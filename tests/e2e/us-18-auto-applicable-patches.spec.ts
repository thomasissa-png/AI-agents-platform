// US-18 — output audit recommendations[].patch présent dans schema.
import { expect, test } from "@playwright/test";

test("openapi expose AuditOutput.recommendations[].patch", async ({ request }) => {
  const r = await request.get("/openapi.json");
  expect(r.status()).toBe(200);
  const txt = await r.text();
  expect(txt).toContain("patch");
  expect(txt).toContain("auto_applicable");
});
