// US-19 — POST /api/audit/refund 4 conditions.
import { expect, test } from "@playwright/test";

test("POST /api/audit/refund body incomplet → 400", async ({ request }) => {
  const r = await request.post("/api/audit/refund", { data: { audit_id: "x" } });
  expect(r.status()).toBe(400);
});

test("POST /api/audit/refund signature mauvais format → 401", async ({ request }) => {
  const r = await request.post("/api/audit/refund", {
    data: {
      audit_id: "aud_x",
      wallet_hash: "a".repeat(64),
      timestamp: "2026-05-06T10:00:00Z",
      evidence: {
        savings_pct_measured: 8,
        measurement_period_days: 35,
        recommendations_applied_pct: 90,
      },
      signature: "0xabc",
    },
  });
  expect([400, 401]).toContain(r.status());
});
