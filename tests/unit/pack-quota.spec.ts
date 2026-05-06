// tests/unit/pack-quota.spec.ts
// qa-strategy §4.5 + §4.6 — quota lookup < 50 ms p95 (vérifié indirectement via mock).

import { describe, it, expect, beforeEach } from "vitest";
import { checkAndConsumePack } from "@/api/middleware/pack-quota";
import { signPayload } from "@/api/lib/hmac";
import { KV_KEYS } from "@/api/lib/kv-keys";

const SECRET = "test_secret_min_16_chars_long_xx";

class MockKV {
  store = new Map<string, string>();
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }
  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

async function makeToken(walletHash: string): Promise<string> {
  const sig = await signPayload({ wallet_hash: walletHash }, SECRET);
  return `${walletHash}.${sig}`;
}

const WALLET = "a".repeat(64); // SHA256 hex 64 chars

describe("checkAndConsumePack", () => {
  let kv: MockKV;
  let env: { PACK_KV: MockKV; HMAC_SECRET_KEY: string };

  beforeEach(() => {
    kv = new MockKV();
    env = { PACK_KV: kv, HMAC_SECRET_KEY: SECRET };
    kv.store.set(KV_KEYS.packRemaining(WALLET), "100");
    kv.store.set(KV_KEYS.packType(WALLET), "standard_10");
    kv.store.set(KV_KEYS.packQuotaTotal(WALLET), "10000");
    kv.store.set(KV_KEYS.packEndpointScope(WALLET), "data");
  });

  it("rejects when no token", async () => {
    const req = new Request("https://devrefs.dev/api/llm-prices");
    const r = await checkAndConsumePack(req, env as never, "data", "llm-prices");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("missing_token");
  });

  it("rejects malformed token", async () => {
    const req = new Request("https://devrefs.dev/", {
      headers: { "X-Pack-Token": "not-a-valid-token" },
    });
    const r = await checkAndConsumePack(req, env as never, "data", "llm-prices");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("invalid_signature");
  });

  it("decrements remaining on success", async () => {
    const token = await makeToken(WALLET);
    const req = new Request("https://devrefs.dev/", { headers: { "X-Pack-Token": token } });
    const r = await checkAndConsumePack(req, env as never, "data", "llm-prices");
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(99);
    expect(kv.store.get(KV_KEYS.packRemaining(WALLET))).toBe("99");
  });

  it("returns pack_exhausted when remaining = 0", async () => {
    kv.store.set(KV_KEYS.packRemaining(WALLET), "0");
    const token = await makeToken(WALLET);
    const req = new Request("https://devrefs.dev/", { headers: { "X-Pack-Token": token } });
    const r = await checkAndConsumePack(req, env as never, "data", "llm-prices");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("pack_exhausted");
    expect(r.remaining).toBe(0);
  });

  it("rejects wrong scope (data pack used for audit)", async () => {
    const token = await makeToken(WALLET);
    const req = new Request("https://devrefs.dev/", { headers: { "X-Pack-Token": token } });
    const r = await checkAndConsumePack(req, env as never, "audit", "agent-audit");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("wrong_scope");
  });

  it("rejects expired pack", async () => {
    kv.store.set(KV_KEYS.packExpiresAt(WALLET), "2020-01-01T00:00:00Z");
    const token = await makeToken(WALLET);
    const req = new Request("https://devrefs.dev/", { headers: { "X-Pack-Token": token } });
    const r = await checkAndConsumePack(req, env as never, "data", "llm-prices");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("expired");
  });

  it("returns pack_not_found if KV empty", async () => {
    const otherWallet = "b".repeat(64);
    const token = await makeToken(otherWallet);
    const req = new Request("https://devrefs.dev/", { headers: { "X-Pack-Token": token } });
    const r = await checkAndConsumePack(req, env as never, "data", "llm-prices");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("pack_not_found");
  });

  it("lookup completes well under 50ms (mock-based proxy for p95)", async () => {
    const token = await makeToken(WALLET);
    const req = new Request("https://devrefs.dev/", { headers: { "X-Pack-Token": token } });
    const t0 = performance.now();
    await checkAndConsumePack(req, env as never, "data", "llm-prices");
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(50);
  });
});
