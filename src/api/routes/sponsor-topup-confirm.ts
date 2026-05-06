// src/api/routes/sponsor-topup-confirm.ts
// GET /api/sponsor/topup-confirm?session_id=X — post-redirect Stripe.
// Source : functional-specs §2.1 + dev-decisions §"JWT sponsor".

import { aeEvents, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { mintJwtForSponsor } from "@/api/lib/jwt";
import { retrieveCheckoutSession, type StripeEnv } from "@/api/lib/stripe";
import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";

export interface SponsorTopupConfirmEnv extends StripeEnv {
  JWT_KV: KVNamespace;
  JWT_SECRET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

export async function handleSponsorTopupConfirm(
  request: Request,
  env: SponsorTopupConfirmEnv,
): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "GET" },
    });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return Response.redirect(`${url.origin}/paywall?error=missing_session`, 302);
  }
  if (!env.JWT_SECRET) {
    return new Response(JSON.stringify({ error: "jwt_secret_missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await retrieveCheckoutSession(env, sessionId);
  if (session.payment_status !== "paid") {
    aeEvents.write(env.DEVREFS_AE, "sponsor_topup_stripe_failed", {
      endpoint: "sponsor-topup-confirm",
      error_code: session.payment_status ?? "unknown",
    });
    return Response.redirect(`${url.origin}/paywall?error=payment_failed`, 302);
  }

  const walletHash = session.metadata?.wallet_target_hash;
  if (!walletHash) {
    return new Response(JSON.stringify({ error: "metadata_missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { token, jti, iat, exp } = await mintJwtForSponsor(walletHash, env.JWT_SECRET);
  await env.JWT_KV.put(
    KV_KEYS.jwt(jti),
    JSON.stringify({
      wallet_hash_sponsor: walletHash,
      issued_at: new Date(iat * 1000).toISOString(),
      expires_at: new Date(exp * 1000).toISOString(),
      invalidated: false,
    }),
    { expirationTtl: KV_TTL.jwt },
  );

  aeEvents.write(env.DEVREFS_AE, "sponsor_jwt_issued", {
    endpoint: "sponsor-topup-confirm",
    wallet_hash: walletHash,
  });
  aeEvents.write(env.DEVREFS_AE, "jwt_issued", {
    endpoint: "sponsor-topup-confirm",
    wallet_hash: walletHash,
  });

  const cookie = `jwt=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 3600}; Path=/`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/dashboard?token=${encodeURIComponent(token)}`,
      "Set-Cookie": cookie,
    },
  });
}
