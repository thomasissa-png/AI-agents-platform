// tests/integration/watermark-hmac-tampering.spec.ts
// qa-strategy §4.4 — payload modifié rejette signature HMAC.

import { describe, expect, it } from "vitest";
import { signPayload, verifySignature } from "../../src/api/lib/hmac.js";

const SECRET = "unit_test_hmac_secret_value_only";

describe("§4.4 watermark HMAC tampering", () => {
  it("payload intact → verify ok", async () => {
    const payload = { a: 1, b: "x", audit_id: "aud_1" };
    const sig = await signPayload(payload, SECRET);
    expect(await verifySignature(payload, sig, SECRET)).toBe(true);
  });

  it("payload modifié 1 char → verify rejette", async () => {
    const payload = { a: 1, b: "x", audit_id: "aud_1" };
    const sig = await signPayload(payload, SECRET);
    const tampered = { ...payload, b: "y" };
    expect(await verifySignature(tampered, sig, SECRET)).toBe(false);
  });

  it("signature modifiée → verify rejette", async () => {
    const payload = { a: 1 };
    const sig = await signPayload(payload, SECRET);
    const tamperedSig = sig.slice(0, -1) + (sig.slice(-1) === "0" ? "1" : "0");
    expect(await verifySignature(payload, tamperedSig, SECRET)).toBe(false);
  });

  it("secret différent → verify rejette", async () => {
    const payload = { a: 1 };
    const sig = await signPayload(payload, SECRET);
    const otherSecret = "other_secret_value_long_enough_32";
    expect(await verifySignature(payload, sig, otherSecret)).toBe(false);
  });
});
