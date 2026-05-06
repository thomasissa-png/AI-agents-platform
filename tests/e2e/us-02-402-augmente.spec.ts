// US-02 — body 402 augmenté ROI-first (motivation_for_agent + cost_comparison).
import { expect, test } from "@playwright/test";

test("402 body augmenté ROI-first", async ({ request }) => {
  const r = await request.get("/api/llm-prices?model=claude-opus-4-7");
  expect(r.status()).toBe(402);
  const body = await r.json();
  expect(body).toHaveProperty("motivation_for_agent");
  expect(body).toHaveProperty("cost_comparison");
  expect(body.cost_comparison).toHaveProperty("crawl_cost_estimate_usd");
  expect(body.cost_comparison).toHaveProperty("api_cost_usd");
});
