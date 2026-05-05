<!-- Version: 2026-05-05T17:00 — @data-analyst — Phase 0 v2 wave 3 — KPI Framework DevRefs v2 (refonte pivot B2A pure) -->

# KPI Framework — DevRefs v2

## Résumé exécutif

- **Pivot v2 2026-05-05** : KPI North Star recalibré sur revenu NET x402 seul (Stripe humain retiré comme pilier de revenu — top-up sponsor marginal). AARRR refactoré double persona v2 : agent IA payeur principal (80 %) + sponsor wallet humain (15 % top-up uniquement). KPIs spécifiques audit + pack ajoutés.
- **Décisions clés** : (1) North Star = revenu NET mensuel x402 + Stripe top-up marginal (formule brut moins frais Coinbase 0,1 % moins frais Stripe 2,9 % + 0,25 € moins CF Workers Paid). (2) Cible 600 €/mois = 66 transactions/mois mix packs + audits (source : `docs/product/pricing-strategy.md` scénarios § 4.1). (3) 3 nouveaux blocs KPI v2 : pack consumption rate, audit savings_pct distribution, garantie refund triggers. (4) Privacy by design strict conservé. (5) Stack analytics 0 € : CF Workers Analytics Engine uniquement, zéro outil tiers.
- **Dépendances** : `tracking-plan.md` v2 (events détaillés), `dashboard-specs.md` v2 (maquette F25 + F26), `dev-decisions.md` v2 (handoff @fullstack).

---

## 1. North Star Metric (NSM)

### 1.1 Définition v2

**Revenu net mensuel x402 + Stripe top-up marginal** = revenus bruts x402 (USDC→EUR) + revenus bruts Stripe top-up sponsor, convertis en EUR au cours du jour de settle, moins frais facilitator (Coinbase 0,1 % USDC), moins frais Stripe (2,9 % + 0,25 € par tx de top-up), moins frais Cloudflare Workers Paid si dépassement quota free tier.

**Important v2** : le top-up Stripe sponsor est une RAMPE d'onboarding wallet, pas une offre commerciale. DevRefs ne reçoit aucun revenu Stripe direct en V1 — le top-up alimente le wallet USDC de l'agent, qui paie ensuite en x402. La mention Stripe dans la formule NSM est donc marginale et ne concerne que les éventuels frais de rampe non-transférés. Source : `docs/product/pricing-strategy.md` § 1 tableau « Stripe top-up wallet sponsor ».

### 1.2 Formule de calcul

```
NSM_mois_M = SOMME_jours(j ∈ M) [
  SOMME_tx_x402(j) [
    amount_usdc * fx_usd_eur(j)
    - 0.001 * amount_usdc * fx_usd_eur(j)   // frais Coinbase facilitator 0,1 %
  ]
  +
  SOMME_tx_stripe_topup(j) [
    amount_eur_topup
    - (amount_eur_topup * 0.029 + 0.25)     // frais Stripe 2,9 % + 0,25 €/tx
    // REMARQUE : cette somme est nulle si DevRefs ne reçoit aucun flux Stripe direct v2
  ]
  -
  cf_workers_paid_usage_eur(M)              // 0 € si sous quota free tier (100 K req/jour)
]
```

**Sources** :
- `amount_usdc` : Coinbase facilitator API (settled tx only — exclure pending).
- `fx_usd_eur(j)` : taux de change quotidien BCE 16h CET (cohérence comptable BNC).
- Frais Coinbase : 0,1 % conservateur (à ajuster si Coinbase change barème).
- Frais Stripe : 2,9 % + 0,25 € par tx Standard EU.
- CF Workers Paid : 5 $/mois déclenchés uniquement si > 100 000 req/jour (non attendu V1).

### 1.3 Fréquence de mesure

| Cadence | Source | Affichage |
|---|---|---|
| **Live** (event-driven) | CF Analytics Engine + webhooks Coinbase | Dashboard admin F25, compteur jour |
| **Quotidienne 00:00 UTC** | Cron agrégation | Snapshot KV `metrics:nsm:YYYY-MM-DD` |
| **Mensuelle 1er du mois 06:00 UTC** | Cron consolidation | Email Mailchannels Thomas + snapshot KV `metrics:nsm:YYYY-MM` |

### 1.4 Valeurs cibles (source : `pricing-strategy.md` § 4.1 + `assumption-map.md` H10)

| Échelle | Cible NSM (revenu net mensuel) | Test binaire associé |
|---|---|---|
| **J7** | N/A (échelle journalière) | >= 1 paiement x402 réel d'un agent IA autonome (test E1 — H1 validation) |
| **J30** | >= 50 € | Binaire : atteint / non-atteint |
| **J90** | >= 200 € | Montée en charge confirmée |
| **M+3** | >= 300 € | Palette mix packs + audits établie |
| **M+6** | **>= 600 €** (KPI North Star atteint) | 66 transactions/mois mix packs + audits |
| **M+12** | >= 1 200 € | Extension bundle ou Subscription Pro V2 |

### 1.5 Décomposition cible 600 €/mois (source : `pricing-strategy.md` § 4.1)

| Scénario mix | Transactions/mois | €/transaction moyen | Réalisme |
|---|---|---|---|
| 100 % Pack Standard $10 | 66 packs | ~9,1 € net (après frais Coinbase 0,1 %) | Réaliste — 1 lecteur Dev.to/1 000 convertit |
| 100 % Audit one-shot $9.99 | 66 audits | ~9,08 € net | Réaliste — ticket élevé, persona 5M+ tok/mois |
| Mix 50/50 Pack + Audit | 33 packs + 33 audits | ~9,1 € net moyen | Scénario cible — démontre les 2 offres |
| Pack Pro $50 seulement | 14 packs | ~45,5 € net | Plus difficile — persona Pro plus rare V1 |

### 1.6 Anti-patterns NSM

- **NE PAS mesurer le revenu BRUT en NSM** : un changement de frais Coinbase (0,1 % → 0,5 %) dégraderait silencieusement le net. Mesurer le brut en KPI input (§ 2.4) uniquement.
- **NE PAS lisser sur trailing 30j en J7** : la cible J7 est binaire (>= 1 paiement x402) — un lissage masquerait le signal go/no-go H1.
- **NE PAS comptabiliser les top-up Stripe sponsor comme revenu DevRefs** : le top-up alimente le wallet de l'agent, pas le compte DevRefs directement.

---

## 2. KPIs AARRR adaptés double persona v2

### 2.1 Acquisition

**Persona agent IA (cible primaire 80 % du revenu)**

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Crawls bots IA identifiés | COUNT(crawl_*) WHERE ua_bucket LIKE 'ai_bot/*' GROUP BY day | CF AE | >= 10 | >= 50 | >= 300 |
| Requêtes `llms.txt` (3 endpoints) | COUNT(crawl_llms_txt_fetched) | CF AE | >= 5 | >= 30 | >= 200 |
| Requêtes `openapi.json` (agent avancé) | COUNT(crawl_openapi_fetched) | CF AE | >= 1 | >= 10 | >= 50 |
| Ratio paiements x402 vs crawls bot IA | COUNT(payment_x402_completed) / COUNT(crawl_* WHERE ua_bucket LIKE 'ai_bot/*') | CF AE | >= 5 % | >= 8 % | >= 12 % |

**Persona sponsor wallet humain (cible secondaire 15-20 % — top-up uniquement)**

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Visites uniques landing humaine (ip_hash 24h) | COUNT(DISTINCT ip_hash) WHERE event = landing_page_view | CF AE | >= 20 | >= 100 | >= 500 |
| Sources de trafic landing (referrers) | COUNT(landing_page_view) GROUP BY referrer_bucket | CF AE | N/A J7 | top 5 documenté | top 5 documenté |
| Top-up Stripe sponsor initiés | COUNT(sponsor_topup_stripe_initiated) | CF AE | N/A J7 | >= 1 | >= 5 |

### 2.2 Activation

**Funnel agent IA vers paiement x402 (endpoint pricing + SDK)**

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Agents IA détectant 402 (ratio crawl → 402) | COUNT(api_response_402_sent) / COUNT(api_request_received WHERE ua_bucket LIKE 'ai_bot/*') | CF AE | >= 80 % | >= 90 % | >= 95 % |
| Agents IA tentant paiement (ratio 402 → attempt) | COUNT(payment_x402_attempt) / COUNT(api_response_402_sent WHERE ua_bucket LIKE 'ai_bot/*') | CF AE | >= 5 % | >= 10 % | >= 15 % |
| Agents IA complétant paiement x402 one-shot | COUNT(payment_x402_completed WHERE pack_type IS NULL) / COUNT(payment_x402_attempt) | CF AE + Coinbase | >= 80 % | >= 85 % | >= 90 % |
| Agents achetant un pack (ratio 402 → pack_purchased) | COUNT(pack_purchased) / COUNT(api_response_402_sent WHERE ua_bucket LIKE 'ai_bot/*') | CF AE | N/A J7 | >= 2 % | >= 5 % |

**Funnel agent IA vers audit**

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Agents recevant 402 audit | COUNT(audit_402_served) | CF AE | >= 1 | >= 5 | >= 20 |
| Agents payant l'audit | COUNT(audit_paid_x402) / COUNT(audit_402_served) | CF AE | >= 5 % | >= 10 % | >= 20 % |
| Audits livrés avec succès | COUNT(audit_delivered) / COUNT(audit_paid_x402) | CF AE | >= 95 % | >= 98 % | >= 99 % |

**Funnel sponsor wallet humain (top-up, secondaire)**

| KPI | Formule | Outil | Cible M+1 | Cible M+6 |
|---|---|---|---|---|
| Top-up Stripe initiés → complétés | COUNT(sponsor_topup_stripe_completed) / COUNT(sponsor_topup_stripe_initiated) | CF AE + Stripe | >= 30 % | >= 50 % |
| CTA curl-copied (signal intérêt technique) | COUNT(landing_cta_curl_copied) | CF AE | >= 5 | >= 50 |

### 2.3 Rétention

| KPI | Formule | Outil | Cible M+1 | Cible M+6 |
|---|---|---|---|---|
| Wallets x402 récurrents (>= 2 paiements en 7j) | COUNT(DISTINCT wallet_hash) WHERE COUNT(payment_x402_completed) >= 2 IN trailing_7d | CF AE | >= 3 wallets | >= 30 wallets |
| Packs rechargés (même wallet_hash, 2e pack_purchased) | COUNT(pack_purchased WHERE wallet_hash_count > 1) / COUNT(DISTINCT wallet_hash) | CF AE | N/A M+1 | >= 20 % wallets |
| Audits récurrents (même wallet_hash, 2e audit_paid_x402) | COUNT(audit_paid_x402 WHERE prev_audit_wallet = true) / COUNT(DISTINCT wallet_hash) | CF AE | N/A M+1 | >= 10 % wallets |
| Pack consumption rate (quota consommé / quota acheté) | AVG(pack_calls_used / pack_quota_total) GROUP BY wallet_hash | CF AE | N/A M+1 | >= 60 % [HYPOTHÈSE : taux d'usage pack estimé sans données V1] |

**Note B2A** : la rétention agent IA est mesurée par récurrence du **wallet** (pseudonyme blockchain), pas par identité personnelle. Un wallet qui revient = un agent (ou dev pilotant un agent) qui revient.

### 2.4 Revenue

| KPI | Formule | Outil | Cible M+6 |
|---|---|---|---|
| Revenu BRUT x402 — packs (€) | SUM(amount_usdc * fx_usd_eur) WHERE pack_purchased = true | Coinbase + CF AE | >= 330 € [HYPOTHÈSE : mix 50/50] |
| Revenu BRUT x402 — audits (€) | SUM(amount_usdc * fx_usd_eur) WHERE audit_paid_x402 = true | Coinbase + CF AE | >= 330 € [HYPOTHÈSE : mix 50/50] |
| Revenu NET (= NSM) | cf. § 1.2 | Calcul agrégé | >= 600 € |
| ARPU x402 par wallet (mensuel) | SUM(amount_x402) / COUNT(DISTINCT wallet_hash) trailing_30d | CF AE + Coinbase | indicateur diagnostic |
| % revenu packs vs audits | revenu_packs_brut / revenu_total_brut | dashboard agrégé | cible pilotage mix : surveiller >70 % audit → trigger pivot § 4.3 pricing-strategy.md |
| % revenu x402 vs Stripe top-up | revenu_x402_brut / revenu_total_brut | dashboard agrégé | >= 90 % x402 (Stripe = marginal) |

### 2.5 Referral

| KPI | Formule | Outil | Cible M+1 | Cible M+6 |
|---|---|---|---|---|
| Citations Perplexity / Claude / ChatGPT | requête manuelle hebdo ("LLM pricing 2026", "Anthropic Opus 4.7 pricing") | Manuel + Google Alerts | >= 5 | >= 30 |
| Backlinks Dev.to / Reddit / HN | COUNT(landing_page_view) WHERE referrer_bucket IN ('devto', 'reddit', 'hn') | CF AE | >= 3 sources | >= 10 sources |
| Wallets IA uniques payants (signal croissance) | COUNT(DISTINCT wallet_hash) WHERE payment_x402_completed | CF AE | >= 2 | >= 30 |

---

## 3. KPIs spécifiques DevRefs v2 (au-delà AARRR)

### 3.1 Cohérence promesse↔réalité (3 endpoints v2)

| KPI | Formule | Outil | Cible | Alerte |
|---|---|---|---|---|
| Taille payload p99 (par endpoint) | PERCENTILE(payload_size_bytes, 99) GROUP BY path | CF AE | p99 < 50 KB | p99 > 50 KB → ROUGE (promesse landing brisée) |
| Latence endpoint p95 (par endpoint) | PERCENTILE(latency_ms, 95) GROUP BY path | CF AE | p95 < 200 ms | p95 > 200 ms → ORANGE |
| Fraîcheur pricing (cron 6h) | MEDIAN(freshness_hours) WHERE path = '/api/llm-prices' | CF AE | < 6 h | > 6 h → ROUGE (cron probable down) |
| Fraîcheur SDK (cron 24h) | MEDIAN(freshness_hours) WHERE path = '/api/sdk-status' | CF AE | < 24 h | > 24 h → ROUGE |
| Fraîcheur audit heuristiques (refresh < 1h) | MAX(audit_heuristic_updated_at - now) | CF AE cron | < 1 h | > 1 h → ORANGE (heuristiques statiques mais re-vérifiées) |

### 3.2 KPIs pack (nouveau v2 — F8b)

| KPI | Formule | Outil | Cible M+1 | Cible M+6 |
|---|---|---|---|---|
| Pack consumption rate (% quota consommé par pack) | AVG(pack_calls_used / pack_quota_total) GROUP BY pack_type | CF AE + KV | >= 40 % M+1 | >= 60 % M+6 [HYPOTHÈSE] |
| Packs expirant avec quota > 50 % restant | COUNT(pack_expired WHERE remaining_quota_pct > 50) / COUNT(pack_expired) | CF AE | N/A M+1 | < 20 % [HYPOTHÈSE : pack bien calibré si < 20 % expiration gaspillage] |
| Packs épuisés (quota consommé 100 %) | COUNT(pack_quota_exhausted) / COUNT(pack_purchased) | CF AE | N/A M+1 | >= 30 % (signal agents intensifs) |
| Distribution par type pack | COUNT(pack_purchased) GROUP BY pack_type (Discovery $5 / Standard $10 / Pro $50 / Audit Pro $49) | CF AE | N/A J7 | top pack type identifié |

### 3.3 KPIs audit (nouveau v2 — F1c/agent-audit-spec)

| KPI | Formule | Outil | Cible M+1 | Alerte si raté |
|---|---|---|---|---|
| savings_pct médian par audit livré | MEDIAN(audit_savings_realized.savings_pct) | CF AE | >= 25 % | < 15 % → revoir heuristiques (H9 invalidée) |
| % audits avec savings_pct >= 15 % | COUNT(audit_savings_realized WHERE savings_pct >= 15) / COUNT(audit_delivered) | CF AE | >= 80 % | < 80 % → révision heuristiques + alerter Thomas |
| % audits déclenchant refund garantie (<15 % savings) | COUNT(audit_refund_triggered) / COUNT(audit_delivered) | CF AE | < 20 % | > 20 % → refund exposition $100/mois max, révision urgente |
| Latence audit (p95) | PERCENTILE(audit_latency_ms, 95) | CF AE | < 2 000 ms (heuristiques statiques, zéro IA runtime) | > 5 000 ms → alerte ROUGE Worker timeout |
| % audits avec auto_applicable recommendations | COUNT(audit_delivered WHERE auto_applicable_count > 0) / COUNT(audit_delivered) | CF AE | >= 50 % | < 30 % → signal valeur perçue faible |

### 3.4 Validation hypothèses business v2

| Hypothèse | KPI de validation | Outil | Cible | Lecture si raté |
|---|---|---|---|---|
| H1 — agent IA achète Pack $10 ou Audit $9.99 en autonomie | ratio crawl bot → payment_x402_completed | CF AE | >= 5 % J30 | H1 invalidée → diagnostic GEO + activation Stripe transitoire |
| H9 — audit ROI 30-50 % économies réelles validables | savings_pct médian >= 25 % J60 | CF AE | >= 25 % | < 15 % → H9 invalidée, heuristiques insuffisantes |
| H10 — 66 transactions/mois à M+6 | COUNT(payment_x402_completed + pack_purchased + audit_paid_x402) trailing_30d | CF AE + Coinbase | >= 22/mois M+1 / >= 44/mois M+3 / >= 66/mois M+6 | ramp-up : J7 >= 1, M+1 >= 22, M+3 >= 44, M+6 >= 66 |
| H4 — fenêtre marché B2A 12-18 mois | % revenu x402 vs Stripe → croissance | dashboard | x402 croît chaque mois | stagnation → push GEO agent |
| HT6 — heuristiques statiques suffisantes sans IA runtime | % audits savings_pct >= 15 % | CF AE | >= 80 % | < 60 % → considérer IA runtime V2 (coût à modéliser) |

### 3.5 Validation persona (v2 — agent principal 80 % / sponsor secondaire 15 %)

| KPI validation persona | Formule | Cible M+1 | Verdict si raté |
|---|---|---|---|
| Ratio agents IA identifiés (UA-bucket) sur trafic API | COUNT(api_request_received WHERE ua_bucket LIKE 'ai_bot/*') / COUNT(api_request_received) | >= 50 % | persona principal NON validé → revoir positionnement B2A |
| Ratio packs vs pay-per-call vs audit (usage mix) | COUNT DISTINCT (pack_purchased, payment_x402_completed one-shot, audit_paid_x402) GROUP BY offer_type | N/A cible — distribution à observer | identifier offre dominante M+1 pour orienter copy + GEO |
| Latence avant 1er paiement après 402 (médiane) | MEDIAN(ts_payment_x402_attempt - ts_api_response_402_sent) GROUP BY session | < 5 secondes | comportement non-autonome → revoir intégration MCP/x402 |
| Ratio sponsor top-up sur revenu total | COUNT(sponsor_topup_stripe_completed) / COUNT(total_transactions) | < 20 % (Stripe marginal) | > 30 % → pivot pricing ou onboarding x402 à améliorer |

---

## 4. Privacy by design (zéro-PII confirmé v2)

### 4.1 Données NON collectées (interdit absolu)

- **Aucune adresse email** côté DevRefs analytics (Stripe gère les emails dans son propre flow).
- **Aucune adresse IP brute** stockée. IP utilisée pour rate-limit puis hashée SHA256(IP + daily_salt) TTL 24h.
- **Aucun User-Agent string complet** : extraction `ua_bucket` catégoriel uniquement (11 buckets : `ai_bot/claude`, `ai_bot/gpt`, `ai_bot/perplexity`, `ai_bot/mistral`, `ai_bot/agentkit`, `ai_bot/cursor`, `ai_bot/mcp`, `ai_bot/other`, `human/desktop`, `human/mobile`, `unknown`). UA brut jeté immédiatement.
- **Aucun mapping wallet → JWT** : wallet x402 et JWT sponsor = 2 identités distinctes, jamais reliées dans les analytics.
- **Aucun cookie tiers** (analytics ou marketing). Seul cookie : JWT post-top-up `Secure;HttpOnly;SameSite=Strict` (strictement nécessaire, exempté RGPD art. 82 LIL).
- **Aucun outil analytics tiers** : pas de Google Analytics, PostHog, Mixpanel, Amplitude, Plausible. CF Analytics Engine uniquement (server-side, zéro pixel JS).
- **Nouveaux events v2** : `audit_request_received`, `audit_paid_x402`, `pack_purchased` — aucun contenu de l'audit (input agent, config) stocké dans CF AE. Seuls les méta-données agrégées (savings_pct, latency_ms, pack_type) sont loggées. Cf. handoff @legal § 6.

### 4.2 Données collectées (justifiées)

| Donnée | Pourquoi collectée | Anonymisation | Rétention |
|---|---|---|---|
| `ua_bucket` (catégoriel) | Validation persona principal (§ 3.5) | catégorisation immédiate, UA brut jeté | 30 jours CF AE |
| `wallet_hash` SHA256 | Rétention agents, déduplication packs (§ 2.3) | wallet déjà pseudonyme on-chain, hashage supplémentaire | 30 jours CF AE |
| `pack_type`, `pack_quota_total`, `pack_calls_used` | KPIs pack (§ 3.2) | aucune PII | 30 jours CF AE |
| `savings_pct`, `audit_latency_ms` | KPIs audit (§ 3.3) | agrégat numérique, zéro contenu input/output audit | 30 jours CF AE |
| `path`, `status_code`, `latency_ms` | Funnel activation (§ 2.2), cohérence (§ 3.1) | aucune PII | 30 jours CF AE |

---

## 5. Stack analytics (0 €, 100 % CF)

| Outil | Usage | Coût |
|---|---|---|
| **CF Workers Analytics Engine** | Events server-side (tous les events tracking-plan.md v2), SQL queries via CF dashboard | 0 € (free tier 100 K events/jour — volume V2 estimé 3 200-3 500 events/jour) |
| **Coinbase facilitator API** | Revenue x402 settled tx (amount_usdc, fees, tx_hash) | 0 € (API gratuite) |
| **CF KV** | Pack quota state (`pack:{wallet_hash}:remaining`, `pack:{wallet_hash}:expires_at`), snapshot NSM | 0 € (free tier) |
| **Mailchannels** | Alertes ROUGE email Thomas (cron_scrape_failed, p99 > 50 KB, NSM jour < 0) | 0 € (inclus CF Workers) |

**Outils REJETÉS (inchangé v1)** : GA4 (RGPD), PostHog (vendor externe), Mixpanel (freemium events plafonnés + vendor externe), Amplitude, Plausible.

---

## 6. Seuils d'alerte et actions associées

| KPI | Seuil VERT | Seuil ORANGE | Seuil ROUGE | Action ROUGE |
|---|---|---|---|---|
| NSM jour | >= objectif J/30 | 50-70 % | < 50 % | Email Thomas immédiat, vérifier Coinbase webhook + cron |
| p99 payload size | < 50 KB | 50-75 KB | > 75 KB | Investiguer compression + endpoint buggy |
| p95 latence | < 200 ms | 200-500 ms | > 500 ms | CF Worker performance audit |
| Fraîcheur pricing | < 6 h | 6-12 h | > 12 h | Vérifier cron_scrape_failed + source officielle down |
| % audits refund triggered | < 10 % | 10-20 % | > 20 % | Révision heuristiques d'audit urgente |
| savings_pct médian | >= 25 % | 15-25 % | < 15 % | H9 potentiellement invalidée, alerter Thomas |
| Test E1 J7 | >= 1 paiement x402 | N/A | 0 paiement à J7 | Diagnostic H1 : GEO push + activation Stripe transitoire |

---

## Handoff → @data-analyst (interne) / @fullstack (Phase 1)

**Fichiers produits** :
- `docs/analytics/kpi-framework.md` v2 (ce fichier)

**Décisions prises** :
- NSM = revenu NET x402 uniquement (Stripe sponsor marginal, non comptabilisé direct)
- Cible 600 €/mois = 66 transactions mix packs + audits (source pricing-strategy.md)
- 3 nouveaux blocs KPI : pack consumption rate, audit savings_pct, refund triggers
- Privacy by design strict : events audit ne loggent aucun contenu input/output

**Points d'attention** :
- H9 et H10 sont des hypothèses non testées — les KPIs les mesurent mais les cibles sont marquées [HYPOTHÈSE]
- Le pack consumption rate target (60 %) est une hypothèse calibrée sans données V1 — à observer dès M+1
