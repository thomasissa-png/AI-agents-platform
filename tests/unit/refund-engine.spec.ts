// tests/unit/refund-engine.spec.ts
// 4 conditions cumulatives CGU Art. 4ter — happy path + chaque condition fail isolée.

import { describe, it, expect, beforeEach } from "vitest";
import { handleAuditRefund } from "@/api/routes/audit-refund";
import type { AuditMetadataKv } from "@/api/types/audit";
import { KV_KEYS } from "@/api/lib/kv-keys";

class MockKV {
  store = new Map<string, string>();
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }
  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

const VALID_SIG = "0x" + "a".repeat(130);

const VALID_META: AuditMetadataKv = {
  audit_id: "aud_2026-05-06_abc123",
  wallet_hash: "w".repeat(64),
  savings_pct: 40,
  monthly_volume_estimate: 10_000_000,
  purchased_at: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(), // 35 jours
  refund_status: "none",
  refund_tx_hash: null,
  pack_origin: "one_shot",
};

function makeReq(body: object): Request {
  return new Request("https://devrefs.dev/api/audit/refund", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("handleAuditRefund", () => {
  let kv: MockKV;
  let env: { AUDIT_METADATA_KV: MockKV };

  beforeEach(() => {
    kv = new MockKV();
    env = { AUDIT_METADATA_KV: kv };
  });

  it("rejects non-POST", async () => {
    const req = new Request("https://devrefs.dev/api/audit/refund", { method: "GET" });
    const res = await handleAuditRefund(req, env as never);
    expect(res.status).toBe(405);
  });

  it("rejects missing fields", async () => {
    const res = await handleAuditRefund(makeReq({ audit_id: "x" }), env as never);
    expect(res.status).toBe(400);
  });

  it("rejects invalid signature format", async () => {
    const res = await handleAuditRefund(
      makeReq({
        audit_id: "x",
        wallet_hash: "w".repeat(64),
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: "not-hex",
      }),
      env as never,
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown audit_id", async () => {
    const res = await handleAuditRefund(
      makeReq({
        audit_id: "unknown",
        wallet_hash: "w".repeat(64),
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(404);
  });

  it("rejects wallet mismatch", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString() };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: "z".repeat(64),
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(403);
  });

  it("rejects already-claimed refund", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString(), refund_status: "approved" as const };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(409);
  });

  it("rejects when claim window > 30 days", async () => {
    const meta = { ...VALID_META, purchased_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString() };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { failed_conditions: string[] };
    expect(json.failed_conditions[0]).toContain("claim_window_expired");
  });

  it("rejects when monthly_volume_estimate < 5M", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString(), monthly_volume_estimate: 1_000_000 };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(400);
  });

  it("rejects when recommendations_applied_pct < 80", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString() };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 50 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(400);
  });

  it("rejects when measurement_period_days < 30", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString() };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 10, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(400);
  });

  it("rejects when savings_pct_measured >= 15 (audit was accurate)", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString() };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 30, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(400);
  });

  it("approves refund when all 4 conditions met", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString() };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string; refund_amount_usdc: number };
    expect(json.status).toBe("approved");
    expect(json.refund_amount_usdc).toBe(4.995);
    // Vérifie KV update vers pending
    const updated = JSON.parse(kv.store.get(KV_KEYS.audit(meta.audit_id))!) as AuditMetadataKv;
    expect(updated.refund_status).toBe("pending");
  });

  it("returns 4.08 USDC refund for audit_pack origin", async () => {
    const meta = { ...VALID_META, purchased_at: new Date().toISOString(), pack_origin: "audit_pack" as const };
    kv.store.set(KV_KEYS.audit(meta.audit_id), JSON.stringify(meta));
    const res = await handleAuditRefund(
      makeReq({
        audit_id: meta.audit_id,
        wallet_hash: meta.wallet_hash,
        evidence: { savings_pct_measured: 5, measurement_period_days: 35, recommendations_applied_pct: 90 },
        signature: VALID_SIG,
      }),
      env as never,
    );
    const json = (await res.json()) as { refund_amount_usdc: number };
    expect(json.refund_amount_usdc).toBe(4.08);
  });
});
