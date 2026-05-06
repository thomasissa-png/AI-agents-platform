// src/api/routes/sdk-status.ts
// GET /api/sdk-status?pkg=X — F2 functional-specs.

import { isSupportedSdkPackage, type SdkKvValue, type SdkResponse200 } from "@/api/types/pricing";
import { KV_KEYS } from "@/api/lib/kv-keys";
import { signPayload } from "@/api/lib/hmac";
import { x402Gate } from "@/api/middleware/x402";
import { checkAndConsumePack } from "@/api/middleware/pack-quota";
import { checkRateLimit, rateLimit429Response } from "@/api/middleware/rate-limit";
import { emitAeEvent, uaBucket, type AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface SdkStatusEnv {
  SDK_KV: KVNamespace;
  PACK_KV: KVNamespace;
  HMAC_SECRET_KEY?: string;
  COINBASE_X402_FACILITATOR_KEY?: string;
  DEVREFS_TREASURY_WALLET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

const PRICE_USDC = 0.001;
const ENDPOINT = "sdk-status" as const;

export async function handleSdkStatus(request: Request, env: SdkStatusEnv): Promise<Response> {
  const t0 = Date.now();
  const url = new URL(request.url);
  const pkg = url.searchParams.get("pkg");
  const ua = uaBucket(request.headers.get("user-agent"));

  emitAeEvent(env.DEVREFS_AE, "api_request_received", { endpoint: ENDPOINT, ua_bucket: ua });

  if (!pkg || !isSupportedSdkPackage(pkg)) {
    emitAeEvent(env.DEVREFS_AE, "api_response_4xx_sent", {
      endpoint: ENDPOINT,
      status_code: 400,
      error_code: "INVALID_PKG",
      latency_ms: Date.now() - t0,
    });
    return new Response(
      JSON.stringify({ error: "invalid_pkg", message: "Param 'pkg' missing or not supported" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const raw = await env.SDK_KV.get(KV_KEYS.sdk(pkg));
  const value: SdkKvValue | null = raw ? (JSON.parse(raw) as SdkKvValue) : null;

  const packResult = request.headers.get("X-Pack-Token")
    ? await checkAndConsumePack(request, env, "data", ENDPOINT)
    : null;

  if (packResult) {
    if (!packResult.ok) {
      const code = packResult.reason === "pack_exhausted" ? 402 : 401;
      return new Response(
        JSON.stringify({ error: packResult.reason ?? "pack_invalid", wallet_hash: packResult.wallet_hash }),
        { status: code, headers: { "Content-Type": "application/json" } },
      );
    }
    if (packResult.wallet_hash) {
      const rl = await checkRateLimit(env, packResult.wallet_hash, "pack");
      if (!rl.ok) return rateLimit429Response(rl.count, rl.limit);
    }
  } else {
    const gate = await x402Gate(request, env, {
      endpoint: ENDPOINT,
      price_usdc: PRICE_USDC,
      context: {
        offer_type: "sdk_one_shot",
        freshness: value
          ? {
              date_modified: value.date_modified,
              fetched_at: value.fetched_at,
              same_as: value.same_as,
              cron_interval_hours: 24,
            }
          : undefined,
        payload_preview: {
          pkg,
          latest: "***",
          breaking_since: "***",
          deprecated_versions: "***",
          date_modified: value?.date_modified ?? "unknown",
        },
      },
    });
    if (gate instanceof Response) return gate;
  }

  if (!value) {
    emitAeEvent(env.DEVREFS_AE, "api_response_5xx_sent", {
      endpoint: ENDPOINT,
      status_code: 503,
      error_code: "DATA_NOT_SEEDED",
      latency_ms: Date.now() - t0,
    });
    return new Response(
      JSON.stringify({
        error: "data_not_seeded",
        message: "Cron has not yet populated this package. Try again in < 24h.",
      }),
      { status: 503, headers: { "Content-Type": "application/json", "Retry-After": "3600" } },
    );
  }

  if (!env.HMAC_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = await signPayload(value, env.HMAC_SECRET_KEY);
  const payload: SdkResponse200 = {
    data: value,
    _signature: signature,
    _jsonld_dataset: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      dateModified: value.date_modified,
      sameAs: value.same_as,
    },
  };
  const body = JSON.stringify(payload);
  const freshnessHours = Math.round(((Date.now() - new Date(value.fetched_at).getTime()) / 36e5) * 10) / 10;

  emitAeEvent(env.DEVREFS_AE, "api_response_200_sent", {
    endpoint: ENDPOINT,
    status_code: 200,
    latency_ms: Date.now() - t0,
    payload_size_bytes: body.length,
    freshness_hours: freshnessHours,
    ua_bucket: ua,
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Last-Modified": new Date(value.date_modified).toUTCString(),
      "Cache-Control": "public, max-age=21600",
      ETag: `"${signature.slice(0, 16)}"`,
      "X-Resource-Fresh-Until": new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      "X-DevRefs-Schema-Version": value.schema_version,
    },
  });
}
