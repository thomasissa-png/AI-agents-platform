<!-- Version: 2026-05-05T18:00 — @product-manager — Phase 1 — Functional Specs V1 DevRefs -->

# Functional Specs — DevRefs V1

> Source de vérité fonctionnelle Phase 1. Lire en parallèle avec `v1-scope.md` v2, `backlog.md` v2, `x402-response-spec.md`, `agent-audit-spec.md`, `tracking-plan.md` v2, `cgu-draft.md` v2.

---

## §1 — Architecture vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Agent IA / Sponsor humain)           │
│    fetch llms.txt ──► GET /api/llm-prices ──► POST /api/agent-audit  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTP
                     ┌──────────▼──────────┐
                     │   Cloudflare CDN    │  (cache Edge KV, TLS)
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │   CF Worker (API)   │  router.ts — 3 endpoints
                     │   + Middleware x402 │  ← valide X-PAYMENT header
                     └──┬─────┬──────┬────┘
                        │     │      │
            ┌───────────▼─┐ ┌─▼────────┐ ┌──────▼────────────────────┐
            │  CF KV      │ │ Coinbase  │ │  CF Workers Analytics      │
            │  6 namespaces│ │ x402 fac.│ │  Engine (events, no PII)   │
            │  (cache data)│ │ (settle) │ └───────────────────────────┘
            └──────┬──────┘ └──────────┘
                   │
            ┌──────▼──────┐
            │  Cron Worker│  5 jobs → écriture KV → IndexNow → CF AE event
            │  (5 crons)  │  sources officielles : Anthropic/OpenAI/
            └─────────────┘  Google/Mistral/npm/GitHub
                   │
            ┌──────▼────────────┐
            │  Stripe (auxiliaire│  top-up wallet sponsor uniquement
            │  sponsor top-up)  │  — PAS offre commerciale principale
            └───────────────────┘
```

**Lecture du flux standard (agent IA)** :
1. Agent fetch `GET /llms.txt` (public, no auth) → découvre 3 endpoints + pricing x402
2. Agent appelle endpoint → CF Worker → middleware x402 → HTTP 402 + body ROI augmenté
3. Agent signe paiement x402 → CF Worker → Coinbase facilitator settle < 5 s
4. Si pack actif : KV lookup `pack:{wallet_hash}:quota` < 50 ms → bypass 402
5. Payload 200 retourné + watermark HMAC + event CF AE emis

---

## §2 — Contracts API

### 2.1 Tableau des 10 endpoints

| Path | Méthode | Auth | Cache TTL | Events émis | Codes erreur métier |
|---|---|---|---|---|---|
| `/api/llm-prices` | GET | x402 ou pack token | 6 h (cron) | `api_request_received`, `api_response_402_sent` ou `api_response_200_sent` | 402 no-pay, 401 pack-exhausted, 429 rate-limit, 503 facilitator-down |
| `/api/sdk-status` | GET | x402 ou pack token | 24 h (cron) | `api_request_received`, `api_response_402_sent` ou `api_response_200_sent` | idem ci-dessus |
| `/api/agent-audit` | POST | x402 one-shot ou pack-audit | Aucun (compute live) | `audit_request_received`, `audit_402_served`, `audit_paid_x402`, `audit_delivered` | 400 invalid-input, 402 no-pay, 413 payload-too-large |
| `/api/audit/refund` | POST | wallet_hash + audit_id | Aucun | `audit_refund_requested`, `audit_refund_approved` ou `audit_refund_rejected` | 400 ineligible, 404 audit-not-found, 409 already-refunded |
| `/llms.txt` | GET | Aucune | 5 min CF edge | `crawl_llmstxt_fetched` | 404 si absent, 5xx CF |
| `/about/data-sources` | GET | Aucune | 24 h | `landing_page_viewed` (path prop) | 404, 5xx |
| `/about/data-schema` | GET | Aucune | 24 h | `landing_page_viewed` (path prop) | 404, 5xx |
| `/legal/cgv` | GET | Aucune | 24 h | `landing_page_viewed` | 404, 5xx |
| `/dashboard` | GET | JWT HMAC 24 h (sponsor) | Aucun (live KV) | `sponsor_dashboard_viewed` | 401 jwt-invalid, 401 jwt-expired |
| `/api/pack/status` | GET | wallet_hash (header) | Aucun (live KV) | `pack_status_checked` | 401 no-wallet, 404 no-pack |

### 2.2 Détail — `/api/llm-prices` (endpoint critique 1)

**Request** :
```
GET /api/llm-prices?model=claude-opus-4-7 HTTP/1.1
Host: devrefs.dev
Accept: application/json
X-PAYMENT: [header x402 si payant] | X-Pack-Token: [token si pack]
```

Paramètre `model` : string enum (12 valeurs : claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5, gpt-5, gpt-4o, gpt-4o-mini, gemini-2-5-pro, gemini-2-0-flash, mistral-large-3, mistral-small-3, deepseek-r2, deepseek-v3). Obligatoire.

**Response 200** :
```json
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
  "_signature": "[HMAC-SHA256 anti-redistribution F13]",
  "_jsonld_dataset": {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "dateModified": "2026-05-05T06:00:00Z",
    "sameAs": "https://www.anthropic.com/pricing"
  }
}
```

**Response 402** : cf. `x402-response-spec.md` § 2.1 — body augmenté complet avec `alternative_cost_estimate`, `roi_summary`, `freshness_proof`, `payload_preview`, `packs_available`.

**Headers SLA** : `Last-Modified`, `Cache-Control: public, max-age=21600`, `ETag`, `X-Resource-Fresh-Until`.

### 2.3 Détail — `/api/agent-audit` (endpoint critique 2)

**Request** :
```
POST /api/agent-audit HTTP/1.1
Content-Type: application/json
Content-Length: [max 102 400 octets]
```

Body : cf. `agent-audit-spec.md` § 2 (input JSON Schema complet). Validations avant 402 :
- `share_pct` sum = 100 ± 1 → sinon 400 `INVALID_MODEL_SHARE`
- `sample_traces.length` ∈ [3, 50] → sinon 400 `SAMPLE_TRACES_OUT_OF_RANGE`
- `monthly_volume_estimate < 5 000 000` → 402 avec `roi_warning`
- Payload > 100 KB → 413 `PAYLOAD_TOO_LARGE`

**Response 200** : cf. `agent-audit-spec.md` § 3 (output complet avec score, savings_pct, recommendations[], guarantee, `_signature`, `_audit_id`).

**Latence cible** : p95 320 ms (dérogation validée — endpoint compute-intensif vs 200 ms endpoints data).

### 2.4 Détail — `/api/audit/refund` (endpoint critique 3)

**Request** :
```
POST /api/audit/refund HTTP/1.1
Content-Type: application/json
```

Body :
```json
{
  "audit_id": "aud_2026-05-05_a3f8b2",
  "wallet_hash": "[SHA256 wallet acheteur]",
  "evidence": {
    "savings_pct_measured": 8.2,
    "measurement_period_days": 30,
    "recommendations_applied_pct": 85
  }
}
```

**Response 200 (refund approuvé)** :
```json
{
  "status": "approved",
  "refund_amount_usdc": 4.995,
  "refund_wallet": "[wallet acheteur]",
  "tx_hash": "0x...",
  "audit_id": "aud_2026-05-05_a3f8b2"
}
```

**Conditions d'éligibilité** (verbatim CGU Art. 4ter) : volume >= 5M tokens/mois, >= 80 % recommandations appliquées, modèle principal stable 30 j, demande soumise <= 30 j après audit. Non remplies → 400 `REFUND_INELIGIBLE` + motif.

---

## §3 — Schémas KV (6 namespaces)

| Namespace | Key pattern | Value structure (JSON) | TTL | Invalidation |
|---|---|---|---|---|
| `PRICES_KV` | `price:{model_slug}` | `{input, output, effective_cost_factor, date_modified, fetched_at, same_as, schema_version}` | 6 h (cron écrase) | Cron toutes 6 h, écriture atomique |
| `SDK_KV` | `sdk:{pkg_slug}` | `{latest, breaking_since, deprecated_versions, date_modified, same_as}` | 24 h (cron écrase) | Cron toutes 24 h |
| `PACK_KV` | `pack:{wallet_hash}:{pack_id}` | `{quota_remaining, quota_total, pack_type, purchased_at, expires_at, endpoint_scope}` | 12 mois (TTL absolu) | Décrémenté à chaque call autorisé, expire sinon |
| `AUDIT_METADATA_KV` | `audit:{audit_id}` | `{wallet_hash, savings_pct, purchased_at, refund_status, refund_tx_hash}` | 13 mois | Mis à jour si refund accordé |
| `JWT_KV` | `jwt:{jti}` | `{wallet_hash_sponsor, issued_at, expires_at, invalidated}` | 24 h + 1 h buffer | Invalidé côté KV si logout sponsor |
| `CRON_STATE_KV` | `cron:{job_name}:last_run` | `{timestamp, success, sources_fetched, kv_writes}` | 7 jours | Ecrasé à chaque run |

**Contraintes free tier CF KV** : <= 1 Go stockage, <= 100 000 reads/jour, <= 1 000 writes/jour. Volume V1 estimé bien en dessous.

---

## §4 — Cron jobs (5 jobs)

| Nom | Fréquence | Sources | Output (KV writes) | Events CF AE |
|---|---|---|---|---|
| `cron-prices-update` | Toutes 6 h | Anthropic pricing page, OpenAI pricing, Google AI Studio, Mistral pricing, DeepSeek pricing (12 modèles) | 12 writes `PRICES_KV` | `cron_prices_updated` (nb_models, freshness_hours) |
| `cron-sdk-update` | Toutes 24 h | npm registry API (50 packages), GitHub releases API (50 repos) | 50 writes `SDK_KV` | `cron_sdk_updated` (nb_packages, nb_breaking_changes) |
| `cron-indexnow-push` | Post-cron (triggered après update) | CF KV (liste endpoints modifiés) | Aucun KV | `cron_indexnow_pushed` (urls_submitted, bing_status) |
| `cron-pack-expiry-check` | 1× par jour (00h00 UTC) | `PACK_KV` (scan TTL proche) | Mise à jour `PACK_KV` expired | `pack_expired` (wallet_hash, pack_type, quota_unused) |
| `cron-cron-health-check` | 15 min (watchdog) | `CRON_STATE_KV` (dernier run OK) | Aucun KV | `quality_cron_stale_alert` si dernier run > 8 h (prix) ou > 30 h (SDK) |

---

## §5 — Dépendances techniques

### 5.1 Secrets env vars (7 obligatoires)

| Variable | Usage |
|---|---|
| `COINBASE_X402_FACILITATOR_KEY` | Auth API Coinbase facilitator |
| `DEVREFS_TREASURY_WALLET` | Adresse wallet reception USDC |
| `HMAC_SECRET_KEY` | Signature watermark payloads + audit_id |
| `STRIPE_SECRET_KEY` | Top-up wallet sponsor (auxiliaire) |
| `STRIPE_WEBHOOK_SECRET` | Validation webhooks Stripe |
| `INDEXNOW_API_KEY` | Push Bing IndexNow post-cron |
| `JWT_SECRET` | Signature/vérification JWT sponsor dashboard |

### 5.2 KV Bindings wrangler.toml (6)

```toml
[[kv_namespaces]]
binding = "PRICES_KV"       # id = à compléter après CF setup
binding = "SDK_KV"
binding = "PACK_KV"
binding = "AUDIT_METADATA_KV"
binding = "JWT_KV"
binding = "CRON_STATE_KV"
```

### 5.3 Free tier limits (bloquant V1)

| Ressource | Limite free | Estimation V1 | Marge |
|---|---|---|---|
| CF Workers requests | 100 000/jour | ~500-2 000/jour | x50-200 |
| CF KV reads | 100 000/jour | ~2 000/jour | x50 |
| CF KV writes | 1 000/jour | ~65/jour (12+50+3 crons) | x15 |
| CF AE events | 100 000/jour | ~3 500/jour | x28 |
| CF Cron triggers | 5 crons | 5 crons | = |

---

## §6 — Mapping features × user stories × events × endpoints

| Feature | US | Event(s) clés | Endpoint | Effort |
|---|---|---|---|---|
| F1 `/api/llm-prices` | US-03, US-04 | `api_request_received`, `payment_x402_completed`, `api_response_200_sent` | `/api/llm-prices` | M |
| F1b `/api/agent-audit` | US-16, US-17, US-18, US-19 | `audit_request_received`, `audit_402_served`, `audit_paid_x402`, `audit_delivered` | `/api/agent-audit` | L |
| F1c Validation input audit | US-16 | `api_response_4xx_sent` (400) | `/api/agent-audit` | S |
| F2 `/api/sdk-status` | US-05, US-06 | `api_request_received`, `payment_x402_completed` | `/api/sdk-status` | M |
| F3 JSON-LD Dataset + dateModified | US-03, US-05 | inclus dans `api_response_200_sent` (freshness_hours prop) | `/api/llm-prices`, `/api/sdk-status` | S |
| F4 Header Last-Modified | US-03, US-05 | — | tous endpoints data | S |
| F5 `effective_cost_factor` Opus | US-03 | prop payload | `/api/llm-prices` | S |
| F6 Cron sources officielles | US-01 (indirect) | `cron_prices_updated`, `cron_sdk_updated` | cron workers | M |
| F7 IndexNow push | US-01 (indirect) | `cron_indexnow_pushed` | cron post-update | S |
| F8 Middleware x402 unifié | US-02, US-03, US-05, US-16 | `payment_x402_required`, `payment_x402_attempt`, `payment_x402_completed` | tous 3 endpoints | L |
| F8b Pack KV quota lookup | US-07, US-08 | `pack_purchased`, `pack_quota_consumed` | tous 3 endpoints | M |
| F9 Stripe top-up sponsor | US-10b | `sponsor_topup_stripe_completed` | Stripe webhook | S |
| F10 JWT HMAC 24 h | US-11 | `sponsor_jwt_issued` | `/api/jwt/issue` | S |
| F11 Cookie Secure;HttpOnly | US-11 | — | `/api/jwt/issue` | S |
| F12 Stripe Tax | — | — | Stripe config | S |
| F13 Watermark HMAC `_signature` | US-03, US-05, US-18 | prop `_signature` dans 200 | tous endpoints data | S |
| F14 Rate-limit applicatif | US-02 (limite) | `api_response_4xx_sent` (429) | middleware | S |
| F15 `llms.txt` | US-01 | `crawl_llmstxt_fetched` | `/llms.txt` | S |
| F16 Landing publique `/` | US-14 | `landing_page_viewed`, `landing_cta_clicked` | `/` | M |
| F17 Sitemap.xml + robots.txt | — | — | CF Pages | S |
| F18 OpenAPI 3.1 spec x-x402 | US-01 (indirect) | — | `/openapi.json` | S |
| F19 `/about/data-sources` | US-14 | `landing_page_viewed` | `/about/data-sources` | S |
| F20 `/about/data-schema` | US-14 | `landing_page_viewed` | `/about/data-schema` | S |
| F21 Page `/legal/cgv` | US-13 | `landing_page_viewed` | `/legal/cgv` | S |
| F22 Page `/legal/privacy` | US-13 | `landing_page_viewed` | `/legal/privacy` | S |
| F23 Page `/legal/mentions-legales` | US-13 | `landing_page_viewed` | `/legal/mentions-legales` | S |
| F24 Page `/bot` | — | — | `/bot` | S |
| F25 Dashboard interne consolidé | US-15 | `sponsor_dashboard_viewed` | `/dashboard-admin` | M |
| F26 Page `/dashboard?token=JWT` | US-12 | `sponsor_dashboard_viewed` | `/dashboard` | S |

**Légende Effort** : S < 4 h IA, M < 1 j IA, L > 1 j IA.

---

## §7 — Critères d'acceptance V1 (10 gates fonctionnels)

- **GA-01 Latence** : p95 < 200 ms sur `/api/llm-prices` et `/api/sdk-status`, p95 < 320 ms sur `/api/agent-audit` — mesuré CF AE propriété `latency_ms`.
- **GA-02 Fraîcheur pricing** : 100 % des payloads `date_modified` < 6 h (cron 6 h) — mesuré `freshness_hours` en CF AE.
- **GA-03 Fraîcheur SDK** : 100 % des payloads `date_modified` < 24 h (cron 24 h) — mesuré CF AE.
- **GA-04 Fraîcheur audit engine** : `audit_metadata.date_modified` < 1 h (pas de stale engine) — watchdog cron-health-check.
- **GA-05 User stories vertes** : 21 US du backlog v2 passent les critères Given/When/Then — attesté par @qa Phase 3.
- **GA-06 Events tracking** : 50 events du tracking-plan v2 présents dans CF AE — attesté par @data-analyst à J7.
- **GA-07 Garantie refund testable** : endpoint `/api/audit/refund` renvoie 200 approved ou 400 ineligible + motif structuré — test @qa cas éligible + cas inéligible.
- **GA-08 Checkbox CGU L.221-28** : landing `/legal/cgv` affiche mention renonciation L.221-28 13° verbatim CGU Art. 4quater — vérification @legal + @qa visuelle.
- **GA-09 Watermark HMAC** : champ `_signature` présent dans 100 % des payloads 200 — test @qa sur 3 endpoints, validation HMAC testable côté acheteur.
- **GA-10 JWT HMAC valide** : JWT émis après top-up Stripe sponsor est valide 24 h exactement, rejeté après expiration — test @qa JWT expired + JWT tampered.

---

## §8 — Contraintes non-fonctionnelles

- **Latence** : p95 < 200 ms endpoints data (KV read + watermark HMAC), p99 < 50 KB payload pricing. Audit : p95 < 320 ms (compute heuristiques). Toute dégradation > 200 ms p95 data déclenche alerte CF AE `quality_cron_stale_alert`.
- **Disponibilité SLO** : 99.5 % uptime mensuel sur CF Workers + CF KV. Cloudflare free tier SLA non garanti contractuellement — upgrade Workers Paid $5/mois si SLO manqué à J30.
- **RGPD zéro-PII** : aucune IP brute, aucun UA complet, aucun email en CF AE. wallet_hash = SHA256 pseudonyme (non réversible sans sel privé). Input audit traité uniquement en mémoire Worker, jamais persisté (CGU Art. 3.4). Seules les métadonnées audit (audit_id, savings_pct, wallet_hash, date) sont stockées dans `AUDIT_METADATA_KV`.
- **Anti-fraude** : rate-limit applicatif 1 000 req/jour par wallet (one-shot), 100 000 req/jour par wallet (pack actif), 10 000 req/jour par JWT sponsor. Dépassement → 429 + event `api_response_4xx_sent`. Double-spend détecté via KV `pack:{wallet}:quota` décrémenté atomiquement.
- **Anti-vendor lock-in** : code Worker portable TypeScript (Deno/Bun/Node compatible). Aucune API Cloudflare-propriétaire hors KV + Analytics Engine. Migration vers autre runtime Workers-compatible (Deno Deploy, Fastly) estimée < 2 j si CF down.

---

## §9 — Risques techniques + mitigations

| # | Risque | Probabilité | Impact | Mitigation (1 ligne) |
|---|---|---|---|---|
| R1 | Coinbase x402 facilitator down > 24 h | Faible | Critique (100 % revenu) | Code Worker portable + plan B Stripe sponsor temporaire + V2 multi-facilitator |
| R2 | Source officielle (Anthropic/OpenAI) change format pricing page | Moyenne | Élevé (cron parse cassé) | Cron avec fallback parsing + alerte `quality_cron_stale_alert` > 8 h + monitoring manuel |
| R3 | CF KV quota dépassé (writes/jour) | Faible V1 | Modéré (cron fail) | Monitoring `CRON_STATE_KV` + upgrade CF Workers Paid automatique si > 800 writes/jour |
| R4 | Audit ROI sur-estimé (savings_pct < 15 % > 20 % cas) | Faible-moyenne | Modéré (crédibilité + refunds) | Garantie CGU Art. 4ter + seuil warning monthly_volume < 5M + révision heuristiques si > 20 % refunds |

---

## §10 — Handoff

**Handoff → @fullstack**
Lire dans l'ordre : `functional-specs.md` §1-§5 (architecture + contracts + KV + crons + env vars) → `x402-response-spec.md` (body 402 complet) → `agent-audit-spec.md` (5 heuristiques + algo détection) → `backlog.md` v2 (21 US, critères Given/When/Then). Priorité : F6 (cron) → F8 (middleware x402) → F1+F2 (endpoints data) → F1b (audit) → F8b (pack) → reste. Dérogation latence audit p95 320 ms validée.

**Handoff → @qa**
Gates à valider : GA-01 à GA-10 (§7). 32 gates G1-G32 (`_gates.md`) + 10 GP testeur-agent-ia (`v1-scope.md` § 7.3). Scénarios critiques : (a) agent full-flow llms.txt → 402 → pack x402 → call → 200 ; (b) audit flow POST → 402 → paiement → 200 score ; (c) refund flow éligible + inéligible ; (d) JWT expired sponsor. Input audit non persisté vérifiable via CF KV scan (aucune clé audit:input:* ne doit exister).

**Handoff → @ux**
3 parcours utilisateur à wireframer : (1) agent IA full-flow (llms.txt → 402 → pack → call) — pas d'écran mais scénario de simulation ; (2) sponsor humain top-up (landing → Stripe → dashboard `/dashboard`) ; (3) landing publique `/` (hero pricing JSON + hero audit JSON + CTAs). Contrainte : landing < 50 KB HTML. Checkbox L.221-28 13° visible sur landing avant CTA paiement.

**Handoff → @design**
Landing publique (`/`) : hero 1 = démo JSON payload pricing (12 modèles, `effective_cost_factor` mis en avant) ; hero 2 = démo audit score JSON (score + savings_pct + 3 recommandations) ; palette brand-platform v2 ; < 50 KB HTML compressé. Pages légales : texte uniquement, navigation sobre. Dashboard sponsor : minimaliste (quota restant, nb calls 24 h, wallet balance). OpenGraph + favicon SVG.

---

## Auto-évaluation gates (pré-livraison)

| Gate | Statut |
|---|---|
| G7 cohérence Phase 0 v2 (zéro contradiction ux/design/copy/qa) | PASS — specs issues des mêmes sources |
| G15 zéro placeholder | PASS — tous champs remplis ou N/A justifié |
| G17 spécifique DevRefs (pas générique) | PASS — 3 endpoints, 12 modèles, 5 heuristiques, x402 Coinbase nommés |
| G32 typo FR | PASS — relu, termes techniques en anglais conservés |
| GA-01→GA-10 définis | PASS — 10 gates fonctionnels binaires documentés |
| Pricing verbatim source unique | PASS — $0.001, $5, $10, $50, $9.99, $49 — source : agent-economics.md § C.1 + cgu-draft.md v2 Art. 4.1 |
| Garantie refund verbatim CGU | PASS — Art. 4ter repris verbatim (4 conditions cumulatives) |
| Input audit non-persistance documentée | PASS — §8 + §2.3 + CGU Art. 3.4 |

---

**Handoff → @orchestrator**
- Fichier produit : `/home/user/AI-agents-platform/docs/product/functional-specs.md`
- Décisions prises : architecture CF Workers + KV, 10 endpoints contractualisés, 6 namespaces KV définis, 5 crons spécifiés, 29 features tracées (§6), 10 gates GA-01→GA-10 binaires
- Points d'attention : dérogation latence audit p95 320 ms (à valider @data-analyst) ; CF KV free tier writes/jour à monitorer dès J7 ; garantie refund 50 % endpoint `/api/audit/refund` est un endpoint critique à tester en priorité Phase 3 ; immatriculation auto-entreprise bloquante avant 1ère transaction (cf. `v1-scope.md` § 5.2)
