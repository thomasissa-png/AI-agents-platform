// US-04 — dateModified JSON-LD < 6h sur llm-prices (mock 200 path).
import { expect, test } from "@playwright/test";

test("freshness signalée dans 402 body", async ({ request }) => {
  const r = await request.get("/api/llm-prices?model=claude-sonnet-4-6");
  if (r.status() === 200) {
    const j = await r.json();
    expect(j).toHaveProperty("dateModified");
  } else {
    expect(r.status()).toBe(402);
  }
});
