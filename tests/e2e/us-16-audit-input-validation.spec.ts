// US-16 — POST audit invalide → 400.
import { expect, test } from "@playwright/test";

test("POST /api/agent-audit body invalide → 4xx", async ({ request }) => {
  const r = await request.post("/api/agent-audit", { data: { foo: "bar" } });
  expect([400, 402]).toContain(r.status());
});
