// tests/integration/sponsor-checkboxes-l22128-13.spec.ts
// qa-strategy §4.2 — bypass impossible + libellé exact.

import { describe, expect, it, vi } from "vitest";
import { handleSponsorTopupInit } from "../../src/api/routes/sponsor-topup-init.js";

const VALID_BASE = {
  amount_usdc: 10,
  wallet_target_hash: "a".repeat(64),
  email: "test@example.com",
};

function mkRequest(body: unknown): Request {
  return new Request("https://x/api/sponsor/topup-init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stubStripe() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ id: "cs_test", url: "https://x" }), { status: 200 }),
    ),
  );
}

describe("§4.2 sponsor 3 checkboxes L.221-28 13°", () => {
  it("0 checkbox → 400", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(mkRequest(VALID_BASE), {
      STRIPE_SECRET_KEY: "sk",
    });
    expect(r.status).toBe(400);
  });

  it("1 checkbox false → 400", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({
        ...VALID_BASE,
        consent_l22128: true,
        consent_email: true,
        consent_proof: false,
      }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
    const j = (await r.json()) as { error: string };
    expect(j.error).toBe("MISSING_CONSENT");
  });

  it("3 checkboxes true → 200", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({
        ...VALID_BASE,
        consent_l22128: true,
        consent_email: true,
        consent_proof: true,
      }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(200);
  });

  it("checkbox = string 'true' (bypass type) → 400", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({
        ...VALID_BASE,
        consent_l22128: "true",
        consent_email: "true",
        consent_proof: "true",
      }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
  });

  it("checkbox = 1 (bypass numeric) → 400", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({
        ...VALID_BASE,
        consent_l22128: 1,
        consent_email: 1,
        consent_proof: 1,
      }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
  });
});
