// US-03 — full flow llm-prices + watermark verify.
import { expect, test } from "@playwright/test";

test("payload 402 contient endpoint x402 et watermark spec", async ({ request }) => {
  const r = await request.get("/api/llm-prices?model=gpt-5");
  expect(r.status()).toBe(402);
  const j = await r.json();
  expect(j).toHaveProperty("accepts");
  expect(Array.isArray(j.accepts)).toBe(true);
  expect(j.accepts[0]).toHaveProperty("scheme", "exact");
});
