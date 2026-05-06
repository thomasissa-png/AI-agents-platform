// US-06 — full flow sdk-status (402 path).
import { expect, test } from "@playwright/test";

test("GET /api/sdk-status sans paiement → 402 augmenté", async ({ request }) => {
  const r = await request.get("/api/sdk-status?pkg=ai");
  expect(r.status()).toBe(402);
  const j = await r.json();
  expect(j).toHaveProperty("accepts");
});
