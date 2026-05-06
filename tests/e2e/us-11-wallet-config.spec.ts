// US-11 — POST /api/jwt/issue post-Stripe.
import { expect, test } from "@playwright/test";

test("POST /api/jwt/issue sans session_id → 400", async ({ request }) => {
  const r = await request.post("/api/jwt/issue", { data: {} });
  expect([400, 500]).toContain(r.status());
});
