// tests/unit/track-route.spec.ts
// Tests POST /api/track : whitelist events + rate limit.

import { describe, expect, it } from "vitest";
import { handleTrack } from "../../src/api/routes/track.js";

function mkRequest(body: unknown, ip = "1.2.3.4"): Request {
  return new Request("https://x/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify(body),
  });
}

describe("track route", () => {
  it("event whitelisted → 200", async () => {
    const r = await handleTrack(
      mkRequest({ event_name: "landing_page_view" }, "10.0.0.1"),
      {},
    );
    expect(r.status).toBe(200);
  });

  it("event not whitelisted → 400", async () => {
    const r = await handleTrack(
      mkRequest({ event_name: "audit_delivered" }, "10.0.0.2"),
      {},
    );
    expect(r.status).toBe(400);
    const j = (await r.json()) as { error: string };
    expect(j.error).toBe("EVENT_NOT_ALLOWED");
  });

  it("invalid JSON → 400", async () => {
    const r = await handleTrack(
      new Request("https://x/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }),
      {},
    );
    expect(r.status).toBe(400);
  });

  it("rate limit : 2nd request <1s → 429", async () => {
    const ip = "192.168.1.42";
    const a = await handleTrack(mkRequest({ event_name: "landing_page_view" }, ip), {});
    expect(a.status).toBe(200);
    const b = await handleTrack(mkRequest({ event_name: "landing_page_view" }, ip), {});
    expect(b.status).toBe(429);
    expect(b.headers.get("Retry-After")).toBe("1");
  });

  it("GET → 405", async () => {
    const r = await handleTrack(
      new Request("https://x/api/track", { method: "GET" }),
      {},
    );
    expect(r.status).toBe(405);
  });
});
