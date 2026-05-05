<!-- Version: 2026-05-05T17:30 — @data-analyst — Phase 0 v2 wave 3 — Dashboard Specs DevRefs v2 (pivot B2A pure, 4 zones recadrées, F26 sponsor) -->

# Dashboard Specs — DevRefs v2 (F25 + F26)

## Résumé exécutif

- **Pivot v2 2026-05-05** : F25 admin recadré sur 4 zones B2A pure — Zone 1 Revenue x402 (split pack/audit/subscription V2) + Zone 2 Activation funnel agent IA (pricing + audit) + Zone 3 Cohérence promesse↔réalité (3 endpoints, savings_pct audit, refund triggers) + Zone 4 Discovery. Zone humain Stripe Link retirée. F26 recadré pour sponsor wallet (ETH/USDC balance, pack quota restant, audit history) — plus dashboard abonné Stripe humain.
- **Décisions clés** : (1) F25 = `/admin/dashboard` 4 zones, refresh live 60s + cron quotidien + alertes ROUGE Mailchannels. (2) F26 = `/dashboard?token=JWT` minimaliste sponsor (ETH balance + pack quota + audit history). (3) Stack 100 % gratuite : CF AE + Coinbase facilitator + Stripe dashboard + CF KV pour snapshots. (4) Backend : endpoint Worker `/api/admin/metrics` agrège CF AE SQL + Coinbase API + Stripe API. (5) Zéro Chart.js externe si SVG natif suffisant — sinon Chart.js < 30 KB.
- **Dépendances** : `tracking-plan.md` v2 (events sources), `kpi-framework.md` v2 (KPIs affichés), `dev-decisions.md` v2 (handoff @fullstack backend agg).

---

## 1. F25 — Dashboard admin consolidé (`/admin/dashboard`)

### 1.1 Vue globale

- **URL** : `/admin/dashboard`
- **Auth** : Basic auth `admin:$ADMIN_PASSWORD` (CF Access single-user si disponible free tier — décision @infrastructure Phase 1).
- **Format** : 1 page HTML (< 100 KB total), 4 zones empilées verticalement, responsive mobile.
- **Refresh** : auto-refresh JS toutes les 60 secondes via `/api/admin/metrics` (cache KV 60s Worker).
- **Backend** : endpoint Worker `/api/admin/metrics` qui agrège (a) CF AE via Workers SQL API, (b) Coinbase facilitator API, (c) Stripe API (top-up marginal). Cache KV 60s.
- **Alertes** : Mailchannels email Thomas immédiat sur seuil ROUGE franchi (hook Worker `if (metric > threshold) { sendMailchannels() }`).

---

### 1.2 Zone 1 — Revenue x402 (North Star visible en 1er coup d'œil)

**Objectif** : décision GO/NO-GO J7 à 5 secondes de chargement. KPI North Star en héros.

```
+--------------------------------------------------------------+
| ZONE 1 — REVENUE x402                                        |
+--------------------------------------------------------------+
|                                                              |
|   NORTH STAR : Revenu net mensuel cumulé (EUR)               |
|   ┌──────────────────────────────────────────┐               |
|   │   €  423 / 600 €  (M+4, 70 % cible)      │  [bar chart]  |
|   └──────────────────────────────────────────┘               |
|                                                              |
|   Décomposition par offre (NOUVEAU v2) :                     |
|   • Packs pré-payés (Pack Std $10 + Pro $50) : 241 € (57 %) |
|   • Audits one-shot ($9.99 + Pack Pro $49)   : 172 € (41 %) |
|   • Sponsor top-up Stripe (marginal)         :  10 €  (2 %) |
|                                                              |
|   Compteurs aujourd'hui :                                    |
|   • Paiements x402 today (packs + audits) : 7               |
|   • Pack Standard vendus MTD              : 22               |
|   • Audits vendus MTD                     : 18               |
|   • Sponsor top-ups MTD                   : 3 (marginal)     |
|                                                              |
|   Barres temporelles : [ Jour ] [ Semaine ] [ Mois ]         |
|                                                              |
|   ALERTE J7 (binaire) : ✓ ATTEINT                            |
|     1 paiement x402 agent IA autonome confirmé J5            |
|     (si NON ATTEINT à J7 → ROUGE + email Thomas immédiat)   |
|                                                              |
|   Trigger pivot audit-only (source pricing-strategy § 4.3):  |
|     Audit = 41 % revenu — sous seuil 70 % (surveiller M+3)  |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- `pack_purchased` (CF AE) + Coinbase API pour fees pack
- `audit_paid_x402` (CF AE) + Coinbase API pour fees audit
- `sponsor_topup_stripe_completed` (CF AE) + Stripe API pour fees top-up
- Calcul NSM : cf. kpi-framework.md v2 § 1.2

**Alertes Zone 1** :
- ROUGE J7 : 0 paiement x402 agent IA à J7 → email Thomas « Test E1 J7 négatif — diagnostiquer H1 ».
- ROUGE M+1 : NSM < 50 € → investiguer activation (funnel Zone 2).
- ROUGE M+6 : NSM < 600 € → révision V2 ou pivot.
- ORANGE : % revenu audit > 70 % à M+3-M+6 → déclencher trigger pivot audit-only (pricing-strategy § 4.3).

**Charts** :
- Bar chart NSM cumulé mois courant (axe x = jours, axe y = €, ligne cible 600 €/mois).
- Donut chart 3 segments : packs / audits / sponsor top-up.
- 4 KPI tiles compteurs : paiements today / packs MTD / audits MTD / top-ups MTD.

---

### 1.3 Zone 2 — Activation funnel B2A (agent IA — pricing + audit)

**Objectif** : visualiser les 2 parcours agent IA (pricing/SDK et audit). Identifier drop-offs. Funnel humain sponsor secondaire.

```
+--------------------------------------------------------------+
| ZONE 2 — ACTIVATION FUNNEL B2A                               |
+--------------------------------------------------------------+
|                                                              |
|   FUNNEL AGENT IA — PRICING + SDK (étapes)                   |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. crawl_bot_detected              : 487  ████████ 100%    |
|   2. llms_txt_fetched                : 312  ██████    64%    |
|   3. endpoint_pricing_requested      : 198  ████      41%    |
|   4. api_response_402_sent           : 198  ████      41%    |
|   5. payment_x402_attempt            :  31  █          6%    |
|   6. payment_x402_completed (1-shot) :  22  █          5%    |
|      OU pack_purchased               :   9  █          2%    |
|   7. payload_consumed (200 OK)       :  31  █          6%    |
|                                                              |
|   FUNNEL AGENT IA — AUDIT (étapes)                           |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. audit_request_received          :  42  ████████ 100%    |
|   2. audit_402_served                :  42  ████████ 100%    |
|   3. audit_paid_x402                 :   8  ██        19%    |
|   4. audit_delivered                 :   8  ██        19%    |
|      dont savings_pct >= 15 %        :   7  ██        88%    |
|                                                              |
|   FUNNEL SPONSOR WALLET (top-up, secondaire)                 |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. landing_page_view               : 142  ████████ 100%    |
|   2. landing_scroll_50%              :  89  ██████    63%    |
|   3. landing_cta_clicked (topup)     :  14  ██        10%    |
|   4. sponsor_topup_stripe_completed  :   5  █          4%    |
|                                                              |
|   TOP 5 User-Agent IA (UA-bucket, sans PII)                  |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   1. ai_bot/claude    : 187 (38 %)                           |
|   2. ai_bot/gpt       : 124 (25 %)                           |
|   3. ai_bot/perplexity:  87 (18 %)                           |
|   4. ai_bot/cursor    :  52 (11 %)                           |
|   5. ai_bot/agentkit  :  37  (8 %)                           |
|                                                              |
|   Pack vs one-shot vs audit (répartition paiements)          |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   • Packs pré-payés : 22 (59 %)                              |
|   • Audits one-shot : 13 (35 %)                              |
|   • x402 one-call   :  2  (6 %)                              |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- Funnel pricing : `crawl_*` + `api_request_received` + `api_response_402_sent` + `payment_x402_*` + `pack_purchased`
- Funnel audit : `audit_request_received` + `audit_402_served` + `audit_paid_x402` + `audit_delivered`
- Funnel sponsor : `landing_page_view` + `landing_scroll_depth` + `landing_cta_clicked` + `sponsor_topup_stripe_completed`
- Top 5 UA : `api_request_received GROUP BY ua_bucket ORDER BY count DESC LIMIT 5`
- Mix offres : COUNT par type payment event

**Alertes Zone 2** :
- ORANGE : ratio crawl→paiement pricing < 3 % à M+1 (H1 activation en danger).
- ORANGE : ratio audit_paid/audit_402 < 5 % à M+1 (audit non converti).
- ROUGE : audit_delivered / audit_paid < 95 % (bug livraison audit).
- ORANGE : sponsor top-up complété / initié < 30 % (friction onboarding wallet).

**Charts** :
- 2 funnel charts verticaux côte à côte (pricing vs audit).
- 1 funnel chart sponsor (compact, secondaire).
- Horizontal bar chart Top 5 UA-bucket.
- Donut chart mix offres (packs / audits / one-shot).

---

### 1.4 Zone 3 — Cohérence promesse↔réalité (3 endpoints + audit savings)

**Objectif** : prouver en temps réel que la promesse landing est tenue sur les 3 endpoints. Surveiller la garantie refund audit.

```
+--------------------------------------------------------------+
| ZONE 3 — COHÉRENCE PROMESSE↔RÉALITÉ                          |
+--------------------------------------------------------------+
|                                                              |
|   PAYLOAD SIZE par endpoint (cible : p99 < 50 KB)            |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   /api/llm-prices  p50:  2.1 KB  p95:  3.4 KB  p99:  4.2 KB |
|   /api/sdk-status  p50:  1.8 KB  p95:  2.7 KB  p99:  3.5 KB |
|   /api/agent-audit p50:  3.2 KB  p95:  4.8 KB  p99:  6.1 KB |
|                            GLOBAL p99:  6.1 KB ✓ VERT        |
|                                                              |
|   LATENCE par endpoint (cible : p95 < 200 ms)                |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   /api/llm-prices   p50:  47 ms  p95: 134 ms ✓               |
|   /api/sdk-status   p50:  52 ms  p95: 142 ms ✓               |
|   /api/agent-audit  p50: 380 ms  p95: 890 ms ✓ (< 2 000 ms) |
|                                                              |
|   FRAÎCHEUR par cron (alertes si dépassement seuil)          |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   LLM Prices  (cron 6h)  : dernière màj il y a  2h 14m ✓    |
|   SDK Status  (cron 24h) : dernière màj il y a  8h 52m ✓    |
|   Audit heuristiques (< 1h) : dernière màj il y a  0h 22m ✓ |
|                                                              |
|   AUDIT — DISTRIBUTION SAVINGS_PCT (NOUVEAU v2)              |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   • savings_pct >= 30 %  : 12 audits (67 %) ✓               |
|   • savings_pct 15-30 %  :  3 audits (17 %) ✓               |
|   • savings_pct 0-15 %   :  3 audits (17 %) ⚠ ORANGE        |
|     dont refund triggered :  1 audit  (6 %) ✓ (< 20 %)      |
|   Médian savings_pct      :  28 %  ✓ (cible >= 25 %)        |
|                                                              |
|   CRON SANTÉ                                                 |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Dernier cron_scrape_completed pricing : ✓ succès 2h 14m    |
|   Dernier cron_scrape_completed SDK     : ✓ succès 8h 52m    |
|   Dernier cron heuristiques             : ✓ succès 0h 22m    |
|   cron_scrape_failed today              :  0 ✓               |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- `quality_payload_size_measured` + `quality_latency_measured` (CF AE, percentiles SQL)
- `quality_freshness_measured` + `cron_dateModified_bumped` (CF AE)
- `audit_delivered.savings_pct` + `audit_refund_triggered` (CF AE)
- `cron_scrape_completed` / `cron_scrape_failed` (CF AE)

**Alertes Zone 3** :
- ROUGE : p99 payload > 50 KB → email Thomas « Promesse size brisée — investiguer endpoint ».
- ORANGE : p95 latence pricing/SDK > 200 ms → investiguer CF Worker performance.
- ROUGE : fraîcheur pricing > 12 h → « cron_scrape_failed détecté ou source officielle down ».
- ROUGE : fraîcheur SDK > 36 h → même alerte.
- ROUGE : % audits savings < 15 % > 20 % → « H9 invalidée — révision heuristiques urgente ».
- ROUGE : médian savings_pct < 15 % → « Exposition refund garantie élevée ».

**Charts** :
- 3 tableaux percentiles par endpoint (p50/p95/p99 size + latence).
- Gauge dial fraîcheur par cron (vert / orange / rouge).
- Histogram distribution savings_pct (buckets : 0-15 / 15-30 / 30-50 / 50+ %).
- Compteur refund triggered MTD avec seuil ROUGE.

---

### 1.5 Zone 4 — Discovery (sources trafic agent + humain)

**Objectif** : suivre les canaux d'acquisition B2A et humain. Citations LLM manuelles.

```
+--------------------------------------------------------------+
| ZONE 4 — DISCOVERY (ACQUISITION)                             |
+--------------------------------------------------------------+
|                                                              |
|   SOURCES TRAFIC LANDING HUMAIN                              |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   devto    : 87 vues (61 %)  [post « Claude agent pays $10»] |
|   reddit   : 32 vues (22 %)                                  |
|   hn       : 12 vues  (8 %)                                  |
|   direct   :  8 vues  (6 %)                                  |
|   other    :  4 vues  (3 %)                                  |
|                                                              |
|   CITATIONS LLM (manuel hebdo — horodatées)                  |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Perplexity   : 3 citations (dernière: 2026-05-03)          |
|   Claude.ai    : 1 citation  (dernière: 2026-04-29)          |
|   ChatGPT      : 0 citation                                  |
|   [+ Ajouter citation] [Export CSV]                          |
|                                                              |
|   AGENTS IA WALLETS UNIQUES PAYANTS                          |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Wallets uniques lifetime : 28                              |
|   Nouveaux wallets ce mois : 12                              |
|   Wallets récurrents (>= 2 paiements en 7j) : 4             |
|                                                              |
|   GEO — SIGNAUX CRAWL IA                                     |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   crawl_dataset_jsonld_parsed (signal LLM) : 14 today        |
|   crawl_llms_txt_fetched                   : 47 today        |
|   crawl_openapi_fetched (agent avancé)     : 8 today         |
|                                                              |
|   POSTS DEV.TO / REDDIT PUBLIÉS                              |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   [Table manuelle : date / titre / url / vues / conversions]  |
|   [+ Ajouter post] [Export CSV]                              |
|                                                              |
+--------------------------------------------------------------+
```

**Sources data** :
- `landing_page_view.referrer_bucket` GROUP BY (CF AE)
- `crawl_llms_txt_fetched` + `crawl_dataset_jsonld_parsed` + `crawl_openapi_fetched` (CF AE)
- `payment_x402_completed.wallet_hash` DISTINCT (CF AE)
- Citations LLM : saisie manuelle Thomas (table KV `discovery:citations:*`)
- Posts Dev.to / Reddit : saisie manuelle Thomas (table KV `discovery:posts:*`)

**Alertes Zone 4** :
- ORANGE : 0 nouveau wallet unique sur 7 jours glissants → acquisition agent stagnante.
- ORANGE : 0 crawl `llms_txt_fetched` depuis 48h → investiguer disponibilité `/llms.txt`.

---

## 2. F26 — Dashboard sponsor wallet (`/dashboard?token=JWT`)

### 2.1 Vue globale

- **URL** : `/dashboard?token=JWT` (JWT signé HMAC à la confirmation top-up Stripe sponsor)
- **Auth** : JWT signature HMAC validation Worker — zéro session cookie additionnel.
- **Format** : 1 page HTML minimaliste (< 30 KB), responsive mobile. Pas de Charts complexes.
- **Refresh** : polling 30s pour balance + quota restant (donnée live KV).
- **Backend** : endpoint Worker `/api/pack/quota?wallet_hash={hash}` (lecture directe KV — voir dev-decisions.md v2 § réponse question ouverte quota).

**Changement v2** : F26 v1 ciblait le dev humain abonné Stripe (JWT 24h, queries restantes, coût cumulé). F26 v2 cible le **sponsor wallet** (top-up USDC Base, pack quota restant, audit history de son agent).

### 2.2 Maquette F26

```
+--------------------------------------------------------------+
| DevRefs — Tableau de bord sponsor                            |
+--------------------------------------------------------------+
|                                                              |
|   WALLET AGENT ASSOCIÉ (pseudonyme, hash partiel)            |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Wallet : 0x7f3...8a2 (10 derniers chars affichés)          |
|   Balance USDC Base estimée : $8.24 (source : top-up - dépensé)|
|   [Recharger wallet → Stripe top-up $5 / $10 / $50]         |
|                                                              |
|   PACK EN COURS                                              |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   Type : Pack Standard $10 (10 000 calls)                    |
|   Quota restant : 7 843 / 10 000 calls  (78 %)               |
|   [Barre progression]                                        |
|   Expiration : pas de TTL (jusqu'à épuisement)               |
|   [Acheter Pack Pro $50 — 60 000 calls]                      |
|                                                              |
|   APPELS RÉCENTS (via pack, dernières 24h)                   |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   2026-05-05 14:22 — /api/llm-prices?model=opus-4.7 — 200   |
|   2026-05-05 14:19 — /api/llm-prices?model=sonnet-4.6 — 200 |
|   2026-05-05 13:45 — /api/sdk-status?pkg=ai — 200            |
|   [Voir tout — 2 157 appels ce mois]                         |
|                                                              |
|   AUDITS (historique)                                        |
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
|   2026-04-28 — Audit #a7f3e2 — Score: 72/100 — Savings: 34%  |
|   [Demander remboursement si savings < 15 % à 30j]           |
|   [Lancer nouvel audit — $9.99 USDC]                         |
|                                                              |
+--------------------------------------------------------------+
```

### 2.3 Sources data F26

- Quota pack restant : `GET /api/pack/quota?wallet_hash={hash}` → lecture directe KV `pack:{wallet_hash}:remaining` + `pack:{wallet_hash}:pack_type` (pas CF AE — KV est le state store).
- Appels récents : `pack_quota_consumed` CF AE (dernières 24h, filtre wallet_hash).
- Audit history : `audit_delivered` CF AE (filtre wallet_hash, sort by timestamp DESC).
- Refund éligibilité : `audit_delivered.savings_pct` + `days_since_audit` (calculé côté Worker).

---

## 3. Récapitulatif technique backend F25 + F26

### 3.1 Endpoints Worker requis pour les dashboards

| Endpoint | F25 ou F26 | Données agrégées | Refresh |
|---|---|---|---|
| `GET /api/admin/metrics` | F25 | CF AE SQL + Coinbase API + Stripe API (NSM, funnels, quality, discovery) | Cache KV 60s |
| `GET /api/pack/quota?wallet_hash={h}` | F26 | CF KV direct (`pack:{h}:remaining`, `pack:{h}:pack_type`, `pack:{h}:expires_at`) | Pas de cache (live KV) |
| `GET /api/admin/metrics/quality` | F25 Zone 3 | CF AE percentiles SQL (payload_size, latency, freshness) | Cache KV 60s |
| `GET /api/admin/metrics/audit` | F25 Zone 3 | CF AE savings_pct distribution + refund_triggered count | Cache KV 60s |
| `GET /api/admin/metrics/discovery` | F25 Zone 4 | CF AE referrer_bucket + crawl events + wallet uniques | Cache KV 60s |

**Note architecture** : tous les endpoints admin sont servis par le même CF Worker, avec rate-limiting Basic auth + IP-rate-limit pour prévenir enumeration.

### 3.2 Alertes Mailchannels (récapitulatif seuils ROUGE)

| Seuil ROUGE | Condition | Message email Thomas |
|---|---|---|
| Test E1 J7 échoué | 0 paiement x402 à J7 | « Test E1 J7 : 0 paiement agent IA. Diagnostiquer H1 — voir assumption-map.md » |
| NSM jour < 50 % objectif jour | NSM_jour < target_jour * 0.5 | « NSM jour en retard : {NSM} € vs {target} € objectif » |
| p99 payload > 50 KB | Sur un endpoint | « Promesse size brisée sur {path} : p99={size} KB » |
| Cron failed 2 runs consécutifs | cron_scrape_failed × 2 | « Cron {cron_name} en échec 2× consécutif — vérifier source {failed_source} » |
| Refund triggers > 20 % audits | COUNT(refund) / COUNT(audits) > 20 % | « Garantie refund dépassée : {pct} % audits remboursés — réviser heuristiques » |
| savings_pct médian < 15 % | Sur derniers 20 audits | « H9 potentiellement invalidée — médian savings {pct} % sous seuil 15 % » |

---

## Handoff → @fullstack (Phase 1)

**Fichiers produits** :
- `docs/analytics/dashboard-specs.md` v2 (ce fichier)

**Décisions prises** :
- F25 = 4 zones (Revenue x402 / Funnel B2A / Cohérence promesse / Discovery) — zone humain Stripe supprimée
- F26 = sponsor wallet (quota pack + audit history) — plus abonné Stripe humain
- `/api/pack/quota` = endpoint dédié KV (pas CF AE) — voir dev-decisions.md v2 pour justification
- Mailchannels alertes sur 6 seuils ROUGE définis

**Points d'attention** :
- `GET /api/admin/metrics` agrège 3 sources (CF AE SQL + Coinbase API + Stripe API) — implémenter le cache KV 60s pour éviter rate-limit Coinbase
- F26 quota restant = lecture KV directe, pas CF AE — CF AE est event-stream, pas state-store
- Les citations LLM (Zone 4) sont saisies manuellement par Thomas — prévoir un mini-form HTMX ou formulaire HTML simple dans le dashboard admin
