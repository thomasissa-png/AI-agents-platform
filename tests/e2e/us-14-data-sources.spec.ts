// US-14 — /about/data-sources + /about/data-schema.
import { expect, test } from "@playwright/test";

test("about/data-sources retourne 200", async ({ request }) => {
  const r = await request.get("/about/data-sources");
  expect([200, 301, 302]).toContain(r.status());
});
