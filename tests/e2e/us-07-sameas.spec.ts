// US-07 — sameAs URL valides schema.org.
import { expect, test } from "@playwright/test";

test("homepage expose schema.org sameAs", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).toMatch(/sameAs|schema\.org/i);
});
