// US-15 — admin dashboard avec Basic auth.
import { expect, test } from "@playwright/test";

test("/admin sans auth → 401 ou 404", async ({ request }) => {
  const r = await request.get("/admin");
  expect([401, 404]).toContain(r.status());
});
