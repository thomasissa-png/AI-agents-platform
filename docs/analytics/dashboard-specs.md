<!-- Version: 2026-05-05T11:30 — @data-analyst — Phase 0 wave 3 — Dashboard Specs DevRefs -->

# Dashboard Specs — DevRefs (F25 + F26)

## Résumé exécutif

- **Objectif** : maquette textuelle du dashboard interne consolidé F25 (admin Thomas) + dashboard utilisateur F26 (post-Stripe `/dashboard?token=JWT`).
- **Décisions clés** : (1) F25 = 1 page unique `/admin/dashboard` 4 zones (Revenue, Activation funnel B2A, Cohérence promesse↔réalité, Discovery). (2) F26 = page minimaliste 1 zone (queries 24h + coût + JWT countdown). (3) Refresh live (CF AE real-time) + agrégation quotidienne + alertes seuils. (4) Implémentation HTML statique + endpoint `/api/admin/metrics` qui agrège CF AE + Coinbase API + Stripe API. (5) Library minimal Chart.js (< 30 KB) ou SVG natif.
- **Dépendances** : `tracking-plan.md` (events sources), `kpi-framework.md` (KPIs affichés), `dev-decisions.md` (handoff @fullstack pour implémentation backend agg).

---

## 1. F25 — Dashboard interne consolidé (admin Thomas)

### 1.1 Vue globale

- **URL** : `/admin/dashboard`
- **Auth** : Basic auth `admin:$ADMIN_PASSWORD` OU Cloudflare Access (single-user MVP) — choix tranché par @infrastructure Phase 1, fallback Basic auth si CF Access indisponible free tier.
- **Format** : 1 page HTML statique (< 100 KB total avec Chart.js), 4 zones empilées verticalement, responsive mobile.
- **Refresh** : auto-refresh JS toutes les 60 secondes (live), agrégation cron quotidienne 00:00 UTC pour snapshots.
- **Backend** : endpoint Worker `/api/admin/metrics` qui agrège (a) CF AE via Workers SQL API, (b) Coinbase facilitator API, (c) Stripe API. Cache KV 60s pour éviter rate-limit.

### 1.2 Zone 1 — Revenue (top, prioritaire)

**Objectif** : KPI North Star visible en premier coup d'œil. Décision GO/NO-GO J7.

```
+--------------------------------------------------------------+
| ZONE 1 — REVENUE                                             |
+--------------------------------------------------------------+
|                                                              |
|   NORTH STAR : Revenu net mensuel cumulé                     |
|   ┌──────────────────────────────────────────┐               |
|   │   €  423 / 600 €  (M+4, 70 % cible)      │  [bar chart]  |
|   └──────────────────────────────────────────┘               |
|                                                              |
|   Décomposition :                                            |
|   • x402 (USDC → EUR cours du jour) : 198 € (47 %)          |
|   • Stripe (EUR direct)             : 225 € (53 %)          |
|                                                              |
|   Compteurs aujourd'hui :                                    |
|   • Paiements x402 today  : 7                                |
|   • Stripe Link clicks    : 12                               |
|   • JWT actifs (24h roll) : 4                                |
|                                                              |
|   Barres temporelles : [ J ] [ S ] [ M ]                     |
|                                                              |
|   ALERTE J7 (binaire) : ✓ ATTEINT                            |
|     5 paiements x402 cumulés à J6 / 5 cible                 |
|     (si NON ATTEINT à J7 → ROUGE, trigger pivot recommandé) |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- `payment_x402_completed` (CF AE) + Coinbase API pour fees
- `payment_stripe_checkout_completed` (CF AE) + Stripe API pour fees
- Calcul NSM : cf. kpi-framework § 1.2

**Alertes** :
- ROUGE J7 : 0-4 paiements x402 cumulés ET 0 JWT — déclencher pivot mot-clé recommandé (cf. v1-scope.md § 4.2)
- ORANGE M+1 : NSM < 50 € — investiguer activation
- ROUGE M+6 : NSM < 600 € — décision révision V2 ou pivot

**Charts** :
- Bar chart NSM cumulé (axe x : jours du mois courant, axe y : €)
- Donut chart décomposition x402 vs Stripe
- 3 KPI tiles compteurs jour

### 1.3 Zone 2 — Activation funnel B2A double

**Objectif** : visualiser le parcours complet agent IA + parcours humain. Identifier drop-off.

```
+--------------------------------------------------------------+
| ZONE 2 — ACTIVATION FUNNEL B2A                               |
+--------------------------------------------------------------+
|                                                              |
|   FUNNEL AGENT IA (7 étapes)                                 |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. crawl_bot_detected           : 487  ████████████ 100%   |
|   2. llms_txt_fetched             : 312  ████████      64%   |
|   3. endpoint_requested           : 198  █████         41%   |
|   4. response_402_received        : 198  █████         41%   |
|   5. payment_x402_attempted       :  31  █              6%   |
|   6. payment_x402_completed       :  28  █              6%   |
|   7. payload_consumed (200 OK)    :  28  █              6%   |
|                                                              |
|   FUNNEL HUMAIN (6 étapes)                                   |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. landing_page_view            : 142  ████████████ 100%   |
|   2. landing_scroll_50%           :  89  ███████       63%   |
|   3. landing_cta_stripe_clicked   :  18  ██            13%   |
|   4. stripe_checkout_completed    :   9  █              6%   |
|   5. jwt_issued                   :   9  █              6%   |
|   6. jwt_validated_first_time     :   8  █              5%   |
|                                                              |
|   TOP 5 User-Agent IA (UA-bucket, sans PII)                  |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. ai_bot/claude    : 187 (38 %)                           |
|   2. ai_bot/gpt       : 124 (25 %)                           |
|   3. ai_bot/perplexity:  87 (18 %)                           |
|   4. ai_bot/cursor    :  52 (11 %)                           |
|   5. ai_bot/agentkit  :  37  (8 %)                           |
|                                                              |
|   TOP 5 modèles consultés sur /api/llm-prices                |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. opus-4.7         : 89 (45 %)                            |
|   2. gpt-5            : 41 (21 %)                            |
|   3. sonnet-4.6       : 28 (14 %)                            |
|   4. gemini-2.5-pro   : 22 (11 %)                            |
|   5. mistral-large-3  : 18  (9 %)                            |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- Funnel agent IA : `crawl_*` + `api_request_received` + `api_response_402_sent` + `payment_x402_*` (CF AE)
- Funnel humain : `landing_page_view` + `landing_scroll_depth` + `landing_cta_stripe_clicked` + `payment_stripe_checkout_completed` + `payment_jwt_*` (CF AE)
- Top 5 UA : `api_request_received GROUP BY ua_bucket ORDER BY count DESC LIMIT 5`
- Top 5 modèles : `api_request_received WHERE path = '/api/llm-prices' GROUP BY model_param`

**Alertes** :
- ORANGE : ratio crawl→paiement < 5 % à M+1 (validation H1 en danger)
- ORANGE : ratio Stripe clic→checkout < 30 % (friction UX humaine)

**Charts** :
- Funnel chart vertical avec largeur de barres proportionnelles
- 2 horizontal bar charts (Top 5 UA + Top 5 modèles)

### 1.4 Zone 3 — Cohérence promesse↔réalité (renforcement #12 zéro fausse promesse)

**Objectif** : prouver en temps réel que la promesse landing (< 50 KB, < 200 ms, fraîcheur < 6h pricing) est tenue. ROUGE si dérive.

```
+--------------------------------------------------------------+
| ZONE 3 — COHÉRENCE PROMESSE↔RÉALITÉ                          |
+--------------------------------------------------------------+
|                                                              |
|   PAYLOAD SIZE par endpoint (cible : 100 % < 50 KB)          |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   /api/llm-prices  p50:  2.1 KB  p95:  3.4 KB  p99:  4.2 KB |
|   /api/sdk-status  p50:  1.8 KB  p95:  2.7 KB  p99:  3.5 KB |
|   ┌──────────────────────────────────────────┐               |
|   │   GAUGE  4.2 KB / 50 KB seuil   ✓ VERT    │              |
|   └──────────────────────────────────────────┘               |
|                                                              |
|   LATENCE par endpoint (cible : p95 < 200 ms)                |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   /api/llm-prices  p50:  47 ms  p95: 134 ms  p99: 198 ms    |
|   /api/sdk-status  p50:  52 ms  p95: 142 ms  p99: 211 ms    |
|   ┌──────────────────────────────────────────┐               |
|   │   GAUGE 211 ms / 200 ms seuil  ⚠ ORANGE   │              |
|   └──────────────────────────────────────────┘               |
|                                                              |
|   FRAÎCHEUR moyenne (= now - dateModified)                   |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   /api/llm-prices  : 3.2 h (cible < 6h)   ✓ VERT             |
|   /api/sdk-status  : 8.4 h (cible < 24h)  ✓ VERT             |
|                                                              |
|   CRON HEALTH                                                |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Dernier scrape réussi llm-prices : 2026-05-05 09:00 UTC    |
|   Prochain scrape llm-prices       : 2026-05-05 15:00 UTC    |
|   Dernier scrape réussi sdk-status : 2026-05-05 00:00 UTC    |
|   Prochain scrape sdk-status       : 2026-05-06 00:00 UTC    |
|   Dernière kv_cache_updated /llm   : 2026-05-05 09:00 UTC    |
|   Dernière kv_cache_updated /sdk   : 2026-05-05 00:00 UTC    |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- `quality_payload_size_measured` (CF AE PERCENTILE)
- `quality_latency_measured` (CF AE PERCENTILE)
- `quality_freshness_measured` (CF AE MEDIAN)
- `cron_*` events (CF AE last value GROUP BY cron_name)

**Alertes** :
- ROUGE : payload p99 > 50 KB sur 1h roll → promesse landing brisée, trigger investigation parser
- ORANGE : latence p95 > 200 ms sur 1h roll → diagnostic edge / KV cache miss
- ROUGE : freshness > seuil (6h pricing OU 24h SDK) → cron probable down, alerte email Thomas

**Charts** :
- 4 gauges (size + latency + 2 freshness) avec seuils colorés
- 2 timelines cron (last + next per cron)

### 1.5 Zone 4 — Discovery (acquisition organique)

**Objectif** : valider que les agents IA et humains TROUVENT DevRefs. Mesurer effort earned media.

```
+--------------------------------------------------------------+
| ZONE 4 — DISCOVERY                                           |
+--------------------------------------------------------------+
|                                                              |
|   SOURCES DE TRAFIC LANDING (humains)                        |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. devto    : 47 (33 %)                                    |
|   2. reddit   : 32 (23 %)                                    |
|   3. direct   : 28 (20 %)                                    |
|   4. hn       : 18 (13 %)                                    |
|   5. x        : 12  (8 %)                                    |
|   6. other    :  5  (3 %)                                    |
|                                                              |
|   CITATIONS LLM (Phase 4 par @geo — V1 manuel hebdo)         |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Perplexity      : 3 mentions / 30j  (target M+1 >= 5)      |
|   Claude          : 1 mention  / 30j                         |
|   ChatGPT         : 0 mention  / 30j                         |
|   Gemini          : 0 mention  / 30j                         |
|   (mesure manuelle V1, instrumentation Phase 4 @geo)         |
|                                                              |
|   CRAWLS BOTS DISTINCTS (UA-bucket, 7 jours)                 |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   ai_bot/claude     : 312                                    |
|   ai_bot/gpt        : 187                                    |
|   ai_bot/perplexity : 124                                    |
|   ai_bot/bingbot    :  87 (Bing crawler)                     |
|   ai_bot/googlebot  :  62 (Google crawler — pas IA pure)     |
|   ai_bot/cursor     :  52                                    |
|   ai_bot/agentkit   :  37                                    |
|   ai_bot/mcp        :  18                                    |
|   ai_bot/other      :  12                                    |
|                                                              |
|   ENDPOINTS DÉCOUVRABILITÉ                                   |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   llms.txt fetches      :  198 / 7j                          |
|   sitemap.xml fetches   :   87 / 7j                          |
|   openapi.json fetches  :   42 / 7j                          |
|   /about/data-sources   :   28 / 7j (signal d'intérêt)       |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- Sources trafic : `landing_page_view GROUP BY referrer_bucket`
- Citations LLM : input manuel Thomas via formulaire `/admin/citations` (V1) ou outil dédié V2
- Crawls bots : `crawl_* + api_request_received GROUP BY ua_bucket WHERE ua_bucket LIKE 'ai_bot/*'`
- Endpoints : `crawl_* GROUP BY event_type`

**Alertes** :
- ORANGE : 0 crawl bot IA reconnaissable sur 7j → diagnostic llms.txt / sitemap / GEO
- ORANGE : 0 nouvelle citation LLM à M+1 → push agressif Phase 4 @geo

**Charts** :
- Pie chart sources de trafic
- Stacked bar chart crawls bots par jour (7 derniers jours)
- 4 KPI tiles endpoints découvrabilité

---

## 2. F26 — Dashboard utilisateur `/dashboard?token=JWT` (post-Stripe humain)

### 2.1 Vue minimaliste

- **URL** : `/dashboard?token=JWT`
- **Auth** : JWT 24h en query param + cookie `Secure;HttpOnly;SameSite=Strict`
- **Format** : 1 page HTML statique < 30 KB, 1 zone, responsive mobile (US-12 + US-11 backlog).
- **Refresh** : pas d'auto-refresh, utilisateur recharge manuellement.
- **Backend** : endpoint Worker `/api/user/metrics?token=JWT` qui retourne queries cumulées + cost cumulé + JWT expiry.

```
+--------------------------------------------------------------+
| /dashboard                                                   |
+--------------------------------------------------------------+
|                                                              |
|   Bonjour, ton accès illimité est actif.                     |
|                                                              |
|   Queries effectuées (24h)  : 47                             |
|   Coût équivalent x402      : 23.03 € (économie : 18.04 €)  |
|   JWT expire dans           : 14 h 32 m                      |
|                                                              |
|   [ Bouton COPIER JWT ]                                      |
|                                                              |
|   Configurer ton agent :                                     |
|   ┌──────────────────────────────────────────────────────┐  |
|   │ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI... │  |
|   └──────────────────────────────────────────────────────┘  |
|                                                              |
|   Quand le JWT expire :                                      |
|   • Soit tu repaies 4,99 € via Stripe Link                  |
|   • Soit ton agent paie automatiquement chaque query 0,49 € |
|     en x402                                                  |
|                                                              |
|   [ Lien Stripe Link 4,99 €/jour ]                          |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- Queries cumulées : `payment_jwt_validated WHERE jwt_id = X`
- Coût équivalent x402 : `COUNT(payment_jwt_validated WHERE jwt_id = X) * 0.49`
- JWT expiry : décodage JWT `exp` claim

---

## 3. Refresh cadence et alertes

### 3.1 Cadence

| Cadence | Quoi | Comment |
|---|---|---|
| **Live (60s)** | F25 auto-refresh JS fetch `/api/admin/metrics` | setInterval JS minimal |
| **Quotidienne 00:00 UTC** | Snapshot KV `metrics:nsm:YYYY-MM-DD` + email Thomas si seuils | Cloudflare Cron Trigger |
| **Mensuelle 1er du mois 06:00 UTC** | Email récap NSM mois précédent | Cloudflare Cron Trigger |

### 3.2 Alertes (email Thomas via Mailchannels gratuit ou Resend free tier)

| Sévérité | Condition | Canal |
|---|---|---|
| ROUGE | NSM J7 = 0 paiement x402 ET 0 JWT | Email immédiat + flag dashboard |
| ROUGE | Cron scrape failed > 2 fois consécutives | Email immédiat |
| ROUGE | payload_size p99 > 50 KB sur 1h | Email + flag dashboard |
| ROUGE | freshness > seuil (6h pricing / 24h SDK) | Email + flag dashboard |
| ORANGE | NSM M+1 < 50 € | Flag dashboard, pas d'email (digest hebdo) |
| ORANGE | latence p95 > 200 ms sur 1h roll | Flag dashboard |
| ORANGE | ratio crawl→paiement < 5 % à M+1 | Flag dashboard + recommandation diagnostic |

### 3.3 Anti-pattern (alertes interdites)

- Pas d'alerte sur metrics qui ne déclenchent pas d'action (cf. data-analyst.md "un dashboard sans actions est un poster").
- Pas de notification Slack en V1 (dépendance externe + budget).
- Pas de SMS (vendor + budget).

---

## 4. Implémentation technique (specs pour @fullstack — handoff dev-decisions.md)

### 4.1 Stack

- **Backend** : Cloudflare Worker `/api/admin/metrics` + `/api/user/metrics` (zéro framework, fetch natif).
- **Frontend** : HTML statique servie par Cloudflare Pages, JS vanilla < 5 KB pour fetch + auto-refresh, Chart.js < 30 KB CDN si besoin (sinon SVG natif).
- **Aggregation** : query SQL CF Workers Analytics Engine + appels Coinbase API + Stripe API. Cache KV 60s pour éviter rate-limit.
- **Auth** : Basic auth `admin:$ADMIN_PASSWORD` (env var) en Phase 1, migration Cloudflare Access si besoin Phase 4.

### 4.2 Composants UI (réutilisables)

- **Bar chart** : Chart.js bar OR SVG `<rect>` natif (préférence SVG pour < 50 KB total).
- **Donut chart** : Chart.js doughnut OR SVG `<path>` natif.
- **Gauge** : SVG `<circle>` avec stroke-dasharray (pas Chart.js, trop lourd pour gauge).
- **KPI tile** : div HTML simple `<div class="kpi-tile"><span class="value">X</span><span class="label">Y</span></div>`.
- **Funnel chart** : div empilées avec largeur proportionnelle (CSS `width: %`).

### 4.3 Performances

- Page `/admin/dashboard` : LCP < 1s, total < 100 KB.
- Page `/dashboard?token=JWT` : LCP < 500 ms, total < 30 KB.
- Endpoint `/api/admin/metrics` : latence < 500 ms p95 (caché 60s).
- Endpoint `/api/user/metrics` : latence < 200 ms p95.

### 4.4 Sécurité

- F25 admin : Basic auth ou CF Access. Pas d'exposition publique.
- F26 user : JWT validation HMAC stricte. 401 immédiat si JWT invalide ou expiré (US-12 backlog).
- Pas de PII dans aucun endpoint (cf. § 5 kpi-framework).
- Headers : `X-Robots-Tag: noindex` sur `/admin/dashboard` et `/dashboard?token=*`.

---

## 5. Mapping zones ↔ KPIs (vérification couverture)

| Zone F25 | KPIs kpi-framework couverts |
|---|---|
| Zone 1 Revenue | § 1 NSM + § 2.4 Revenue (brut + net + ARPU + % x402/Stripe) |
| Zone 2 Activation | § 2.2 Activation funnel + § 2.6 validation persona (Top 5 UA) |
| Zone 3 Cohérence | § 3.1 cohérence promesse↔réalité (size + latence + fraîcheur + cron health) |
| Zone 4 Discovery | § 2.1 Acquisition + § 2.5 Referral citations LLM |

100 % des KPIs du framework sont visualisés dans >= 1 zone du F25. Aucun KPI orphelin.

---

## 6. Synthèse

| Élément | Décision |
|---|---|
| **F25 admin** | 1 page `/admin/dashboard`, 4 zones, < 100 KB, auto-refresh 60s |
| **F26 user** | 1 page `/dashboard?token=JWT`, 1 zone, < 30 KB, refresh manuel |
| **Auth F25** | Basic auth ou Cloudflare Access |
| **Auth F26** | JWT HMAC 24h |
| **Refresh** | Live 60s + cron quotidien snapshot + cron mensuel récap |
| **Alertes** | ROUGE email immédiat, ORANGE flag dashboard digest hebdo |
| **Charts** | SVG natif privilégié, Chart.js < 30 KB en backup |
| **Outils REJETÉS** | Slack notifications V1, SMS, dashboards SaaS payants |

---

## Handoff @data-analyst → @fullstack (via dev-decisions.md)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/analytics/dashboard-specs.md`
- **Décisions prises** : F25 4 zones, F26 minimaliste, stack 0 € HTML statique + CF Worker + Chart.js, refresh live + alertes seuils.
- **Points d'attention pour @fullstack (cf. dev-decisions.md)** :
  - Endpoint `/api/admin/metrics` doit agréger CF AE SQL + Coinbase API + Stripe API avec cache KV 60s.
  - Endpoint `/api/user/metrics?token=JWT` doit valider JWT HMAC strict.
  - Charts SVG natif privilégié (zéro dépendance lourde, cohérent < 50 KB landing).
  - Alertes email via Mailchannels (gratuit Cloudflare) ou Resend free tier — flag dans dev-decisions.md.
