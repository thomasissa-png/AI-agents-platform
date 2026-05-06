// src/api/routes/audit-refund.ts
// POST /api/audit/refund — endpoint claim refund garanti.
// Source : CGU Art. 4ter (4 conditions cumulatives) + dev-decisions §"Garantie refund".
// Note : V1 fait confiance à la déclaration sponsor pour `evidence`.
// Validation manuelle Thomas avant settle on-chain (email Mailchannels).

import type { AuditMetadataKv, RefundRequestBody, RefundResponseApproved, RefundResponseRejected } from "@/api/types/audit";
import { KV_KEYS } from "@/api/lib/kv-keys";
import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { buildRefundMessage, verifyEip191 } from "@/api/lib/eip191";

export interface AuditRefundEnv {
  AUDIT_METADATA_KV: KVNamespace;
  HMAC_SECRET_KEY?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
}

const REFUND_DELAY_MAX_DAYS = 30;

export async function handleAuditRefund(request: Request, env: AuditRefundEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    });
  }

  let body: RefundRequestBody;
  try {
    body = (await request.json()) as RefundRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.audit_id || !body.wallet_hash || !body.evidence || !body.signature || !body.timestamp) {
    return new Response(
      JSON.stringify({
        error: "missing_fields",
        required: ["audit_id", "wallet_hash", "evidence", "signature", "timestamp"],
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // EIP-191 strict via viem ecrecover — message canonique DevRefs.
  const message = buildRefundMessage(body.audit_id, body.timestamp);
  const ver = await verifyEip191(message, body.signature, body.wallet_hash);
  if (!ver.ok) {
    return new Response(
      JSON.stringify({ error: "INVALID_SIGNATURE", reason: ver.error }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  emitAeEvent(env.DEVREFS_AE, "audit_refund_requested", {
    endpoint: "audit-refund",
    audit_id: body.audit_id,
    wallet_hash: body.wallet_hash,
  });

  const raw = await env.AUDIT_METADATA_KV.get(KV_KEYS.audit(body.audit_id));
  if (!raw) {
    return new Response(JSON.stringify({ error: "AUDIT_NOT_FOUND", audit_id: body.audit_id }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const meta = JSON.parse(raw) as AuditMetadataKv;

  if (meta.wallet_hash !== body.wallet_hash) {
    return new Response(JSON.stringify({ error: "WALLET_MISMATCH" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (meta.refund_status !== "none") {
    return new Response(
      JSON.stringify({ error: "GUARANTEE_ALREADY_CLAIMED", current_status: meta.refund_status }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }
  const ageMs = Date.now() - new Date(meta.purchased_at).getTime();
  if (ageMs > REFUND_DELAY_MAX_DAYS * 24 * 3600 * 1000) {
    const rejected: RefundResponseRejected = {
      status: "rejected",
      error: "REFUND_INELIGIBLE",
      failed_conditions: ["claim_window_expired (>30 days)"],
      audit_id: body.audit_id,
    };
    return new Response(JSON.stringify(rejected), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4 conditions cumulatives CGU Art. 4ter
  const failed: string[] = [];
  if (meta.monthly_volume_estimate < 5_000_000) failed.push("monthly_volume_estimate < 5,000,000");
  if (body.evidence.recommendations_applied_pct < 80) failed.push("recommendations_applied_pct < 80");
  if (body.evidence.measurement_period_days < 30) failed.push("measurement_period_days < 30");
  if (body.evidence.savings_pct_measured >= 15) failed.push("savings_pct_measured >= 15 (audit was accurate)");

  if (failed.length > 0) {
    emitAeEvent(env.DEVREFS_AE, "audit_refund_rejected", {
      endpoint: "audit-refund",
      audit_id: body.audit_id,
      wallet_hash: body.wallet_hash,
      error_code: "REFUND_INELIGIBLE",
    });
    const rejected: RefundResponseRejected = {
      status: "rejected",
      error: "REFUND_INELIGIBLE",
      failed_conditions: failed,
      audit_id: body.audit_id,
    };
    return new Response(JSON.stringify(rejected), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Approuvé — pending settle manuel Thomas
  const refundAmount = meta.pack_origin === "audit_pack" ? 4.08 : 4.995;
  meta.refund_status = "pending";
  await env.AUDIT_METADATA_KV.put(KV_KEYS.audit(body.audit_id), JSON.stringify(meta), {
    expirationTtl: 13 * 30 * 24 * 3600,
  });

  emitAeEvent(env.DEVREFS_AE, "audit_refund_triggered", {
    endpoint: "audit-refund",
    audit_id: body.audit_id,
    wallet_hash: body.wallet_hash,
    savings_pct: meta.savings_pct,
  });

  const approved: RefundResponseApproved = {
    status: "approved",
    refund_amount_usdc: refundAmount,
    refund_wallet: body.wallet_hash,
    audit_id: body.audit_id,
    message:
      "Refund approved (pending manual settle ≤ 5 business days). You will receive USDC on Base to your verified wallet.",
  };
  return new Response(JSON.stringify(approved), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
