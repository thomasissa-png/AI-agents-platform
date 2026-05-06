// tests/unit/jwt-rate-limit.spec.ts
// Tests JWT validation + rate limit middleware (couverture).

import { describe, it, expect, beforeEach } from "vitest";
import { issueJwt, validateJwt } from "@/api/middleware/jwt-validate";
import { checkRateLimit, rateLimit429Response } from "@/api/middleware/rate-limit";

class MockKV {
  store = new Map<string, string>();
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }
  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

const SECRET = "test_jwt_secret_min_16_chars_xx";
const WALLET = "w".repeat(64);

describe("issueJwt + validateJwt — happy path", () => {
  it("issues a token, validates it, and stores active jti in KV", async () => {
    const kv = new MockKV();
    const env = { JWT_SECRET: SECRET, JWT_KV: kv as never };
    const token = await issueJwt(WALLET, env);
    expect(token).toBeTruthy();
    expect(token!.split(".").length).toBe(3);
    const v = await validateJwt(token!, env);
    expect(v.ok).toBe(true);
    expect(v.payload?.sub).toBe(WALLET);
    expect(v.payload?.scope).toBe("sponsor_dashboard");
  });

  it("rejects revoked jti", async () => {
    const kv = new MockKV();
    const env = { JWT_SECRET: SECRET, JWT_KV: kv as never };
    const token = await issueJwt(WALLET, env);
    // Override jti as "revoked"
    const v0 = await validateJwt(token!, env);
    if (v0.ok && v0.payload) {
      kv.store.set(`jwt:${v0.payload.jti}`, "revoked");
    }
    const v = await validateJwt(token!, env);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("revoked");
  });

  it("rejects malformed token", async () => {
    const env = { JWT_SECRET: SECRET, JWT_KV: new MockKV() as never };
    const v = await validateJwt("not.a.jwt.token.too.many.parts", env);
    expect(v.ok).toBe(false);
  });

  it("rejects when JWT_SECRET missing", async () => {
    const env = { JWT_KV: new MockKV() as never } as never;
    const v = await validateJwt("a.b.c", env);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("jwt_secret_missing");
  });

  it("rejects bad signature", async () => {
    const env = { JWT_SECRET: SECRET, JWT_KV: new MockKV() as never };
    // Forge un token avec mauvaise signature
    const token = await issueJwt(WALLET, env);
    const tampered = token!.split(".").slice(0, 2).join(".") + ".badsig";
    const v = await validateJwt(tampered, env);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("bad_signature");
  });

  it("returns null from issueJwt when JWT_SECRET missing", async () => {
    const env = { JWT_KV: new MockKV() as never } as never;
    expect(await issueJwt(WALLET, env)).toBeNull();
  });
});

describe("checkRateLimit", () => {
  let kv: MockKV;
  let env: { PACK_KV: MockKV };
  beforeEach(() => {
    kv = new MockKV();
    env = { PACK_KV: kv };
  });

  it("allows under limit (oneshot mode)", async () => {
    const r = await checkRateLimit(env as never, WALLET, "oneshot");
    expect(r.ok).toBe(true);
    expect(r.count).toBe(1);
    expect(r.limit).toBe(1000);
  });

  it("rejects over limit (oneshot mode)", async () => {
    const day = new Date().toISOString().slice(0, 10);
    kv.store.set(`ratelimit:oneshot:${WALLET}:${day}`, "999");
    const r1 = await checkRateLimit(env as never, WALLET, "oneshot");
    expect(r1.ok).toBe(true);
    expect(r1.count).toBe(1000);
    const r2 = await checkRateLimit(env as never, WALLET, "oneshot");
    expect(r2.ok).toBe(false);
    expect(r2.count).toBe(1001);
  });

  it("uses higher limit on pack mode", async () => {
    const r = await checkRateLimit(env as never, WALLET, "pack");
    expect(r.limit).toBe(100_000);
  });

  it("returns ok=true on empty wallet hash (no-op)", async () => {
    const r = await checkRateLimit(env as never, "", "oneshot");
    expect(r.ok).toBe(true);
    expect(r.count).toBe(0);
  });

  it("rateLimit429Response builds a valid 429 with Retry-After", async () => {
    const res = rateLimit429Response(1001, 1000);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Limit")).toBe("1000");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});
