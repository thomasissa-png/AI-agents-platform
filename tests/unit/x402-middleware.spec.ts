// tests/unit/x402-middleware.spec.ts
// Source : qa-strategy §4 + x402-response-spec.md.

import { describe, it, expect } from "vitest";
import { x402Gate } from "@/api/middleware/x402";
import { build402Body } from "@/api/lib/x402-body";

const BASE_ENV = {
  COINBASE_X402_FACILITATOR_KEY: undefined,
  DEVREFS_TREASURY_WALLET: "0xtreasury",
  PUBLIC_ENV: "preview" as const,
};

describe("build402Body — pricing one_shot", () => {
  it("includes ROI summary with verdict no_brainer_buy when factor >= 100", () => {
    const body = build402Body({
      endpoint: "llm-prices",
      offer_type: "pricing_one_shot",
      price_usdc: 0.001,
      pay_to: "0xtreasury",
    });
    expect(body.error).toBe("payment_required");
    expect(body.roi_summary.verdict).toBe("no_brainer_buy");
    expect(body.roi_summary.roi_multiplier).toBeGreaterThanOrEqual(100);
    expect(body.x402.network).toBe("base");
    expect(body.x402.price_usdc).toBe("0.001");
    expect(body.x402.max_amount_required).toBe("1000"); // 0.001 USDC = 1000 base units
    expect(body.packs_available.standard?.recommended).toBe(true);
  });
  it("includes audit packs when endpoint is agent-audit", () => {
    const body = build402Body({
      endpoint: "agent-audit",
      offer_type: "audit_one_shot",
      price_usdc: 9.99,
      pay_to: "0xtreasury",
    });
    expect(body.packs_available.pack_pro_audit?.audits).toBe(6);
    expect(body.packs_available.pack_pro_audit?.recommended).toBe(true);
  });
  it("attaches freshness_proof when freshness provided", () => {
    const fetchedAt = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const body = build402Body({
      endpoint: "llm-prices",
      offer_type: "pricing_one_shot",
      price_usdc: 0.001,
      pay_to: "0xtreasury",
      freshness: {
        date_modified: fetchedAt,
        fetched_at: fetchedAt,
        same_as: "https://www.anthropic.com/pricing",
        cron_interval_hours: 6,
      },
    });
    const fp = body.freshness_proof;
    if (!fp || !("cron_interval_hours" in fp)) throw new Error("expected pricing freshness_proof shape");
    expect(fp.cron_interval_hours).toBe(6);
    expect(fp.freshness_hours).toBeGreaterThan(0);
  });
});

describe("x402Gate", () => {
  it("returns 402 when no X-PAYMENT and no X-Pack-Token", async () => {
    const req = new Request("https://devrefs.dev/api/llm-prices?model=claude-opus-4-7");
    const res = await x402Gate(req, BASE_ENV, {
      endpoint: "llm-prices",
      price_usdc: 0.001,
      context: { offer_type: "pricing_one_shot" },
    });
    expect(res).toBeInstanceOf(Response);
    if (res instanceof Response) {
      expect(res.status).toBe(402);
      expect(res.headers.get("WWW-Authenticate")).toBe("x402");
      expect(res.headers.get("X-Network")).toBe("base");
      const json = (await res.json()) as { error: string; roi_summary: { verdict: string } };
      expect(json.error).toBe("payment_required");
      expect(json.roi_summary.verdict).toBe("no_brainer_buy");
    }
  });

  it("accepts mock payment in preview env", async () => {
    const req = new Request("https://devrefs.dev/api/llm-prices?model=claude-opus-4-7", {
      headers: { "X-PAYMENT": "mock_abc123def456" },
    });
    const res = await x402Gate(req, BASE_ENV, {
      endpoint: "llm-prices",
      price_usdc: 0.001,
      context: { offer_type: "pricing_one_shot" },
    });
    expect("paid" in res && res.paid).toBe(true);
    if ("via" in res) expect(res.via).toBe("x402");
  });

  it("delegates to pack via X-Pack-Token header", async () => {
    const req = new Request("https://devrefs.dev/api/llm-prices?model=claude-opus-4-7", {
      headers: { "X-Pack-Token": "abc.def" },
    });
    const res = await x402Gate(req, BASE_ENV, {
      endpoint: "llm-prices",
      price_usdc: 0.001,
      context: { offer_type: "pricing_one_shot" },
    });
    expect("paid" in res && res.paid).toBe(true);
    if ("via" in res) expect(res.via).toBe("pack");
  });
});
