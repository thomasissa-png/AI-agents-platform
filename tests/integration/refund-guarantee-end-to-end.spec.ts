// tests/integration/refund-guarantee-end-to-end.spec.ts
// qa-strategy §4.1 — audit J-30 + savings 11.2 % + EIP-191 sign + refund pending.

import { describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import { handleAuditRefund } from "../../src/api/routes/audit-refund.js";
import { buildRefundMessage, sha256Hex } from "../../src/api/lib/eip191.js";
import { KV_KEYS } from "../../src/api/lib/kv-keys.js";

const FIXTURE_PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

function mkKv(): KVNamespace {
  const data = new Map<string, string>();
  return {
    get: async (k: string) => data.get(k) ?? null,
    put: async (k: string, v: string) => {
      data.set(k, v);
    },
    delete: async (k: string) => {
      data.delete(k);
    },
    list: async () => ({
      keys: Array.from(data.keys()).map((k) => ({ name: k })),
      list_complete: true,
    }),
  } as unknown as KVNamespace;
}

describe("§4.1 refund guarantee end-to-end", () => {
  it("audit J-30 + 4 conditions OK + EIP-191 → refund pending", async () => {
    const kv = mkKv();
    const account = privateKeyToAccount(FIXTURE_PK);
    const walletHash = await sha256Hex(account.address.toLowerCase());
    const purchasedAt = new Date(Date.now() - 25 * 24 * 3600 * 1000); // J-25
    await kv.put(
      KV_KEYS.audit("aud_pivot_1"),
      JSON.stringify({
        audit_id: "aud_pivot_1",
        wallet_hash: walletHash,
        savings_pct: 30,
        monthly_volume_estimate: 8_000_000, // > 5M
        purchased_at: purchasedAt.toISOString(),
        refund_status: "none",
        refund_tx_hash: null,
        pack_origin: "one_shot",
      }),
    );
    const ts = new Date().toISOString();
    const sig = await account.signMessage({
      message: buildRefundMessage("aud_pivot_1", ts),
    });

    const r = await handleAuditRefund(
      new Request("https://x/api/audit/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: "aud_pivot_1",
          wallet_hash: walletHash,
          timestamp: ts,
          signature: sig,
          evidence: {
            savings_pct_measured: 11.2, // < 15
            measurement_period_days: 35, // > 30
            recommendations_applied_pct: 90, // > 80
          },
        }),
      }),
      { AUDIT_METADATA_KV: kv },
    );
    expect(r.status).toBe(200);
    const body = (await r.json()) as { status: string; refund_amount_usdc: number };
    expect(body.status).toBe("approved");
    expect(body.refund_amount_usdc).toBe(4.995);

    // KV refund_status doit être "pending"
    const stored = JSON.parse((await kv.get(KV_KEYS.audit("aud_pivot_1"))) as string);
    expect(stored.refund_status).toBe("pending");
  });

  it("savings ≥ 15 % → REFUND_INELIGIBLE", async () => {
    const kv = mkKv();
    const account = privateKeyToAccount(FIXTURE_PK);
    const walletHash = await sha256Hex(account.address.toLowerCase());
    await kv.put(
      KV_KEYS.audit("aud_high_savings"),
      JSON.stringify({
        audit_id: "aud_high_savings",
        wallet_hash: walletHash,
        savings_pct: 30,
        monthly_volume_estimate: 8_000_000,
        purchased_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        refund_status: "none",
        refund_tx_hash: null,
        pack_origin: "one_shot",
      }),
    );
    const ts = new Date().toISOString();
    const sig = await account.signMessage({ message: buildRefundMessage("aud_high_savings", ts) });
    const r = await handleAuditRefund(
      new Request("https://x/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: "aud_high_savings",
          wallet_hash: walletHash,
          timestamp: ts,
          signature: sig,
          evidence: {
            savings_pct_measured: 22,
            measurement_period_days: 35,
            recommendations_applied_pct: 90,
          },
        }),
      }),
      { AUDIT_METADATA_KV: kv },
    );
    expect(r.status).toBe(400);
    const j = (await r.json()) as { error: string };
    expect(j.error).toBe("REFUND_INELIGIBLE");
  });
});
