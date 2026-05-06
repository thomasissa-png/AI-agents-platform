// src/api/middleware/rate-limit.ts
// F14 — Rate limiting :
//  - 1 000 calls/jour par wallet en mode pay-per-call (anti-fraude one-shot)
//  - 100 000 calls/jour par wallet sur pack (anti-abus)
// Source : functional-specs §8 (anti-fraude) + dev-decisions.

import type { AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface RateLimitEnv {
  PACK_KV: KVNamespace; // réutilisé pour stocker compteurs ratelimit
  DEVREFS_AE?: AnalyticsEngineDataset;
}

const ONE_DAY_SEC = 24 * 3600;

interface LimitConfig {
  perOneShot: number;
  perPack: number;
}

const LIMITS: LimitConfig = {
  perOneShot: 1000,
  perPack: 100_000,
};

function dayKey(walletHash: string, mode: "oneshot" | "pack"): string {
  const day = new Date().toISOString().slice(0, 10);
  return `ratelimit:${mode}:${walletHash}:${day}`;
}

/**
 * Incrément + check. Retourne { ok, count, limit }.
 * Note V1 : pas atomique (CF KV), mais acceptable pour rate-limit grossier.
 */
export async function checkRateLimit(
  env: RateLimitEnv,
  walletHash: string,
  mode: "oneshot" | "pack",
): Promise<{ ok: boolean; count: number; limit: number }> {
  if (!walletHash) return { ok: true, count: 0, limit: LIMITS[mode === "oneshot" ? "perOneShot" : "perPack"] };
  const key = dayKey(walletHash, mode);
  const cur = await env.PACK_KV.get(key);
  const count = cur ? parseInt(cur, 10) + 1 : 1;
  const limit = mode === "oneshot" ? LIMITS.perOneShot : LIMITS.perPack;
  await env.PACK_KV.put(key, count.toString(), { expirationTtl: ONE_DAY_SEC + 3600 });
  return { ok: count <= limit, count, limit };
}

export function rateLimit429Response(count: number, limit: number): Response {
  const resetSec = Math.ceil((24 - new Date().getUTCHours()) * 3600);
  return new Response(
    JSON.stringify({
      error: "rate_limit_exceeded",
      count,
      limit,
      reset_in_seconds: resetSec,
      message: "Daily rate limit exceeded for this wallet. Upgrade to a pack for higher limits.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": resetSec.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}
