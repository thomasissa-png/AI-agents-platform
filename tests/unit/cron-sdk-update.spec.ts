// tests/unit/cron-sdk-update.spec.ts
// Tests cron sdk-update : rate-limit npm, KV writes, fallback.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runSdkUpdate } from "@/cron/jobs/sdk-update";

interface MockKv {
  store: Map<string, string>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

function makeKv(): MockKv {
  const store = new Map<string, string>();
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

describe("cron sdk-update", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock npm registry — Response body is consumable once, donc on en re-instancie un par appel
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            "dist-tags": { latest: "5.0.12" },
            time: { "5.0.12": "2026-05-04T12:00:00Z" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
  });

  it("écrit packages en KV avec schema valide", async () => {
    const sdkKv = makeKv();
    const env = {
      SDK_KV: sdkKv as unknown as KVNamespace,
      CRON_STATE_KV: makeKv() as unknown as KVNamespace,
      PUBLIC_ENV: "test",
    };
    // limit liste à 2 packages pour test rapide (NPM_RATE_LIMIT_MS = 1s × 50 = 50s sinon)
    const r = await runSdkUpdate(env, new Date(), ["ai", "openai"]);
    expect(r.packages_total).toBe(2);
    expect(r.fails).toEqual([]);
    expect(sdkKv.store.size).toBe(2);
    const aiRaw = sdkKv.store.get("sdk:ai");
    expect(aiRaw).toBeTruthy();
    const ai = JSON.parse(aiRaw!);
    expect(ai.latest).toBe("5.0.12");
    expect(ai.breaking_since).toBe("5.0.0");
    expect(ai.schema_version).toBe("1.0");
  }, 30_000);

  it("fallback si fetch échoue + KV existant préservé", async () => {
    const sdkKv = makeKv();
    sdkKv.store.set("sdk:ai", JSON.stringify({ pkg: "ai", latest: "4.0.0", schema_version: "1.0" }));
    // fetchNpmLatest catch les erreurs et retourne null → branche fallback
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    const env = {
      SDK_KV: sdkKv as unknown as KVNamespace,
      CRON_STATE_KV: makeKv() as unknown as KVNamespace,
      PUBLIC_ENV: "test",
    };
    const r = await runSdkUpdate(env, new Date(), ["ai"]);
    expect(r.packages_fallback).toBeGreaterThanOrEqual(1);
    const ai = JSON.parse(sdkKv.store.get("sdk:ai")!);
    expect(ai.latest).toBe("4.0.0");
  }, 10_000);
});
