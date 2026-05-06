// src/api/routes/webhooks/stripe.ts
// POST /api/webhooks/stripe — webhook checkout.session.completed + payment_intent.succeeded.
// Source : functional-specs §2.1 + dev-decisions §"Idempotence webhooks".

import { aeEvents, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { mintJwtForSponsor } from "@/api/lib/jwt";
import { verifyStripeWebhook, type StripeEnv } from "@/api/lib/stripe";
import { isWebhookProcessed, markWebhookProcessed } from "@/api/lib/coinbase";
import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";

export interface StripeWebhookEnv extends StripeEnv {
  JWT_KV: KVNamespace;
  CRON_STATE_KV: KVNamespace; // pour stocker webhook:processed:{id}
  JWT_SECRET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_status?: string;
      amount_total?: number;
      customer_email?: string;
      metadata?: Record<string, string>;
    };
  };
}

export async function handleStripeWebhook(
  request: Request,
  env: StripeWebhookEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("Stripe-Signature");
  const ver = await verifyStripeWebhook(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ver.ok) {
    aeEvents.write(env.DEVREFS_AE, "webhook_signature_invalid", {
      endpoint: "webhooks/stripe",
      error_code: ver.error ?? "unknown",
    });
    return new Response(JSON.stringify({ error: "signature_invalid", reason: ver.error }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let evt: StripeEvent;
  try {
    evt = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  // Idempotence
  if (await isWebhookProcessed(env.CRON_STATE_KV, evt.id)) {
    aeEvents.write(env.DEVREFS_AE, "webhook_duplicate_ignored", {
      endpoint: "webhooks/stripe",
      webhook_id: evt.id,
    });
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  aeEvents.write(env.DEVREFS_AE, "webhook_received", {
    endpoint: "webhooks/stripe",
    webhook_id: evt.id,
  });

  if (evt.type === "checkout.session.completed") {
    const obj = evt.data.object;
    const walletHash = obj.metadata?.wallet_target_hash;
    if (walletHash && env.JWT_SECRET) {
      const { jti, iat, exp } = await mintJwtForSponsor(walletHash, env.JWT_SECRET);
      await env.JWT_KV.put(
        KV_KEYS.jwt(jti),
        JSON.stringify({
          wallet_hash_sponsor: walletHash,
          issued_at: new Date(iat * 1000).toISOString(),
          expires_at: new Date(exp * 1000).toISOString(),
          invalidated: false,
          source: "stripe_webhook",
        }),
        { expirationTtl: KV_TTL.jwt },
      );
    }
    aeEvents.write(env.DEVREFS_AE, "sponsor_topup_stripe_completed", {
      endpoint: "webhooks/stripe",
      wallet_hash: walletHash ?? "",
      amount_eur: (obj.amount_total ?? 0) / 100,
      amount_usdc: Number(obj.metadata?.amount_usdc ?? 0),
      webhook_id: evt.id,
    });
    // Email transactionnel best-effort déclenché côté caller (pas async ici, env CF Worker)
  } else if (evt.type === "payment_intent.succeeded") {
    aeEvents.write(env.DEVREFS_AE, "sponsor_topup_stripe_completed", {
      endpoint: "webhooks/stripe",
      webhook_id: evt.id,
    });
  } else if (evt.type === "checkout.session.expired" || evt.type === "payment_intent.payment_failed") {
    aeEvents.write(env.DEVREFS_AE, "sponsor_topup_stripe_failed", {
      endpoint: "webhooks/stripe",
      webhook_id: evt.id,
      error_code: evt.type,
    });
  }

  await markWebhookProcessed(env.CRON_STATE_KV, evt.id);
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
