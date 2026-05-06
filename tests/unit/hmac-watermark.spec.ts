// tests/unit/hmac-watermark.spec.ts
// Tests signature watermark HMAC — qa-strategy §4.4.

import { describe, it, expect } from "vitest";
import {
  canonicalizeJson,
  signPayload,
  verifySignature,
  generateAuditId,
  generateUuidV4,
  sha256Hex,
} from "@/api/lib/hmac";

const SECRET = "test_secret_min_16_chars_long_xx";

describe("canonicalizeJson", () => {
  it("orders object keys alphabetically", () => {
    expect(canonicalizeJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
  });
  it("recurses into nested objects", () => {
    expect(canonicalizeJson({ b: { y: 2, x: 1 }, a: 1 })).toBe('{"a":1,"b":{"x":1,"y":2}}');
  });
  it("preserves array order", () => {
    expect(canonicalizeJson([3, 1, 2])).toBe("[3,1,2]");
  });
  it("handles primitives", () => {
    expect(canonicalizeJson("hello")).toBe('"hello"');
    expect(canonicalizeJson(42)).toBe("42");
    expect(canonicalizeJson(null)).toBe("null");
  });
});

describe("signPayload", () => {
  it("produces deterministic signature for same payload", async () => {
    const sig1 = await signPayload({ a: 1, b: 2 }, SECRET);
    const sig2 = await signPayload({ b: 2, a: 1 }, SECRET);
    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^[a-f0-9]{64}$/);
  });
  it("differs for different payloads", async () => {
    const sig1 = await signPayload({ a: 1 }, SECRET);
    const sig2 = await signPayload({ a: 2 }, SECRET);
    expect(sig1).not.toBe(sig2);
  });
  it("rejects short secret", async () => {
    await expect(signPayload({ a: 1 }, "short")).rejects.toThrow();
  });
});

describe("verifySignature", () => {
  it("validates a correct signature", async () => {
    const payload = { foo: "bar", n: 42 };
    const sig = await signPayload(payload, SECRET);
    expect(await verifySignature(payload, sig, SECRET)).toBe(true);
  });
  it("rejects tampered payload", async () => {
    const sig = await signPayload({ foo: "bar" }, SECRET);
    expect(await verifySignature({ foo: "baz" }, sig, SECRET)).toBe(false);
  });
  it("rejects wrong signature", async () => {
    expect(await verifySignature({ foo: "bar" }, "deadbeef".repeat(8), SECRET)).toBe(false);
  });
  it("rejects empty signature", async () => {
    expect(await verifySignature({ foo: "bar" }, "", SECRET)).toBe(false);
  });
});

describe("generateAuditId", () => {
  it("produces format aud_{uuid_v4}", () => {
    const id = generateAuditId(new Date("2026-05-06T12:00:00Z"));
    expect(id).toMatch(/^aud_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it("is unique across calls", () => {
    const a = generateAuditId();
    const b = generateAuditId();
    expect(a).not.toBe(b);
  });
});

describe("generateUuidV4 / sha256Hex", () => {
  it("uuid v4 format", () => {
    expect(generateUuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it("sha256 hex 64 chars", async () => {
    const h = await sha256Hex("hello");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});
