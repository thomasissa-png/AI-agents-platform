// US-08 — /openapi.json parse 3.1 + x-x402.
import { expect, test } from "@playwright/test";

test("openapi.json est OpenAPI 3.1 + extension x-x402", async ({ request }) => {
  const r = await request.get("/openapi.json");
  expect(r.status()).toBe(200);
  const j = await r.json();
  expect(j.openapi).toMatch(/^3\.1/);
  expect(JSON.stringify(j)).toContain("x-x402");
});
