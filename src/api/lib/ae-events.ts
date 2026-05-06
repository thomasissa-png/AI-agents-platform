// src/api/lib/ae-events.ts
// Helper émission events vers Cloudflare Analytics Engine.
// Source : tracking-plan v2 + dev-decisions §"47 events à instrumenter".
// Garde anti-PII : aucune string d'email, IP brute ou UA complet — seulement wallet_hash, ua_bucket, agrégats.

export type AeEventName =
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
  | "audit_request_received"
  | "audit_input_validation_failed"
  | "audit_delivered"
  | "audit_refund_requested"
  | "audit_refund_triggered"
  | "audit_refund_rejected"
  | "jwt_issued"
  | "jwt_validated"
  | "jwt_rejected";

export interface AnalyticsEngineDataset {
  writeDataPoint(point: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}

export interface AeEventContext {
  endpoint?: string;
  wallet_hash?: string; // SHA256, jamais wallet brute
  ua_bucket?: string; // catégoriel : "claude-code" | "openai-sdk" | "browser" | "other" (10 max)
  status_code?: number;
  latency_ms?: number;
  payload_size_bytes?: number;
  freshness_hours?: number;
  pack_type?: string;
  quota_remaining?: number;
  error_code?: string;
  // audit-specific
  audit_id?: string;
  savings_pct?: number;
  recommendations_count?: number;
  monthly_volume_estimate?: number;
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
  if (!ds) return; // tolérant en local/test

  // Échantillonnage haute volumétrie : 1/100 calls + force seuils
  if (name === "pack_quota_consumed") {
    const remaining = ctx.quota_remaining ?? -1;
    const total = ctx.payload_size_bytes ?? 0; // détourné ici comme placeholder seuils — voir routes
    const isMilestone = total > 0 && (
      remaining === 0 ||
      remaining === Math.floor(total * 0.25) ||
      remaining === Math.floor(total * 0.5) ||
      remaining === Math.floor(total * 0.75)
    );
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
  ];

  try {
    ds.writeDataPoint({
      blobs,
      doubles,
      indexes: [name],
    });
  } catch {
    // AE write best-effort, ne bloque jamais le handler
  }
}

/**
 * Catégorise un user-agent en bucket (max 10 valeurs distinctes pour cardinality AE).
 */
export function uaBucket(ua: string | null): string {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (lower.includes("claude-code")) return "claude-code";
  if (lower.includes("anthropic")) return "anthropic-sdk";
  if (lower.includes("openai")) return "openai-sdk";
  if (lower.includes("axios")) return "axios";
  if (lower.includes("node-fetch") || lower.includes("undici")) return "fetch";
  if (lower.includes("python")) return "python";
  if (lower.includes("curl")) return "curl";
  if (lower.includes("mozilla") || lower.includes("chrome") || lower.includes("safari")) return "browser";
  if (lower.includes("bot") || lower.includes("crawler")) return "bot";
  return "other";
}
