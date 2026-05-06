// src/api/types/audit.ts
// Types pour /api/agent-audit — input + output + heuristiques.
// Source : agent-audit-spec.md §2 (input), §3 (output), §5 (heuristiques).

export type ModelSlug =
  | "claude-opus-4-7"
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5"
  | "gpt-5"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gemini-2-5-pro"
  | "gemini-2-0-flash"
  | "mistral-large-3"
  | "mistral-small-3"
  | "deepseek-r2"
  | "deepseek-v3";

export type TaskComplexity = "simple" | "medium" | "complex";
export type RequestPattern = "sequential" | "parallel" | "mixed";
export type EffortLevel = "low" | "medium" | "high";

// Input audit (POST body)
export interface AuditInput {
  agent_config: {
    models_used: Array<{
      model: ModelSlug;
      share_pct: number; // 0..100
    }>;
    task_complexity: TaskComplexity;
    request_pattern: RequestPattern;
    monthly_volume_estimate: number; // tokens/mois
    batch_eligible_workloads_pct: number; // 0..100
    system_prompts: Array<{
      tokens: number;
      cached: boolean;
    }>;
    tools: Array<{
      name: string;
      description_tokens: number;
    }>;
  };
  sample_traces: Array<{
    model_used: ModelSlug;
    input_tokens: number;
    output_tokens: number;
    effort_level: EffortLevel;
  }>;
  wallet_hash?: string; // optionnel, hash SHA256 pour méta-data audit
}

// 5 heuristiques V1 (dev-decisions §"5 heuristiques statiques V1")
export type HeuristicId = "H1" | "H2" | "H3" | "H4" | "H5";

export interface AuditRecommendation {
  heuristic_id: HeuristicId;
  title: string;
  description: string;
  auto_applicable: boolean;
  savings_estimate_pct: number;
  monthly_cost_current_usd: number;
  monthly_cost_optimized_usd: number;
  patch: Record<string, unknown> | null;
}

// Output 200 signé
export interface AuditOutput {
  audit_id: string; // aud_{date}_{hex6}
  score: number; // 0..100
  savings_pct: number; // savings totaux estimés
  monthly_cost_current_usd: number;
  monthly_cost_optimized_usd: number;
  recommendations: AuditRecommendation[];
  guarantee: {
    refund_eligible: boolean;
    refund_amount_usdc: number;
    conditions: string[];
  };
  _signature: string; // HMAC-SHA256 hex
  _audit_id: string; // duplication de audit_id pour validation client
  schema_version: "1.0";
}

// Méta-data persistée KV (AUDIT_METADATA_KV) — JAMAIS l'input audit
export interface AuditMetadataKv {
  audit_id: string;
  wallet_hash: string;
  savings_pct: number;
  monthly_volume_estimate: number; // pour vérif refund condition
  purchased_at: string; // ISO
  refund_status: "none" | "pending" | "approved" | "rejected";
  refund_tx_hash: string | null;
  pack_origin: "one_shot" | "audit_pack"; // pour calculer refund_amount
}

// Refund request body
export interface RefundRequestBody {
  audit_id: string;
  wallet_hash: string;
  evidence: {
    savings_pct_measured: number;
    measurement_period_days: number;
    recommendations_applied_pct: number;
  };
  signature: string; // EIP-191 du wallet
}

export interface RefundResponseApproved {
  status: "approved";
  refund_amount_usdc: number;
  refund_wallet: string;
  audit_id: string;
  message: string;
}

export interface RefundResponseRejected {
  status: "rejected";
  error: "REFUND_INELIGIBLE";
  failed_conditions: string[];
  audit_id: string;
}
