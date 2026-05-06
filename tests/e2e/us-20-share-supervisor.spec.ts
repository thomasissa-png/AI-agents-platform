// US-20 — POST /api/audit/savings declarative.
import { expect, test } from "@playwright/test";

test("POST /api/audit/savings sans champs → 400", async ({ request }) => {
  const r = await request.post("/api/audit/savings", { data: {} });
  expect(r.status()).toBe(400);
});
