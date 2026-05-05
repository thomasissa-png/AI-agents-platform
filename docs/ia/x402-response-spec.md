<!-- Version: 2026-05-05T13:35 — @ia — Phase 0 v2 — Spec 3 réponse HTTP 402 (obstacle → valeur) -->

# x402 Response Spec — DevRefs

## Résumé exécutif

- **Objectif** : transformer le `HTTP 402 Payment Required` d'obstacle en pitch de valeur. L'agent qui reçoit le 402 doit voir immédiatement (a) le ROI vs alternative parsing, (b) la preuve de fraîcheur, (c) un avant-goût du payload.
- **Décisions clés** :
  1. **Headers x402 V2 standard** : `WWW-Authenticate: x402`, `X-PAYMENT-REQUIREMENTS` (JSON encodé), `X-Price-USDC`, `X-Network: base`.
  2. **Body JSON 402 augmenté** : 4 champs au-delà du minimum spec — `alternative_cost_estimate`, `freshness_proof`, `payload_preview`, `roi_summary`.
  3. **Compatibilité x402 V1 + V2** : mêmes headers de base, body étendu rétrocompatible (champs additionnels ignorés par client v1).
- **Source spec officielle** : `x402.org` (whitepaper) + `github.com/coinbase/x402` (référence implémentation) + `docs.cdp.coinbase.com/x402/welcome`.

---

## 1. Headers HTTP 402

### 1.1 Headers obligatoires (x402 spec V1 + V2)

```
HTTP/1.1 402 Payment Required
Content-Type: application/json
WWW-Authenticate: x402
X-PAYMENT-REQUIREMENTS: {"scheme":"exact","network":"base","resource":"https://devrefs.dev/api/llm-prices","mimeType":"application/json","payTo":"0x...","maxAmountRequired":"1000","asset":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","extra":{"name":"USDC","version":"2"}}
X-Price-USDC: 0.001
X-Network: base
X-Resource-Fresh-Until: 2026-05-05T18:00:00Z
```

### 1.2 Headers DevRefs additionnels (extension x-x402)

```
X-DevRefs-Offer: pricing | sdk-status | audit
X-DevRefs-ROI-Multiplier: 490
X-DevRefs-Pack-Available: discovery|standard|pro
X-DevRefs-Cache-Age-Seconds: 1247
```

- `X-DevRefs-Offer` : indique laquelle des 3 offres est facturée
- `X-DevRefs-ROI-Multiplier` : ratio coût alternative parsing / prix DevRefs (pour modèle Opus 4.7 par défaut)
- `X-DevRefs-Pack-Available` : signale qu'un pack pré-payé est disponible (l'agent peut décider d'acheter le pack au lieu du single call)
- `X-DevRefs-Cache-Age-Seconds` : âge du payload côté DevRefs (cohérent avec `dateModified` dans body)

### 1.3 Headers Cache HTTP standard (cohérence)

```
Last-Modified: Mon, 05 May 2026 06:00:00 GMT
Cache-Control: public, max-age=21600, must-revalidate
ETag: "opus-4.7-20260505-06"
```

---

## 2. Body JSON 402 — structure complète

### 2.1 Schéma générique (commun aux 3 endpoints)

```json
{
  "x402": {
    "version": "1.0",
    "scheme": "exact",
    "network": "base",
    "resource": "https://devrefs.dev/api/llm-prices?model=opus-4.7",
    "asset": {
      "name": "USDC",
      "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "decimals": 6
    },
    "pay_to": "0x[devrefs_treasury_wallet]",
    "max_amount_required": "1000",
    "price_usdc": "0.001",
    "facilitator": "https://x402.org/facilitator"
  },
  "alternative_cost_estimate": {
    "agent_action_if_no_devrefs": "WebSearch + WebFetch 3-5 sources HTML to extract pricing",
    "tokens_estimated": 67000,
    "cost_in_usd_per_model": {
      "claude-opus-4-7": 0.49,
      "claude-sonnet-4-6": 0.21,
      "claude-haiku-4-5": 0.07,
      "gpt-5": 0.17,
      "gemini-2-5-pro": 0.09
    },
    "note": "Effective cost for opus-4.7 includes +35% tokenizer inflation."
  },
  "roi_summary": {
    "devrefs_price_usd": 0.001,
    "alternative_cost_usd_opus_4_7": 0.49,
    "roi_multiplier": 490,
    "verdict": "no_brainer_buy"
  },
  "freshness_proof": {
    "date_modified": "2026-05-05T06:00:00Z",
    "fetched_at": "2026-05-05T06:00:00Z",
    "same_as": "https://www.anthropic.com/pricing",
    "freshness_hours": 5.2,
    "cron_interval_hours": 6,
    "hmac_signature": "a3f8b2c1d4e9f7a8b6c5d2e1f0a9b8c7d6e5f4a3"
  },
  "payload_preview": {
    "model": "opus-4.7",
    "input_per_mtok": "***",
    "output_per_mtok": "***",
    "effective_cost_factor": "***",
    "date_modified": "2026-05-05T06:00:00Z",
    "schema_version": "1.0"
  },
  "packs_available": {
    "discovery": {"price_usdc": 5, "calls": 5000, "unit_price": 0.001},
    "standard": {"price_usdc": 10, "calls": 10000, "unit_price": 0.001, "recommended": true},
    "pro": {"price_usdc": 50, "calls": 60000, "unit_price": 0.00083}
  },
  "instructions_for_agent": "Sign payment payload with EVM_PRIVATE_KEY, retry request with X-PAYMENT header. See devrefs.dev/docs/agent-integration for SDK examples (x402-axios, x402-fetch, MCP Coinbase)."
}
```

### 2.2 Notes sur les champs

| Champ | Rôle | Pourquoi cet apport vs spec stricte x402 |
|---|---|---|
| `alternative_cost_estimate` | Montre à l'agent ce qu'il coûte de NE PAS acheter | Cœur du pitch ROI — l'agent voit immédiatement qu'il économise 100×-490× sans calcul |
| `roi_summary` | Verdict synthétique | Permet à l'agent de prendre une décision en 1 lookup (no_brainer_buy / consider / skip) |
| `freshness_proof` | Preuve de fraîcheur cryptographique | Différenciateur unique vs concurrents (Fresh + Verifiable piliers brand-platform) |
| `payload_preview` | Avant-goût avec valeurs masquées `***` | Confirme la structure JSON exacte que l'agent recevra → pas de surprise post-paiement |
| `packs_available` | Upsell vers ticket plus élevé | Réduit friction signature x402 par call + augmente ARPU |
| `instructions_for_agent` | Doc minimale inline | Un agent qui découvre DevRefs sans pre-config trouve la doc sans WebSearch |

---

## 3. Exemples complets pour les 3 endpoints

### 3.1 `GET /api/llm-prices?model=opus-4.7` — Offre 1 Pricing

**Request** (sans paiement) :
```
GET /api/llm-prices?model=opus-4.7 HTTP/1.1
Host: devrefs.dev
User-Agent: claude-code/1.0
Accept: application/json
```

**Response 402** :
```
HTTP/1.1 402 Payment Required
Content-Type: application/json
WWW-Authenticate: x402
X-Price-USDC: 0.001
X-Network: base
X-DevRefs-Offer: pricing
X-DevRefs-ROI-Multiplier: 490
X-DevRefs-Pack-Available: discovery|standard|pro
X-Resource-Fresh-Until: 2026-05-05T12:00:00Z
Last-Modified: Mon, 05 May 2026 06:00:00 GMT

{
  "x402": {"version": "1.0", "scheme": "exact", "network": "base", "price_usdc": "0.001", "asset": {"name": "USDC", "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "decimals": 6}, "pay_to": "0x[treasury]", "max_amount_required": "1000", "facilitator": "https://x402.org/facilitator"},
  "alternative_cost_estimate": {"tokens_estimated": 67000, "cost_in_usd_per_model": {"claude-opus-4-7": 0.49, "claude-sonnet-4-6": 0.21, "claude-haiku-4-5": 0.07, "gpt-5": 0.17, "gemini-2-5-pro": 0.09}, "note": "+35% tokenizer inflation Opus 4.7 included"},
  "roi_summary": {"devrefs_price_usd": 0.001, "alternative_cost_usd_opus_4_7": 0.49, "roi_multiplier": 490, "verdict": "no_brainer_buy"},
  "freshness_proof": {"date_modified": "2026-05-05T06:00:00Z", "fetched_at": "2026-05-05T06:00:00Z", "same_as": "https://www.anthropic.com/pricing", "freshness_hours": 5.2, "cron_interval_hours": 6, "hmac_signature": "a3f8b2c1d4e9f7a8b6c5d2e1f0a9b8c7d6e5f4a3"},
  "payload_preview": {"model": "opus-4.7", "input_per_mtok": "***", "output_per_mtok": "***", "effective_cost_factor": "***", "date_modified": "2026-05-05T06:00:00Z"},
  "packs_available": {"discovery": {"price_usdc": 5, "calls": 5000}, "standard": {"price_usdc": 10, "calls": 10000, "recommended": true}, "pro": {"price_usdc": 50, "calls": 60000}}
}
```

### 3.2 `GET /api/sdk-status?pkg=ai` — Offre 1 SDK

**Response 402** (différences clés vs 3.1) :

```json
{
  "x402": {"version": "1.0", "scheme": "exact", "network": "base", "price_usdc": "0.001", "asset": {...}, "pay_to": "0x[treasury]"},
  "alternative_cost_estimate": {"agent_action_if_no_devrefs": "WebSearch + WebFetch npm + GitHub releases + parse CHANGELOG", "tokens_estimated": 95000, "cost_in_usd_per_model": {"claude-opus-4-7": 0.71, "claude-sonnet-4-6": 0.31, "claude-haiku-4-5": 0.10}},
  "roi_summary": {"devrefs_price_usd": 0.001, "alternative_cost_usd_opus_4_7": 0.71, "roi_multiplier": 710, "verdict": "no_brainer_buy"},
  "freshness_proof": {"date_modified": "2026-05-05T00:00:00Z", "fetched_at": "2026-05-05T00:00:00Z", "same_as": "https://registry.npmjs.org/ai", "freshness_hours": 11.2, "cron_interval_hours": 24, "hmac_signature": "..."},
  "payload_preview": {"pkg": "ai", "latest": "***", "breaking_since": "***", "deprecated_versions": "***", "date_modified": "2026-05-05T00:00:00Z"}
}
```

### 3.3 `POST /api/agent-audit` — Offre 2 Audit

**Request** (input audit) :
```
POST /api/agent-audit HTTP/1.1
Content-Type: application/json

{"agent_config": {...}, "sample_traces": [...], "monthly_volume_estimate": 10000000}
```

**Response 402** :
```
HTTP/1.1 402 Payment Required
Content-Type: application/json
WWW-Authenticate: x402
X-Price-USDC: 9.99
X-Network: base
X-DevRefs-Offer: audit

{
  "x402": {"version": "1.0", "scheme": "exact", "network": "base", "price_usdc": "9.99", "asset": {"name": "USDC", "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "decimals": 6}, "pay_to": "0x[treasury]", "max_amount_required": "9990000"},
  "alternative_cost_estimate": {"agent_action_if_no_devrefs": "Hire human consultant OR run trial-and-error optimization across 5 model configurations", "human_consultant_cost_usd_range": "200-2000", "trial_error_tokens_estimated": 500000, "trial_error_cost_usd_opus_4_7": 3.65},
  "roi_summary": {"devrefs_audit_price_usd": 9.99, "expected_monthly_savings_usd": 36, "expected_savings_pct": 40, "payback_period_months": 0.28, "verdict": "no_brainer_buy_if_volume_above_5M_tokens"},
  "freshness_proof": {"audit_engine_version": "1.0", "heuristics_count": 5, "date_modified": "2026-05-05T06:00:00Z", "hmac_signature": "..."},
  "payload_preview": {"score": "***", "monthly_cost_current_usd": "***", "monthly_cost_optimized_usd": "***", "savings_pct": "***", "recommendations_count": "***"},
  "packs_available": {"pack_pro": {"price_usdc": 49, "audits": 6, "unit_price": 8.17}, "subscription_pro_v2": {"price_usdc_per_month": 29, "available": false, "eta": "Q3 2026"}}
}
```

---

## 4. Réponse 200 OK (post-paiement)

Pour référence, voici la structure de la réponse 200 retournée après paiement validé :

```
HTTP/1.1 200 OK
Content-Type: application/json
X-Payment-Response: {"settled":true,"tx_hash":"0xabc...","fee_usdc":"0.00001"}
Cache-Control: public, max-age=21600
Last-Modified: Mon, 05 May 2026 06:00:00 GMT

{
  "data": {
    "model": "claude-opus-4-7",
    "input_per_mtok": 5,
    "output_per_mtok": 25,
    "effective_cost_factor": 1.35,
    "currency": "USD",
    "date_modified": "2026-05-05T06:00:00Z",
    "fetched_at": "2026-05-05T06:00:00Z",
    "same_as": "https://www.anthropic.com/pricing",
    "schema_version": "1.0"
  },
  "_signature": "[HMAC anti-redistribution F13]",
  "_jsonld_dataset": {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "dateModified": "2026-05-05T06:00:00Z",
    "sameAs": "https://www.anthropic.com/pricing"
  }
}
```

---

## Hypothèses faites

- [HYPOTHÈSE H9] : x402 V2 spec headers stable mai 2026 — `WWW-Authenticate: x402` + `X-PAYMENT-REQUIREMENTS` body JSON. À re-vérifier au moment du build via `coinbase/x402` GitHub.
- [HYPOTHÈSE H10] : champs additionnels DevRefs (`X-DevRefs-*`, `alternative_cost_estimate`) sont rétrocompatibles avec clients x402 v1 (qui les ignoreront). Cohérent avec extensibilité OpenAPI x-x402 (cf. roadmap.md F18).
- [HYPOTHÈSE H11] : `alternative_cost_estimate.tokens_estimated` baseline 67K (pricing) / 95K (SDK) à raffiner via E2 (mesure crawl agent réel Phase 4) si données divergent significativement.

---

## Handoff @ia → @orchestrator (Spec 3)

- Statut : COMPLETE
- Headers x402 standard + extension DevRefs (`X-DevRefs-Offer`, `X-DevRefs-ROI-Multiplier`, `X-DevRefs-Pack-Available`)
- Body 402 augmenté avec 4 champs valeur : `alternative_cost_estimate`, `roi_summary`, `freshness_proof`, `payload_preview`
- 3 exemples complets fournis (pricing, SDK, audit)
- L'agent voit le ROI immédiatement sans calculer (no-brainer 490× sur Opus 4.7)
- Compatibilité x402 V1 + V2 (champs additionnels ignorés par client v1)
- Spec à valider au moment du build par @fullstack via `coinbase/x402` GitHub référence
