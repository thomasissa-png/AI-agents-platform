// tests/visual/generate-baselines-from-prod.ts
// Script standalone pour générer les baselines depuis prod (devrefs.dev).
// Usage : pnpm exec tsx tests/visual/generate-baselines-from-prod.ts
// N'utilise PAS la config Playwright (qui spin un dev server local).
// Cible directement les pages live, screenshots full-page, 3 viewports.

import { chromium } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";

const BASE_URL = process.env.BASELINE_BASE_URL ?? "https://devrefs.dev";

const PAGES = [
  { name: "landing", path: "/" },
  { name: "paywall", path: "/paywall" },
  { name: "dashboard", path: "/dashboard" },
  { name: "llm-prices", path: "/llm-prices" },
];

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
];

const BASELINE_DIR = path.resolve(__dirname, "..", "screenshots", "baseline");

async function main() {
  await fs.mkdir(BASELINE_DIR, { recursive: true });
  const browser = await chromium.launch();
  const results: Array<{ tag: string; status: string; bytes?: number; error?: string }> = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      ignoreHTTPSErrors: true,
    });
    const page = await ctx.newPage();
    for (const p of PAGES) {
      const tag = `${p.name}-${vp.width}`;
      const out = path.join(BASELINE_DIR, `${tag}.png`);
      try {
        const url = `${BASE_URL}${p.path}`;
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
        const status = resp?.status() ?? 0;
        // Petit settle (animations CSS, fonts)
        await page.waitForTimeout(800);
        const buf = await page.screenshot({ fullPage: true });
        await fs.writeFile(out, buf);
        results.push({ tag, status: `HTTP ${status} → ${buf.byteLength} bytes`, bytes: buf.byteLength });
        console.log(`  OK  ${tag} (${buf.byteLength} bytes, HTTP ${status})`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ tag, status: "FAIL", error: msg });
        console.log(`  FAIL ${tag} → ${msg}`);
      }
    }
    await ctx.close();
  }
  await browser.close();

  // Rapport JSON pour debug
  const reportPath = path.join(BASELINE_DIR, "_generation-report.json");
  await fs.writeFile(
    reportPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, results }, null, 2),
  );
  console.log(`\nRapport : ${reportPath}`);

  const fails = results.filter((r) => r.status === "FAIL").length;
  if (fails > 0) {
    console.error(`\n${fails} screenshots failed`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
