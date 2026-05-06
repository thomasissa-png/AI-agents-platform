// tests/unit/cron-health-check.spec.ts
// Tests cron-health-check : alerte si crons stale.

import { describe, it, expect } from "vitest";
import { runCronHealthCheck } from "@/cron/jobs/cron-health-check";

interface MockKv {
  store: Map<string, string>;
  get(k: string): Promise<string | null>;
  put(k: string, v: string): Promise<void>;
}

function makeKv(seed: Record<string, string> = {}): MockKv {
  const store = new Map<string, string>(Object.entries(seed));
  return {
    store,
    async get(k) {
      return store.get(k) ?? null;
    },
    async put(k, v) {
      store.set(k, v);
    },
  };
}

describe("cron-health-check", () => {
  it("OK si tous les crons sont récents", async () => {
    const now = new Date("2026-05-06T12:00:00Z");
    const recent = new Date("2026-05-06T11:00:00Z").toISOString(); // 1h ago
    const env = {
      CRON_STATE_KV: makeKv({
        "cron:prices-update:last_run": recent,
        "cron:sdk-update:last_run": recent,
        "cron:indexnow-push:last_run": recent,
        "cron:pack-expiry-check:last_run": recent,
      }) as unknown as KVNamespace,
      PUBLIC_ENV: "test",
    };
    const r = await runCronHealthCheck(env, now);
    expect(r.ok).toBe(true);
    expect(r.alerts).toEqual([]);
  });

  it("alerte si prices-update > 8h", async () => {
    const now = new Date("2026-05-06T12:00:00Z");
    const stale = new Date("2026-05-06T03:00:00Z").toISOString(); // 9h ago
    const recent = new Date("2026-05-06T11:30:00Z").toISOString();
    const env = {
      CRON_STATE_KV: makeKv({
        "cron:prices-update:last_run": stale,
        "cron:sdk-update:last_run": recent,
        "cron:indexnow-push:last_run": recent,
        "cron:pack-expiry-check:last_run": recent,
      }) as unknown as KVNamespace,
      PUBLIC_ENV: "test",
    };
    const r = await runCronHealthCheck(env, now);
    expect(r.ok).toBe(false);
    expect(r.alerts.some((a) => a.includes("prices-update"))).toBe(true);
  });

  it("alerte si last_run absent", async () => {
    const now = new Date("2026-05-06T12:00:00Z");
    const env = {
      CRON_STATE_KV: makeKv() as unknown as KVNamespace,
      PUBLIC_ENV: "test",
    };
    const r = await runCronHealthCheck(env, now);
    expect(r.ok).toBe(false);
    expect(r.alerts.length).toBe(4);
  });
});
