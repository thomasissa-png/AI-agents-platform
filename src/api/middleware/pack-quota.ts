// src/api/middleware/pack-quota.ts
// Middleware F8b — lookup KV pack + decrement atomique.
// Cible latence p95 < 50 ms (qa-strategy §4.6).
// Note V1 : CF KV n'est PAS transactionnel — last-write-wins acceptable. Durable Objects en V2 si concurrence détectée.

import { KV_KEYS } from "@/api/lib/kv-keys";
import { verifySignature } from "@/api/lib/hmac";
import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import type { PackType } from "@/api/types/pack";

export interface PackQuotaEnv {
  PACK_KV: KVNamespace;
  HMAC_SECRET_KEY?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

export interface PackQuotaResult {
  ok: boolean;
  wallet_hash?: string;
  pack_type?: PackType;
  remaining?: number;
  total?: number;
  reason?: "missing_token" | "invalid_signature" | "pack_not_found" | "pack_exhausted" | "wrong_scope" | "expired";
}

/**
 * Pack token format : `{wallet_hash}.{hmac_signature}`
 * HMAC sur payload `{ wallet_hash }` avec HMAC_SECRET_KEY.
 */
async function verifyPackToken(token: string, secret: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [walletHash, sig] = parts;
  if (!walletHash || !sig || walletHash.length !== 64) return null; // SHA256 hex
  const ok = await verifySignature({ wallet_hash: walletHash }, sig, secret);
  return ok ? walletHash : null;
}

/**
 * Vérifie le pack token, décrémente le quota et retourne le résultat.
 * @param requiredScope — "data" pour pricing/SDK, "audit" pour agent-audit
 */
export async function checkAndConsumePack(
  request: Request,
  env: PackQuotaEnv,
  requiredScope: "data" | "audit",
  endpoint: string,
): Promise<PackQuotaResult> {
  const token = request.headers.get("X-Pack-Token");
  if (!token) return { ok: false, reason: "missing_token" };
  if (!env.HMAC_SECRET_KEY) return { ok: false, reason: "invalid_signature" };

  const walletHash = await verifyPackToken(token, env.HMAC_SECRET_KEY);
  if (!walletHash) {
    return { ok: false, reason: "invalid_signature" };
  }

  // Lookup parallèle des champs pack (latence < 50 ms)
  const [remainingRaw, packTypeRaw, totalRaw, scopeRaw, expiresRaw] = await Promise.all([
    env.PACK_KV.get(KV_KEYS.packRemaining(walletHash)),
    env.PACK_KV.get(KV_KEYS.packType(walletHash)),
    env.PACK_KV.get(KV_KEYS.packQuotaTotal(walletHash)),
    env.PACK_KV.get(KV_KEYS.packEndpointScope(walletHash)),
    env.PACK_KV.get(KV_KEYS.packExpiresAt(walletHash)),
  ]);

  if (remainingRaw === null || packTypeRaw === null) {
    return { ok: false, wallet_hash: walletHash, reason: "pack_not_found" };
  }
  if (scopeRaw && scopeRaw !== requiredScope) {
    return { ok: false, wallet_hash: walletHash, reason: "wrong_scope" };
  }
  if (expiresRaw) {
    if (new Date(expiresRaw).getTime() < Date.now()) {
      return { ok: false, wallet_hash: walletHash, reason: "expired" };
    }
  }
  const remaining = parseInt(remainingRaw, 10);
  const total = totalRaw ? parseInt(totalRaw, 10) : 0;
  if (remaining <= 0) {
    emitAeEvent(env.DEVREFS_AE, "pack_quota_exhausted", {
      endpoint,
      wallet_hash: walletHash,
      pack_type: packTypeRaw,
      quota_remaining: 0,
    });
    return { ok: false, wallet_hash: walletHash, pack_type: packTypeRaw as PackType, remaining: 0, total, reason: "pack_exhausted" };
  }

  // Décrément atomique (last-write-wins V1)
  const newRemaining = remaining - 1;
  await env.PACK_KV.put(KV_KEYS.packRemaining(walletHash), newRemaining.toString());

  emitAeEvent(env.DEVREFS_AE, "pack_quota_consumed", {
    endpoint,
    wallet_hash: walletHash,
    pack_type: packTypeRaw,
    quota_remaining: newRemaining,
    payload_size_bytes: total, // détourné en "total" pour calcul seuils dans emitAeEvent
  });

  return {
    ok: true,
    wallet_hash: walletHash,
    pack_type: packTypeRaw as PackType,
    remaining: newRemaining,
    total,
  };
}
