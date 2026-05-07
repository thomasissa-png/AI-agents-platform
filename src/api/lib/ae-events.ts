// src/api/lib/ae-events.ts
// Helper émission events vers Cloudflare Analytics Engine.
// Source : tracking-plan v2 + dev-decisions §"47 events à instrumenter".
// Garde anti-PII : aucune string d'email, IP brute ou UA complet — seulement wallet_hash, ua_bucket, agrégats.

export type AeEventName =
  // Core API (4a/4b/4c/4d)
  | "api_request_received"
  | "api_response_200_sent"
  | "api_response_4xx_sent"
  | "api_response_5xx_sent"
  | "payment_x402_required"
  | "payment_x402_attempt"
  | "payment_x402_completed"
  | "payment_x402_failed"
  | "pack_quota_consumed"
  | "pack_quota_exhausted"
  | "pack_purchased"
  | "pack_purchase_failed_400"
  | "pack_purchase_failed_409"
  | "pack_expired"
  | "badge_roi_rendered"
  | "badge_roi_clicked"
  | "roi_calculator_viewed"
  | "roi_calculator_interacted"
  | "roi_calculator_cta_clicked"
  | "audit_share_clicked"
  | "audit_request_received"
  | "audit_input_validation_failed"
  | "audit_delivered"
  | "audit_refund_requested"
  | "audit_refund_triggered"
  | "audit_refund_rejected"
  | "audit_savings_realized"
  | "jwt_issued"
  | "jwt_validated"
  | "jwt_rejected"
  // 4e — Sponsor Stripe top-up flow
  | "sponsor_topup_stripe_initiated"
  | "sponsor_topup_stripe_completed"
  | "sponsor_topup_stripe_failed"
  | "sponsor_jwt_issued"
  | "sponsor_consent_recorded"
  // 4e — Quality instrumentation
  | "quality_payload_size_measured"
  | "quality_latency_measured"
  | "quality_freshness_measured"
  | "quality_watermark_verified"
  // 4e — Crawl & UA bucketing
  | "crawl_dataset_jsonld_parsed"
  | "crawl_llms_txt_fetched"
  | "crawl_openapi_fetched"
  | "crawl_sitemap_fetched"
  // 4e — Landing & frontend
  | "landing_page_view"
  | "landing_scroll_depth"
  | "landing_cta_clicked"
  | "landing_cta_curl_copied"
  | "landing_faq_expanded"
  // 4e — Webhook idempotency
  | "webhook_received"
  | "webhook_duplicate_ignored"
  | "webhook_signature_invalid"
  // 4e — Email
  | "email_sent"
  | "email_failed";

export interface AnalyticsEngineDataset {
  writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void;
}

export interface AeEventContext {
  endpoint?: string;
  wallet_hash?: string;
  ua_bucket?: string;
  status_code?: number;
  latency_ms?: number;
  payload_size_bytes?: number;
  freshness_hours?: number;
  pack_type?: string;
  quota_remaining?: number;
  error_code?: string;
  audit_id?: string;
  savings_pct?: number;
  recommendations_count?: number;
  monthly_volume_estimate?: number;
  // 4e additions
  amount_usdc?: number;
  amount_eur?: number;
  scroll_pct?: number;
  template_name?: string;
  webhook_id?: string;
  watermark_valid?: number; // 0 | 1
  consent_count?: number;
  // Phase 4 viral / widget additions
  price_usdc?: number;
  quota_total?: number;
  tx_hash?: string;
  via?: string; // x402 | pack | none
  savings_bucket?: string; // low | mid | high
}

/**
 * Émet un event vers Analytics Engine.
 * Échantillonnage 1/100 sur events haute volumétrie (pack_quota_consumed) — cf. dev-decisions.
 */
export function emitAeEvent(
  ds: AnalyticsEngineDataset | undefined,
  name: AeEventName,
  ctx: AeEventContext = {},
): void {
  if (!ds) return;

  if (name === "pack_quota_consumed") {
    const remaining = ctx.quota_remaining ?? -1;
    const total = ctx.payload_size_bytes ?? 0;
    const isMilestone =
      total > 0 &&
      (remaining === 0 ||
        remaining === Math.floor(total * 0.25) ||
        remaining === Math.floor(total * 0.5) ||
        remaining === Math.floor(total * 0.75));
    if (!isMilestone && Math.random() > 0.01) return;
  }

  const blobs: string[] = [
    name,
    ctx.endpoint ?? "",
    ctx.wallet_hash ?? "",
    ctx.ua_bucket ?? "",
    ctx.pack_type ?? "",
    ctx.error_code ?? "",
    ctx.audit_id ?? "",
    ctx.template_name ?? "",
    ctx.webhook_id ?? "",
  ];
  const doubles: number[] = [
    ctx.status_code ?? 0,
    ctx.latency_ms ?? 0,
    ctx.payload_size_bytes ?? 0,
    ctx.freshness_hours ?? 0,
    ctx.quota_remaining ?? 0,
    ctx.savings_pct ?? 0,
    ctx.recommendations_count ?? 0,
    ctx.monthly_volume_estimate ?? 0,
    ctx.amount_usdc ?? 0,
    ctx.amount_eur ?? 0,
    ctx.scroll_pct ?? 0,
    ctx.watermark_valid ?? 0,
    ctx.consent_count ?? 0,
  ];

  try {
    ds.writeDataPoint({ blobs, doubles, indexes: [name] });
  } catch {
    // best-effort
  }
}

/**
 * Catégorise un user-agent en bucket (max 10 valeurs distinctes pour cardinality AE).
 * Étendu v2 : ajout buckets crawl-IA spécifiques (claude_bot, gpt_bot, gemini_bot, perplexity_bot, cursor_agent).
 */
export function uaBucket(ua: string | null): string {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  // Crawlers IA (priorité haute pour analyse GEO)
  if (lower.includes("claudebot") || lower.includes("anthropic-ai")) return "claude_bot";
  if (lower.includes("gptbot") || lower.includes("oai-searchbot") || lower.includes("chatgpt-user")) return "gpt_bot";
  if (lower.includes("google-extended") || lower.includes("gemini") || lower.includes("googleother")) return "gemini_bot";
  if (lower.includes("perplexitybot") || lower.includes("perplexity-user")) return "perplexity_bot";
  if (lower.includes("cursor")) return "cursor_agent";
  // SDK clients agents
  if (lower.includes("claude-code")) return "claude-code";
  if (lower.includes("anthropic")) return "anthropic-sdk";
  if (lower.includes("openai")) return "openai-sdk";
  if (lower.includes("axios")) return "axios";
  if (lower.includes("node-fetch") || lower.includes("undici")) return "fetch";
  if (lower.includes("python")) return "python";
  if (lower.includes("curl")) return "curl";
  if (lower.includes("mozilla") || lower.includes("chrome") || lower.includes("safari")) return "browser";
  if (lower.includes("bot") || lower.includes("crawler") || lower.includes("spider")) return "other_bot";
  return "other";
}

/**
 * Helper public : namespace pour grep "aeEvents.write" — alias d'emitAeEvent.
 * Forme uniforme demandée par dev-decisions §"Émission events".
 */
export const aeEvents = {
  write(ds: AnalyticsEngineDataset | undefined, name: AeEventName, ctx: AeEventContext = {}): void {
    emitAeEvent(ds, name, ctx);
  },
};
