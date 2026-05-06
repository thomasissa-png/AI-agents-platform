// src/api/lib/audit-heuristics.ts
// 5 heuristiques statiques V1 — zéro IA runtime (CGU Art. 3.4 + project-context.md).
// Source : dev-decisions.md §"5 heuristiques statiques V1" + agent-audit-spec.md §5.

import type { AuditInput, AuditRecommendation, ModelSlug } from "@/api/types/audit";

// Coût par MTok (USD) — cohérent avec PRICES_KV seed (à raffiner via cron run).
// Source : pricing officiel public Anthropic/OpenAI mai 2026.
const MODEL_COST_PER_MTOK: Record<ModelSlug, { input: number; output: number }> = {
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 0.8, output: 4 },
  "gpt-5": { input: 5, output: 20 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gemini-2-5-pro": { input: 1.25, output: 5 },
  "gemini-2-0-flash": { input: 0.1, output: 0.4 },
  "mistral-large-3": { input: 2, output: 6 },
  "mistral-small-3": { input: 0.2, output: 0.6 },
  "deepseek-r2": { input: 0.55, output: 2.19 },
  "deepseek-v3": { input: 0.27, output: 1.1 },
};

function modelBlendedCostPerMtok(input: AuditInput): number {
  let cost = 0;
  for (const m of input.agent_config.models_used) {
    const c = MODEL_COST_PER_MTOK[m.model];
    // mix 70% input / 30% output (heuristique baseline)
    const blended = c.input * 0.7 + c.output * 0.3;
    cost += blended * (m.share_pct / 100);
  }
  return cost;
}

function totalMonthlyCost(input: AuditInput): number {
  const blended = modelBlendedCostPerMtok(input);
  return (input.agent_config.monthly_volume_estimate / 1_000_000) * blended;
}

// H1 — Model downgrade par task complexity
export function h1ModelDowngrade(input: AuditInput): AuditRecommendation | null {
  const dominantOpus = input.agent_config.models_used.find(
    (m) => m.model === "claude-opus-4-7" && m.share_pct >= 50,
  );
  if (!dominantOpus || input.agent_config.task_complexity !== "simple") return null;
  const current = totalMonthlyCost(input);
  const sonnetCost = MODEL_COST_PER_MTOK["claude-sonnet-4-6"];
  const optimizedBlended = sonnetCost.input * 0.7 + sonnetCost.output * 0.3;
  const optimized = (input.agent_config.monthly_volume_estimate / 1_000_000) * optimizedBlended;
  const savingsPct = Math.round(((current - optimized) / current) * 100);
  return {
    heuristic_id: "H1",
    title: "Downgrade Opus 4.7 vers Sonnet 4.6 (task simple)",
    description:
      "Votre agent utilise Opus 4.7 sur des tasks classifiées 'simple'. Sonnet 4.6 délivre 95 % de la qualité à 20 % du coût.",
    auto_applicable: true,
    savings_estimate_pct: savingsPct,
    monthly_cost_current_usd: Math.round(current * 100) / 100,
    monthly_cost_optimized_usd: Math.round(optimized * 100) / 100,
    patch: { models_used: [{ model: "claude-sonnet-4-6", share_pct: 100 }] },
  };
}

// H2 — Prompt caching activation
export function h2PromptCaching(input: AuditInput): AuditRecommendation | null {
  const eligible = input.agent_config.system_prompts.filter((p) => !p.cached && p.tokens >= 1024);
  if (eligible.length === 0) return null;
  const current = totalMonthlyCost(input);
  // Cache Anthropic : 90 % réduction sur prompt cached (read), 25 % surcoût write (1 fois)
  // Estimation conservative : économie 50 % sur portion input des prompts éligibles
  const cachedTokens = eligible.reduce((s, p) => s + p.tokens, 0);
  const savingsRatio = Math.min(0.5, (cachedTokens * 100) / input.agent_config.monthly_volume_estimate);
  const optimized = current * (1 - savingsRatio);
  return {
    heuristic_id: "H2",
    title: "Activer prompt caching Anthropic/OpenAI",
    description: `${eligible.length} system prompt(s) ≥ 1 024 tokens non-cachés. Activation cache = -90 % coût input sur lectures répétées.`,
    auto_applicable: true,
    savings_estimate_pct: Math.round(savingsRatio * 100),
    monthly_cost_current_usd: Math.round(current * 100) / 100,
    monthly_cost_optimized_usd: Math.round(optimized * 100) / 100,
    patch: { system_prompts: eligible.map((p) => ({ ...p, cached: true })) },
  };
}

// H3 — Batch parallélisation
export function h3BatchParallelization(input: AuditInput): AuditRecommendation | null {
  if (
    input.agent_config.batch_eligible_workloads_pct < 20 ||
    input.agent_config.request_pattern !== "sequential"
  ) {
    return null;
  }
  const current = totalMonthlyCost(input);
  // Anthropic Batch API : -50 % coût + latence accrue mais throughput +
  const eligibleShare = input.agent_config.batch_eligible_workloads_pct / 100;
  const savingsRatio = eligibleShare * 0.5;
  const optimized = current * (1 - savingsRatio);
  return {
    heuristic_id: "H3",
    title: "Migrer workloads éligibles vers Batch API",
    description: `${input.agent_config.batch_eligible_workloads_pct} % de votre charge est batch-éligible mais traitée séquentiellement. Batch API = -50 % coût.`,
    auto_applicable: false,
    savings_estimate_pct: Math.round(savingsRatio * 100),
    monthly_cost_current_usd: Math.round(current * 100) / 100,
    monthly_cost_optimized_usd: Math.round(optimized * 100) / 100,
    patch: null,
  };
}

// H4 — Tool description trimming
export function h4ToolTrimming(input: AuditInput): AuditRecommendation | null {
  const fat = input.agent_config.tools.filter((t) => t.description_tokens >= 300);
  if (fat.length === 0) return null;
  const current = totalMonthlyCost(input);
  const wastedTokens = fat.reduce((s, t) => s + (t.description_tokens - 100), 0);
  // Hypothèse : tools envoyés à chaque appel (typique agent), savings = wasted/total input
  const savingsRatio = Math.min(0.15, (wastedTokens * 100) / input.agent_config.monthly_volume_estimate);
  const optimized = current * (1 - savingsRatio);
  return {
    heuristic_id: "H4",
    title: "Trim tool descriptions sous 100 tokens",
    description: `${fat.length} tool(s) avec description ≥ 300 tokens. Cible 100 tokens/tool = -5 à 15 % tokens input.`,
    auto_applicable: true,
    savings_estimate_pct: Math.round(savingsRatio * 100),
    monthly_cost_current_usd: Math.round(current * 100) / 100,
    monthly_cost_optimized_usd: Math.round(optimized * 100) / 100,
    patch: { tools: fat.map((t) => ({ name: t.name, description_tokens: 100 })) },
  };
}

// H5 — Effort level mismatch
export function h5EffortMismatch(input: AuditInput): AuditRecommendation | null {
  const mismatched = input.sample_traces.filter((t) => t.effort_level === "high" && t.output_tokens <= 200);
  if (mismatched.length === 0 || mismatched.length / input.sample_traces.length < 0.2) return null;
  const current = totalMonthlyCost(input);
  // Effort high = thinking tokens > 1k typique ; output 200 = sur-kill
  const ratio = mismatched.length / input.sample_traces.length;
  const savingsRatio = ratio * 0.3;
  const optimized = current * (1 - savingsRatio);
  return {
    heuristic_id: "H5",
    title: "Réduire effort level sur tasks à output court",
    description: `${mismatched.length}/${input.sample_traces.length} traces ont effort=high pour output ≤ 200 tokens. Effort=medium suffit.`,
    auto_applicable: true,
    savings_estimate_pct: Math.round(savingsRatio * 100),
    monthly_cost_current_usd: Math.round(current * 100) / 100,
    monthly_cost_optimized_usd: Math.round(optimized * 100) / 100,
    patch: null,
  };
}

export interface AuditAnalysisResult {
  recommendations: AuditRecommendation[];
  score: number; // 0..100
  savings_pct: number;
  monthly_cost_current_usd: number;
  monthly_cost_optimized_usd: number;
}

/**
 * Exécute les 5 heuristiques et agrège le résultat.
 * Score : 100 - (savings_pct cumulé borné à 80) → un agent déjà optimal scorera ~100.
 */
export function runAuditHeuristics(input: AuditInput): AuditAnalysisResult {
  const candidates = [
    h1ModelDowngrade(input),
    h2PromptCaching(input),
    h3BatchParallelization(input),
    h4ToolTrimming(input),
    h5EffortMismatch(input),
  ];
  const recommendations = candidates.filter((r): r is AuditRecommendation => r !== null);

  const current = totalMonthlyCost(input);
  // Combinaison : on suppose les économies multiplicatives (1-r1)(1-r2)... pour éviter double-comptage
  let remainingFactor = 1;
  for (const r of recommendations) {
    remainingFactor *= 1 - r.savings_estimate_pct / 100;
  }
  const optimized = current * remainingFactor;
  const totalSavingsPct = Math.round((1 - remainingFactor) * 100);
  const score = Math.max(0, Math.min(100, 100 - Math.min(80, totalSavingsPct)));

  return {
    recommendations,
    score,
    savings_pct: totalSavingsPct,
    monthly_cost_current_usd: Math.round(current * 100) / 100,
    monthly_cost_optimized_usd: Math.round(optimized * 100) / 100,
  };
}

/**
 * Validation pre-payment de l'input audit. Renvoie null si OK, sinon { code, message }.
 */
export function validateAuditInput(
  input: unknown,
): { code: string; message: string } | null {
  if (!input || typeof input !== "object") {
    return { code: "INVALID_BODY", message: "Body must be a JSON object" };
  }
  const i = input as Partial<AuditInput>;
  if (!i.agent_config || !i.sample_traces) {
    return { code: "MISSING_FIELDS", message: "Required: agent_config, sample_traces" };
  }
  const cfg = i.agent_config;
  if (!Array.isArray(cfg.models_used) || cfg.models_used.length === 0) {
    return { code: "MISSING_MODELS", message: "agent_config.models_used must be non-empty array" };
  }
  const totalShare = cfg.models_used.reduce((s, m) => s + (m.share_pct ?? 0), 0);
  if (Math.abs(totalShare - 100) > 1) {
    return {
      code: "INVALID_MODEL_SHARE",
      message: `Sum of share_pct must equal 100 (±1). Got ${totalShare}.`,
    };
  }
  if (!Array.isArray(i.sample_traces) || i.sample_traces.length < 3 || i.sample_traces.length > 50) {
    return {
      code: "SAMPLE_TRACES_OUT_OF_RANGE",
      message: "sample_traces.length must be in [3, 50]",
    };
  }
  if (typeof cfg.monthly_volume_estimate !== "number" || cfg.monthly_volume_estimate <= 0) {
    return { code: "INVALID_VOLUME", message: "monthly_volume_estimate must be positive number" };
  }
  return null;
}
