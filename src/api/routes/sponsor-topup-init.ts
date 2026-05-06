// src/api/routes/sponsor-topup-init.ts
// POST /api/sponsor/topup-init — création Stripe Checkout pour top-up sponsor.
// Source : functional-specs §2.1 + dev-decisions §"Pricing pack v2".

import { aeEvents, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import {
  createCheckoutSession,
  topupAmountToCents,
  TOPUP_AMOUNTS_USDC,
  type StripeEnv,
  type TopupAmount,
} from "@/api/lib/stripe";

export interface SponsorTopupInitEnv extends StripeEnv {
  DEVREFS_AE?: AnalyticsEngineDataset;
}

interface TopupInitBody {
  amount_usdc?: number;
  wallet_target_hash?: string;
  email?: string;
  consent_l22128?: boolean;
  consent_email?: boolean;
  consent_proof?: boolean;
}

const SHA256_RE = /^[a-f0-9]{64}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jerr(status: number, error: string, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ error, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleSponsorTopupInit(
  request: Request,
  env: SponsorTopupInitEnv,
): Promise<Response> {
  if (request.method !== "POST") return jerr(405, "method_not_allowed");

  let body: TopupInitBody;
  try {
    body = (await request.json()) as TopupInitBody;
  } catch {
    return jerr(400, "invalid_json");
  }

  const { amount_usdc, wallet_target_hash, email, consent_l22128, consent_email, consent_proof } =
    body;

  if (typeof amount_usdc !== "number" || !TOPUP_AMOUNTS_USDC.includes(amount_usdc as TopupAmount)) {
    return jerr(400, "INVALID_AMOUNT", { allowed: TOPUP_AMOUNTS_USDC });
  }
  if (!wallet_target_hash || !SHA256_RE.test(wallet_target_hash)) {
    return jerr(400, "INVALID_WALLET_HASH");
  }
  if (!email || !EMAIL_RE.test(email)) {
    return jerr(400, "INVALID_EMAIL");
  }
  if (consent_l22128 !== true || consent_email !== true || consent_proof !== true) {
    return jerr(400, "MISSING_CONSENT", {
      required: ["consent_l22128", "consent_email", "consent_proof"],
    });
  }

  const consentsRecordedAt = new Date().toISOString();
  const amountCents = topupAmountToCents(amount_usdc as TopupAmount);

  const baseUrl = new URL(request.url).origin;
  const session = await createCheckoutSession(env, {
    email,
    successUrl: `${baseUrl}/api/sponsor/topup-confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/paywall?cancelled=1`,
    lineItems: [
      {
        amount_eur_cents: amountCents,
        name: `DevRefs sponsor top-up ${amount_usdc} USDC`,
        description: `Wallet ${wallet_target_hash.slice(0, 8)}…`,
        quantity: 1,
      },
    ],
    metadata: {
      wallet_target_hash,
      amount_usdc: String(amount_usdc),
      consents_recorded_at: consentsRecordedAt,
    },
  });

  aeEvents.write(env.DEVREFS_AE, "sponsor_topup_stripe_initiated", {
    endpoint: "sponsor-topup-init",
    wallet_hash: wallet_target_hash,
    amount_usdc,
    amount_eur: amountCents / 100,
    consent_count: 3,
  });
  aeEvents.write(env.DEVREFS_AE, "sponsor_consent_recorded", {
    endpoint: "sponsor-topup-init",
    wallet_hash: wallet_target_hash,
    consent_count: 3,
  });

  return new Response(
    JSON.stringify({ checkout_url: session.url, session_id: session.id }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
