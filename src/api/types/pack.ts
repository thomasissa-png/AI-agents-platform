// src/api/types/pack.ts
// Types pour les packs pré-payés DevRefs.
// Source : dev-decisions §"Implémentation pricing pack KV" + pricing-strategy v2.

// 4 types de packs V1 (dev-decisions verbatim)
export type PackType = "discovery_5" | "standard_10" | "pro_50" | "audit_pro_49";

// Catalogue figé V1 — pricing source de vérité (project-context.md)
export const PACK_CATALOG: Record<
  PackType,
  {
    pack_type: PackType;
    price_usdc: number;
    quota_total: number;
    endpoint_scope: "data" | "audit"; // data = pricing+SDK, audit = agent-audit
    discount_pct: number; // vs pay-per-call
    label: string;
  }
> = {
  discovery_5: {
    pack_type: "discovery_5",
    price_usdc: 5,
    quota_total: 5000,
    endpoint_scope: "data",
    discount_pct: 0, // baseline 5000 × $0.001 = $5
    label: "Discovery (5 000 calls)",
  },
  standard_10: {
    pack_type: "standard_10",
    price_usdc: 10,
    quota_total: 10000,
    endpoint_scope: "data",
    discount_pct: 0,
    label: "Standard (10 000 calls)",
  },
  pro_50: {
    pack_type: "pro_50",
    price_usdc: 50,
    quota_total: 60000,
    endpoint_scope: "data",
    discount_pct: 17, // 60k × $0.001 = $60 → $50
    label: "Pro (60 000 calls)",
  },
  audit_pro_49: {
    pack_type: "audit_pro_49",
    price_usdc: 49,
    quota_total: 6,
    endpoint_scope: "audit",
    discount_pct: 18, // 6 × $9.99 = $59.94 → $49
    label: "Audit Pro (6 audits)",
  },
};

// KV value structure (PACK_KV) — clés flat, lookup atomique
// Voir kv-keys.ts pour les patterns de clés
export interface PackKvSnapshot {
  wallet_hash: string;
  pack_type: PackType;
  quota_total: number;
  quota_remaining: number;
  purchased_at: string;
  expires_at: string | null;
  tx_hash: string;
  endpoint_scope: "data" | "audit";
}

// Réponse /api/pack/quota
export interface PackQuotaResponse {
  wallet_hash: string;
  pack_type: PackType;
  quota_total: number;
  quota_remaining: number;
  quota_pct_used: number;
  purchased_at: string;
  expires_at: string | null;
  endpoint_scope: "data" | "audit";
}

// Réponse /api/pack/status (sans JWT, lookup wallet header)
export interface PackStatusResponse {
  wallet_hash: string;
  active_packs: Array<{
    pack_type: PackType;
    quota_remaining: number;
    quota_total: number;
    purchased_at: string;
  }>;
}

export function isPackType(value: string): value is PackType {
  return value in PACK_CATALOG;
}
