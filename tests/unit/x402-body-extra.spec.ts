// tests/unit/x402-body-extra.spec.ts
// Couverture complémentaire branches : verdicts, alternative_cost custom, ae-events buckets.

import { describe, it, expect } from "vitest";
import { build402Body, buildPackTypeForOffer } from "@/api/lib/x402-body";
import { uaBucket, emitAeEvent } from "@/api/lib/ae-events";

describe("build402Body — alternative cost paths", () => {
  it("uses custom alternative_cost when provided (audit endpoint)", () => {
    const body = build402Body({
      endpoint: "agent-audit",
      offer_type: "audit_one_shot",
      price_usdc: 9.99,
      pay_to: "0xtreasury",
      alternative_cost: {
        tokens_estimated: 500_000,
        cost_in_usd_per_model: { "claude-opus-4-7": 3.65 },
        agent_action_if_no_devrefs: "trial-and-error",
      },
    });
    expect(body.alternative_cost_estimate.tokens_estimated).toBe(500_000);
    expect(body.alternative_cost_estimate.agent_action_if_no_devrefs).toBe("trial-and-error");
    expect(body.roi_summary.verdict).toBe("no_brainer_buy"); // hard-coded for audit
  });

  it("verdict consider for ROI 10-99×", () => {
    const body = build402Body({
      endpoint: "llm-prices",
      offer_type: "pricing_one_shot",
      price_usdc: 0.01,
      pay_to: "0xtreasury",
      alternative_cost: {
        tokens_estimated: 1000,
        cost_in_usd_per_model: { "claude-opus-4-7": 0.5 },
      },
    });
    expect(body.roi_summary.verdict).toBe("consider");
  });

  it("verdict skip for ROI < 10×", () => {
    const body = build402Body({
      endpoint: "llm-prices",
      offer_type: "pricing_one_shot",
      price_usdc: 1,
      pay_to: "0xtreasury",
      alternative_cost: {
        tokens_estimated: 1000,
        cost_in_usd_per_model: { "claude-opus-4-7": 5 },
      },
    });
    expect(body.roi_summary.verdict).toBe("skip");
  });

  it("falls back when claude-opus-4-7 missing in alt_cost map", () => {
    const body = build402Body({
      endpoint: "llm-prices",
      offer_type: "pricing_one_shot",
      price_usdc: 0.001,
      pay_to: "0xtreasury",
      alternative_cost: {
        tokens_estimated: 1000,
        cost_in_usd_per_model: { "gpt-5": 0.17 },
      },
    });
    // Fallback to default 0.49
    expect(body.roi_summary.alternative_cost_usd_opus_4_7).toBe(0.49);
  });

  it("uses sdk endpoint baseline (95k tokens / 0.71 USD)", () => {
    const body = build402Body({
      endpoint: "sdk-status",
      offer_type: "sdk_one_shot",
      price_usdc: 0.001,
      pay_to: "0xtreasury",
    });
    expect(body.alternative_cost_estimate.tokens_estimated).toBe(95000);
    expect(body.roi_summary.alternative_cost_usd_opus_4_7).toBe(0.71);
  });

  it("attaches payload_preview when provided", () => {
    const body = build402Body({
      endpoint: "llm-prices",
      offer_type: "pricing_one_shot",
      price_usdc: 0.001,
      pay_to: "0xtreasury",
      payload_preview: { model: "x", input: "***" },
    });
    expect(body.payload_preview).toEqual({ model: "x", input: "***" });
  });
});

describe("buildPackTypeForOffer", () => {
  it.each([
    ["pricing_pack", "standard_10"],
    ["sdk_pack", "standard_10"],
    ["audit_pack", "audit_pro_49"],
    ["pricing_one_shot", null],
    ["audit_one_shot", null],
    ["sdk_one_shot", null],
  ])("maps %s -> %s", (offer, expected) => {
    expect(buildPackTypeForOffer(offer as never)).toBe(expected);
  });
});

describe("uaBucket", () => {
  it.each([
    [null, "unknown"],
    ["", "unknown"],
    ["claude-code/1.0", "claude-code"],
    ["@anthropic-ai/sdk", "anthropic-sdk"],
    ["openai-node/4.0", "openai-sdk"],
    ["axios/1.0", "axios"],
    ["node-fetch/3", "fetch"],
    ["undici/6", "fetch"],
    ["python-requests/2.0", "python"],
    ["curl/8.0", "curl"],
    ["Mozilla/5.0 Chrome/120", "browser"],
    ["GoogleBot/2.1 crawler", "bot"],
    ["RandomTool/1", "other"],
  ])("buckets %s -> %s", (ua, expected) => {
    expect(uaBucket(ua)).toBe(expected);
  });
});

describe("emitAeEvent", () => {
  it("is a no-op when ds undefined", () => {
    expect(() => emitAeEvent(undefined, "api_request_received")).not.toThrow();
  });

  it("writes data point to dataset", () => {
    const writes: unknown[] = [];
    const ds = { writeDataPoint: (p: unknown) => writes.push(p) };
    emitAeEvent(ds, "api_response_200_sent", {
      endpoint: "llm-prices",
      status_code: 200,
      latency_ms: 42,
    });
    expect(writes.length).toBe(1);
  });

  it("forces emit on quota_consumed milestone", () => {
    const writes: unknown[] = [];
    const ds = { writeDataPoint: (p: unknown) => writes.push(p) };
    // milestone 0 (exhausted)
    emitAeEvent(ds, "pack_quota_consumed", {
      pack_type: "standard_10",
      quota_remaining: 0,
      payload_size_bytes: 10000,
    });
    expect(writes.length).toBe(1);
  });

  it("swallows AE write errors", () => {
    const ds = {
      writeDataPoint: () => {
        throw new Error("AE error");
      },
    };
    expect(() => emitAeEvent(ds, "api_request_received")).not.toThrow();
  });
});
