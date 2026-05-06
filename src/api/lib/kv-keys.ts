// src/api/lib/kv-keys.ts
// Constantes pour les patterns de clés KV — source unique pour tous les modules.
// Source : functional-specs §3 + dev-decisions §"Schéma KV quota pack".

export const KV_KEYS = {
  // PRICES_KV
  price: (modelSlug: string) => `price:${modelSlug}`,

  // SDK_KV
  sdk: (pkgSlug: string) => `sdk:${pkgSlug}`,

  // PACK_KV — clés flat (wallet_hash + suffix)
  packRemaining: (walletHash: string) => `pack:${walletHash}:remaining`,
  packType: (walletHash: string) => `pack:${walletHash}:pack_type`,
  packQuotaTotal: (walletHash: string) => `pack:${walletHash}:quota_total`,
  packPurchasedAt: (walletHash: string) => `pack:${walletHash}:purchased_at`,
  packExpiresAt: (walletHash: string) => `pack:${walletHash}:expires_at`,
  packTxHash: (walletHash: string) => `pack:${walletHash}:tx_hash`,
  packEndpointScope: (walletHash: string) => `pack:${walletHash}:endpoint_scope`,

  // AUDIT_METADATA_KV — méta uniquement (jamais d'input audit, CGU Art. 3.4)
  audit: (auditId: string) => `audit:${auditId}`,

  // JWT_KV
  jwt: (jti: string) => `jwt:${jti}`,

  // CRON_STATE_KV
  cronLastRun: (jobName: string) => `cron:${jobName}:last_run`,
} as const;

// TTL absolus (secondes) — Cloudflare KV TTL
export const KV_TTL = {
  // PRICES_KV : pas de TTL CF (cron écrase la valeur), mais set 7j safety
  pricesSafety: 7 * 24 * 3600,
  // SDK_KV : pas de TTL CF (cron écrase), 7j safety
  sdkSafety: 7 * 24 * 3600,
  // PACK_KV : 12 mois absolus (functional-specs §3)
  pack: 12 * 30 * 24 * 3600,
  // AUDIT_METADATA_KV : 13 mois (functional-specs §3 — au-delà du délai refund 30j + safety)
  auditMetadata: 13 * 30 * 24 * 3600,
  // JWT_KV : 24h + 1h buffer
  jwt: 25 * 3600,
  // CRON_STATE_KV : 7 jours
  cronState: 7 * 24 * 3600,
} as const;
