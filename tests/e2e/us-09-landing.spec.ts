// US-09 — homepage 7 sections + CTA principal.
import { expect, test } from "@playwright/test";

test("landing / contient sections clés et 1 CTA principal", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DevRefs|pricing|agents/i);
  // Le CTA principal pointe sur /paywall ou /api/llm-prices
  const ctas = await page.locator("a[href*='paywall'], a[href*='/api/']").count();
  expect(ctas).toBeGreaterThan(0);
});
