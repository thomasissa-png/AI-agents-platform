// tests/unit/audit-input-validator.spec.ts
// Validation pre-payment input audit — qa-strategy §4.

import { describe, it, expect } from "vitest";
import { validateAuditInput } from "@/api/lib/audit-heuristics";

const VALID_INPUT = {
  agent_config: {
    models_used: [{ model: "claude-sonnet-4-6", share_pct: 100 }],
    task_complexity: "medium",
    request_pattern: "parallel",
    monthly_volume_estimate: 10_000_000,
    batch_eligible_workloads_pct: 0,
    system_prompts: [],
    tools: [],
  },
  sample_traces: [
    { model_used: "claude-sonnet-4-6", input_tokens: 100, output_tokens: 50, effort_level: "low" },
    { model_used: "claude-sonnet-4-6", input_tokens: 100, output_tokens: 50, effort_level: "low" },
    { model_used: "claude-sonnet-4-6", input_tokens: 100, output_tokens: 50, effort_level: "low" },
  ],
};

describe("validateAuditInput", () => {
  it("accepts a valid input", () => {
    expect(validateAuditInput(VALID_INPUT)).toBeNull();
  });
  it("rejects null/non-object", () => {
    expect(validateAuditInput(null)?.code).toBe("INVALID_BODY");
    expect(validateAuditInput("string")?.code).toBe("INVALID_BODY");
  });
  it("rejects missing agent_config", () => {
    const r = validateAuditInput({ sample_traces: VALID_INPUT.sample_traces });
    expect(r?.code).toBe("MISSING_FIELDS");
  });
  it("rejects share_pct sum != 100", () => {
    const bad = JSON.parse(JSON.stringify(VALID_INPUT));
    bad.agent_config.models_used = [
      { model: "claude-sonnet-4-6", share_pct: 60 },
      { model: "claude-haiku-4-5", share_pct: 30 },
    ];
    expect(validateAuditInput(bad)?.code).toBe("INVALID_MODEL_SHARE");
  });
  it("accepts share_pct sum within ±1 of 100", () => {
    const ok = JSON.parse(JSON.stringify(VALID_INPUT));
    ok.agent_config.models_used = [
      { model: "claude-sonnet-4-6", share_pct: 50 },
      { model: "claude-haiku-4-5", share_pct: 49 },
    ];
    expect(validateAuditInput(ok)).toBeNull();
  });
  it("rejects sample_traces.length < 3", () => {
    const bad = { ...VALID_INPUT, sample_traces: VALID_INPUT.sample_traces.slice(0, 2) };
    expect(validateAuditInput(bad)?.code).toBe("SAMPLE_TRACES_OUT_OF_RANGE");
  });
  it("rejects sample_traces.length > 50", () => {
    const bad = { ...VALID_INPUT, sample_traces: Array(51).fill(VALID_INPUT.sample_traces[0]) };
    expect(validateAuditInput(bad)?.code).toBe("SAMPLE_TRACES_OUT_OF_RANGE");
  });
  it("rejects monthly_volume_estimate <= 0", () => {
    const bad = JSON.parse(JSON.stringify(VALID_INPUT));
    bad.agent_config.monthly_volume_estimate = 0;
    expect(validateAuditInput(bad)?.code).toBe("INVALID_VOLUME");
  });
  it("rejects empty models_used", () => {
    const bad = JSON.parse(JSON.stringify(VALID_INPUT));
    bad.agent_config.models_used = [];
    expect(validateAuditInput(bad)?.code).toBe("MISSING_MODELS");
  });
});
