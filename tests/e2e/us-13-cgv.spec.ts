// US-13 — /legal/cgv complet + Art. 4quater verbatim.
import { expect, test } from "@playwright/test";

test("/legal/cgv expose Art. 4ter et 4quater", async ({ page }) => {
  await page.goto("/legal/cgv");
  const html = await page.content();
  expect(html).toMatch(/4ter|garantie|refund/i);
  expect(html).toMatch(/4quater|renonciation|L\.?\s?221-28/i);
});
