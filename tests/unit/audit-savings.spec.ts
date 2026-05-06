// tests/unit/audit-savings.spec.ts
// POST /api/audit/savings — validation EIP-191 + persistance KV.

import { describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import { handleAuditSavings } from "../../src/api/routes/audit-savings.js";
import { buildRefundMessage, sha256Hex } from "../../src/api/lib/eip191.js";
import { KV_KEYS } from "../../src/api/lib/kv-keys.js";

const FIXTURE_PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

interface KvStore {
  data: Map<string, string>;
}
function mkKv(): KVNamespace {
  const data = new Map<string, string>();
  return {
    async get(k: string) {
      return data.get(k) ?? null;
    },
    async put(k: string, v: string) {
      data.set(k, v);
    },
    async delete(k: string) {
      data.delete(k);
    },
    async list() {
      return { keys: Array.from(data.keys()).map((k) => ({ name: k })), list_complete: true };
    },
  } as unknown as KVNamespace & KvStore;
}

describe("audit-savings route", () => {
  it("payload signé valide → 200 + KV mis à jour", async () => {
    const kv = mkKv();
    const account = privateKeyToAccount(FIXTURE_PK);
    const walletHash = await sha256Hex(account.address.toLowerCase());
    await kv.put(
      KV_KEYS.audit("aud_x"),
      JSON.stringify({
        wallet_hash: walletHash,
        purchased_at: new Date().toISOString(),
        savings_pct: 30,
        monthly_volume_estimate: 8_000_000,
        refund_status: "none",
      }),
    );
    const ts = "2026-05-06T10:00:00Z";
    const sig = await account.signMessage({ message: buildRefundMessage("aud_x", ts) });
    const r = await handleAuditSavings(
      new Request("https://x/api/audit/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: "aud_x",
          savings_pct_actual: 22.5,
          days_since_audit: 31,
          wallet_hash: walletHash,
          signature: sig,
          timestamp: ts,
        }),
      }),
      { AUDIT_METADATA_KV: kv },
    );
    expect(r.status).toBe(200);
    const stored = JSON.parse((await kv.get(KV_KEYS.audit("aud_x"))) as string);
    expect(stored.savings_data).toHaveLength(1);
    expect(stored.savings_data[0].savings_pct).toBe(22.5);
  });

  it("audit_id absent → 404", async () => {
    const kv = mkKv();
    const account = privateKeyToAccount(FIXTURE_PK);
    const walletHash = await sha256Hex(account.address.toLowerCase());
    const ts = "2026-05-06T10:00:00Z";
    const sig = await account.signMessage({ message: buildRefundMessage("nope", ts) });
    const r = await handleAuditSavings(
      new Request("https://x/api/audit/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: "nope",
          savings_pct_actual: 10,
          days_since_audit: 30,
          wallet_hash: walletHash,
          signature: sig,
          timestamp: ts,
        }),
      }),
      { AUDIT_METADATA_KV: kv },
    );
    expect(r.status).toBe(404);
  });

  it("savings_pct_actual hors bornes → 400", async () => {
    const kv = mkKv();
    const r = await handleAuditSavings(
      new Request("https://x/api/audit/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: "x",
          savings_pct_actual: 150,
          days_since_audit: 30,
          wallet_hash: "a".repeat(64),
          signature: "0x" + "0".repeat(130),
          timestamp: "2026-05-06T10:00:00Z",
        }),
      }),
      { AUDIT_METADATA_KV: kv },
    );
    expect(r.status).toBe(400);
  });
});
