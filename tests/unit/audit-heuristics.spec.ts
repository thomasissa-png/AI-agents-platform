// tests/unit/audit-heuristics.spec.ts
// 5 heuristiques H1-H5 — couverture happy path + edge cases.

import { describe, it, expect } from "vitest";
import {
  h1ModelDowngrade,
  h2PromptCaching,
  h3BatchParallelization,
  h4ToolTrimming,
  h5EffortMismatch,
  runAuditHeuristics,
} from "@/api/lib/audit-heuristics";
import type { AuditInput } from "@/api/types/audit";

function baseInput(overrides: Partial<AuditInput["agent_config"]> = {}): AuditInput {
  return {
    agent_config: {
      models_used: [{ model: "claude-sonnet-4-6", share_pct: 100 }],
      task_complexity: "medium",
      request_pattern: "parallel",
      monthly_volume_estimate: 10_000_000,
      batch_eligible_workloads_pct: 0,
      system_prompts: [{ tokens: 500, cached: true }],
      tools: [{ name: "search", description_tokens: 80 }],
      ...overrides,
    },
    sample_traces: [
      { model_used: "claude-sonnet-4-6", input_tokens: 500, output_tokens: 300, effort_level: "medium" },
      { model_used: "claude-sonnet-4-6", input_tokens: 800, output_tokens: 400, effort_level: "medium" },
      { model_used: "claude-sonnet-4-6", input_tokens: 1000, output_tokens: 600, effort_level: "low" },
    ],
  };
}

describe("H1 — Model downgrade", () => {
  it("recommends Sonnet 4.6 when Opus 4.7 dominant on simple tasks", () => {
    const r = h1ModelDowngrade(
      baseInput({
        models_used: [{ model: "claude-opus-4-7", share_pct: 100 }],
        task_complexity: "simple",
      }),
    );
    expect(r).not.toBeNull();
    expect(r?.heuristic_id).toBe("H1");
    expect(r?.savings_estimate_pct).toBeGreaterThan(50);
    expect(r?.auto_applicable).toBe(true);
  });
  it("returns null for complex tasks", () => {
    const r = h1ModelDowngrade(
      baseInput({
        models_used: [{ model: "claude-opus-4-7", share_pct: 100 }],
        task_complexity: "complex",
      }),
    );
    expect(r).toBeNull();
  });
  it("returns null when Opus is < 50%", () => {
    const r = h1ModelDowngrade(
      baseInput({
        models_used: [
          { model: "claude-opus-4-7", share_pct: 30 },
          { model: "claude-sonnet-4-6", share_pct: 70 },
        ],
        task_complexity: "simple",
      }),
    );
    expect(r).toBeNull();
  });
});

describe("H2 — Prompt caching", () => {
  it("recommends activation for non-cached prompts >= 1024 tokens", () => {
    const r = h2PromptCaching(
      baseInput({ system_prompts: [{ tokens: 2000, cached: false }] }),
    );
    expect(r).not.toBeNull();
    expect(r?.heuristic_id).toBe("H2");
  });
  it("returns null when all prompts cached", () => {
    const r = h2PromptCaching(baseInput({ system_prompts: [{ tokens: 2000, cached: true }] }));
    expect(r).toBeNull();
  });
  it("returns null for prompts < 1024 tokens", () => {
    const r = h2PromptCaching(baseInput({ system_prompts: [{ tokens: 500, cached: false }] }));
    expect(r).toBeNull();
  });
});

describe("H3 — Batch parallelization", () => {
  it("recommends batching when sequential + 20%+ batch-eligible", () => {
    const r = h3BatchParallelization(
      baseInput({ request_pattern: "sequential", batch_eligible_workloads_pct: 50 }),
    );
    expect(r).not.toBeNull();
    expect(r?.auto_applicable).toBe(false);
  });
  it("returns null for parallel pattern", () => {
    const r = h3BatchParallelization(
      baseInput({ request_pattern: "parallel", batch_eligible_workloads_pct: 50 }),
    );
    expect(r).toBeNull();
  });
});

describe("H4 — Tool trimming", () => {
  it("recommends trim for fat tool descriptions", () => {
    const r = h4ToolTrimming(
      baseInput({
        tools: [
          { name: "search", description_tokens: 500 },
          { name: "fetch", description_tokens: 350 },
        ],
      }),
    );
    expect(r).not.toBeNull();
    expect(r?.heuristic_id).toBe("H4");
  });
  it("returns null when all tools <= 300 tokens", () => {
    expect(h4ToolTrimming(baseInput({ tools: [{ name: "x", description_tokens: 100 }] }))).toBeNull();
  });
});

describe("H5 — Effort mismatch", () => {
  it("recommends downscale for high effort + short output traces", () => {
    const input = baseInput();
    input.sample_traces = [
      { model_used: "claude-opus-4-7", input_tokens: 100, output_tokens: 50, effort_level: "high" },
      { model_used: "claude-opus-4-7", input_tokens: 100, output_tokens: 100, effort_level: "high" },
      { model_used: "claude-opus-4-7", input_tokens: 100, output_tokens: 150, effort_level: "high" },
    ];
    const r = h5EffortMismatch(input);
    expect(r).not.toBeNull();
  });
  it("returns null when no mismatched traces", () => {
    const r = h5EffortMismatch(baseInput());
    expect(r).toBeNull();
  });
});

describe("runAuditHeuristics — aggregate", () => {
  it("applies multiple heuristics and aggregates savings", () => {
    const input = baseInput({
      models_used: [{ model: "claude-opus-4-7", share_pct: 100 }],
      task_complexity: "simple",
      system_prompts: [{ tokens: 2000, cached: false }],
      tools: [{ name: "x", description_tokens: 500 }],
    });
    const result = runAuditHeuristics(input);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(result.savings_pct).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.monthly_cost_optimized_usd).toBeLessThan(result.monthly_cost_current_usd);
  });
  it("scores ~100 when no heuristic applies (already optimal)", () => {
    const result = runAuditHeuristics(baseInput());
    expect(result.recommendations.length).toBe(0);
    expect(result.score).toBe(100);
    expect(result.savings_pct).toBe(0);
  });
});
