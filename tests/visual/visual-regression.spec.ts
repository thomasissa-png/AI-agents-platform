// tests/visual/visual-regression.spec.ts
// Diff pixel vs baselines (G26 BLOQUANT). Seuil 100 pixels.
// Baselines : générer 1ère fois avec `pnpm test:screenshots:update`.

import { expect, test } from "@playwright/test";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const PAGES = [
  { name: "landing", path: "/" },
  { name: "paywall", path: "/paywall" },
  { name: "dashboard", path: "/dashboard" },
  { name: "llm-prices", path: "/llm-prices" },
];

const ROOT = path.resolve(__dirname, "..", "screenshots");
const BASELINE = path.join(ROOT, "baseline");
const ACTUAL = path.join(ROOT, "actual");
const DIFF = path.join(ROOT, "diff");

async function ensureDirs(): Promise<void> {
  for (const d of [BASELINE, ACTUAL, DIFF]) {
    await fs.mkdir(d, { recursive: true });
  }
}

const PIXELMATCH_THRESHOLD = 100;

for (const p of PAGES) {
  test(`visual ${p.name}`, async ({ page }, testInfo) => {
    await ensureDirs();
    const viewport = page.viewportSize();
    const w = viewport?.width ?? 1280;
    const tag = `${p.name}-${w}`;
    const baselinePath = path.join(BASELINE, `${tag}.png`);
    const actualPath = path.join(ACTUAL, `${tag}.png`);
    const diffPath = path.join(DIFF, `${tag}.png`);

    await page.goto(p.path);
    await page.waitForLoadState("networkidle");
    const buf = await page.screenshot({ fullPage: true });
    await fs.writeFile(actualPath, buf);

    if (!existsSync(baselinePath)) {
      // 1ère fois : copie l'actual en baseline (mode update).
      if (process.env.UPDATE_SCREENSHOTS === "1" || testInfo.config.updateSnapshots === "all") {
        await fs.writeFile(baselinePath, buf);
        test.skip(true, "baseline created");
        return;
      }
      test.skip(true, "no baseline — run with UPDATE_SCREENSHOTS=1 once to create");
      return;
    }

    const baselineBuf = await fs.readFile(baselinePath);
    const baseline = PNG.sync.read(baselineBuf);
    const actual = PNG.sync.read(buf);
    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      throw new Error(
        `Dimensions mismatch ${tag}: baseline ${baseline.width}x${baseline.height} vs actual ${actual.width}x${actual.height}`,
      );
    }
    const diff = new PNG({ width: baseline.width, height: baseline.height });
    const diffPixels = pixelmatch(
      baseline.data,
      actual.data,
      diff.data,
      baseline.width,
      baseline.height,
      { threshold: 0.1 },
    );
    if (diffPixels > PIXELMATCH_THRESHOLD) {
      await fs.writeFile(diffPath, PNG.sync.write(diff));
    }
    expect(diffPixels).toBeLessThanOrEqual(PIXELMATCH_THRESHOLD);
  });
}
