<!-- Version: 2026-05-05T17:15 — @data-analyst — Phase 0 v2 wave 3 — Tracking Plan DevRefs v2 (pivot B2A pure — audit + pack) -->

# Tracking Plan — DevRefs v2

## Résumé exécutif

- **Pivot v2 2026-05-05** : refonte des 38 events v1 → 50 events v2. Ajout domain `audit` (6 events nouveaux) + events `pack_*` (4 nouveaux) + events `sponsor_*` (2 nouveaux). Retrait/archivage 3 events Stripe humain pilier. Events conservés v1 adaptés aux 3 endpoints (au lieu de 2).
- **Décisions clés** : (1) Naming `{domain}_{verb}_{object}` snake_case verbe au passé — conservé v1. (2) 7 domains v2 : `api`, `payment`, `audit`, `pack`, `sponsor`, `landing`, `crawl`, `cron`, `quality`. (3) Outil unique CF Workers Analytics Engine server-side — zéro outil tiers. (4) Volume estimé v2 : ~3 200-3 500 events/jour avec audit + pack — sous quota CF AE 100 K/jour. (5) Privacy by design strict : aucun contenu audit input/output dans CF AE, aucun email, aucune IP brute, aucun UA complet.
- **50 events totaux v2** : 33 conservés/adaptés v1 + 12 nouveaux (audit 6 + pack 4 + sponsor 2) — 3 retirés (Stripe humain pilier archivés).
- **Dépendances aval** : `dashboard-specs.md` v2 (visualisation), `dev-decisions.md` v2 (handoff @fullstack).

---

## 1. Convention de nommage (inchangée v1)

```
Format : {domain}_{verb}_{object}
- snake_case strict (pas de camelCase, pas de kebab-case)
- Verbe au PASSÉ (received, completed, sent, purchased, triggered — pas receive, complete, send)
- Domains autorisés v2 : api / payment / audit / pack / sponsor / landing / crawl / cron / quality
- Object descriptif et spécifique à l'action
```

**Exemples conformes v2** : `audit_request_received`, `pack_purchased`, `sponsor_topup_stripe_completed`, `pack_quota_exhausted`.

**Exemples non conformes** (à rejeter) : `auditRequest` (camelCase), `pack-purchased` (kebab), `purchase_pack` (ordre inversé).

---

## 2. Events par domain

### 2.1 Domain `api` — requêtes sur les 3 endpoints monétisés

**Changement v2** : propriété `path` accepte maintenant `/api/agent-audit` en plus des 2 endpoints v1.

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `api_request_received` | Toute requête sur `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit` | `path` (string : enum 3 values), `method` (string : GET ou POST), `ua_bucket` (string : 11 buckets), `referrer_bucket` (string), `has_payment_header` (bool), `has_pack_token` (bool) | CF AE | UA brut jeté, IP non capturée |
| `api_response_402_sent` | Middleware x402 renvoie 402 sur les 3 endpoints | `path`, `ua_bucket`, `price_usdc` (number : 0.001 ou 9.99 selon endpoint), `facilitator` (string : coinbase), `offer_type` (string : one-shot ou pack ou audit) | CF AE | Aucune PII |
| `api_response_200_sent` | Endpoint sert payload payé (pricing / SDK / audit) | `path`, `ua_bucket`, `payload_size_bytes` (number), `latency_ms` (number), `freshness_hours` (number), `auth_type` (string : x402_oneshot ou x402_pack ou x402_audit) | CF AE | Aucune PII |
| `api_response_401_sent` | JWT invalide ou pack token expiré/épuisé | `path`, `ua_bucket`, `reason` (string : jwt_expired / jwt_invalid / pack_exhausted / pack_expired) | CF AE | Aucune PII |
| `api_response_4xx_sent` | Erreur client (400, 404, 422) | `path`, `ua_bucket`, `status_code` (number), `error_code` (string) | CF AE | Aucune PII |
| `api_response_5xx_sent` | Erreur serveur (503 facilitator down, 504 timeout) | `path`, `ua_bucket`, `status_code` (number), `error_code` (string) | CF AE + Mailchannels alerte | Aucune PII |

### 2.2 Domain `payment` — events x402 one-shot (pricing + SDK)

**Changement v2** : events Stripe humain pilier (`payment_stripe_link_clicked`, `payment_stripe_checkout_completed`, `payment_jwt_issued`, `payment_jwt_validated`, `payment_jwt_expired`) archivés ou reclassés en `sponsor_*`. Events x402 conservés.

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `payment_x402_required` | Middleware x402 envoie HTTP 402 (alias `api_response_402_sent` côté paiement) | `path`, `price_usdc` (number), `network` (string : base) | CF AE | Aucune PII |
| `payment_x402_attempt` | Requête entrante avec header `X-PAYMENT` non vide, AVANT validation Coinbase | `path`, `wallet_hash` (string : SHA256 wallet), `signature_valid` (bool), `offer_type` (string : one-shot) | CF AE | Wallet hashé |
| `payment_x402_completed` | Coinbase facilitator confirme settle (webhook ou polling) | `path`, `wallet_hash`, `amount_usdc` (number), `fx_usd_eur_at_settle` (number), `tx_hash` (string : on-chain pseudonyme), `offer_type` (string : one-shot) | CF AE + Coinbase | Wallet hashé, tx_hash pseudonyme on-chain |
| `payment_x402_failed` | Coinbase renvoie erreur | `path`, `wallet_hash`, `failure_reason` (string : enum : insufficient_funds / signature_invalid / settle_timeout) | CF AE | Wallet hashé |

**Events archivés v1 → v2** (retirés, non utilisés en B2A pure) :
- `payment_stripe_link_clicked` → archivé (Stripe humain pilier banni). Remplacement : `landing_cta_clicked` générique.
- `payment_stripe_checkout_completed` → archivé. Le Stripe sponsor est dans domain `sponsor_*`.
- `payment_jwt_issued` / `payment_jwt_validated` / `payment_jwt_expired` → archivés (JWT Stripe humain 24h banni). Si JWT sponsor top-up introduit V2, rebaptiser `sponsor_jwt_*`.

### 2.3 Domain `audit` — endpoint `/api/agent-audit` (NOUVEAU v2)

**6 events nouveaux couvrant le parcours complet agent IA → audit livré.**

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `audit_request_received` | POST `/api/agent-audit` reçu (avant auth) | `ua_bucket`, `input_size_bytes` (number), `has_payment_header` (bool) | CF AE | Zéro contenu input loggé — uniquement méta-données |
| `audit_402_served` | Middleware x402 renvoie 402 sur `/api/agent-audit` | `ua_bucket`, `price_usdc` (number : 9.99 one-shot ou 8.17 Pack Pro), `offer_type` (string : one-shot ou pack_pro) | CF AE | Aucune PII |
| `audit_paid_x402` | Coinbase confirme settle pour `/api/agent-audit` | `wallet_hash`, `amount_usdc` (number), `tx_hash`, `offer_type` (string : one-shot ou pack_pro), `pack_audits_remaining` (number : null si one-shot) | CF AE + Coinbase | Wallet hashé, zéro contenu audit |
| `audit_delivered` | Output JSON audit renvoyé 200 au client | `wallet_hash`, `latency_ms` (number), `score_0_100` (number), `savings_pct` (number), `auto_applicable_count` (number), `watermark_hmac_valid` (bool) | CF AE | Agrégats numériques uniquement — zéro contenu recommandations |
| `audit_savings_realized` | Déclaratif : agent re-appelle après audit avec header `X-Audit-ID` (signal d'usage suivi) | `audit_id` (string : pseudonyme UUID v4, non corrélable wallet), `savings_pct_claimed` (number), `days_since_audit` (number) | CF AE | UUID pseudonyme — aucun lien wallet |
| `audit_refund_triggered` | Sponsor soumet demande refund via `/api/audit/refund` (savings_pct < 15 % prouvé à 30j) | `audit_id` (string : UUID v4), `savings_pct_actual` (number), `refund_amount_usdc` (number : 50 % du prix audit) | CF AE | UUID pseudonyme, montant agrégé |

**Règle privacy audit** : le contenu de `agent_config` et `sample_traces` (input JSON) n'est JAMAIS stocké dans CF AE. Seuls les méta-données agrégées de l'output (score, savings_pct, latency_ms) sont loggées. Validation @legal session 3.

### 2.4 Domain `pack` — gestion quota pré-payé KV (NOUVEAU v2)

**4 events couvrant le cycle de vie d'un pack : achat → usage → épuisement/expiration.**

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `pack_purchased` | Coinbase confirme settle pour pack (1 signature x402 unique) | `wallet_hash`, `pack_type` (string : discovery_5 / standard_10 / pro_50 / audit_pro_49), `quota_total` (number : 5000 / 10000 / 60000 / 6), `amount_usdc` (number), `tx_hash`, `expires_at` (timestamp : null si pas de TTL temporel) | CF AE + Coinbase | Wallet hashé |
| `pack_quota_consumed` | Chaque appel API autorisé via lookup KV pack (décrémente `remaining`) | `wallet_hash`, `pack_type`, `quota_remaining` (number), `path` (string : endpoint consommé), `quota_pct_used` (number) | CF AE | Wallet hashé — event fréquent, peut être échantillonné 1/10 |
| `pack_quota_exhausted` | `remaining` atteint 0 (dernière requête autorisée) | `wallet_hash`, `pack_type`, `quota_total` (number), `calls_made_total` (number), `days_active` (number : jours depuis achat) | CF AE | Wallet hashé |
| `pack_expired` | TTL temporel atteint (si implémenté V2) OU trigger manuel Thomas | `wallet_hash`, `pack_type`, `remaining_quota` (number), `remaining_quota_pct` (number), `reason` (string : ttl_expired / admin_revoked) | CF AE | Wallet hashé |

**Note architecture** : `pack_quota_consumed` peut générer un volume élevé (jusqu'à 10 000 events/pack acheté si l'agent consomme chaque call). Stratégie d'échantillonnage recommandée : logguer 1 event tous les 100 calls (1 % sampling rate) + logguer systématiquement aux seuils 25 %, 50 %, 75 %, 100 %. Cf. dev-decisions.md v2 § Implémentation pricing pack.

### 2.5 Domain `sponsor` — top-up wallet Stripe (NOUVEAU v2, marginal)

**2 events couvrant le top-up Stripe sponsor (rampe onboarding crypto, pas revenu direct).**

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `sponsor_topup_stripe_initiated` | Clic CTA Stripe top-up sur landing (snippet JS → Worker) ou agent déclenche top-up UI | `referrer_bucket`, `topup_amount_eur` (number : 5 / 10 / 50), `ua_bucket` | CF AE | Aucune PII — pas de customer_id capturé avant completion |
| `sponsor_topup_stripe_completed` | Webhook Stripe `checkout.session.completed` pour top-up sponsor | `customer_id` (string : Stripe pseudonyme), `amount_eur` (number), `country` (string : ISO 2 lettres pour TVA OSS), `topup_amount_usdc_estimate` (number : montant USDC équivalent après conversion) | Stripe webhook → CF AE | Customer_id pseudonyme Stripe — email dans Stripe scope uniquement |

**Rappel v2** : le top-up Stripe sponsor ne génère aucun revenu direct pour DevRefs (l'agent paie DevRefs ensuite en x402). Ces events mesurent le funnel onboarding, pas le revenu.

### 2.6 Domain `landing` — page publique (adapté v2)

**Changement v2** : CTA Stripe Link humain retiré → CTA générique `landing_cta_clicked` avec `cta_type` enum.

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `landing_page_view` | GET sur `/`, `/llm-prices`, ou autre page publique avec ua_bucket `human/*` | `path`, `referrer_bucket`, `ua_bucket` (`human/desktop` ou `human/mobile`), `has_session_cookie` (bool) | CF AE server-side | Aucune PII |
| `landing_scroll_depth` | Scroll seuils 25 / 50 / 75 / 100 % (snippet JS minimal) | `path`, `depth_percent` (number : 25 / 50 / 75 / 100) | CF AE (Worker REST) | Aucune PII |
| `landing_cta_clicked` | Clic sur tout CTA de la landing (remplace `landing_cta_stripe_clicked` v1) | `cta_type` (string : curl_demo / audit_try / pack_buy / sponsor_topup / docs), `referrer_bucket`, `scroll_depth_at_click` (number) | CF AE | Aucune PII |
| `landing_cta_curl_copied` | Clic bouton « copier curl » (snippet JS) | `path`, `endpoint_demo` (string : llm-prices / sdk-status / agent-audit) | CF AE | Aucune PII |
| `landing_faq_expanded` | Clic question FAQ (snippet JS) | `question_id` (string : enum ≤ 15 questions) | CF AE | Aucune PII |

### 2.7 Domain `crawl` — bots et agents IA (inchangé v1, adapté 3 endpoints)

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `crawl_llms_txt_fetched` | GET `/llms.txt` (3 endpoints listés v2) | `ua_bucket`, `if_modified_since` (bool) | CF AE | Aucune PII |
| `crawl_sitemap_fetched` | GET `/sitemap.xml` | `ua_bucket` | CF AE | Aucune PII |
| `crawl_robots_fetched` | GET `/robots.txt` | `ua_bucket` | CF AE | Aucune PII |
| `crawl_openapi_fetched` | GET `/openapi.json` | `ua_bucket`, `accept_header_bucket` (string : json / yaml / other) | CF AE | Aucune PII |
| `crawl_dataset_jsonld_parsed` | Header `Accept: application/ld+json` OU UA bot IA + GET landing | `path`, `ua_bucket` | CF AE | Aucune PII |
| `crawl_about_data_sources_viewed` | GET `/about/data-sources` | `ua_bucket`, `referrer_bucket` | CF AE | Aucune PII |

### 2.8 Domain `cron` — scrape sources officielles (adapté v2 : 3 crons)

**Changement v2** : 3e cron pour heuristiques audit (< 1h refresh) en plus des 2 crons v1.

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `cron_scrape_started` | Début exécution cron | `cron_name` (string : llm-prices / sdk-status / audit-heuristics), `started_at` (timestamp) | CF AE | Interne |
| `cron_scrape_completed` | Fin succès cron | `cron_name`, `duration_ms` (number), `sources_count` (number), `items_updated` (number) | CF AE | Interne |
| `cron_scrape_failed` | Échec cron (source down, parser cassé) | `cron_name`, `failure_reason` (string), `failed_source` (string : domain officiel) | CF AE + Mailchannels alerte | Interne |
| `cron_kv_cache_updated` | Écriture KV après scrape réussi | `cron_name`, `key_pattern` (string), `entries_count` (number) | CF AE | Interne |
| `cron_dateModified_bumped` | Mise à jour `dateModified` JSON-LD | `cron_name`, `new_dateModified` (timestamp ISO 8601) | CF AE | Interne |
| `cron_indexnow_pushed` | Push IndexNow Bing après update | `urls_count` (number), `success` (bool) | CF AE | Interne |

### 2.9 Domain `quality` — cohérence promesse↔réalité (adapté v2 : 3 endpoints)

| Event | Déclencheur | Propriétés (typées) | Outil | PII-free |
|---|---|---|---|---|
| `quality_payload_size_measured` | Chaque réponse 200 sur `/api/*` | `path`, `payload_size_bytes` (number), `under_50kb` (bool) | CF AE | Aucune PII |
| `quality_latency_measured` | Chaque réponse 200 sur `/api/*` | `path`, `latency_ms` (number), `under_200ms` (bool) | CF AE | Aucune PII |
| `quality_freshness_measured` | Chaque réponse 200 — calcul `now - dateModified` | `path`, `freshness_hours` (number), `freshness_ok` (bool : < 6h pricing / < 24h SDK / < 1h audit heuristiques) | CF AE | Aucune PII |
| `quality_watermark_verified` | Vérification HMAC `_signature` payload | `path`, `valid` (bool) | CF AE | Aucune PII |

---

## 3. Delta v1 → v2 (récapitulatif)

### Events ajoutés (12 nouveaux)

| Event ajouté | Domain | Justification |
|---|---|---|
| `audit_request_received` | audit | F1c — endpoint `/api/agent-audit` |
| `audit_402_served` | audit | F1c — funnel 402 audit |
| `audit_paid_x402` | audit | F1c — paiement x402 audit |
| `audit_delivered` | audit | F1c — livraison audit |
| `audit_savings_realized` | audit | H9 — validation ROI 30-50 % |
| `audit_refund_triggered` | audit | CGV — garantie refund < 15 % savings |
| `pack_purchased` | pack | F8b — pack pré-payé KV |
| `pack_quota_consumed` | pack | F8b — quota décrémenté |
| `pack_quota_exhausted` | pack | F8b — quota épuisé |
| `pack_expired` | pack | F8b — expiration pack |
| `sponsor_topup_stripe_initiated` | sponsor | US-10b — top-up wallet |
| `sponsor_topup_stripe_completed` | sponsor | US-10b — top-up wallet confirmé |

### Events retirés / archivés (3 supprimés)

| Event retiré | Raison | Remplacement |
|---|---|---|
| `payment_stripe_link_clicked` | Stripe humain pilier banni v2 | `landing_cta_clicked` avec `cta_type=sponsor_topup` |
| `payment_stripe_checkout_completed` | Stripe humain pilier banni v2 | `sponsor_topup_stripe_completed` |
| `payment_jwt_issued` / `payment_jwt_validated` / `payment_jwt_expired` | JWT Stripe humain 24h banni | Archivés — à réintroduire si JWT sponsor V2 |

**Compte net** : 38 events v1 + 12 nouveaux - 3 retirés + 2 events JWT archivés = **47 events actifs v2** (+ 3 archivés).

### Events adaptés (sans renommage)

- `api_request_received` : `path` accepte `/api/agent-audit` + `has_pack_token` bool ajouté
- `api_response_402_sent` : `price_usdc` remplace `price_eur` + `offer_type` ajouté
- `api_response_200_sent` : `auth_type` enrichi (x402_pack / x402_audit)
- `api_response_401_sent` : `reason` enrichi (pack_exhausted / pack_expired)
- `landing_cta_stripe_clicked` → renommé `landing_cta_clicked` + `cta_type` enum
- `cron_scrape_*` : `cron_name` accepte `audit-heuristics` en plus des 2 crons v1
- `quality_freshness_measured` : `freshness_ok` seuil audit < 1h en plus de pricing/SDK

---

## 4. Anti-pattern (events à NE PAS tracker)

| Event interdit | Raison | Alternative anonymisée |
|---|---|---|
| `audit_input_logged` (contenu JSON input audit) | Privacy — config agent + sample traces peuvent contenir des secrets (API keys, prompts propriétaires) | Zéro contenu input dans CF AE — uniquement `input_size_bytes` |
| `audit_output_logged` (recommandations complètes) | Privacy + valeur — le contenu audit est le produit payé, pas une donnée analytique | `score_0_100`, `savings_pct`, `auto_applicable_count` agrégés |
| `user_email_captured` | RGPD — Stripe gère emails dans son scope | `customer_id` Stripe pseudonyme |
| `user_ip_logged` (IP brute) | RGPD — IP est PII | `ip_hash` SHA256(IP + daily_salt) TTL 24h |
| `ua_string_full_captured` | UA complet peut être PII (fingerprint) | `ua_bucket` catégoriel (11 buckets max) |
| `wallet_to_email_mapping` | Briserait anonymat persona principal | wallet_hash et customer_id traités séparément |
| `pack_wallet_to_sponsor_mapping` | Nouveau v2 — ne pas relier wallet agent à compte sponsor humain | Traités séparément dans CF AE |
| `session_replay_recorded` | Privacy invasif | Interdit V1 |

---

## 5. Outil de capture (stack 0 €, inchangé v1)

### 5.1 Cloudflare Workers Analytics Engine (principal)

- **Free tier 2026** : 25 000 events/min écriture, 100 000 events/jour rétention 30 jours, SQL queryable.
- **Volume v2 estimé** :

| Source | Events/jour estimés |
|---|---|
| `crawl_*` (bots IA + SEO) | 200 |
| `api_request_received` + `api_response_*` (3 endpoints) | 1 200 (+50 % v1 pour 3e endpoint) |
| `payment_x402_*` (~10 events/paiement, ~3 paiements/jour) | 30 |
| `audit_*` (~6 events/audit, ~2 audits/jour) | 12 |
| `pack_*` (~4 events + échantillonnage quota_consumed) | 50 |
| `sponsor_*` (marginal) | 5 |
| `landing_*` (humain) | 100 |
| `cron_*` (3 crons × 6-8 events, audit 1h = 24/jour) | 300 (+260 v1 pour cron audit hourly) |
| `quality_*` (4 events × ~400 réponses 200/jour) | 1 600 (+50 % v1) |
| **Total estimé v2** | **~3 500 events/jour** |

**Marge quota CF AE** : 3 500 / 100 000 = 3,5 % utilisé. Marge ×28. Aucun risque V1.

### 5.2 Coinbase facilitator API (revenue x402 + pack + audit)

- Données récupérées : `amount_usdc`, `tx_hash`, `wallet_hash`, `settled_at`, `fees_usdc`.
- Anti-PII : metadata x402 (`resource_url`, `description`) sans PII.

### 5.3 CF KV (quota pack — state store, pas event stream)

- **Pack quota** : `pack:{wallet_hash}:remaining` (number), `pack:{wallet_hash}:expires_at` (timestamp ISO 8601 ou null), `pack:{wallet_hash}:pack_type` (string).
- **Lecture** : endpoint dédié `/api/pack/quota` (voir dev-decisions.md v2 § réponse question ouverte).
- **CF AE n'est PAS un state store** : le quota restant en temps réel est dans KV, pas dans CF AE. CF AE reçoit uniquement les events discrets (pack_purchased, pack_quota_exhausted, pack_expired).

### 5.4 Outils REJETÉS (inchangés v1)

| Outil | Raison rejet |
|---|---|
| Google Analytics 4 | RGPD friction + pixel JS + vendor lock-in |
| PostHog Cloud | Pixel JS + vendor lock-in |
| Mixpanel | Payant + RGPD friction |
| Amplitude | Idem Mixpanel |
| Plausible | 9 €/mois anti-budget 0 € |
| Hotjar / FullStory | Session replay anti-privacy |

---

## 6. Mapping events ↔ user stories backlog v2 (gate G7)

| User Story | Events associés |
|---|---|
| US-01 (découvrir via llms.txt) | `crawl_llms_txt_fetched` |
| US-02 (payer llm-prices one-shot) | `api_response_402_sent`, `payment_x402_attempt`, `payment_x402_completed`, `api_response_200_sent` |
| US-03 (payload fraîcheur pricing) | `quality_freshness_measured`, `cron_dateModified_bumped` |
| US-04 (dateModified machine-readable) | `quality_freshness_measured`, `crawl_dataset_jsonld_parsed` |
| US-05 (effective_cost_factor) | `api_response_200_sent` (payload field) |
| US-06 (sdk-status) | `api_response_402_sent`, `payment_x402_completed`, `api_response_200_sent` |
| US-07 (breaking_since detection) | `api_response_200_sent` (payload field `breaking_since`) |
| US-08 (quota pack KV lookup) | `api_response_200_sent` (auth_type=x402_pack), `pack_quota_consumed` |
| US-08b (pack pré-payé F8b) | `pack_purchased`, `pack_quota_consumed`, `pack_quota_exhausted`, `pack_expired` |
| US-09 (sponsor top-up) | `sponsor_topup_stripe_initiated`, `sponsor_topup_stripe_completed` |
| US-10b (top-up USDC wallet) | `sponsor_topup_stripe_completed`, `payment_x402_attempt` (post-top-up) |
| US-11 (llms.txt découvrable) | `crawl_llms_txt_fetched` |
| US-12 (openapi.json structuré) | `crawl_openapi_fetched` |
| US-13 (IndexNow push) | `cron_indexnow_pushed` |
| US-14 (JSON-LD dataset) | `crawl_dataset_jsonld_parsed` |
| US-15 (monitoring admin F25) | Tous events `quality_*` + `payment_*` + `pack_*` + `audit_*` (dashboard agrégé) |
| US-16 (agent envoie config audit) | `audit_request_received`, `audit_402_served` |
| US-17 (agent paie audit x402) | `audit_paid_x402` |
| US-18 (audit livré JSON structuré) | `audit_delivered` |
| US-19 (savings_pct mesurés) | `audit_savings_realized`, `audit_refund_triggered` |
| US-20 (garantie refund) | `audit_refund_triggered` |

**Vérification G7** : 21 user stories backlog v2 mappées — chacune a >= 1 event tracking associé. Couverture 100 %.

---

## 7. Mapping events ↔ KPIs kpi-framework.md v2

| KPI kpi-framework v2 | Events tracking-plan v2 |
|---|---|
| § 1 NSM revenu net x402 | `payment_x402_completed`, `pack_purchased`, `audit_paid_x402` (agrégés via Coinbase API) |
| § 2.1 Acquisition crawls bots | `crawl_*` (6 events) |
| § 2.1 Sponsor top-up | `sponsor_topup_stripe_completed` |
| § 2.2 Funnel agent IA pricing/SDK | `api_response_402_sent`, `payment_x402_attempt`, `payment_x402_completed` |
| § 2.2 Funnel agent IA audit | `audit_402_served`, `audit_paid_x402`, `audit_delivered` |
| § 2.2 Funnel sponsor | `sponsor_topup_stripe_initiated`, `sponsor_topup_stripe_completed` |
| § 2.3 Rétention wallet x402 | `payment_x402_completed.wallet_hash` (window 7j) |
| § 2.3 Pack rechargé | `pack_purchased` (wallet_hash récurrent) |
| § 3.1 Cohérence promesse | `quality_payload_size_measured`, `quality_latency_measured`, `quality_freshness_measured` |
| § 3.2 Pack consumption rate | `pack_quota_consumed`, `pack_quota_exhausted`, `pack_expired` |
| § 3.3 Audit savings_pct | `audit_delivered.savings_pct`, `audit_savings_realized`, `audit_refund_triggered` |
| § 3.4 Validation H9, H10 | `audit_delivered.savings_pct`, COUNT(`payment_x402_completed` + `pack_purchased` + `audit_paid_x402`) |
| § 3.5 Ratio UA bots | `api_request_received.ua_bucket` |
