// src/api/lib/x402-body.ts
// Helper construction body 402 augmenté ROI-first.
// Source : docs/ia/x402-response-spec.md §1.4 (body) + §2 (exemples par endpoint).
// Pricing verbatim project-context.md (single source of truth).

import { PACK_CATALOG, type PackType } from "@/api/types/pack";

export type X402OfferType =
  | "pricing_one_shot"
  | "pricing_pack"
  | "audit_one_shot"
  | "audit_pack"
  | "sdk_one_shot"
  | "sdk_pack";

export type X402Verdict = "no_brainer_buy" | "consider" | "skip" | "PAY";

export interface X402BodyContext {
  endpoint: "llm-prices" | "sdk-status" | "agent-audit";
  offer_type: X402OfferType;
  price_usdc: number;
  pay_to: string;
  // pricing/sdk : freshness depuis KV
  freshness?: {
    date_modified: string;
    fetched_at: string;
    same_as: string;
    cron_interval_hours: number;
  };
  // payload preview (clés masquées)
  payload_preview?: Record<string, unknown>;
  // ROI baseline tokens estimate (cf. agent-economics C.1)
  alternative_cost?: {
    tokens_estimated: number;
    cost_in_usd_per_model: Record<string, number>;
    note?: string;
    agent_action_if_no_devrefs?: string;
  };
}

const USDC_BASE_ASSET = {
  name: "USDC",
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  decimals: 6,
};

export interface X402Body {
  error: "payment_required";
  endpoint: string;
  x402: {
    version: "1.0";
    scheme: "exact";
    network: "base";
    price_usdc: string;
    asset: typeof USDC_BASE_ASSET;
    pay_to: string;
    max_amount_required: string;
    facilitator: string;
  };
  offer_type: X402OfferType;
  alternative_cost_estimate: {
    tokens_estimated: number;
    cost_in_usd_per_model: Record<string, number>;
    note?: string;
    agent_action_if_no_devrefs?: string;
  };
  roi_summary: {
    devrefs_price_usd: number;
    alternative_cost_usd_opus_4_7: number;
    roi_multiplier: number;
    verdict: X402Verdict;
  };
  freshness_proof?: {
    date_modified: string;
    fetched_at: string;
    same_as: string;
    freshness_hours: number;
    cron_interval_hours: number;
  };
  payload_preview?: Record<string, unknown>;
  packs_available: Record<string, { price_usdc: number; calls?: number; audits?: number; recommended?: boolean }>;
  instructions_for_agent: string;
}

function buildPacksAvailable(scope: "data" | "audit"): X402Body["packs_available"] {
  if (scope === "audit") {
    return {
      pack_pro_audit: {
        price_usdc: PACK_CATALOG.audit_pro_49.price_usdc,
        audits: PACK_CATALOG.audit_pro_49.quota_total,
        recommended: true,
      },
    };
  }
  return {
    discovery: { price_usdc: PACK_CATALOG.discovery_5.price_usdc, calls: PACK_CATALOG.discovery_5.quota_total },
    standard: {
      price_usdc: PACK_CATALOG.standard_10.price_usdc,
      calls: PACK_CATALOG.standard_10.quota_total,
      recommended: true,
    },
    pro: { price_usdc: PACK_CATALOG.pro_50.price_usdc, calls: PACK_CATALOG.pro_50.quota_total },
  };
}

function hoursBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  return Math.round(((b - a) / 36e5) * 10) / 10;
}

function priceToBaseUnits(usdc: number): string {
  return Math.round(usdc * 1e6).toString();
}

export function build402Body(ctx: X402BodyContext): X402Body {
  const scope: "data" | "audit" = ctx.endpoint === "agent-audit" ? "audit" : "data";

  // ROI baseline values verbatim agent-economics.md C.1
  const altCost = ctx.alternative_cost ?? {
    tokens_estimated: ctx.endpoint === "sdk-status" ? 95000 : 67000,
    cost_in_usd_per_model: {
      "claude-opus-4-7": ctx.endpoint === "sdk-status" ? 0.71 : 0.49,
      "claude-sonnet-4-6": ctx.endpoint === "sdk-status" ? 0.31 : 0.21,
      "claude-haiku-4-5": ctx.endpoint === "sdk-status" ? 0.1 : 0.07,
      "gpt-5": 0.17,
      "gemini-2-5-pro": 0.09,
    },
    note: "+35% tokenizer inflation Opus 4.7 included",
  };

  const opusCost = altCost.cost_in_usd_per_model["claude-opus-4-7"] ?? 0.49;
  const roiMultiplier = Math.round(opusCost / ctx.price_usdc);
  const verdict: X402Verdict =
    ctx.endpoint === "agent-audit"
      ? "no_brainer_buy"
      : roiMultiplier >= 100
        ? "no_brainer_buy"
        : roiMultiplier >= 10
          ? "consider"
          : "skip";

  const body: X402Body = {
    error: "payment_required",
    endpoint: ctx.endpoint,
    x402: {
      version: "1.0",
      scheme: "exact",
      network: "base",
      price_usdc: ctx.price_usdc.toString(),
      asset: USDC_BASE_ASSET,
      pay_to: ctx.pay_to,
      max_amount_required: priceToBaseUnits(ctx.price_usdc),
      facilitator: "https://x402.org/facilitator",
    },
    offer_type: ctx.offer_type,
    alternative_cost_estimate: altCost,
    roi_summary: {
      devrefs_price_usd: ctx.price_usdc,
      alternative_cost_usd_opus_4_7: opusCost,
      roi_multiplier: roiMultiplier,
      verdict,
    },
    packs_available: buildPacksAvailable(scope),
    instructions_for_agent:
      "Sign payment payload with EVM_PRIVATE_KEY, retry request with X-PAYMENT header. See devrefs.dev/docs/agent-integration for SDK examples (x402-axios, x402-fetch, MCP Coinbase).",
  };

  if (ctx.freshness) {
    const now = new Date().toISOString();
    body.freshness_proof = {
      date_modified: ctx.freshness.date_modified,
      fetched_at: ctx.freshness.fetched_at,
      same_as: ctx.freshness.same_as,
      freshness_hours: hoursBetween(ctx.freshness.fetched_at, now),
      cron_interval_hours: ctx.freshness.cron_interval_hours,
    };
  }
  if (ctx.payload_preview) {
    body.payload_preview = ctx.payload_preview;
  }

  return body;
}

export function buildPackTypeForOffer(offer: X402OfferType): PackType | null {
  switch (offer) {
    case "pricing_pack":
    case "sdk_pack":
      return "standard_10";
    case "audit_pack":
      return "audit_pro_49";
    default:
      return null;
  }
}
