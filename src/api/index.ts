// src/api/index.ts
// Entry point Worker DevRefs (wrangler.toml main).
// Router minimaliste — pas de framework lourd (Hono/itty-router évités V1).

import { handleLlmPrices, type LlmPricesEnv } from "@/api/routes/llm-prices";
import { handleSdkStatus, type SdkStatusEnv } from "@/api/routes/sdk-status";
import { handleAgentAudit, type AgentAuditEnv } from "@/api/routes/agent-audit";
import { handleAuditRefund, type AuditRefundEnv } from "@/api/routes/audit-refund";
import { handlePackStatus, type PackStatusEnv } from "@/api/routes/pack-status";
import { handlePackQuota, type PackQuotaRouteEnv } from "@/api/routes/pack-quota";
import { handleLlmsTxt } from "@/api/routes/llms-txt";
import { dispatchCron, type CronEnv } from "@/cron/index";
import type { AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface DevRefsEnv
  extends LlmPricesEnv,
    SdkStatusEnv,
    AgentAuditEnv,
    AuditRefundEnv,
    PackStatusEnv,
    PackQuotaRouteEnv {
  PRICES_KV: KVNamespace;
  SDK_KV: KVNamespace;
  PACK_KV: KVNamespace;
  AUDIT_METADATA_KV: KVNamespace;
  JWT_KV: KVNamespace;
  CRON_STATE_KV: KVNamespace;
  // secrets (peuvent être absents en preview/dev)
  HMAC_SECRET_KEY?: string;
  COINBASE_X402_FACILITATOR_KEY?: string;
  DEVREFS_TREASURY_WALLET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  INDEXNOW_API_KEY?: string;
  JWT_SECRET?: string;
  // analytics
  DEVREFS_AE?: AnalyticsEngineDataset;
  // vars
  PUBLIC_ENV?: string;
  DEVREFS_VERSION?: string;
  INDEXNOW_HOST?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-PAYMENT, X-Pack-Token",
  "Access-Control-Expose-Headers":
    "X-PAYMENT-RESPONSE, X-Price-USDC, X-DevRefs-Offer, X-DevRefs-ROI-Multiplier, X-Audit-Id, X-Resource-Fresh-Until",
  "Access-Control-Max-Age": "86400",
};

function withCors(res: Response): Response {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

function jsonError(status: number, error: string, message?: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: DevRefsEnv): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      // Public manifest
      if (path === "/llms.txt" && request.method === "GET") {
        return withCors(handleLlmsTxt());
      }
      // Health
      if (path === "/api/health" && request.method === "GET") {
        return withCors(
          new Response(
            JSON.stringify({
              status: "ok",
              version: env.DEVREFS_VERSION ?? "0.1.0",
              env: env.PUBLIC_ENV ?? "unknown",
              ts: new Date().toISOString(),
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }

      // Monétisé : pricing + SDK + audit
      if (path === "/api/llm-prices" && request.method === "GET") {
        return withCors(await handleLlmPrices(request, env));
      }
      if (path === "/api/sdk-status" && request.method === "GET") {
        return withCors(await handleSdkStatus(request, env));
      }
      if (path === "/api/agent-audit") {
        return withCors(await handleAgentAudit(request, env));
      }
      if (path === "/api/audit/refund") {
        return withCors(await handleAuditRefund(request, env));
      }

      // Pack
      if (path === "/api/pack/status" && request.method === "GET") {
        return withCors(await handlePackStatus(request, env));
      }
      if (path === "/api/pack/quota" && request.method === "GET") {
        return withCors(await handlePackQuota(request, env));
      }

      return withCors(jsonError(404, "not_found", `Route ${request.method} ${path} not found`));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown_error";
      return withCors(jsonError(500, "internal_error", msg));
    }
  },

  async scheduled(controller: ScheduledController, env: DevRefsEnv): Promise<void> {
    const cronExpr = controller.cron ?? "";
    try {
      await dispatchCron(cronExpr, env as unknown as CronEnv, new Date(controller.scheduledTime));
    } catch (e) {
      // Best-effort logging — pas de crash propagé (CF retry sinon)
      console.error("scheduled_dispatch_failed", cronExpr, e instanceof Error ? e.message : e);
    }
  },
} satisfies ExportedHandler<DevRefsEnv>;
