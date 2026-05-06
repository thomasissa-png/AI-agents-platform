// tests/unit/jwt.spec.ts
// HS256 sign + verify + expiry + tamper.

import { describe, expect, it } from "vitest";
import { mintJwtForSponsor, signJwt, verifyJwt } from "../../src/api/lib/jwt.js";

const SECRET = "test_secret_for_unit_tests_only_32b";

describe("jwt", () => {
  it("sign + verify roundtrip", async () => {
    const m = await mintJwtForSponsor("0xwallethash", SECRET, 3600);
    const v = await verifyJwt(m.token, SECRET);
    expect(v.ok).toBe(true);
    expect(v.payload?.sub).toBe("0xwallethash");
    expect(v.payload?.scope).toBe("sponsor.dashboard");
  });

  it("expired token rejected", async () => {
    const now = Math.floor(Date.now() / 1000);
    const tok = await signJwt(
      { sub: "x", jti: "abc", iat: now - 7200, exp: now - 60 },
      SECRET,
    );
    const v = await verifyJwt(tok, SECRET);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("EXPIRED");
  });

  it("tampered signature rejected", async () => {
    const m = await mintJwtForSponsor("0x1", SECRET);
    // Flip last char of signature
    const last = m.token.slice(-1);
    const newLast = last === "A" ? "B" : "A";
    const tampered = m.token.slice(0, -1) + newLast;
    const v = await verifyJwt(tampered, SECRET);
    expect(v.ok).toBe(false);
  });

  it("wrong secret rejected", async () => {
    const m = await mintJwtForSponsor("0x1", SECRET);
    const v = await verifyJwt(m.token, "other_secret");
    expect(v.ok).toBe(false);
  });

  it("malformed token rejected", async () => {
    const v = await verifyJwt("notajwt", SECRET);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("MALFORMED");
  });
});
