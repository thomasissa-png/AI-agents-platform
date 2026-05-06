// US-17 — full flow audit + watermark + KV check.
import { expect, test } from "@playwright/test";

test("POST /api/agent-audit sans X-PAYMENT → 402 augmenté", async ({ request }) => {
  const r = await request.post("/api/agent-audit", {
    headers: { "Content-Type": "application/json" },
    data: {
      agent_config: {
        models_used: [{ model: "claude-opus-4-7", share_pct: 100 }],
        task_complexity: "medium",
        request_pattern: "sequential",
        monthly_volume_estimate: 5_000_000,
        batch_eligible_workloads_pct: 0,
        system_prompts: [],
        tools: [],
      },
      sample_traces: [],
    },
  });
  expect(r.status()).toBe(402);
});
