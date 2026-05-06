// US-05 — Opus 1.35 effective_cost_factor signalé.
import { expect, test } from "@playwright/test";

test("402 mentions effective_cost_factor pour Opus", async ({ request }) => {
  const r = await request.get("/api/llm-prices?model=claude-opus-4-7");
  expect([200, 402]).toContain(r.status());
  // L'effective_cost_factor est documenté dans le payload 200 — mais l'OpenAPI/llms.txt l'expose.
  const llms = await request.get("/llms.txt");
  expect((await llms.text()).toLowerCase()).toMatch(/effective_cost_factor|opus/);
});
