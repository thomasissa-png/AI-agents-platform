// src/api/lib/stripe.ts
// Wrapper Stripe minimal — raw fetch (pas de SDK, garde le bundle Worker léger).
// Source : functional-specs §2.1 + dev-decisions §"Stripe Tax B2B reverse charge".

const STRIPE_API = "https://api.stripe.com/v1";

export interface StripeEnv {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

interface CheckoutLineItem {
  amount_eur_cents: number;
  name: string;
  description?: string;
  quantity?: number;
}

export interface CreateCheckoutParams {
  email: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: CheckoutLineItem[];
  metadata: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  payment_status?: string;
  customer_email?: string;
  metadata?: Record<string, string>;
  amount_total?: number;
}

function formEncode(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

function flattenStripeBody(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          Object.assign(out, flattenStripeBody(item as Record<string, unknown>, `${key}[${i}]`));
        } else {
          out[`${key}[${i}]`] = String(item);
        }
      });
    } else if (typeof v === "object") {
      Object.assign(out, flattenStripeBody(v as Record<string, unknown>, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

/**
 * Crée une Stripe Checkout Session.
 * Mode payment, currency EUR (Thomas FR), Tax automatique côté Stripe.
 */
export async function createCheckoutSession(
  env: StripeEnv,
  params: CreateCheckoutParams,
): Promise<CheckoutSession> {
  if (!env.STRIPE_SECRET_KEY) throw new Error("stripe_secret_missing");

  const lineItems = params.lineItems.map((li) => ({
    price_data: {
      currency: "eur",
      unit_amount: li.amount_eur_cents,
      product_data: {
        name: li.name,
        description: li.description ?? undefined,
      },
    },
    quantity: li.quantity ?? 1,
  }));

  const body = flattenStripeBody({
    mode: "payment",
    customer_email: params.email,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    line_items: lineItems,
    metadata: params.metadata,
    automatic_tax: { enabled: true },
  });

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formEncode(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`stripe_checkout_create_failed:${res.status}:${errText.slice(0, 200)}`);
  }
  const json = (await res.json()) as CheckoutSession;
  return json;
}

/**
 * Récupère une session Checkout via son id (post-redirect).
 */
export async function retrieveCheckoutSession(
  env: StripeEnv,
  sessionId: string,
): Promise<CheckoutSession> {
  if (!env.STRIPE_SECRET_KEY) throw new Error("stripe_secret_missing");
  const res = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`stripe_checkout_retrieve_failed:${res.status}`);
  return (await res.json()) as CheckoutSession;
}

/**
 * Vérifie la signature Stripe d'un webhook.
 * Format header `Stripe-Signature: t=<ts>,v1=<sig>` — HMAC-SHA256 de `${ts}.${rawBody}`.
 */
export async function verifyStripeWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
  toleranceSec = 300,
): Promise<{ ok: boolean; error?: string }> {
  if (!secret) return { ok: false, error: "secret_missing" };
  if (!signatureHeader) return { ok: false, error: "header_missing" };

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.trim().split("=");
      return [k, v];
    }),
  );
  const ts = parts["t"];
  const v1 = parts["v1"];
  if (!ts || !v1) return { ok: false, error: "header_malformed" };

  const tsNum = parseInt(ts, 10);
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > toleranceSec) return { ok: false, error: "timestamp_too_old" };

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // constant-time compare
  if (expected.length !== v1.length) return { ok: false, error: "signature_mismatch" };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0 ? { ok: true } : { ok: false, error: "signature_mismatch" };
}

/**
 * Pricing catalog EUR (Stripe Checkout) — synchronisé pricing-pack KV.
 * Source : dev-decisions §"Pricing pack v2".
 */
export const PRICING_EUR_CENTS = {
  pack_discovery: 500, // 5 EUR
  pack_standard: 1000, // 10 EUR
  pack_pro: 5000, // 50 EUR
  audit_one_shot: 999, // 9.99 EUR
  pack_pro_audit: 4900, // 49 EUR
} as const;

export const TOPUP_AMOUNTS_USDC = [5, 10, 50] as const;
export type TopupAmount = (typeof TOPUP_AMOUNTS_USDC)[number];

export function topupAmountToCents(amountUsdc: TopupAmount): number {
  // Approximation 1 USDC ≈ 1 EUR (Stripe convertira via FX au moment du paiement).
  // Source : dev-decisions §"Cohérence pricing — montants en EUR Stripe".
  switch (amountUsdc) {
    case 5:
      return 500;
    case 10:
      return 1000;
    case 50:
      return 5000;
  }
}
