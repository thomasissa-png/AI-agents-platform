// tests/unit/sponsor-topup-init.spec.ts
// Validation inputs + 3 checkboxes consent + amount whitelist.

import { describe, expect, it, vi } from "vitest";
import { handleSponsorTopupInit } from "../../src/api/routes/sponsor-topup-init.js";

// Stub global fetch (Stripe API)
function stubStripe(ok = true): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      ok
        ? new Response(
            JSON.stringify({
              id: "cs_test_123",
              url: "https://checkout.stripe.com/cs_test_123",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          )
        : new Response("err", { status: 400 }),
    ),
  );
}

const VALID = {
  amount_usdc: 10,
  wallet_target_hash: "a".repeat(64),
  email: "thomas@example.com",
  consent_l22128: true,
  consent_email: true,
  consent_proof: true,
};

function mkRequest(body: unknown): Request {
  return new Request("https://devrefs.dev/api/sponsor/topup-init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("sponsor-topup-init", () => {
  it("payload valide → 200 + checkout_url", async () => {
    stubStripe(true);
    const r = await handleSponsorTopupInit(mkRequest(VALID), {
      STRIPE_SECRET_KEY: "sk_test_x",
    });
    expect(r.status).toBe(200);
    const j = (await r.json()) as { checkout_url: string; session_id: string };
    expect(j.checkout_url).toContain("checkout.stripe.com");
    expect(j.session_id).toBe("cs_test_123");
  });

  it("amount hors whitelist → 400 INVALID_AMOUNT", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({ ...VALID, amount_usdc: 7 }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
    const j = (await r.json()) as { error: string };
    expect(j.error).toBe("INVALID_AMOUNT");
  });

  it("wallet_target_hash mauvais format → 400", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({ ...VALID, wallet_target_hash: "short" }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
  });

  it("email invalide → 400", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({ ...VALID, email: "not-an-email" }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
  });

  it("1 checkbox manquante → 400 MISSING_CONSENT", async () => {
    stubStripe();
    const r = await handleSponsorTopupInit(
      mkRequest({ ...VALID, consent_proof: false }),
      { STRIPE_SECRET_KEY: "sk" },
    );
    expect(r.status).toBe(400);
    const j = (await r.json()) as { error: string };
    expect(j.error).toBe("MISSING_CONSENT");
  });

  it("GET → 405", async () => {
    const r = await handleSponsorTopupInit(
      new Request("https://x/api/sponsor/topup-init", { method: "GET" }),
      {},
    );
    expect(r.status).toBe(405);
  });
});
