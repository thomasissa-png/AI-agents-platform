// src/api/routes/audit-savings.ts
// POST /api/audit/savings — déclaration savings réels post-audit.
// Source : functional-specs §2.1 + dev-decisions §"Audit ID KV" + tracking-plan v2 (audit_savings_realized).

import { aeEvents, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { buildRefundMessage, verifyEip191 } from "@/api/lib/eip191";
import { KV_KEYS } from "@/api/lib/kv-keys";

export interface AuditSavingsEnv {
  AUDIT_METADATA_KV: KVNamespace;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

interface SavingsBody {
  audit_id?: string;
  savings_pct_actual?: number;
  days_since_audit?: number;
  wallet_hash?: string;
  signature?: string;
  timestamp?: string;
}

interface AuditMeta {
  wallet_hash: string;
  savings_pct?: number;
  monthly_volume_estimate?: number;
  purchased_at: string;
  refund_status?: string;
  savings_data?: Array<{ ts: string; savings_pct: number; days: number }>;
}

function jerr(status: number, error: string, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ error, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleAuditSavings(
  request: Request,
  env: AuditSavingsEnv,
): Promise<Response> {
  if (request.method !== "POST") return jerr(405, "method_not_allowed");

  let body: SavingsBody;
  try {
    body = (await request.json()) as SavingsBody;
  } catch {
    return jerr(400, "invalid_json");
  }
  const { audit_id, savings_pct_actual, days_since_audit, wallet_hash, signature, timestamp } = body;
  if (!audit_id || !wallet_hash || !signature || !timestamp) {
    return jerr(400, "missing_fields", {
      required: ["audit_id", "wallet_hash", "signature", "timestamp"],
    });
  }
  if (typeof savings_pct_actual !== "number" || savings_pct_actual < 0 || savings_pct_actual > 100) {
    return jerr(400, "INVALID_SAVINGS_PCT");
  }
  if (typeof days_since_audit !== "number" || days_since_audit < 0) {
    return jerr(400, "INVALID_DAYS");
  }

  const raw = await env.AUDIT_METADATA_KV.get(KV_KEYS.audit(audit_id));
  if (!raw) return jerr(404, "AUDIT_NOT_FOUND", { audit_id });
  const meta = JSON.parse(raw) as AuditMeta;
  if (meta.wallet_hash !== wallet_hash) return jerr(403, "WALLET_MISMATCH");

  const message = buildRefundMessage(audit_id, timestamp);
  const ver = await verifyEip191(message, signature, wallet_hash);
  if (!ver.ok) return jerr(401, "INVALID_SIGNATURE", { reason: ver.error });

  meta.savings_data = meta.savings_data ?? [];
  meta.savings_data.push({
    ts: new Date().toISOString(),
    savings_pct: savings_pct_actual,
    days: days_since_audit,
  });
  await env.AUDIT_METADATA_KV.put(KV_KEYS.audit(audit_id), JSON.stringify(meta), {
    expirationTtl: 31 * 24 * 3600,
  });

  aeEvents.write(env.DEVREFS_AE, "audit_savings_realized", {
    endpoint: "audit-savings",
    audit_id,
    wallet_hash,
    savings_pct: savings_pct_actual,
    monthly_volume_estimate: meta.monthly_volume_estimate ?? 0,
  });

  return new Response(JSON.stringify({ recorded: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
