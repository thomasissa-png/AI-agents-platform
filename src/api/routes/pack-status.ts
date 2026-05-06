// src/api/routes/pack-status.ts
// GET /api/pack/status?wallet_hash=X — lookup public KV (read-only, no decrement).
// Source : functional-specs F11.

import type { PackKvSnapshot, PackStatusResponse, PackType } from "@/api/types/pack";
import { KV_KEYS } from "@/api/lib/kv-keys";

export interface PackStatusEnv {
  PACK_KV: KVNamespace;
}

export async function handlePackStatus(request: Request, env: PackStatusEnv): Promise<Response> {
  const url = new URL(request.url);
  const walletHash = url.searchParams.get("wallet_hash");
  if (!walletHash || walletHash.length !== 64) {
    return new Response(
      JSON.stringify({ error: "invalid_wallet_hash", message: "Param 'wallet_hash' must be SHA256 hex (64 chars)" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const [remaining, packType, total, purchasedAt] = await Promise.all([
    env.PACK_KV.get(KV_KEYS.packRemaining(walletHash)),
    env.PACK_KV.get(KV_KEYS.packType(walletHash)),
    env.PACK_KV.get(KV_KEYS.packQuotaTotal(walletHash)),
    env.PACK_KV.get(KV_KEYS.packPurchasedAt(walletHash)),
  ]);

  if (remaining === null || packType === null) {
    const empty: PackStatusResponse = { wallet_hash: walletHash, active_packs: [] };
    return new Response(JSON.stringify(empty), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const response: PackStatusResponse = {
    wallet_hash: walletHash,
    active_packs: [
      {
        pack_type: packType as PackType,
        quota_remaining: parseInt(remaining, 10),
        quota_total: total ? parseInt(total, 10) : 0,
        purchased_at: purchasedAt ?? "",
      },
    ],
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=10" },
  });
}

// Helper interne pour debug/test : snapshot complet (à retirer en prod si pas authentifié)
export async function getPackSnapshot(env: PackStatusEnv, walletHash: string): Promise<PackKvSnapshot | null> {
  const [remaining, packType, total, scope, purchasedAt, expiresAt, txHash] = await Promise.all([
    env.PACK_KV.get(KV_KEYS.packRemaining(walletHash)),
    env.PACK_KV.get(KV_KEYS.packType(walletHash)),
    env.PACK_KV.get(KV_KEYS.packQuotaTotal(walletHash)),
    env.PACK_KV.get(KV_KEYS.packEndpointScope(walletHash)),
    env.PACK_KV.get(KV_KEYS.packPurchasedAt(walletHash)),
    env.PACK_KV.get(KV_KEYS.packExpiresAt(walletHash)),
    env.PACK_KV.get(KV_KEYS.packTxHash(walletHash)),
  ]);
  if (!remaining || !packType) return null;
  return {
    wallet_hash: walletHash,
    pack_type: packType as PackType,
    quota_total: total ? parseInt(total, 10) : 0,
    quota_remaining: parseInt(remaining, 10),
    purchased_at: purchasedAt ?? "",
    expires_at: expiresAt,
    tx_hash: txHash ?? "",
    endpoint_scope: (scope as "data" | "audit") ?? "data",
  };
}
