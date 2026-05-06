// US-10b — paywall 3 checkboxes + Stripe redirect.
import { expect, test } from "@playwright/test";

test("/paywall expose 3 checkboxes consent", async ({ page }) => {
  await page.goto("/paywall");
  const checkboxes = page.locator("input[type='checkbox']");
  const count = await checkboxes.count();
  expect(count).toBeGreaterThanOrEqual(3);
});

test("POST /api/sponsor/topup-init sans consent → 400", async ({ request }) => {
  const r = await request.post("/api/sponsor/topup-init", {
    data: {
      amount_usdc: 10,
      wallet_target_hash: "a".repeat(64),
      email: "test@example.com",
    },
  });
  expect(r.status()).toBe(400);
  const j = await r.json();
  expect(j.error).toBe("MISSING_CONSENT");
});
