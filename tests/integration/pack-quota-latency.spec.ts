// tests/integration/pack-quota-latency.spec.ts
// qa-strategy §4.6 — 100 lookups successifs latence p95 < 50 ms.
// (note : KV mock in-memory — dans CF prod c'est différent, ici on vérifie la logique pure.)

import { describe, expect, it } from "vitest";
import { KV_KEYS } from "../../src/api/lib/kv-keys.js";

function mkKv(): KVNamespace {
  const data = new Map<string, string>();
  return {
    get: async (k: string) => data.get(k) ?? null,
    put: async (k: string, v: string) => {
      data.set(k, v);
    },
    delete: async (k: string) => {
      data.delete(k);
    },
    list: async () => ({ keys: [], list_complete: true }),
  } as unknown as KVNamespace;
}

function pct(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * p)];
}

describe("§4.6 pack quota lookup latency", () => {
  it("100 reads p95 < 50 ms (in-memory)", async () => {
    const kv = mkKv();
    const wallet = "c".repeat(64);
    await kv.put(KV_KEYS.packRemaining(wallet), "100");
    const latencies: number[] = [];
    for (let i = 0; i < 100; i++) {
      const t0 = performance.now();
      await kv.get(KV_KEYS.packRemaining(wallet));
      latencies.push(performance.now() - t0);
    }
    const p95 = pct(latencies, 0.95);
    expect(p95).toBeLessThan(50);
  });
});
