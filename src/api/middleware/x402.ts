// src/api/middleware/x402.ts
// Middleware x402 unifié — F8 functional-specs.
// Source : docs/ia/x402-response-spec.md + dev-decisions §"Coinbase facilitator settle ≤ 5s".
//
// Flow :
//  1. Si X-Pack-Token présent → délègue à pack-quota middleware
//  2. Sinon si X-PAYMENT absent → 402 augmenté (build402Body)
//  3. Sinon vérifie via Coinbase facilitator API → settle ≤ 5s
//  4. OK → écrit metadata Tx, émet event, passe au handler

import { build402Body, type X402BodyContext } from "@/api/lib/x402-body";
import { emitAeEvent, uaBucket, type AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface X402Env {
  COINBASE_X402_FACILITATOR_KEY?: string;
  DEVREFS_TREASURY_WALLET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

export interface X402Result {
  paid: boolean;
  via: "x402" | "pack" | "none";
  payment_response?: string; // header X-PAYMENT-RESPONSE à attacher au 200
  tx_hash?: string;
  pack_remaining?: number;
}

const FACILITATOR_URL = "https://x402.org/facilitator/verify";
const FACILITATOR_TIMEOUT_MS = 5000;

/**
 * Vérifie un header X-PAYMENT auprès du facilitator Coinbase.
 * En env preview/test : mock acceptant tout header non-vide commençant par "mock_".
 */
async function verifyPayment(
  paymentHeader: string,
  env: X402Env,
  expectedPriceUsdc: number,
): Promise<{ ok: boolean; tx_hash?: string; settled_response?: string; error?: string }> {
  // Mock pour tests E2E + preview
  if (env.PUBLIC_ENV !== "production" && paymentHeader.startsWith("mock_")) {
    return { ok: true, tx_hash: `0xmock_${paymentHeader.slice(5, 17)}`, settled_response: paymentHeader };
  }
  if (!env.COINBASE_X402_FACILITATOR_KEY) {
    return { ok: false, error: "facilitator_key_missing" };
  }
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), FACILITATOR_TIMEOUT_MS);
    const res = await fetch(FACILITATOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.COINBASE_X402_FACILITATOR_KEY}`,
      },
      body: JSON.stringify({
        x_payment: paymentHeader,
        expected_price_usdc: expectedPriceUsdc.toString(),
        network: "base",
        pay_to: env.DEVREFS_TREASURY_WALLET,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) {
      return { ok: false, error: `facilitator_${res.status}` };
    }
    const json = (await res.json()) as { valid?: boolean; tx_hash?: string; settled?: string };
    if (!json.valid) return { ok: false, error: "facilitator_invalid" };
    return { ok: true, tx_hash: json.tx_hash, settled_response: json.settled };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "facilitator_exception" };
  }
}

export interface X402GateOptions {
  endpoint: "llm-prices" | "sdk-status" | "agent-audit";
  price_usdc: number;
  context: Omit<X402BodyContext, "endpoint" | "price_usdc" | "pay_to">;
}

/**
 * Gate principal : retourne soit une Response 402/4xx, soit X402Result.paid=true pour continuer.
 */
export async function x402Gate(
  request: Request,
  env: X402Env,
  opts: X402GateOptions,
): Promise<Response | X402Result> {
  const ua = uaBucket(request.headers.get("user-agent"));
  const packToken = request.headers.get("X-Pack-Token");
  const payment = request.headers.get("X-PAYMENT");

  // Pack token a priorité (call gratuit du quota)
  if (packToken) {
    return { paid: true, via: "pack" };
  }

  if (!payment) {
    emitAeEvent(env.DEVREFS_AE, "payment_x402_required", {
      endpoint: opts.endpoint,
      ua_bucket: ua,
      status_code: 402,
    });
    const body = build402Body({
      endpoint: opts.endpoint,
      price_usdc: opts.price_usdc,
      pay_to: env.DEVREFS_TREASURY_WALLET ?? "0x0",
      ...opts.context,
    });
    return new Response(JSON.stringify(body), {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": "x402",
        "X-Price-USDC": opts.price_usdc.toString(),
        "X-Network": "base",
        "X-DevRefs-Offer": opts.context.offer_type,
        "X-DevRefs-ROI-Multiplier": body.roi_summary.roi_multiplier.toString(),
        "Cache-Control": "no-store",
      },
    });
  }

  emitAeEvent(env.DEVREFS_AE, "payment_x402_attempt", { endpoint: opts.endpoint, ua_bucket: ua });
  const verify = await verifyPayment(payment, env, opts.price_usdc);
  if (!verify.ok) {
    emitAeEvent(env.DEVREFS_AE, "payment_x402_failed", {
      endpoint: opts.endpoint,
      ua_bucket: ua,
      error_code: verify.error ?? "unknown",
      status_code: 402,
    });
    return new Response(
      JSON.stringify({ error: "payment_invalid", reason: verify.error ?? "verification_failed" }),
      { status: 402, headers: { "Content-Type": "application/json", "WWW-Authenticate": "x402" } },
    );
  }
  emitAeEvent(env.DEVREFS_AE, "payment_x402_completed", {
    endpoint: opts.endpoint,
    ua_bucket: ua,
    status_code: 200,
  });
  return {
    paid: true,
    via: "x402",
    payment_response: verify.settled_response,
    tx_hash: verify.tx_hash,
  };
}
