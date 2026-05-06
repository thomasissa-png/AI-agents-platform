// src/api/routes/agent-audit.ts
// POST /api/agent-audit — F1b functional-specs.
// Cible latence p95 < 320 ms (dérogation vs 200 ms data endpoints).
// CRITIQUE RGPD : aucun input audit persisté en KV (CGU Art. 3.4).

import type { AuditInput, AuditMetadataKv, AuditOutput } from "@/api/types/audit";
import { runAuditHeuristics, validateAuditInput } from "@/api/lib/audit-heuristics";
import { signPayload, generateAuditId, sha256Hex } from "@/api/lib/hmac";
import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";
import { x402Gate } from "@/api/middleware/x402";
import { checkAndConsumePack } from "@/api/middleware/pack-quota";
import { emitAeEvent, uaBucket, type AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface AgentAuditEnv {
  AUDIT_METADATA_KV: KVNamespace;
  PACK_KV: KVNamespace;
  HMAC_SECRET_KEY?: string;
  COINBASE_X402_FACILITATOR_KEY?: string;
  DEVREFS_TREASURY_WALLET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

const PRICE_USDC = 9.99;
const ENDPOINT = "agent-audit" as const;
const MAX_BODY_BYTES = 100 * 1024;

export async function handleAgentAudit(request: Request, env: AgentAuditEnv): Promise<Response> {
  const t0 = Date.now();
  const ua = uaBucket(request.headers.get("user-agent"));

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    });
  }

  emitAeEvent(env.DEVREFS_AE, "audit_request_received", { endpoint: ENDPOINT, ua_bucket: ua });

  // Body size guard
  const cl = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (cl > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "body_too_large", max_bytes: MAX_BODY_BYTES }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse + validate (pre-payment)
  let input: AuditInput;
  try {
    input = (await request.json()) as AuditInput;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const validation = validateAuditInput(input);
  if (validation) {
    emitAeEvent(env.DEVREFS_AE, "audit_input_validation_failed", {
      endpoint: ENDPOINT,
      status_code: 400,
      error_code: validation.code,
      latency_ms: Date.now() - t0,
    });
    return new Response(JSON.stringify({ error: validation.code, message: validation.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Volume warning (pas refus, juste info dans 402)
  const lowVolume = input.agent_config.monthly_volume_estimate < 5_000_000;

  // x402 ou pack
  const packResult = request.headers.get("X-Pack-Token")
    ? await checkAndConsumePack(request, env, "audit", ENDPOINT)
    : null;

  let walletHashFromPack: string | null = null;
  let packOrigin: AuditMetadataKv["pack_origin"] = "one_shot";

  if (packResult) {
    if (!packResult.ok) {
      const code = packResult.reason === "pack_exhausted" ? 402 : 401;
      return new Response(
        JSON.stringify({ error: packResult.reason ?? "pack_invalid", wallet_hash: packResult.wallet_hash }),
        { status: code, headers: { "Content-Type": "application/json" } },
      );
    }
    walletHashFromPack = packResult.wallet_hash ?? null;
    packOrigin = "audit_pack";
  } else {
    const gate = await x402Gate(request, env, {
      endpoint: ENDPOINT,
      price_usdc: PRICE_USDC,
      context: {
        offer_type: "audit_one_shot",
        alternative_cost: {
          tokens_estimated: 500_000,
          cost_in_usd_per_model: {
            "claude-opus-4-7": 3.65,
            "claude-sonnet-4-6": 1.5,
          },
          agent_action_if_no_devrefs:
            "Hire human consultant ($200-2000) OR run trial-and-error optimization across 5 model configurations",
          ...(lowVolume
            ? { note: "ROI warning: monthly_volume < 5M tokens = ROI < 5x. Consider waiting until volume scales." }
            : {}),
        },
        audit_freshness: {
          audit_engine_version: "1.0.0",
          heuristics_count: 5,
          date_modified: new Date().toISOString(),
        },
        monthly_volume_estimate: input.agent_config.monthly_volume_estimate,
        payload_preview: {
          score: "***",
          monthly_cost_current_usd: "***",
          monthly_cost_optimized_usd: "***",
          savings_pct: "***",
          recommendations_count: "***",
        },
      },
    });
    if (gate instanceof Response) return gate;
  }

  // Run heuristics (pure JS, in-memory only — input never persisted)
  const result = runAuditHeuristics(input);
  const auditId = generateAuditId();
  if (!env.HMAC_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const refundEligible = !lowVolume; // condition C1 CGU 4ter
  const refundAmountUsdc = packOrigin === "audit_pack" ? Math.round((49 / 6 / 2) * 100) / 100 : 4.995;

  const baseOutput: Omit<AuditOutput, "_signature"> = {
    audit_id: auditId,
    score: result.score,
    savings_pct: result.savings_pct,
    monthly_cost_current_usd: result.monthly_cost_current_usd,
    monthly_cost_optimized_usd: result.monthly_cost_optimized_usd,
    recommendations: result.recommendations,
    guarantee: {
      refund_eligible: refundEligible,
      refund_amount_usdc: refundAmountUsdc,
      conditions: [
        "monthly_volume_estimate >= 5,000,000 tokens",
        "recommendations_applied_pct >= 80",
        "model_used stable for >= 30 days",
        "savings_pct_measured < 15",
      ],
    },
    _audit_id: auditId,
    schema_version: "1.0",
  };
  const signature = await signPayload(baseOutput, env.HMAC_SECRET_KEY);
  const output: AuditOutput = { ...baseOutput, _signature: signature };

  // Persist METADATA ONLY (jamais l'input — RGPD critique)
  const walletHash = walletHashFromPack ?? (input.wallet_hash ?? (await sha256Hex(`anon_${auditId}`)));
  const meta: AuditMetadataKv = {
    audit_id: auditId,
    wallet_hash: walletHash,
    savings_pct: result.savings_pct,
    monthly_volume_estimate: input.agent_config.monthly_volume_estimate,
    purchased_at: new Date().toISOString(),
    refund_status: "none",
    refund_tx_hash: null,
    pack_origin: packOrigin,
  };
  await env.AUDIT_METADATA_KV.put(KV_KEYS.audit(auditId), JSON.stringify(meta), {
    expirationTtl: KV_TTL.auditMetadata,
  });

  const body = JSON.stringify(output);
  emitAeEvent(env.DEVREFS_AE, "audit_delivered", {
    endpoint: ENDPOINT,
    status_code: 200,
    latency_ms: Date.now() - t0,
    payload_size_bytes: body.length,
    audit_id: auditId,
    savings_pct: result.savings_pct,
    recommendations_count: result.recommendations.length,
    monthly_volume_estimate: input.agent_config.monthly_volume_estimate,
    wallet_hash: walletHash,
    ua_bucket: ua,
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Audit-Id": auditId,
      "X-DevRefs-Schema-Version": output.schema_version,
    },
  });
}
