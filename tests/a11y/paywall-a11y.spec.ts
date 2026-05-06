// tests/a11y/paywall-a11y.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("/paywall a11y : 0 serious / critical", async ({ page }) => {
  await page.goto("/paywall");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  if (blocking.length > 0) {
    console.error("a11y paywall:", JSON.stringify(blocking, null, 2));
  }
  expect(blocking).toHaveLength(0);
});
