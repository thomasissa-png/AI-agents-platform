// src/api/lib/coinbase.ts
// Validation webhook Coinbase x402 facilitator.
// Source : functional-specs §2.1 + dev-decisions §"x402 settle Coinbase".

export interface CoinbaseEnv {
  COINBASE_X402_FACILITATOR_KEY?: string;
}

export type X402SettleEvent = {
  id: string;
  type: "x402.settle.completed" | "x402.settle.failed" | "x402.pack.purchased";
  data: {
    tx_hash: string;
    wallet_payer_hash: string; // SHA256 du payer
    wallet_recipient: string;
    amount_usdc: number;
    offer_type?: "one_shot" | "pricing_pack" | "audit_pack";
    pack_size?: 30 | 100 | 1000;
    audit_id?: string;
    timestamp: string;
  };
};

/**
 * Vérifie la signature Coinbase d'un webhook x402.
 * Format header `Coinbase-Signature: <hex>` — HMAC-SHA256 du raw body.
 */
export async function verifyCoinbaseWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
): Promise<{ ok: boolean; error?: string }> {
  if (!secret) return { ok: false, error: "secret_missing" };
  if (!signatureHeader) return { ok: false, error: "header_missing" };

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const provided = signatureHeader.replace(/^sha256=/, "").trim();
  if (expected.length !== provided.length) return { ok: false, error: "signature_mismatch" };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0 ? { ok: true } : { ok: false, error: "signature_mismatch" };
}

/**
 * Idempotence webhook : grep KV `webhook:processed:{id}` (TTL 7 jours).
 * Retourne true si déjà processé.
 */
export async function isWebhookProcessed(
  kv: KVNamespace,
  webhookId: string,
): Promise<boolean> {
  const v = await kv.get(`webhook:processed:${webhookId}`);
  return v !== null;
}

export async function markWebhookProcessed(
  kv: KVNamespace,
  webhookId: string,
): Promise<void> {
  await kv.put(`webhook:processed:${webhookId}`, "1", { expirationTtl: 7 * 24 * 3600 });
}
