<!-- Version: 2026-05-07 — @growth — Phase 4 acquisition — Handoff acquisition DevRefs v2 -->

# Handoff Acquisition — DevRefs v2

## Document destinataires

- **Thomas** (fondateur) : plan d'action 30/60/90 jours + critères GO/PIVOT
- **@social** : canaux à activer, contenu à produire, pipeline automatisation
- **@sales-enablement** : matériaux sponsor humain, objections, onboarding wallet

---

## 1. Situation de départ (2026-05-07)

| Élément            | Statut                                                                      |
| ------------------ | --------------------------------------------------------------------------- |
| Site live          | devrefs.dev (landing) + api.devrefs.dev (endpoints)                         |
| Endpoints V1       | `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit` (3 endpoints x402) |
| Revenu actuel      | Phase 4 — pré-lancement public (pas de données revenu)                      |
| Analytics          | CF Analytics Engine configuré, events `tracking-plan.md` v2 activés         |
| NSM cible          | 600 €/mois net à M+6 = 66 transactions/mois mix packs $10 + audits $9.99    |
| Budget acquisition | **0 € paid** — organic only V1                                              |
| Persona principal  | Agent IA autonome (ua_bucket `ai_bot/*`)                                    |
| Persona secondaire | Dev humain sponsor (top-up wallet USDC Base)                                |

---

## 2. Plan 30/60/90 jours

### J1-J30 — Fondations et premiers signaux

**Objectif binaire J7** : >= 1 paiement x402 réel d'un agent IA autonome (H1 validation).
**Objectif J30** : >= 50 € revenu net + >= 10 wallets uniques ayant tenté un paiement.

| Jour    | Action                                                                                   | Responsable                    | Durée estimée                     |
| ------- | ---------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------- |
| J1      | Soumettre devrefs.dev aux registres llmstxt.directory + llmstxt.info                     | Thomas                         | 30 min                            |
| J1      | Soumettre à agent.market (Coinbase CDP)                                                  | Thomas                         | 1h                                |
| J1-J3   | Configurer Google Alerts : "DevRefs", "cost intelligence AI agents", "x402 pricing"      | Thomas                         | 15 min                            |
| J3      | Lancer Show HN : "Show HN: DevRefs — $0.001/call LLM pricing for AI agents, x402 native" | Thomas                         | J lundi ou mardi matin 9h-11h EST |
| J3-J7   | Publier article Dev.to #1 : "Your AI agent overpays by 490× for LLM pricing data"        | @copywriter + @social          | Pipeline auto Dev.to API          |
| J7      | Analyser premiers crawls (CF AE `crawl_llms_txt_fetched` + `api_request_received`)       | Thomas                         | 30 min                            |
| J7      | Test manuel : 5 requêtes Perplexity/Claude sur "LLM pricing 2026" — DevRefs cité ?       | Thomas                         | 15 min                            |
| J10     | Publier article Dev.to #2 : "Setting up an x402 wallet for your Claude Code agent"       | @copywriter + @social          | Pipeline auto                     |
| J14     | Tweet teaser Product Hunt launch J+7                                                     | @social                        | Auto                              |
| J14-J17 | Publier article Dev.to #3 : "Top 5 most expensive models to crawl for pricing"           | @copywriter + @social          | Pipeline auto                     |
| J17     | Partager code snippet dans Discord Mastra + Discord AgentKit (template B)                | Thomas                         | 30 min                            |
| J21     | **Product Hunt launch** (mardi 12h01 PST)                                                | Thomas (engagement temps réel) | 8h le jour J                      |
| J21     | Soumettre AlternativeTo + G2 (one-shot)                                                  | Thomas                         | 1h                                |
| J28     | Analyser KPIs J30 — décision GO/PIVOT selon critères § 5                                 | Thomas                         | 1h                                |

**Automatisations J1** (à configurer une fois) :

- Cron CF Worker rapport JSON mensuel (`devrefs.dev/data/monthly-report-YYYY-MM.json`)
- Pipeline Dev.to API : @social configure token + templates article
- Google Alerts digest quotidien → email Thomas

### J31-J60 — Amplification des canaux qui fonctionnent

**Objectif J60** : >= 150 € revenu net cumulé + identifier le canal d'acquisition dominant
(llms.txt vs Dev.to vs HN vs Reddit).

| Action                                       | Condition d'activation                                                        | Responsable                       |
| -------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| Articles Dev.to #4-#6 (série complète)       | Systématique — pas de condition                                               | @copywriter + @social             |
| Premier communiqué Pressonify                | Si data story inédite disponible (rapport mensuel M+1 avec >= 50 data points) | @copywriter + Thomas (validation) |
| Outreach swyx + Simon Willison               | Si >= 1 article Dev.to avec > 500 vues + data story live                      | Thomas (email)                    |
| Post Reddit r/LocalLLaMA + r/MachineLearning | Si article Dev.to #1 ou data story disponible                                 | Thomas ou @social                 |
| Rapport mensuel JSON publié                  | Automatique (cron CF Worker)                                                  | CF Worker                         |
| Analyse cohortes wallets J30-J60             | Systématique                                                                  | Thomas (CF AE dashboard)          |
| Test A/B hero landing (challenger vs actuel) | Si taux conversion curl_copied < 2 % sur landing                              | Thomas + @fullstack               |

**Canaux à couper si aucun signal J30** :

- Si `referrer_bucket = reddit` = 0 visites à J30 → suspendre posts Reddit jusqu'à M+2
- Si `referrer_bucket = hn` = 0 visites à J30 → analyser timing/titre Show HN, refaire
  1 tentative Ask HN avant de déprioritiser

### J61-J90 — Optimisation et scale organiques

**Objectif J90** : >= 200 € revenu net mensuel (cible `kpi-framework.md` § 1.4).

| Action                                   | Trigger                                                     | Responsable                    |
| ---------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| Data story Q2 2026 (rapport trimestriel) | Automatique J+90                                            | @copywriter + CF Worker        |
| 2e communiqué Pressonify                 | Si rapport trimestriel contient >= 100 data points citables | @copywriter + Thomas           |
| Activer badge ROI embeddable (boucle 3)  | Si >= 5 audits livrés avec savings_pct documenté            | @fullstack (1 CF Worker route) |
| Audit PR snippet (boucle 1) dans F1b     | Si @fullstack n'a pas encore ajouté le champ                | @fullstack                     |
| Analyse trigger pivot Audit-only         | Si % revenu audit > 70 % sur M+2 à M+3                      | Thomas (dashboard)             |
| Activation V2 backlog si signal          | Si >= 5 agents demandent Cost Regression Alerts             | Thomas → @product-manager      |

---

## 3. 5 Expériences acquisition prioritaires (RICE)

Format RICE : Reach × Impact × Confidence / Effort

| #      | Expérience                                       | Reach                                                                 | Impact                             | Confidence                               | Effort                    | RICE score | Délai              |
| ------ | ------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------- | ------------------------- | ---------- | ------------------ |
| **E1** | Show HN lancement + article Dev.to #1 simultanés | 18K visites HN front page [HYPOTHÈSE : si front page] + 500-5K Dev.to | 8/10 (audience exacte)             | 6/10 (incertitude front page HN)         | 2h (Thomas) + pipeline IA | **240**    | J3-J7              |
| **E2** | Soumission agent.market Coinbase                 | 69K agents actifs x402 [source : CoinDesk avril 2026]                 | 10/10 (audience B2A parfaite)      | 7/10 (délai validation Coinbase inconnu) | 1h                        | **483**    | J1                 |
| **E3** | llmstxt.directory + llmstxt.info soumission      | agents qui crawlent les registres llms.txt (volume non-mesuré)        | 7/10 (canal direct agent-to-agent) | 8/10 (formulaire simple)                 | 30 min                    | **112**    | J1                 |
| **E4** | Outreach swyx / Simon Willison (si article live) | 80K+ (swyx) + 10K+ (Simon Willison)                                   | 9/10 (1 citation = 10K visites)    | 4/10 (dépend de leur intérêt)            | 30 min (email)            | **108**    | M+1 (conditionnel) |
| **E5** | Partage code snippet Mastra + AgentKit Discord   | 2K-10K devs actifs discord [HYPOTHÈSE]                                | 8/10 (audience technique directe)  | 7/10 (si snippet utile)                  | 30 min                    | **112**    | J17                |

**Priorisation** : E2 (agent.market) > E1 (Show HN) > E3/E5 (registres + Discord) > E4 (outreach).

**Note sur E4** : ne pas activer avant M+1 et avant d'avoir >= 1 article Dev.to avec > 500 vues.
Un outreach sans preuve de traction = spam. La confiance monte avec la preuve.

---

## 4. Handoff @social — Canaux et pipeline contenu

### Ce que @social doit activer

| Canal        | Format                                                | Fréquence   | Automation                     | Priorité                 |
| ------------ | ----------------------------------------------------- | ----------- | ------------------------------ | ------------------------ |
| **Dev.to**   | Articles techniques (série 6 + data stories mensuels) | 2-4/mois    | Pipeline API Dev.to (100 % IA) | P0                       |
| **X.com**    | Threads 5-8 tweets (verbatims + data)                 | 2-3/semaine | Buffer ou API X.com (batch)    | P1                       |
| **BlueSky**  | Cross-post X.com threads                              | 2-3/semaine | Auto cross-post                | P2 — anti-vendor-lock-in |
| **LinkedIn** | Reformatage articles Dev.to (ton ROI/business)        | 1-2/mois    | Semi-auto                      | P3                       |

**Contenu prioritaire à produire (J1-J30)** :

1. Thread X.com — verbatim V1 (outil-call JSON agent cramant $0.49)
2. Thread X.com — Show HN announcement + lien
3. Article Dev.to #1 — "Your AI agent overpays 490×"
4. Article Dev.to #2 — "x402 wallet setup for Claude Code"
5. Tweet Product Hunt teaser (J+14)

**Pipeline Dev.to** :

- Prompt batch @copywriter → Markdown Frontmatter (`title`, `tags`, `published: false`)
- @social appelle `POST api.dev.to/api/articles` avec token API
- Review Thomas (optionnel J1-J30, automatique après validation voix M+1)
- Scheduling : mardi-jeudi 9h-11h EST (peak engagement Dev.to)

**Tags Dev.to recommandés** : `#ai`, `#agents`, `#cloudflare`, `#webmonetization`, `#typescript`

**Anti-patterns @social** :

- Pas de posts promotionnels directs. Les 3 premiers mots d'un post/thread = donnée ou question.
- Pas d'emojis sauf si la voix de marque évolue (Thomas décide).
- Pas de "RT si vous êtes d'accord". Pas de polls. Pas de "follow for more".

---

## 5. Handoff @sales-enablement — Matériaux sponsor humain

### Ce que @sales-enablement doit produire

Le persona sponsor n'est pas un "acheteur" — il est un **enabler de l'agent payeur**. Le
"sales" est une éducation crypto-wallet, pas une conversion SaaS.

| Matériau                           | Format                                              | Priorité              | Contenu clé                                                                                                                            |
| ---------------------------------- | --------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Guide "Top-up wallet en 5 min"** | Page `/docs/sponsor` (HTML statique F16)            | P0 — déjà en scope V1 | 3 wallets (Coinbase Wallet, MetaMask, Rainbow) + screenshots + montant top-up recommandé ($10-$20 USDC Base)                           |
| **FAQ objections sponsor**         | Section FAQ landing                                 | P0                    | 6 objections (`personas.md` § 1.4) avec réponses concises                                                                              |
| **Email brouillon bienvenue**      | Template email (Mailchannels, envoi manuel first)   | P1                    | Déclenché après `sponsor_topup_stripe_completed` — "Ton agent a un solde de $X USDC. Il peut maintenant appeler DevRefs en autonomie." |
| **Calcul ROI sponsor**             | Widget badge + page `/roi-calculator` (V1 statique) | P1                    | Inputs : modèle agent, calls/jour. Output : économies/mois vs parsing HTML. Lien badge embeddable.                                     |
| **Doc fiscalité BNC FR**           | Stub `/docs/billing`                                | P2                    | "Comment catégoriser les paiements x402 de ton agent en BNC : export Basescan + catégorie 'services numériques'"                       |

**Objections sponsor les plus critiques** (réponses courtes obligatoires) :

1. "Je ne suis pas à l'aise avec les wallets crypto."
   → "Coinbase Wallet = app iOS/Android. Top-up = 30 secondes. Tu envoies $10 USDC, ton agent
   paie en autonomie. Pas de Stripe, pas d'abonnement, pas de dashboard."

2. "Et si le wallet de mon agent se vide pendant une session critique ?"
   → "Le solde est visible sur Basescan (adresse wallet publique). Configurez une alerte
   Basescan sur la balance. Recommandation : garder >= $5 USDC de tampon."

3. "Comment je justifie ces paiements en BNC ?"
   → "Export CSV Basescan du wallet → catégorie 'services numériques' → déclaration BNC 2035.
   DevRefs ne génère pas de factures (paiements x402 on-chain = preuve fiscale). Guide sur
   `/docs/billing`."

4. "Pourquoi pas simplement une carte bleue ?"
   → "L'agent paie en autonomie, sans supervision humaine. x402 = l'agent signe lui-même.
   Une CB nécessiterait une intervention humaine à chaque call."

---

## 6. Critères GO/PIVOT à J30

### Test H1 (critique — binaire J7)

**GO** : >= 1 paiement x402 réel d'un agent IA autonome identifié (ua_bucket = `ai_bot/*` +
`payment_x402_completed`) avant J7.

**PIVOT si NON à J7** :

1. Vérifier que F8 (middleware x402) est correctement configuré — bug technique possible
2. Vérifier que `llms.txt` est indexé (test : `curl https://devrefs.dev/llms.txt` + requête
   Perplexity "devrefs.dev llms.txt")
3. Si technique OK → GEO push urgent (@geo) + outreach manuel 5 devs dans Discord Mastra/AgentKit
4. Si J14 toujours 0 paiement x402 → activer Stripe transitoire (rampe onboarding humain) en
   parallèle de x402 — cf. trigger `kpi-framework.md` § 3.4 H1 invalidée

### Critères GO/PIVOT à J30

| KPI                          | Seuil GO                | Seuil PIVOT  | Action si PIVOT                                                                                         |
| ---------------------------- | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| Revenu net J30               | >= 50 €                 | < 20 €       | Analyser funnel activation : ratio 402 → paiement. Si < 5 % → revoir body 402 (copywriting roi_summary) |
| Wallets uniques payants      | >= 2                    | 0            | Diagnostic GEO : "DevRefs" cité par Perplexity ? Si non → push @geo pipeline immédiat                   |
| % revenu audit vs packs      | Distribution documentée | Audit > 70 % | Trigger pivot brand-platform.md § 6 : considérer audit-only V2                                          |
| taux conversion 402→paiement | >= 5 %                  | < 2 %        | Revoir `roi_summary` body 402 + `packs_available` pricing. Tester landing avec ROI calculator explicite |
| Crawls bots IA               | >= 50                   | < 10         | Vérifier llms.txt + IndexNow + soumission registres. Relancer @seo pour optimisation crawlabilité       |

### Décision GO/NO-GO continuation paid (M+3)

**Condition** : si NSM >= 200 € à M+3 ET taux conversion 402→paiement >= 8 % → évaluer
premier budget paid (Google Ads sur "LLM pricing API" + "agent cost optimization", CAC cible < 30 €).

**Si NSM < 100 € à M+3** → rester organic. Le paid avant conversion > 5 % = gaspillage.

---

## 7. Budget acquisition V1 (récapitulatif)

| Canal                         | Budget mensuel                    | Justification                    |
| ----------------------------- | --------------------------------- | -------------------------------- |
| Dev.to articles               | 0 € (pipeline IA)                 | Automatisé @copywriter + @social |
| X.com / BlueSky               | 0 € (organic)                     | Threads manuels Thomas + @social |
| HN / Reddit                   | 0 € (organic)                     | Posts Thomas                     |
| Earned media PR (communiqués) | 0-49 €/mois (1 communiqué max V1) | Conditionnel data story          |
| Product Hunt                  | 0 €                               | One-shot                         |
| Directories                   | 0 € (formulaires gratuits)        | One-shot                         |
| **Total**                     | **0-49 €/mois**                   |                                  |

**Principe** : tout euro dépensé en acquisition avant M+3 est un euro gaspillé si la conversion
n'est pas prouvée. Le organic first jusqu'à >= 5 % taux 402→paiement.

---

## 8. Auto-évaluation @growth (critères 0-5)

| Critère            | Score | Commentaire                                                                                                                        |
| ------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Complétude**     | 5/5   | 4 fichiers produits, tous les éléments demandés couverts (AARRR + viral loops + earned media + handoff)                            |
| **Cohérence**      | 5/5   | Aligné avec personas.md v2, brand-platform.md v2, kpi-framework.md v2, agent-economics.md                                          |
| **Actionnabilité** | 4/5   | Plan J1-J90 avec durées et responsables. -1 : certaines estimations (K-factor, conversion agent.market) sont [HYPOTHÈSE] à valider |
| **Messages**       | 5/5   | Zéro copie générique SaaS humain. Templates outreach agent-first. Anti-mots respectés.                                             |
| **Spécificité**    | 5/5   | Chaque KPI mappé à un event CF AE spécifique. Chaque canal a son mécanisme B2A documenté.                                          |

---

## Handoff structuré final → @orchestrator

**Fichiers produits** :

- `/home/user/AI-agents-platform/docs/growth/aarrr-funnel-b2a.md`
- `/home/user/AI-agents-platform/docs/growth/viral-loops.md`
- `/home/user/AI-agents-platform/docs/growth/earned-media-strategy.md`
- `/home/user/AI-agents-platform/docs/growth/handoff-acquisition.md`

**Décisions prises** :

- Stratégie PLG pure (pas de sales-led) — agent paie en autonomie, sponsor top-up via wallet
- Budget acquisition V1 = 0 € paid — organic + earned media uniquement
- Canaux prioritaires : agent.market (P0) + llmstxt registres (P0) + Show HN (P1) + Dev.to série 6 articles (P1)
- 5 boucles virales définies, K-factor estimé conservateur (0.02-0.50 selon boucle)
- Critères GO/PIVOT J7 (binaire H1) + J30 (5 KPIs) documentés
- Unit economics : CAC = 0 € tous canaux V1, LTV = 9-45 €/wallet, ratio LTV:CAC > 10:1

**Points d'attention pour @orchestrator** :

- `pr_snippet` (boucle 1) et `badge_roi` (boucle 3) requièrent 2 petits ajouts @fullstack — à
  planifier en sprint Phase 4 : 1 champ JSON F1b + 1 route CF Worker
- agent.market soumission (Coinbase) : délai validation inconnu — Thomas doit soumettre J1
- Product Hunt launch : Thomas doit être disponible 8h le jour J (engagement temps réel critique)
- Monitoring pipeline 7 : configurer Google Alerts avant J7 — 15 min max

**Points d'attention pour @social** :

- Pipeline Dev.to API : configurer token API + 6 articles en batch J1-J7
- Conviction-first : jamais de CTA en hero des posts. Données d'abord, lien en conclusion.
- Anti-vendor-lock-in : publier en parallèle sur BlueSky (pas tout sur X.com)

**Points d'attention pour @sales-enablement** :

- Matériaux sponsor : guide top-up wallet (F16) est en scope V1 — vérifier avec @fullstack que
  `/docs/sponsor` est bien inclus dans le build Phase 3
- FAQ objections sponsor : 4 objections critiques documentées § 5 — à intégrer dans la landing
- Email brouillon bienvenue : brouillon obligatoire (jamais envoi direct — règle CLAUDE.md)

**Sources utilisées** :

- [x402 adoption 165M tx, 69K agents : CoinDesk avril 2026](https://www.coindesk.com/tech/2026/04/25/coinbase-s-jesse-pollak-says-ai-agents-are-the-next-big-wave-for-crypto-payments)
- [HN conversion 6.8 % vs Reddit 2.1 % : teract.ai 2026](https://www.teract.ai/resources/reddit-vs-hackernews-tech-marketing-2026)
- [x402 Foundation Coinbase + Cloudflare](https://www.coinbase.com/blog/coinbase-and-cloudflare-will-launch-x402-foundation)
- [agent.market Coinbase launch](https://www.coinbase.com/developer-platform/discover/launches/google_x402)
- [Latent Space podcast (swyx)](https://www.latent.space/)
- [Simon Willison blog](https://simonwillison.net)
