// US-12 — /dashboard 4 zones + JWT requis.
import { expect, test } from "@playwright/test";

test("/dashboard charge un HTML avec JWT placeholder", async ({ page }) => {
  await page.goto("/dashboard");
  const html = await page.content();
  // Doit mentionner les zones clés ou demander le token
  expect(html.toLowerCase()).toMatch(/dashboard|sponsor|wallet|token/);
});
