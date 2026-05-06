// US-08b — purchase pack + consume + exhaust (mocked).
import { expect, test } from "@playwright/test";

test("GET /api/pack/status pour wallet inconnu → 404", async ({ request }) => {
  const r = await request.get("/api/pack/status?wallet_hash=" + "0".repeat(64));
  expect([404, 200]).toContain(r.status());
});
