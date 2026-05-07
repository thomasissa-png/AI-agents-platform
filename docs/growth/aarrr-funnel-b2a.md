<!-- Version: 2026-05-07 — @growth — Phase 4 acquisition — Funnel AARRR DevRefs v2 B2A double persona -->

# Funnel AARRR — DevRefs v2 (double persona B2A)

## Résumé exécutif

Funnel entièrement refactoré pour un produit 100 % B2A (Business-to-Agent). Le persona principal est
l'**agent IA autonome PAYEUR** (80 % du revenu). Le persona secondaire est le **dev humain SPONSOR**
(top-up wallet, 15-20 % du flux, zéro revenu direct DevRefs). Les 5 étapes AARRR sont instrumentées
sur CF Analytics Engine uniquement (zéro outil tiers, privacy by design).

**North Star** : revenu net mensuel x402 >= 600 €/mois à M+6 (= 66 transactions mix packs $10 +
audits $9.99, source : `docs/ia/agent-economics.md` § C.2).

---

## 1. Acquisition — "Ton agent te trouve sans que tu le cherches"

### 1.1 Canaux d'acquisition — Agent IA (persona principal)

Le canal primaire n'est pas un canal humain. Un agent IA découvre DevRefs de 3 façons :

| Canal                                     | Mécanisme                                                                                                                                                                                                    | Automatisation                                           | Volume estimé J30                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| **llms.txt crawl**                        | L'agent crawle `devrefs.dev/llms.txt` (liste endpoints + pricing) avant d'agir sur un modèle LLM. Référencé dans les registres llms.txt connus (llmstxt.directory, llmstxt.info)                             | 100 % automatique (cron IndexNow + soumission registres) | [HYPOTHÈSE : 30-100 crawls/mois J30 — pas de données V1] |
| **OpenAPI + MCP discovery**               | L'agent inspecte `devrefs.dev/openapi.json` via MCP tool ou `WebFetch`. Référencé sur `agent.market` (Coinbase, avril 2026)                                                                                  | 100 % automatique (F15 déjà livré)                       | [HYPOTHÈSE : 10-30 fetches/mois]                         |
| **Réponse 402 augmentée comme publicité** | Un agent qui tape `/api/llm-prices` sans pack reçoit un body 402 avec `roi_summary.verdict: no_brainer_buy` + `alternative_cost_usd_opus_4_7: 0.49`. Le 402 lui-même est le premier touchpoint de conviction | 100 % automatique (F8 middleware)                        | signal immédiat J1                                       |
| **Citations LLM (GEO)**                   | Perplexity, Claude, ChatGPT citent devrefs.dev sur requêtes "claude opus 4.7 pricing 2026", "Vercel AI SDK breaking changes"                                                                                 | Semi-auto (@geo pipeline actif)                          | [HYPOTHÈSE : 5-15 citations/semaine M+1]                 |
| **Indexation Bing/Google News**           | IndexNow push après chaque cron update (F7) → Bing indexe en < 1h → Perplexity cite                                                                                                                          | Automatique (F7 cron)                                    | signal SEO J7-J14                                        |

### 1.2 Canaux d'acquisition — Sponsor humain (persona secondaire)

| Canal                                       | Mécanisme                                                                                                                 | Priorité                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Dev.to articles techniques**              | Série "How I set up my Claude Code agent with an x402 wallet" — 2-4 articles/mois via pipeline IA (@copywriter + @social) | Haute — canal warm dev IA                                                                                       |
| **Hacker News (Show HN)**                   | Show HN au lancement V1 : "Show HN: DevRefs — cost intelligence API for AI agents, x402 native"                           | One-shot, haute visibilité 6-18h (HN front page = 18K visites, taux conversion 6.8 % [source : teract.ai 2026]) |
| **Reddit r/LocalLLaMA / r/MachineLearning** | Post data story : "I tracked what my Claude Code agent burns per session — results surprised me"                          | Moyen — viralité organique                                                                                      |
| **X.com / BlueSky threads**                 | Threads techniques : verbatim V1 tool-call JSON (agent cramant $0.49 pour 2 nombres)                                      | Moyen — amplification earned media                                                                              |
| **Earned media (PR automatisé)**            | Communiqués EIN Presswire / Pressonify sur thèmes x402 + agent economics (pipeline 1)                                     | Voir `earned-media-strategy.md`                                                                                 |

### 1.3 KPIs Acquisition

| KPI                                       | Outil                             | Cible J7 | Cible M+1 | Cible M+6 |
| ----------------------------------------- | --------------------------------- | -------- | --------- | --------- |
| Crawls bots IA identifiés                 | CF AE `ua_bucket LIKE 'ai_bot/*'` | >= 10    | >= 50     | >= 300    |
| Fetches `llms.txt`                        | CF AE `crawl_llms_txt_fetched`    | >= 5     | >= 30     | >= 200    |
| Fetches `openapi.json`                    | CF AE `crawl_openapi_fetched`     | >= 1     | >= 10     | >= 50     |
| Visites landing uniques humains (ip_hash) | CF AE `landing_page_view`         | >= 20    | >= 100    | >= 500    |
| Sources referrers top 5                   | CF AE GROUP BY referrer_bucket    | —        | documenté | documenté |

**Events tracking-plan.md associés** : `crawl_llms_txt_fetched`, `crawl_openapi_fetched`,
`api_request_received`, `landing_page_view`.

---

## 2. Activation — "Le 402 convainc l'agent en 1 lookup"

### 2.1 Funnel agent IA (chemin critique — 80 % revenu)

```
Crawl llms.txt / OpenAPI
       ↓
GET /api/llm-prices (ou /api/sdk-status) sans pack actif
       ↓
← HTTP 402 + body augmenté (roi_summary + alternative_cost_estimate + packs_available)
       ↓
Parse: roi_summary.verdict = "no_brainer_buy" ?
       ├── OUI → tente paiement x402 (signature wallet USDC Base)
       │         ↓
       │    payment_x402_completed → payload JSON livré → activation réussie
       │         ↓
       │    [optionnel] parse packs_available → achète Pack Standard $10 (10K calls)
       └── NON → skip (agent économe / Haiku low-cost) — retargeting via llms.txt update
```

**Levier clé** : le body 402 est la landing page de l'agent. `alternative_cost_estimate: 0.49`
vs `your_cost: 0.001` = ROI 490× exposé machine-readable. Aucune copy marketing nécessaire.

### 2.2 Funnel sponsor humain (chemin secondaire)

```
Landing devrefs.dev (hero JSON payload + CTA curl)
       ↓
Copie curl ou lit /docs/sponsor (top-up wallet)
       ↓
Top-up wallet agent (Coinbase Wallet / MetaMask / Rainbow — USDC Base)
       ↓
Agent déblocage → premier paiement x402 autonome
```

**Levier clé** : friction top-up = 1 transaction Coinbase Wallet, < 30 secondes. Section
`/docs/sponsor` dédiée (3 wallets supportés + screenshots F16). Pas de Stripe.

### 2.3 KPIs Activation

| KPI                                 | Formule CF AE                                           | Cible J7 | Cible M+1 | Cible M+6 |
| ----------------------------------- | ------------------------------------------------------- | -------- | --------- | --------- |
| Ratio crawl → 402 servi             | `api_response_402_sent / api_request_received [ai_bot]` | >= 80 %  | >= 90 %   | >= 95 %   |
| Ratio 402 → tentative paiement      | `payment_x402_attempt / api_response_402_sent [ai_bot]` | >= 5 %   | >= 10 %   | >= 15 %   |
| Ratio tentative → paiement complété | `payment_x402_completed / payment_x402_attempt`         | >= 80 %  | >= 85 %   | >= 90 %   |
| Ratio 402 → pack acheté             | `pack_purchased / api_response_402_sent [ai_bot]`       | —        | >= 2 %    | >= 5 %    |
| Latence médiane 402 → paiement      | `MEDIAN(ts_payment - ts_402)`                           | < 5 s    | < 5 s     | < 3 s     |
| CTA curl-copied (sponsor)           | `landing_cta_curl_copied`                               | —        | >= 5      | >= 50     |

**Events tracking-plan.md** : `api_response_402_sent`, `payment_x402_attempt`,
`payment_x402_completed`, `pack_purchased`, `landing_cta_curl_copied`.

---

## 3. Rétention — "Un wallet qui revient est un agent fidèle"

### 3.1 Mécaniques de rétention B2A

La rétention agent IA est structurellement différente du SaaS humain. Un agent revient si :

- (a) son sponsor humain top-up régulièrement le wallet (solde > 0 USDC),
- (b) le payload reste frais et atomique (promesse Fresh/Atomic — cron 6h/24h),
- (c) le body 402 `packs_available` lui rappelle à chaque refus que le Pack Standard économise
  la friction de signature.

**Anti-churn principal** : un pack pré-payé actif (quota > 0 en KV) = l'agent ne reçoit plus
de 402 → il continue à appeler sans friction. Le pack lui-même est un mécanisme de rétention.

### 3.2 Leviers rétention actifs V1

| Levier                | Mécanique                                                                                                                     | Feature V1 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Pack quota KV**     | Agent achète Pack Standard $10 → 10 000 calls stockés en KV → zéro 402 pendant le quota                                       | F8b        |
| **Fraîcheur prouvée** | Cron 6h pricing + 24h SDK → `dateModified` dans chaque payload → l'agent sait que la donnée est fraîche → il revient          | F3/F6      |
| **Audit récurrrent**  | Après audit Offre 2, le rapport inclut `recommended_next_audit: "30d"` → l'agent (ou son sponsor) planifie un re-audit        | F1b        |
| **Alerte sponsor**    | Si solde wallet < seuil → webhook sponsor (V2 backlog) — en V1 : section `/docs/sponsor` documente l'alerte Basescan manuelle | V2         |

### 3.3 KPIs Rétention

| KPI                                       | Formule CF AE                                                             | Cible M+1 | Cible M+6 |
| ----------------------------------------- | ------------------------------------------------------------------------- | --------- | --------- |
| Wallets récurrents (>= 2 paiements en 7j) | `COUNT(DISTINCT wallet_hash) >= 2 payments trailing_7d`                   | >= 3      | >= 30     |
| Packs rechargés (2e pack même wallet)     | `pack_purchased WHERE wallet_hash_count > 1` / `DISTINCT wallet_hash`     | —         | >= 20 %   |
| Audits récurrents (2e audit même wallet)  | `audit_paid_x402 WHERE prev_audit_wallet = true` / `DISTINCT wallet_hash` | —         | >= 10 %   |
| Pack consumption rate                     | `AVG(pack_calls_used / pack_quota_total)`                                 | >= 40 %   | >= 60 %   |

**Events tracking-plan.md** : `pack_quota_exhausted`, `pack_calls_used`, `audit_paid_x402`
avec flag `prev_audit_wallet`.

---

## 4. Référence (Referral) — "L'agent encode son audit dans ses commits"

### 4.1 Boucles de référence B2A

Détail complet dans `viral-loops.md`. Résumé ici :

| Boucle                         | Signal de référence                                                                | K-factor estimé                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Audit GitHub PR**            | Agent inclut lien DevRefs audit dans description PR auto-générée                   | [HYPOTHÈSE : K 0.05-0.15 — 1 PR = 2-5 reviewers qui voient le lien] |
| **ROI Calculator embeddable**  | Sponsor partage widget ROI sur son blog / README projet                            | [HYPOTHÈSE : K 0.02-0.08 — niche dev IA]                            |
| **Commit message automatique** | Agent inclut `[devref: cost-optimized]` tag + savings_pct dans ses commit messages | [HYPOTHÈSE : K 0.01-0.04 — signal discret mais reproductible]       |

### 4.2 KPIs Référence

| KPI                                 | Source                                              | Cible M+1    | Cible M+6     |
| ----------------------------------- | --------------------------------------------------- | ------------ | ------------- |
| Citations Perplexity/Claude/ChatGPT | Requête manuelle hebdo                              | >= 5         | >= 30         |
| Backlinks Dev.to/Reddit/HN          | CF AE referrer_bucket                               | >= 3 sources | >= 10 sources |
| Wallets uniques payants             | CF AE `DISTINCT wallet_hash payment_x402_completed` | >= 2         | >= 30         |

**Events tracking-plan.md** : `landing_page_view WHERE referrer_bucket IN (devto, reddit, hn, github)`.

---

## 5. Revenue — "66 transactions/mois = 600 €/mois net"

### 5.1 Modèle économique V1

| Offre                | Prix       | Revenu net/tx             | Transactions cible M+6 | Revenu net cible |
| -------------------- | ---------- | ------------------------- | ---------------------- | ---------------- |
| Pack Standard $10    | $10 USDC   | ~$9.09 (- 0.1 % Coinbase) | 33/mois (mix 50/50)    | ~300 €           |
| Audit one-shot $9.99 | $9.99 USDC | ~$9.08                    | 33/mois                | ~300 €           |
| **Total mix 50/50**  | —          | —                         | **66/mois**            | **~600 € net**   |

Source : `agent-economics.md` § C.2 + `pricing-strategy.md` § 4.1.

### 5.2 Unit economics par canal

| Canal                         | CAC estimé                                         | LTV estimé                              | Ratio LTV:CAC | Payback  |
| ----------------------------- | -------------------------------------------------- | --------------------------------------- | ------------- | -------- |
| **llms.txt crawl (agent)**    | 0 € (infra déjà payée)                             | 9-45 € (pack Standard → Pro récurrence) | > 10:1        | < 1 mois |
| **Dev.to article (sponsor)**  | 0 € (pipeline IA)                                  | 9-45 €                                  | > 10:1        | < 1 mois |
| **HN Show HN (sponsor)**      | 0 € (one-shot)                                     | 9-45 €                                  | > 10:1        | < 1 mois |
| **Earned media PR (sponsor)** | 50-150 €/release [HYPOTHÈSE : taux reprise 5-15 %] | 9-45 € × N backlinks                    | Variable      | 1-3 mois |

Note : tous les canaux V1 sont organic/0 €. Le paid n'est pas recommandé avant M+3 (pas de données
conversion suffisantes pour justifier CAC > 0 €).

### 5.3 KPIs Revenue

| KPI                      | Source                               | Cible M+1    | Cible M+6                          |
| ------------------------ | ------------------------------------ | ------------ | ---------------------------------- |
| Revenu NET mensuel (NSM) | Coinbase + CF AE                     | >= 50 €      | >= 600 €                           |
| % revenu x402 vs Stripe  | dashboard                            | >= 90 % x402 | >= 95 % x402                       |
| ARPU par wallet          | `SUM(amount) / DISTINCT wallet_hash` | indicateur   | indicateur                         |
| Mix packs vs audits      | `GROUP BY offer_type`                | —            | surveiller si audit > 70 % → pivot |

**Events tracking-plan.md** : `payment_x402_completed`, `audit_paid_x402`, `pack_purchased`
avec `amount_usdc`, `pack_type`, `offer_type`.

---

## 6. Mapping complet events tracking-plan.md

| Event                            | Étape AARRR          | Persona | Déclencheur                          |
| -------------------------------- | -------------------- | ------- | ------------------------------------ |
| `crawl_llms_txt_fetched`         | Acquisition          | Agent   | GET /llms.txt                        |
| `crawl_openapi_fetched`          | Acquisition          | Agent   | GET /openapi.json                    |
| `api_request_received`           | Acquisition          | Agent   | Toute requête API                    |
| `landing_page_view`              | Acquisition          | Sponsor | GET /                                |
| `api_response_402_sent`          | Activation           | Agent   | Requête sans pack actif              |
| `payment_x402_attempt`           | Activation           | Agent   | Agent tente signature x402           |
| `payment_x402_completed`         | Activation + Revenue | Agent   | Tx confirmée Coinbase                |
| `pack_purchased`                 | Activation + Revenue | Agent   | Achat pack pré-payé                  |
| `audit_402_served`               | Activation           | Agent   | GET /api/agent-audit sans pack       |
| `audit_paid_x402`                | Activation + Revenue | Agent   | Audit acheté                         |
| `audit_delivered`                | Activation           | Agent   | Rapport JSON retourné                |
| `landing_cta_curl_copied`        | Activation           | Sponsor | Click "Copy curl"                    |
| `sponsor_topup_stripe_initiated` | Activation           | Sponsor | Click Stripe top-up                  |
| `sponsor_topup_stripe_completed` | Activation           | Sponsor | Stripe webhook paid                  |
| `pack_calls_used`                | Rétention            | Agent   | Call avec pack actif                 |
| `pack_quota_exhausted`           | Rétention            | Agent   | Quota pack = 0                       |
| `audit_savings_realized`         | Rétention            | Agent   | J+30 post-audit (webhook ou re-call) |

---

## Handoff → @orchestrator

**Fichiers produits** : `docs/growth/aarrr-funnel-b2a.md`

**Décisions prises** :

- Funnel agent IA primaire : découverte via llms.txt + OpenAPI + body 402 lui-même
- Funnel sponsor secondaire : Dev.to + HN + landing curl
- Rétention B2A par pack quota KV (zéro friction inter-calls)
- Revenue mix 50/50 packs/audits → 66 tx/mois = 600 € net M+6
- CAC = 0 € sur tous les canaux V1 (organic only)

**Points d'attention** :

- Le body 402 augmenté (F8) est le premier levier d'activation — tout passe par sa qualité
- Le tracking `ua_bucket` est le signal de validation persona B2A principal (cible : >= 50 % ai_bot M+1)
- Earned media : voir `earned-media-strategy.md` pour budget et pipelines détaillés
- Viral loops : voir `viral-loops.md` pour K-factor et implémentation

**Sources** :

- x402 adoption stats : [Coinbase Jesse Pollak, CoinDesk avril 2026](https://www.coindesk.com/tech/2026/04/25/coinbase-s-jesse-pollak-says-ai-agents-are-the-next-big-wave-for-crypto-payments)
- HN conversion rate 6.8 % : [teract.ai Reddit vs HN 2026](https://www.teract.ai/resources/reddit-vs-hackernews-tech-marketing-2026)
- x402 Foundation : [Coinbase + Cloudflare x402 Foundation](https://www.coinbase.com/blog/coinbase-and-cloudflare-will-launch-x402-foundation)
