// src/api/routes/webhooks/coinbase.ts
// POST /api/webhooks/coinbase — settle x402 (one-shot, pricing pack, audit pack).
// Source : functional-specs §2.1 + dev-decisions §"Schéma KV quota pack".

import { aeEvents, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import {
  isWebhookProcessed,
  markWebhookProcessed,
  verifyCoinbaseWebhook,
  type CoinbaseEnv,
  type X402SettleEvent,
} from "@/api/lib/coinbase";
import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";

export interface CoinbaseWebhookEnv extends CoinbaseEnv {
  PACK_KV: KVNamespace;
  AUDIT_METADATA_KV: KVNamespace;
  CRON_STATE_KV: KVNamespace;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

const PACK_QUOTAS: Record<number, number> = { 30: 30, 100: 100, 1000: 1000 };
const AUDIT_PACK_QUOTA = 6;
const PACK_TYPE_BY_SIZE: Record<number, string> = {
  30: "pack_discovery",
  100: "pack_standard",
  1000: "pack_pro",
};

export async function handleCoinbaseWebhook(
  request: Request,
  env: CoinbaseWebhookEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }
  const rawBody = await request.text();
  const sig = request.headers.get("Coinbase-Signature") ?? request.headers.get("X-Coinbase-Signature");
  const ver = await verifyCoinbaseWebhook(rawBody, sig, env.COINBASE_X402_FACILITATOR_KEY);
  if (!ver.ok) {
    aeEvents.write(env.DEVREFS_AE, "webhook_signature_invalid", {
      endpoint: "webhooks/coinbase",
      error_code: ver.error ?? "unknown",
    });
    return new Response(JSON.stringify({ error: "signature_invalid", reason: ver.error }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let evt: X402SettleEvent;
  try {
    evt = JSON.parse(rawBody) as X402SettleEvent;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  if (await isWebhookProcessed(env.CRON_STATE_KV, evt.id)) {
    aeEvents.write(env.DEVREFS_AE, "webhook_duplicate_ignored", {
      endpoint: "webhooks/coinbase",
      webhook_id: evt.id,
    });
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  aeEvents.write(env.DEVREFS_AE, "webhook_received", {
    endpoint: "webhooks/coinbase",
    webhook_id: evt.id,
  });

  const d = evt.data;
  const walletHash = d.wallet_payer_hash;

  if (evt.type === "x402.settle.completed" && d.offer_type === "one_shot") {
    aeEvents.write(env.DEVREFS_AE, "payment_x402_completed", {
      endpoint: "webhooks/coinbase",
      wallet_hash: walletHash,
      amount_usdc: d.amount_usdc,
      webhook_id: evt.id,
    });
  } else if (evt.type === "x402.settle.failed") {
    aeEvents.write(env.DEVREFS_AE, "payment_x402_failed", {
      endpoint: "webhooks/coinbase",
      wallet_hash: walletHash,
      webhook_id: evt.id,
    });
  } else if (
    evt.type === "x402.pack.purchased" ||
    (evt.type === "x402.settle.completed" && d.offer_type === "pricing_pack")
  ) {
    const quota = PACK_QUOTAS[d.pack_size ?? 0] ?? 100;
    const packType = PACK_TYPE_BY_SIZE[d.pack_size ?? 100] ?? "pack_standard";
    const purchasedAt = new Date(d.timestamp);
    const expiresAt = new Date(purchasedAt.getTime() + 365 * 24 * 3600 * 1000);
    await Promise.all([
      env.PACK_KV.put(KV_KEYS.packRemaining(walletHash), String(quota), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(KV_KEYS.packType(walletHash), packType, { expirationTtl: KV_TTL.pack }),
      env.PACK_KV.put(KV_KEYS.packQuotaTotal(walletHash), String(quota), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(KV_KEYS.packPurchasedAt(walletHash), purchasedAt.toISOString(), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(KV_KEYS.packExpiresAt(walletHash), expiresAt.toISOString(), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(KV_KEYS.packTxHash(walletHash), d.tx_hash, { expirationTtl: KV_TTL.pack }),
      env.PACK_KV.put(
        KV_KEYS.packEndpointScope(walletHash),
        "llm-prices,sdk-status,llms-txt",
        { expirationTtl: KV_TTL.pack },
      ),
    ]);
    aeEvents.write(env.DEVREFS_AE, "pack_purchased", {
      endpoint: "webhooks/coinbase",
      wallet_hash: walletHash,
      pack_type: packType,
      amount_usdc: d.amount_usdc,
      quota_remaining: quota,
      webhook_id: evt.id,
    });
  } else if (d.offer_type === "audit_pack") {
    const purchasedAt = new Date(d.timestamp);
    const expiresAt = new Date(purchasedAt.getTime() + 365 * 24 * 3600 * 1000);
    await Promise.all([
      env.PACK_KV.put(`audit:pack:${walletHash}:audit_remaining`, String(AUDIT_PACK_QUOTA), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(`audit:pack:${walletHash}:purchased_at`, purchasedAt.toISOString(), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(`audit:pack:${walletHash}:expires_at`, expiresAt.toISOString(), {
        expirationTtl: KV_TTL.pack,
      }),
      env.PACK_KV.put(`audit:pack:${walletHash}:tx_hash`, d.tx_hash, { expirationTtl: KV_TTL.pack }),
    ]);
    aeEvents.write(env.DEVREFS_AE, "pack_purchased", {
      endpoint: "webhooks/coinbase",
      wallet_hash: walletHash,
      pack_type: "audit_pack",
      amount_usdc: d.amount_usdc,
      quota_remaining: AUDIT_PACK_QUOTA,
      webhook_id: evt.id,
    });
  }

  await markWebhookProcessed(env.CRON_STATE_KV, evt.id);
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
