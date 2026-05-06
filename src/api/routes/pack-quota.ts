// src/api/routes/pack-quota.ts
// GET /api/pack/quota — version authentifiée JWT sponsor (dashboard).
// Source : functional-specs F10/F11.

import type { PackQuotaResponse, PackType } from "@/api/types/pack";
import { KV_KEYS } from "@/api/lib/kv-keys";
import { validateJwt, type JwtEnv } from "@/api/middleware/jwt-validate";

export interface PackQuotaRouteEnv extends JwtEnv {
  PACK_KV: KVNamespace;
}

export async function handlePackQuota(request: Request, env: PackQuotaRouteEnv): Promise<Response> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized", message: "Bearer JWT required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" },
    });
  }
  const token = auth.slice("Bearer ".length);
  const validation = await validateJwt(token, env);
  if (!validation.ok || !validation.payload) {
    return new Response(JSON.stringify({ error: "invalid_jwt", reason: validation.error }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const walletHash = validation.payload.sub;

  const [remaining, packType, total, purchasedAt, expiresAt, scope] = await Promise.all([
    env.PACK_KV.get(KV_KEYS.packRemaining(walletHash)),
    env.PACK_KV.get(KV_KEYS.packType(walletHash)),
    env.PACK_KV.get(KV_KEYS.packQuotaTotal(walletHash)),
    env.PACK_KV.get(KV_KEYS.packPurchasedAt(walletHash)),
    env.PACK_KV.get(KV_KEYS.packExpiresAt(walletHash)),
    env.PACK_KV.get(KV_KEYS.packEndpointScope(walletHash)),
  ]);

  if (remaining === null || packType === null || total === null) {
    return new Response(
      JSON.stringify({ error: "no_active_pack", wallet_hash: walletHash }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }
  const remainingN = parseInt(remaining, 10);
  const totalN = parseInt(total, 10);
  const response: PackQuotaResponse = {
    wallet_hash: walletHash,
    pack_type: packType as PackType,
    quota_total: totalN,
    quota_remaining: remainingN,
    quota_pct_used: totalN > 0 ? Math.round(((totalN - remainingN) / totalN) * 1000) / 10 : 0,
    purchased_at: purchasedAt ?? "",
    expires_at: expiresAt,
    endpoint_scope: ((scope as "data" | "audit") ?? "data"),
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=5" },
  });
}
