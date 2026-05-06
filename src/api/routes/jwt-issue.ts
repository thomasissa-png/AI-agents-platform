// src/api/routes/jwt-issue.ts
// POST /api/jwt/issue — mint JWT 24 h post-Stripe success (alternative à /confirm).
// Source : functional-specs §2.1.
// Sécurité : auth via Stripe session_id valide payment_status === 'paid'.

import { aeEvents, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { mintJwtForSponsor } from "@/api/lib/jwt";
import { retrieveCheckoutSession, type StripeEnv } from "@/api/lib/stripe";
import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";

export interface JwtIssueEnv extends StripeEnv {
  JWT_KV: KVNamespace;
  JWT_SECRET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

interface JwtIssueBody {
  session_id?: string;
}

export async function handleJwtIssue(request: Request, env: JwtIssueEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    });
  }
  if (!env.JWT_SECRET) {
    return new Response(JSON.stringify({ error: "jwt_secret_missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: JwtIssueBody;
  try {
    body = (await request.json()) as JwtIssueBody;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!body.session_id) {
    return new Response(JSON.stringify({ error: "missing_session_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await retrieveCheckoutSession(env, body.session_id);
  if (session.payment_status !== "paid") {
    aeEvents.write(env.DEVREFS_AE, "jwt_rejected", {
      endpoint: "jwt-issue",
      error_code: "PAYMENT_NOT_COMPLETED",
    });
    return new Response(JSON.stringify({ error: "PAYMENT_NOT_COMPLETED" }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }
  const walletHash = session.metadata?.wallet_target_hash;
  if (!walletHash) {
    return new Response(JSON.stringify({ error: "metadata_missing" }), {
      status: 400,
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
    endpoint: "jwt-issue",
    wallet_hash: walletHash,
  });
  aeEvents.write(env.DEVREFS_AE, "jwt_issued", {
    endpoint: "jwt-issue",
    wallet_hash: walletHash,
  });

  return new Response(
    JSON.stringify({
      token,
      jti,
      issued_at: new Date(iat * 1000).toISOString(),
      expires_at: new Date(exp * 1000).toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
