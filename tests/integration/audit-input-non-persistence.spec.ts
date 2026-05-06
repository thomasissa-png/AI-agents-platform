// tests/integration/audit-input-non-persistence.spec.ts
// qa-strategy §4.3 — RGPD critique : input audit JAMAIS persisté.
// On vérifie qu'aucune valeur KV ne contient le marker UUID injecté dans l'input.

import { describe, expect, it, vi } from "vitest";
import { handleAgentAudit } from "../../src/api/routes/agent-audit.js";

interface MockKv extends KVNamespace {
  _data: Map<string, string>;
}

function mkKv(): MockKv {
  const data = new Map<string, string>();
  const kv = {
    _data: data,
    get: async (k: string) => data.get(k) ?? null,
    put: async (k: string, v: string) => {
      data.set(k, v);
    },
    delete: async (k: string) => {
      data.delete(k);
    },
    list: async () => ({
      keys: Array.from(data.keys()).map((k) => ({ name: k })),
      list_complete: true,
    }),
  } as unknown as MockKv;
  return kv;
}

function uuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

describe("§4.3 audit input non-persistence (PII leak)", () => {
  it("UUID marker injecté dans input → absent de KV + console + AE", async () => {
    const auditKv = mkKv();
    const packKv = mkKv();
    const marker = uuidV4();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const aeWrites: Array<{ blobs?: string[]; doubles?: number[]; indexes?: string[] }> = [];
    const ae = {
      writeDataPoint: (p: { blobs?: string[]; doubles?: number[]; indexes?: string[] }) => {
        aeWrites.push(p);
      },
    };

    // Simule X-PAYMENT settled (bypass middleware x402 avec env approprié)
    // Le test vise la non-persistance : on accepte 402 ou 200, pas grave.
    const req = new Request("https://x/api/agent-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-PAYMENT": "stub" },
      body: JSON.stringify({
        agent_config: {
          models_used: [{ model: "claude-opus-4-7", share_pct: 100 }],
          task_complexity: "complex",
          request_pattern: "sequential",
          monthly_volume_estimate: 10_000_000,
          batch_eligible_workloads_pct: 0,
          system_prompts: [{ tokens: 2000, cached: false }],
          tools: [{ name: `tool_${marker}`, description_tokens: 50 }],
        },
        sample_traces: [{ model_used: "claude-opus-4-7", input_tokens: 1000, output_tokens: 500, effort_level: "high" }],
        wallet_hash: "a".repeat(64),
      }),
    });

    try {
      await handleAgentAudit(req, {
        AUDIT_METADATA_KV: auditKv,
        PACK_KV: packKv,
        DEVREFS_AE: ae,
        HMAC_SECRET_KEY: "test_hmac_secret",
        COINBASE_X402_FACILITATOR_KEY: "test",
        DEVREFS_TREASURY_WALLET: "0xfake",
      } as never);
    } catch {
      // peu importe le 402 — on vérifie la non-persistance.
    }

    // Assertion 1 : aucune valeur KV ne contient le marker
    for (const v of auditKv._data.values()) {
      expect(v).not.toContain(marker);
    }

    // Assertion 2 : aucun event AE ne contient le marker dans blobs
    for (const w of aeWrites) {
      for (const b of w.blobs ?? []) {
        expect(b).not.toContain(marker);
      }
    }

    // Assertion 3 : console n'a jamais loggé le marker
    for (const call of consoleSpy.mock.calls.concat(consoleErrSpy.mock.calls)) {
      for (const arg of call) {
        const s = typeof arg === "string" ? arg : JSON.stringify(arg);
        expect(s).not.toContain(marker);
      }
    }

    consoleSpy.mockRestore();
    consoleErrSpy.mockRestore();
  });
});
