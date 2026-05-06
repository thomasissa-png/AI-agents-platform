// tests/a11y/landing-a11y.spec.ts
// axe-core sur / — WCAG 2.2 AA, 0 violation serious/critical.

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing / a11y : 0 serious / critical", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  if (blocking.length > 0) {
    console.error("a11y violations:", JSON.stringify(blocking, null, 2));
  }
  expect(blocking).toHaveLength(0);
});
