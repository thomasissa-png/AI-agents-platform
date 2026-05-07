// src/api/routes/pack-purchase.ts
// POST /api/pack/purchase — F8c functional-specs § 2.5 (US-08c).
// Officialisation Session 7 : achat pack pré-payé avec quota KV TTL 365j.
// Source pricing : docs/ia/agent-economics.md § C.1 + types/pack.ts PACK_CATALOG.
//
// Flow :
//  1. POST body { pack: "discovery" | "standard" | "pro" } (zod-equiv validation)
//  2. wallet_hash dérivé du header X-PAYMENT (settle facilitator) OU body.wallet_hash
//  3. Check 409 — pack actif déjà sur ce wallet (KV lookup pack:{hash}:remaining)
//  4. x402Gate — accept $5/$10/$50 USDC selon pack choisi
//  5. KV write atomique 6 clés (TTL 365j) — pattern aligné agent-audit + pack-status
//  6. Response 200 { pack_type, calls_remaining, expires_at, _signature, ...JWT optional }
//
// Events tracking-plan v2.1 : pack_purchased / pack_purchase_failed_409 / pack_purchase_failed_400

import { PACK_CATALOG, type PackType } from "@/api/types/pack";
import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";
import { x402Gate } from "@/api/middleware/x402";
import { signPayload, sha256Hex, generateUuidV4 } from "@/api/lib/hmac";
import { emitAeEvent, uaBucket, type AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface PackPurchaseEnv {
  PACK_KV: KVNamespace;
  HMAC_SECRET_KEY?: string;
  COINBASE_X402_FACILITATOR_KEY?: string;
  DEVREFS_TREASURY_WALLET?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

const ENDPOINT = "pack-purchase" as const;
const MAX_BODY_BYTES = 4 * 1024;

// Mapping body alias → PackType canonique (functional-specs § 2.5)
const PACK_ALIAS: Record<string, PackType> = {
  discovery: "discovery_5",
  standard: "standard_10",
  pro: "pro_50",
  audit_pro: "audit_pro_49",
  // alias canoniques (passe-through)
  discovery_5: "discovery_5",
  standard_10: "standard_10",
  pro_50: "pro_50",
  audit_pro_49: "audit_pro_49",
};

interface PurchaseBody {
  pack?: string;
  wallet_hash?: string;
}

interface PackPurchaseResponse {
  pack_type: PackType;
  quota_total: number;
  calls_remaining: number;
  purchased_at: string;
  expires_at: string;
  endpoint_scope: "data" | "audit";
  wallet_hash: string;
  tx_hash: string;
  schema_version: "1.0";
  _signature: string;
  _audit_id?: string; // request_id for traceability
}

function jsonResponse(status: number, body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extraHeaders },
  });
}

export async function handlePackPurchase(request: Request, env: PackPurchaseEnv): Promise<Response> {
  const t0 = Date.now();
  const ua = uaBucket(request.headers.get("user-agent"));
  const requestId = generateUuidV4();

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" }, { Allow: "POST" });
  }

  // Body size guard (§2.5 anti-DoS)
  const cl = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (cl > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "body_too_large", max_bytes: MAX_BODY_BYTES });
  }

  // Parse body
  let body: PurchaseBody;
  try {
    body = (await request.json()) as PurchaseBody;
  } catch {
    return jsonResponse(400, { error: "invalid_json", message: "Body must be valid JSON" });
  }

  // Validate pack value (zod-equiv inline — pas de dep new)
  const rawPack = typeof body.pack === "string" ? body.pack.toLowerCase().trim() : "";
  const packType: PackType | undefined = PACK_ALIAS[rawPack];
  if (!packType) {
    emitAeEvent(env.DEVREFS_AE, "pack_purchase_failed_400", {
      endpoint: ENDPOINT,
      ua_bucket: ua,
      status_code: 400,
      error_code: "invalid_pack_value",
      latency_ms: Date.now() - t0,
    });
    return jsonResponse(400, {
      error: "invalid_pack",
      message: "Field 'pack' must be one of: discovery, standard, pro, audit_pro",
      allowed: Object.keys(PACK_ALIAS).filter((k) => !k.endsWith("_5") && !k.endsWith("_10") && !k.endsWith("_50") && !k.endsWith("_49")),
    });
  }

  const catalog = PACK_CATALOG[packType];

  // Resolve wallet_hash : body.wallet_hash (preferred) ou dérivé d'un fallback x402 settle response
  // En l'absence de wallet client, on utilise un sha256(request_id) anonyme — non-recommandé en prod
  let walletHash = typeof body.wallet_hash === "string" ? body.wallet_hash.trim().toLowerCase() : "";
  if (walletHash && walletHash.length !== 64) {
    return jsonResponse(400, {
      error: "invalid_wallet_hash",
      message: "Field 'wallet_hash' must be SHA256 hex (64 chars)",
    });
  }

  // Pre-payment 409 check : pack actif déjà ?
  if (walletHash) {
    const existing = await env.PACK_KV.get(KV_KEYS.packRemaining(walletHash));
    if (existing !== null && parseInt(existing, 10) > 0) {
      const existingType = await env.PACK_KV.get(KV_KEYS.packType(walletHash));
      emitAeEvent(env.DEVREFS_AE, "pack_purchase_failed_409", {
        endpoint: ENDPOINT,
        ua_bucket: ua,
        status_code: 409,
        error_code: "pack_already_active",
        wallet_hash: walletHash,
        latency_ms: Date.now() - t0,
      });
      return jsonResponse(409, {
        error: "pack_already_active",
        message: "An active pack already exists on this wallet. Wait until quota_remaining=0 or expires_at passed.",
        active_pack: { pack_type: existingType, calls_remaining: parseInt(existing, 10) },
      });
    }
  }

  // x402 gate — price selon catalog (5/10/50/49 USDC)
  const gate = await x402Gate(request, env, {
    endpoint: "llm-prices", // fallback endpoint kind for build402Body — pack-purchase n'a pas de slot dédié
    price_usdc: catalog.price_usdc,
    context: {
      offer_type: "pricing_pack",
      alternative_cost: {
        tokens_estimated: catalog.quota_total * 1500, // ~1.5KB JSON parsing per call économisé
        cost_in_usd_per_model: { "claude-opus-4-7": catalog.quota_total * 0.003 },
        agent_action_if_no_devrefs: `Pay-per-call $0.001 × ${catalog.quota_total} = $${catalog.quota_total * 0.001} (no discount)`,
      },
      audit_freshness: {
        audit_engine_version: "1.0.0",
        heuristics_count: 0,
        date_modified: new Date().toISOString(),
      },
      monthly_volume_estimate: catalog.quota_total,
      payload_preview: {
        pack_type: catalog.pack_type,
        quota_total: catalog.quota_total,
        endpoint_scope: catalog.endpoint_scope,
        discount_pct: catalog.discount_pct,
      },
    },
  });
  if (gate instanceof Response) return gate;

  // Re-derive wallet_hash si pas fourni : SHA256(tx_hash) si dispo, sinon anon_request_id
  if (!walletHash) {
    walletHash = await sha256Hex(gate.tx_hash ?? `anon_${requestId}`);
  }

  // Race-condition double-check post-paiement (idempotence si rejeu wallet pendant settle)
  const raceCheck = await env.PACK_KV.get(KV_KEYS.packRemaining(walletHash));
  if (raceCheck !== null && parseInt(raceCheck, 10) > 0) {
    emitAeEvent(env.DEVREFS_AE, "pack_purchase_failed_409", {
      endpoint: ENDPOINT,
      ua_bucket: ua,
      status_code: 409,
      error_code: "pack_already_active_race",
      wallet_hash: walletHash,
      latency_ms: Date.now() - t0,
    });
    return jsonResponse(409, {
      error: "pack_already_active_post_payment",
      message: "Race condition detected — an active pack was created during settle. Refund will be processed.",
      tx_hash: gate.tx_hash,
    });
  }

  // KV writes (6 clés) — TTL 365j absolu (KV_TTL.pack)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + KV_TTL.pack * 1000);
  const txHash = gate.tx_hash ?? `pack_${requestId}`;

  await Promise.all([
    env.PACK_KV.put(KV_KEYS.packRemaining(walletHash), String(catalog.quota_total), {
      expirationTtl: KV_TTL.pack,
    }),
    env.PACK_KV.put(KV_KEYS.packType(walletHash), catalog.pack_type, { expirationTtl: KV_TTL.pack }),
    env.PACK_KV.put(KV_KEYS.packQuotaTotal(walletHash), String(catalog.quota_total), {
      expirationTtl: KV_TTL.pack,
    }),
    env.PACK_KV.put(KV_KEYS.packPurchasedAt(walletHash), now.toISOString(), {
      expirationTtl: KV_TTL.pack,
    }),
    env.PACK_KV.put(KV_KEYS.packExpiresAt(walletHash), expiresAt.toISOString(), {
      expirationTtl: KV_TTL.pack,
    }),
    env.PACK_KV.put(KV_KEYS.packTxHash(walletHash), txHash, { expirationTtl: KV_TTL.pack }),
    env.PACK_KV.put(KV_KEYS.packEndpointScope(walletHash), catalog.endpoint_scope, {
      expirationTtl: KV_TTL.pack,
    }),
  ]);

  // Construct signed response (watermark HMAC pattern aligné agent-audit)
  if (!env.HMAC_SECRET_KEY) {
    return jsonResponse(500, { error: "server_misconfigured", message: "HMAC_SECRET_KEY missing" });
  }
  const baseResponse: Omit<PackPurchaseResponse, "_signature"> = {
    pack_type: catalog.pack_type,
    quota_total: catalog.quota_total,
    calls_remaining: catalog.quota_total,
    purchased_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    endpoint_scope: catalog.endpoint_scope,
    wallet_hash: walletHash,
    tx_hash: txHash,
    schema_version: "1.0",
    _audit_id: requestId,
  };
  const signature = await signPayload(baseResponse, env.HMAC_SECRET_KEY);
  const response: PackPurchaseResponse = { ...baseResponse, _signature: signature };

  emitAeEvent(env.DEVREFS_AE, "pack_purchased", {
    endpoint: ENDPOINT,
    status_code: 200,
    pack_type: catalog.pack_type,
    price_usdc: catalog.price_usdc,
    quota_total: catalog.quota_total,
    wallet_hash: walletHash,
    tx_hash: txHash,
    via: gate.via,
    ua_bucket: ua,
    latency_ms: Date.now() - t0,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Pack-Type": catalog.pack_type,
    "X-DevRefs-Schema-Version": response.schema_version,
  };
  if (gate.payment_response) {
    headers["X-PAYMENT-RESPONSE"] = gate.payment_response;
  }

  return new Response(JSON.stringify(response), { status: 200, headers });
}
