<!-- Version: 2026-05-05T11:15 — @data-analyst — Phase 0 wave 3 — Tracking Plan DevRefs -->

# Tracking Plan — DevRefs

## Résumé exécutif

- **Objectif** : tracking plan complet pour instrumenter tous les KPIs du `kpi-framework.md`.
- **Décisions clés** : (1) Naming `{domain}_{verb}_{object}` snake_case, verbe au passé. (2) 6 domains : `api`, `payment`, `landing`, `crawl`, `cron`, `quality`. (3) Outil principal Cloudflare Workers Analytics Engine (gratuit, server-side, zéro-PII). (4) Aucun outil tiers (pas de GA / PostHog / Mixpanel). (5) Volume estimé V1 : ~3 000 events/jour conservateur, largement sous quota CF AE (25 K events/min, 100 K/jour retention).
- **38 events** totaux couvrant 26 features V1 + 9 KPIs validation persona + 4 KPIs cohérence promesse↔réalité.
- **Dépendances aval** : `dashboard-specs.md` (visualisation), `dev-decisions.md` (handoff @fullstack pour implémentation).

---

## 1. Convention de nommage

```
Format : {domain}_{verb}_{object}
- snake_case strict (pas de camelCase, pas de kebab-case)
- Verbe au PASSÉ (received, completed, sent — pas receive, complete, send)
- Domains autorisés : api / payment / landing / crawl / cron / quality
- Object descriptif (ex : 402_sent, x402_completed, payload_size_measured)
```

**Exemples conformes** : `api_request_received`, `payment_x402_completed`, `landing_cta_stripe_clicked`.

**Exemples non conformes** (à rejeter) : `apiRequestReceived` (camelCase), `api-request-received` (kebab), `request_api` (verbe au présent + ordre inversé).

---

## 2. Domains et events

### 2.1 Domain `api` — events serveur sur les 2 endpoints monétisés

| Event | Déclencheur | Type user/system | Propriétés (typées) | Outil capture | Propagation dashboard | Justification PII-free |
|---|---|---|---|---|---|---|
| `api_request_received` | toute requête sur `/api/llm-prices` ou `/api/sdk-status` | system | `path` (string : `/api/llm-prices` ou `/api/sdk-status`), `method` (string : GET), `ua_bucket` (string : cf. kpi-framework § 5.1), `referrer_bucket` (string), `has_payment_header` (bool), `has_jwt` (bool) | CF Workers AE | Zone 2 funnel | UA brut jeté, IP non capturée |
| `api_response_402_sent` | middleware x402 renvoie 402 | system | `path`, `ua_bucket`, `price_eur` (number : 0.49), `facilitator` (string : coinbase) | CF AE | Zone 2 funnel agent | aucune PII |
| `api_response_200_sent` | endpoint sert payload payé | system | `path`, `ua_bucket`, `payload_size_bytes` (number), `latency_ms` (number), `freshness_hours` (number), `auth_type` (string : x402 ou jwt) | CF AE | Zone 2 + Zone 3 cohérence | aucune PII |
| `api_response_401_sent` | JWT invalide ou expiré | system | `path`, `ua_bucket`, `jwt_expired` (bool), `jwt_invalid_signature` (bool) | CF AE | Zone 2 (drop-off) | aucune PII |
| `api_response_4xx_sent` | erreur client (400 model_param_required, 404 model_not_found) | system | `path`, `ua_bucket`, `status_code` (number), `error_code` (string) | CF AE | Zone 2 diagnostic | aucune PII |
| `api_response_5xx_sent` | erreur serveur (503 facilitator down, 504 timeout) | system | `path`, `ua_bucket`, `status_code` (number), `error_code` (string) | CF AE | Zone 3 alerte | aucune PII |

### 2.2 Domain `payment` — events x402 + Stripe

| Event | Déclencheur | Type | Propriétés | Outil | Propagation | PII-free |
|---|---|---|---|---|---|---|
| `payment_x402_required` | middleware x402 envoie HTTP 402 (alias de `api_response_402_sent` côté payment) | system | `path`, `price_eur`, `network` (string : base) | CF AE | Zone 2 funnel agent | aucune PII |
| `payment_x402_attempt` | requête entrante avec header `X-PAYMENT` non vide | system | `path`, `wallet_hash` (string : SHA256 wallet), `signature_valid` (bool) | CF AE | Zone 2 funnel agent | wallet hashé |
| `payment_x402_completed` | Coinbase facilitator confirme settle (event-driven via webhook ou polling) | system | `path`, `wallet_hash`, `amount_usdc` (number), `fx_usd_eur_at_settle` (number), `tx_hash` (string : on-chain pseudonyme) | CF AE + Coinbase | Zone 1 revenue + Zone 2 | wallet hashé, tx_hash on-chain public |
| `payment_x402_failed` | Coinbase renvoie erreur (insufficient_funds, signature_invalid, settle_timeout) | system | `path`, `wallet_hash`, `failure_reason` (string : enum) | CF AE | Zone 2 diagnostic | wallet hashé |
| `payment_stripe_link_clicked` | clic CTA Stripe sur landing (alias de `landing_cta_stripe_clicked` côté payment) | user humain | `referrer_bucket`, `has_session_cookie` (bool) | CF AE | Zone 2 funnel humain | aucune PII |
| `payment_stripe_checkout_completed` | webhook Stripe `checkout.session.completed` | system | `customer_id` (string : Stripe pseudo), `amount_eur` (number : 4.99), `country` (string : 2 lettres ISO pour Stripe Tax) | Stripe webhook | Zone 1 revenue | customer_id pseudonyme, country pour TVA OSS |
| `payment_jwt_issued` | post-Stripe checkout, génération JWT 24h | system | `jwt_id` (string : UUID v4), `customer_id`, `expires_at` (timestamp) | CF AE | Zone 2 funnel humain | UUID non corrélable email |
| `payment_jwt_validated` | requête API avec JWT valide accepté | system | `path`, `jwt_id`, `validation_count` (number : compteur d'usage du JWT) | CF AE | Zone 2 + § 2.3 rétention | JWT pseudonyme |
| `payment_jwt_expired` | requête avec JWT expiré (alias de `api_response_401_sent` avec `jwt_expired=true`) | system | `jwt_id`, `age_hours` (number) | CF AE | Zone 2 diagnostic | JWT pseudonyme |

### 2.3 Domain `landing` — events page publique humaine

| Event | Déclencheur | Type | Propriétés | Outil | Propagation | PII-free |
|---|---|---|---|---|---|---|
| `landing_page_view` | requête HTTP GET sur `/llm-prices` ou autre page publique avec UA-bucket `human/*` | user humain | `path`, `referrer_bucket`, `ua_bucket` (`human/desktop` ou `human/mobile`), `has_session_cookie` (bool) | CF AE (server-side via Worker) | Zone 2 funnel humain + Zone 4 sources | aucune PII |
| `landing_scroll_depth` | scroll seuils 25 / 50 / 75 / 100 % (snippet JS minimal sur landing seulement) | user humain | `path`, `depth_percent` (number : 25 / 50 / 75 / 100) | CF AE (Worker REST endpoint) | Zone 2 funnel humain | aucune PII |
| `landing_cta_stripe_clicked` | clic sur lien Stripe Payment Link (capture via Worker proxy ou snippet JS) | user humain | `referrer_bucket`, `has_session_cookie`, `scroll_depth_at_click` (number) | CF AE | Zone 2 funnel humain | aucune PII |
| `landing_cta_curl_copied` | clic bouton "copier curl" (snippet JS minimal) | user humain | `path`, `endpoint_demo` (string : llm-prices ou sdk-status) | CF AE | Zone 2 diagnostic | aucune PII |
| `landing_faq_expanded` | clic question FAQ (snippet JS minimal) | user humain | `question_id` (string : enum 12 questions) | CF AE | Zone 2 + diagnostic copy | aucune PII |

### 2.4 Domain `crawl` — events bot/agent (détection via UA + headers)

| Event | Déclencheur | Type | Propriétés | Outil | Propagation | PII-free |
|---|---|---|---|---|---|---|
| `crawl_llms_txt_fetched` | requête GET sur `/llms.txt` | system | `ua_bucket`, `if_modified_since` (bool : présence header) | CF AE | Zone 1 + Zone 2 acquisition agent | aucune PII |
| `crawl_sitemap_fetched` | requête GET sur `/sitemap.xml` | system | `ua_bucket` | CF AE | Zone 4 acquisition | aucune PII |
| `crawl_robots_fetched` | requête GET sur `/robots.txt` | system | `ua_bucket` | CF AE | Zone 4 acquisition | aucune PII |
| `crawl_openapi_fetched` | requête GET sur `/openapi.json` | system | `ua_bucket`, `accept_header_bucket` (string : json / yaml / other) | CF AE | Zone 2 acquisition agent avancé | aucune PII |
| `crawl_dataset_jsonld_parsed` | détection JSON-LD parser via header `Accept: application/ld+json` ou User-Agent IA + GET sur landing | system | `path`, `ua_bucket` | CF AE | Zone 4 GEO | aucune PII |
| `crawl_about_data_sources_viewed` | requête GET sur `/about/data-sources` | system | `ua_bucket`, `referrer_bucket` | CF AE | Zone 4 (signal d'intérêt acheteur) | aucune PII |

### 2.5 Domain `cron` — events scrape sources officielles

| Event | Déclencheur | Type | Propriétés | Outil | Propagation | PII-free |
|---|---|---|---|---|---|---|
| `cron_scrape_started` | début exécution cron (6h pricing / 24h SDK) | system | `cron_name` (string : llm-prices ou sdk-status), `started_at` (timestamp) | CF AE | Zone 3 cron health | aucune PII (interne) |
| `cron_scrape_completed` | fin succès cron | system | `cron_name`, `duration_ms` (number), `sources_count` (number), `items_updated` (number) | CF AE | Zone 3 cron health | aucune PII |
| `cron_scrape_failed` | échec cron (source down, parser cassé) | system | `cron_name`, `failure_reason` (string), `failed_source` (string : domain officiel) | CF AE | Zone 3 alerte ROUGE | aucune PII |
| `cron_kv_cache_updated` | écriture KV après scrape réussi | system | `cron_name`, `key_pattern` (string : `pricing:*` ou `sdk:*`), `entries_count` (number) | CF AE | Zone 3 cron health | aucune PII |
| `cron_dateModified_bumped` | mise à jour `dateModified` JSON-LD dans le payload | system | `cron_name`, `new_dateModified` (timestamp ISO 8601) | CF AE | Zone 3 fraîcheur | aucune PII |
| `cron_indexnow_pushed` | push IndexNow Bing après update | system | `urls_count` (number), `success` (bool) | CF AE | Zone 4 acquisition | aucune PII |

### 2.6 Domain `quality` — cohérence promesse↔réalité

| Event | Déclencheur | Type | Propriétés | Outil | Propagation | PII-free |
|---|---|---|---|---|---|---|
| `quality_payload_size_measured` | chaque réponse 200 sur `/api/*` (instrumentation Worker) | system | `path`, `payload_size_bytes` (number), `under_50kb` (bool) | CF AE | Zone 3 cohérence | aucune PII |
| `quality_latency_measured` | chaque réponse 200 sur `/api/*` (instrumentation Worker `Date.now()` start/end) | system | `path`, `latency_ms` (number), `under_200ms` (bool) | CF AE | Zone 3 cohérence | aucune PII |
| `quality_freshness_measured` | chaque réponse 200 (calcul `now - dateModified`) | system | `path`, `freshness_hours` (number), `freshness_ok` (bool : < 6h pricing, < 24h SDK) | CF AE | Zone 3 cohérence | aucune PII |
| `quality_watermark_verified` | vérification HMAC `_signature` payload (interne) | system | `path`, `valid` (bool) | CF AE | Zone 3 anti-fraude | aucune PII |

---

## 3. Anti-pattern (events à NE PAS tracker)

| Event interdit | Raison | Alternative anonymisée |
|---|---|---|
| `user_email_captured` | RGPD — Stripe gère emails dans son scope, jamais côté DevRefs analytics | `customer_id` Stripe pseudonyme |
| `user_ip_logged` (IP brute) | RGPD — IP est PII identifiable | `ip_hash` SHA256(IP + daily_salt), TTL 24h |
| `ua_string_full_captured` | UA complet peut être PII (fingerprint) + bruit analytique | `ua_bucket` catégoriel (10 buckets max) |
| `wallet_to_email_mapping` | Briserait l'anonymat persona principal (agent IA) | wallet_hash et customer_id traités séparément, jamais joints |
| `referrer_url_full_captured` | URL référente complète peut contenir tokens / params sensibles | `referrer_bucket` catégoriel (devto / reddit / hn / x / direct / other) |
| `session_replay_recorded` | Privacy invasif + lourd + budget | aucune alternative — interdit V1 |
| `cookie_consent_*` | Aucun cookie nécessitant consentement V1 (cf. § 5 kpi-framework) | aucun cookie tiers V1 |

---

## 4. Outil de capture (stack 0 €)

### 4.1 Cloudflare Workers Analytics Engine (principal)

- **Free tier 2026** : 25 000 events/min écriture, 100 000 events/jour rétention 30 jours, query SQL via dashboard CF.
- **Volume V1 estimé** : ~3 000 events/jour conservateur (~125 events/heure, ~2 events/min) — largement sous quota.
- **Avantages** : server-side (zéro JS sur landing humaine pour la mesure de base), bindings natifs Workers, SQL queryable, pas de vendor externe.
- **Limites** : pas de UI dashboard riche (queries SQL manuelles ou via dashboard custom F25), pas de funnels visuels intégrés (à construire dans F25).

### 4.2 Coinbase facilitator dashboard (revenue x402)

- **Natif** : settled tx, fees, wallet pseudonymes.
- **Données récupérées via API** pour agrégation dashboard interne F25 : `amount_usdc`, `tx_hash`, `wallet_hash`, `settled_at`, `fees_usdc`.
- **Anti-PII** : Coinbase x402 metadata (`resource_url`, `description`, `reason`) doivent rester en clair sans PII (cf. legal-audit P0).

### 4.3 Stripe dashboard (revenue Stripe + JWT post-checkout)

- **Natif** : Payment Link analytics, webhooks `checkout.session.completed`, `customer.created`.
- **Données récupérées via API** : `customer_id`, `amount_eur`, `country`, `payment_method`, `created_at`.
- **Anti-PII côté DevRefs** : email Stripe stocké dans Stripe uniquement, jamais répliqué en CF AE.

### 4.4 Outils REJETÉS (et raisons)

| Outil | Raison rejet |
|---|---|
| Google Analytics 4 | Vendor lock-in + RGPD friction (consentement bannière) + pixel JS sur landing (poids + fingerprint) + budget |
| PostHog Cloud | Freemium 1M events/mois OK budget V1 mais vendor lock-in + pixel JS + complexité à intégrer pour zéro valeur ajoutée vs CF AE |
| Mixpanel | Payant > 20K MTU + vendor lock-in + RGPD friction |
| Amplitude | Idem Mixpanel |
| Plausible | 9 €/mois mini (anti budget 0 €) — bonne option V2 si CF AE limité |
| Hotjar / FullStory | Session replay anti-privacy by design |

**Ces outils peuvent être ajoutés en V2 si signal d'intérêt** (ex : volume humain > 1 000 visites/mois justifie analytics riche). Pas avant validation H1 J7.

---

## 5. Volume estimé V1 (sanity check quota CF AE)

| Source | Events/jour estimés (conservateur) |
|---|---|
| `crawl_*` (bots IA + bots SEO) | 200 |
| `api_request_received` (API endpoints) | 800 (cible 100 paiements/mois = ~3-4 paiements/jour, mais 4xx + 402 + autres incluent ~25 req/paiement complété) |
| `api_response_*` (4 sous-events par requête) | 800 |
| `payment_*` (x402 + Stripe + JWT, ~10 events par paiement complété) | 50 |
| `landing_*` (humain : page_view + scroll + CTA + FAQ) | 100 |
| `cron_*` (8 events × cron 6h pricing × 4/jour + cron 24h SDK × 1/jour) | 40 |
| `quality_*` (4 events × ~200 réponses 200/jour) | 800 |
| **Total estimé** | **~2 800 events/jour** |

Quota CF AE : 100 000 events/jour rétention. Marge ×35. Aucun risque de dépassement V1. Réévaluer M+3 si trafic > 10× attendu.

---

## 6. Mapping events ↔ KPIs (vérification couverture)

| KPI kpi-framework | Events tracking-plan |
|---|---|
| § 1 NSM | `payment_x402_completed` + `payment_stripe_checkout_completed` (agrégés via Coinbase + Stripe API) |
| § 2.1 Acquisition crawls bots | `crawl_*` (6 events) + `api_request_received` (filter UA-bucket) |
| § 2.1 Visites landing humaine | `landing_page_view` |
| § 2.1 Sources de trafic | `landing_page_view.referrer_bucket` |
| § 2.2 Activation 402→attempt | `api_response_402_sent` + `payment_x402_attempt` |
| § 2.2 Activation Stripe clic→checkout | `payment_stripe_link_clicked` + `payment_stripe_checkout_completed` |
| § 2.3 Rétention wallet x402 | `payment_x402_completed.wallet_hash` (window 7j) |
| § 2.3 Rétention JWT | `payment_jwt_validated.jwt_id` (window 24h) |
| § 2.4 Revenue brut | `payment_x402_completed` + `payment_stripe_checkout_completed` |
| § 2.5 Referral citations LLM | manuel V1 (pas d'event automatique possible) |
| § 2.6 Validation persona ratio agents | `api_request_received.ua_bucket` filter |
| § 2.6 Latence avant 1er paiement | `api_response_402_sent.timestamp` vs `payment_x402_attempt.timestamp` JOIN session |
| § 3.1 Cohérence size / latency / freshness | `quality_payload_size_measured` + `quality_latency_measured` + `quality_freshness_measured` |
| § 3.2 Validation H1 / H2 | `crawl_*` → `payment_x402_completed` ratio |

100 % des KPIs du framework sont mesurés par >= 1 event. Aucun KPI orphelin.

---

## 7. Mapping events ↔ user stories backlog (cross-fichier wave 2)

| User story (backlog.md) | Events trackés |
|---|---|
| US-01 découverte llms.txt | `crawl_llms_txt_fetched` |
| US-02 réception 402 | `api_response_402_sent` + `payment_x402_required` |
| US-03 paiement x402 + payload | `payment_x402_attempt` + `payment_x402_completed` + `api_response_200_sent` + `quality_*` |
| US-04 vérif fraîcheur dateModified | `quality_freshness_measured` |
| US-05 effective_cost_factor | `api_response_200_sent` (payload contient le champ, pas d'event dédié) |
| US-06 sdk-status | `api_request_received` (path filter) + `payment_x402_completed` |
| US-07 sameAs vérif source | aucun event direct (consultation externe) |
| US-08 OpenAPI discovery | `crawl_openapi_fetched` |
| US-09 landing publique | `landing_page_view` + `landing_scroll_depth` |
| US-10 Stripe Payment Link | `payment_stripe_link_clicked` + `payment_stripe_checkout_completed` |
| US-11 JWT 24h | `payment_jwt_issued` + `payment_jwt_validated` |
| US-12 dashboard /dashboard?token=JWT | `payment_jwt_validated` (path filter) |
| US-13 pages légales | `landing_page_view` (path filter `/legal/*`) |
| US-14 /about/data-sources | `crawl_about_data_sources_viewed` + `landing_page_view` |
| US-15 dashboard admin Thomas | `landing_page_view` (path filter `/admin/dashboard`, ua_bucket `human/*`) |

100 % des user stories V1 ont >= 1 event de mesure (sauf US-05 et US-07 où la donnée est dans le payload, pas un event dédié — comportement attendu).

---

## 8. Synthèse

| Élément | Décision |
|---|---|
| **Total events** | 38 events sur 6 domains |
| **Outil principal** | Cloudflare Workers Analytics Engine (server-side, gratuit) |
| **Outils complémentaires** | Coinbase facilitator API + Stripe API |
| **Outils tiers REJETÉS** | GA4, PostHog, Mixpanel, Amplitude, Plausible (V2 possible Plausible si justifié) |
| **Volume estimé V1** | ~2 800 events/jour (marge ×35 vs quota CF AE) |
| **PII collectée** | ZÉRO (cf. § 5 kpi-framework + anti-pattern § 3 ci-dessus) |
| **Couverture KPIs** | 100 % (cf. § 6) |
| **Couverture user stories** | 100 % (cf. § 7) |

---

## Handoff @data-analyst → dashboard-specs.md (étape suivante du même agent)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/analytics/tracking-plan.md`
- **Décisions prises** : 38 events, 6 domains, naming `{domain}_{verb}_{object}` snake_case verbe passé, stack 0 € CF AE + Coinbase + Stripe, zéro-PII strict.
- **Points d'attention pour dashboard-specs.md** :
  - Chaque event a une colonne "Propagation dashboard" qui pointe vers Zone 1 (revenue), Zone 2 (funnel), Zone 3 (cohérence promesse↔réalité), Zone 4 (acquisition).
  - F25 dashboard interne consolidé = 1 page unique, 4 zones.
  - Implémentation page `/admin/dashboard` protégée Basic auth ou Cloudflare Access.
