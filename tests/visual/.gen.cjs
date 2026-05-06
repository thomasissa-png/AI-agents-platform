"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tests/visual/generate-baselines-from-prod.ts
var import_test = require("@playwright/test");
var import_fs = require("fs");
var import_path = __toESM(require("path"), 1);
var BASE_URL = process.env.BASELINE_BASE_URL ?? "https://devrefs.dev";
var PAGES = [
  { name: "landing", path: "/" },
  { name: "paywall", path: "/paywall" },
  { name: "dashboard", path: "/dashboard" },
  { name: "llm-prices", path: "/llm-prices" }
];
var VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 }
];
var BASELINE_DIR = import_path.default.resolve(__dirname, "..", "screenshots", "baseline");
async function main() {
  await import_fs.promises.mkdir(BASELINE_DIR, { recursive: true });
  const browser = await import_test.chromium.launch();
  const results = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      ignoreHTTPSErrors: true
    });
    const page = await ctx.newPage();
    for (const p of PAGES) {
      const tag = `${p.name}-${vp.width}`;
      const out = import_path.default.join(BASELINE_DIR, `${tag}.png`);
      try {
        const url = `${BASE_URL}${p.path}`;
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 2e4 });
        const status = resp?.status() ?? 0;
        await page.waitForTimeout(800);
        const buf = await page.screenshot({ fullPage: true });
        await import_fs.promises.writeFile(out, buf);
        results.push({ tag, status: `HTTP ${status} \u2192 ${buf.byteLength} bytes`, bytes: buf.byteLength });
        console.log(`  OK  ${tag} (${buf.byteLength} bytes, HTTP ${status})`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ tag, status: "FAIL", error: msg });
        console.log(`  FAIL ${tag} \u2192 ${msg}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  const reportPath = import_path.default.join(BASELINE_DIR, "_generation-report.json");
  await import_fs.promises.writeFile(
    reportPath,
    JSON.stringify({ generatedAt: (/* @__PURE__ */ new Date()).toISOString(), baseUrl: BASE_URL, results }, null, 2)
  );
  console.log(`
Rapport : ${reportPath}`);
  const fails = results.filter((r) => r.status === "FAIL").length;
  if (fails > 0) {
    console.error(`
${fails} screenshots failed`);
    process.exit(1);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
