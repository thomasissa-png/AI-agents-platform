// US-01 — GET /llms.txt parse 3 endpoints.
import { expect, test } from "@playwright/test";

test("GET /llms.txt expose 3 endpoints", async ({ request }) => {
  const r = await request.get("/llms.txt");
  expect(r.status()).toBe(200);
  const txt = await r.text();
  expect(txt).toContain("/api/llm-prices");
  expect(txt).toContain("/api/sdk-status");
  expect(txt).toContain("/api/agent-audit");
  expect(r.headers()["content-type"]).toMatch(/text\/plain/);
});
