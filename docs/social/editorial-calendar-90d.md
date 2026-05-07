<!-- Version: 2026-05-07 — @social — Phase 4 acquisition DevRefs — Calendrier éditorial 90 jours -->

# Calendrier éditorial 90 jours — DevRefs

## Principe de génération perpétuelle

Ce calendrier est conçu pour se régénérer automatiquement. Après J90, le cycle recommence avec :

- Nouvelles données fraîches (Top 5 modèles du trimestre suivant)
- Nouveaux SDKs breaking changes détectés par le cron
- Nouveaux tutoriels intégration si nouveaux agents IA majeurs

**Registre anti-répétition** : chaque ligne a un angle unique. Avant tout nouveau post, vérifier ce tableau pour éviter le même angle sur le même sujet.

---

## Volume cible

- **8 posts/mois** en moyenne = 24 posts sur 90 jours
- **Mix** : 50 % P1 Data stories (12 posts), 30 % P2 Tutoriels (7 posts), 20 % P3 Actualité LLM (5 posts)
- **Réseaux** : X.com (primaire), BlueSky (miroir), Dev.to (long-form), GitHub (soumissions one-shot)

---

## Mois 1 — Semaines 1 à 4 (7 mai → 3 juin 2026)

| #   | Semaine | Date cible | Réseau          | Format                  | Pilier       | Hook / Angle                                                                                                                                          | Source du claim                                                           | CTA                                                                                         | KPI cible                     | Statut                                   |
| --- | ------- | ---------- | --------------- | ----------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| 1   | S1      | 2026-05-09 | X.com + BlueSky | Thread 6 tweets         | P1 Data      | "We measured the cost of a single LLM pricing query without DevRefs. 64,520 tokens. $0.49 for an Opus 4.7 agent. Here's the breakdown."               | `docs/ia/agent-economics.md` § A.1-A.2 + verbatim V1 `project-context.md` | Thread final : `devrefs.dev — $0.001/call` (pas de lien tweet 1)                            | 500 vues, 20 likes, 5 replies | A produire                               |
| 2   | S1      | 2026-05-10 | Dev.to          | Article 800 mots        | P2 Tutoriel  | "How to pay for LLM pricing data in x402 with Claude Code (5-min integration)"                                                                        | `docs/ia/agent-integration.md` voies intégration Coinbase MCP server      | CTA final : lien `/api/llm-prices` OpenAPI + devrefs.dev                                    | 30 saves, 5 réactions         | A produire                               |
| 3   | S2      | 2026-05-13 | GitHub          | Soumission awesome list | P2           | PR sur `awesome-llm` : ajout DevRefs dans section "Pricing APIs" avec description < 80 chars                                                          | —                                                                         | PR elle-même = signal                                                                       | 1 PR ouverte                  | A produire                               |
| 4   | S2      | 2026-05-14 | X.com + BlueSky | Thread 5 tweets         | P1 Data      | "Opus 4.7 has a silent tokenizer inflation of +35%. Effective cost: $6.75/MTok input, not $5. Here's why your agent's cost estimation is off by 35%." | Finout.io blog + `agent-economics.md` § A.2                               | Reply tweet 5 : `GET /api/llm-prices?model=opus-4.7` retourne `effective_cost_factor: 1.35` | 300 vues, 15 likes            | A produire                               |
| 5   | S3      | 2026-05-19 | X.com           | Thread 4 tweets         | P3 Actualité | Réaction à une annonce pricing LLM (surveiller semaine 3 — si Anthropic/OpenAI annoncent) — angle : "What this means for agent cost estimation"       | Source officielle annonce + `agent-economics.md`                          | Lien devrefs.dev en dernier tweet                                                           | 200 vues                      | A produire — CONDITIONNEL (si actualité) |
| 6   | S3      | 2026-05-21 | Dev.to          | Article 1000 mots       | P1 Data      | "Top 5 LLM models by real cost for AI agents (May 2026) : tokenizer inflation included"                                                               | `agent-economics.md` § A.2, Anthropic/OpenAI/Google pricing officiel      | CTA : `GET /api/llm-prices?model={model}` + devrefs.dev                                     | 50 saves, 10 réactions        | A produire                               |
| 7   | S4      | 2026-05-26 | X.com + BlueSky | Thread 5 tweets         | P2 Tutoriel  | "Your AgentKit agent can pay for its own LLM pricing data. Here's the 3-step x402 integration."                                                       | `docs/ia/agent-integration.md` + x402-fetch wrapper                       | Reply thread : lien OpenAPI spec devrefs.dev                                                | 250 vues, 10 likes            | A produire                               |
| 8   | S4      | 2026-05-28 | X.com           | Post unique             | P3 Actualité | "Vercel AI SDK had 3 breaking changes in Q1 2026. How many did your agent miss?" + JSON payload `/api/sdk-status?pkg=ai`                              | `docs/product/v1-scope.md` — 50 SDKs V1 + npm changelog                   | Pas de lien (post unique, lien en reply si demandé)                                         | 300 vues, 15 replies          | A produire                               |

---

## Mois 2 — Semaines 5 à 8 (4 juin → 1 juillet 2026)

| #   | Semaine | Date cible | Réseau          | Format                  | Pilier       | Hook / Angle                                                                                                                      | Source du claim                                                           | CTA                                      | KPI cible          | Statut                 |
| --- | ------- | ---------- | --------------- | ----------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- | ------------------ | ---------------------- |
| 9   | S5      | 2026-06-02 | Dev.to          | Article 1200 mots       | P2 Tutoriel  | "POST /api/agent-audit : how to run a cost audit on your AI agent in x402 (with sample JSON output)"                              | `docs/ia/agent-audit-spec.md` + verbatim V6 `personas.md`                 | CTA : devrefs.dev/audit + $9.99 one-shot | 40 saves           | A produire             |
| 10  | S5      | 2026-06-03 | X.com + BlueSky | Thread 6 tweets         | P1 Data      | "We ran the 5 most common AI agent cost optimization heuristics on a 10M tokens/month agent. Results: -40% monthly cost. Thread." | `agent-economics.md` § B.2-B.3                                            | Reply 6 : devrefs.dev/audit              | 400 vues, 20 likes | A produire             |
| 11  | S6      | 2026-06-09 | GitHub          | Soumission awesome list | P2           | PR sur `awesome-x402` : ajout DevRefs dans section "B2A APIs"                                                                     | —                                                                         | PR = signal + lien devrefs.dev           | 1 PR ouverte       | A produire             |
| 12  | S6      | 2026-06-11 | X.com           | Thread 4 tweets         | P1 Data      | "Top 10 SDKs with breaking changes detected by DevRefs cron this month. Angle : which ones cost the most agent retries?"          | Cron data live `api.devrefs.dev/api/sdk-status`                           | Reply 4 : lien endpoint + CHANGELOG      | 300 vues, 15 likes | A produire             |
| 13  | S7      | 2026-06-16 | X.com + BlueSky | Thread 5 tweets         | P3 Actualité | Réaction à une actualité GPT-5/Gemini pricing — "What GPT-5's new pricing means for an Opus-heavy agent stack"                    | Source officielle OpenAI + `agent-economics.md` § A.2                     | Pas de lien tweet 1                      | 200 vues           | CONDITIONNEL actualité |
| 14  | S7      | 2026-06-18 | Dev.to          | Article 800 mots        | P2 Tutoriel  | "Integrating DevRefs with Mastra agents : pre-flight cost check before LLM calls"                                                 | `docs/ia/agent-integration.md` Mastra section                             | CTA : devrefs.dev + Pack Standard $10    | 30 saves           | A produire             |
| 15  | S8      | 2026-06-23 | X.com           | Post unique + JSON      | P1 Data      | "June 2026 LLM pricing snapshot. What changed since May." JSON comparaison M/M.                                                   | Cron live + sources officielles Anthropic/OpenAI/Google/Mistral           | Reply : devrefs.dev/api/llm-prices       | 200 vues           | A produire             |
| 16  | S8      | 2026-06-25 | X.com + BlueSky | Thread 5 tweets         | P1 Data      | "model_downgrade heuristic: why 80% of agents using Opus 4.7 could switch 60% of tasks to Sonnet 4.6 and save ~$240/month. Data." | `agent-economics.md` § B.3 + verbatim V6 `personas.md` (marqué HYPOTHÈSE) | Reply 5 : POST /api/agent-audit          | 350 vues, 15 likes | A produire             |

---

## Mois 3 — Semaines 9 à 13 (2 juillet → 4 août 2026)

| #   | Semaine | Date cible | Réseau          | Format                  | Pilier       | Hook / Angle                                                                                                                                         | Source du claim                                                                                                  | CTA                                                 | KPI cible           | Statut                                    |
| --- | ------- | ---------- | --------------- | ----------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------- | ----------------------------------------- |
| 17  | S9      | 2026-07-02 | Dev.to          | Article 1000 mots       | P1 Data      | "Q2 2026 LLM pricing review: which models got cheaper, which got more expensive (tokenizer inflation included)"                                      | Sources officielles + cron DevRefs live                                                                          | CTA : GET /api/llm-prices + devrefs.dev             | 60 saves            | A produire                                |
| 18  | S9      | 2026-07-07 | X.com + BlueSky | Thread 6 tweets         | P2 Tutoriel  | "How to sponsor your Claude Code agent's x402 wallet in < 2 minutes (Coinbase Wallet, MetaMask, Rainbow)"                                            | `personas.md` v2 § 2 + verbatim V4 v2                                                                            | Reply 6 : devrefs.dev docs sponsor                  | 250 vues, 10 likes  | A produire                                |
| 19  | S10     | 2026-07-09 | HN              | Show HN post            | P2           | "Show HN: DevRefs – x402 micropayments for LLM pricing queries ($0.001/call, JSON-LD dated)"                                                         | Endpoint live + data cron                                                                                        | Post lui-même — titre neutre, description technique | Front-page candidat | A produire — 1ère tentative HN            |
| 20  | S10     | 2026-07-14 | X.com           | Thread 4 tweets         | P3 Actualité | Réaction post-HN (si front-page) : "What HN said about x402 payments for AI agents" + stats trafic anonymisées                                       | CF Analytics — données trafic post-HN                                                                            | Pas de lien tweet 1                                 | 500 vues (si HN)    | CONDITIONNEL HN                           |
| 21  | S11     | 2026-07-17 | Dev.to          | Article 1200 mots       | P2 Tutoriel  | "OpenAI Agents SDK + DevRefs: cost-aware agent loop with x402 pre-flight pricing"                                                                    | `docs/ia/agent-integration.md` + OpenAI Agents SDK docs officiels                                                | CTA : devrefs.dev + Pack Standard $10               | 50 saves            | A produire                                |
| 22  | S11     | 2026-07-22 | X.com + BlueSky | Thread 5 tweets         | P1 Data      | "Prompt caching heuristic: agents who cache prompts > 1024 tokens save 90% on those tokens. How many of yours qualify? Data from 100 audit samples." | `agent-economics.md` § B.2 (heuristique prompt caching) + marqué HYPOTHÈSE sur "100 audit samples" si non mesuré | Reply 5 : POST /api/agent-audit                     | 300 vues, 12 likes  | A produire                                |
| 23  | S12     | 2026-07-28 | GitHub          | Soumission awesome list | P2           | PR sur liste Mastra ou AgentKit README "Tools" section                                                                                               | —                                                                                                                | PR = signal                                         | 1 PR ouverte        | A produire                                |
| 24  | S13     | 2026-08-04 | X.com + BlueSky | Thread 6 tweets         | P1 Data      | "90-day review: what we learned from DevRefs API calls. Top 3 models queried. Top 5 SDKs checked. Volume. Angle data réel."                          | CF Analytics + Coinbase facilitator logs — données réelles anonymisées                                           | Reply 6 : devrefs.dev                               | 500 vues, 25 likes  | A produire — données réelles obligatoires |

---

## Règles de remplacement (post conditionnel)

- Si le post P3 Actualité "CONDITIONNEL" de la semaine n'a pas de déclencheur actualité fort → remplacer par un post P1 Data sur les SDKs breaking changes détectés par le cron cette semaine
- Si HN S10 n'aboutit pas → remplacer le post CONDITIONNEL HN par un thread X.com sur les résultats du cron (données fraîches réelles)

---

## Workflow d'automatisation (génération continue)

```
[Cron DevRefs 6h] → données fraîches pricing + SDK
       ↓
[Template IA - voir post-templates.md] → draft post généré par batch
       ↓
[Validation Thomas < 15 min] → vérification claim source + anti-règles
       ↓
[Scheduling Buffer/Typefully] → publication au créneau optimal
       ↓
[CF Analytics referrer] → suivi clics post-publication
       ↓
[Registre anti-répétition] → mise à jour colonne Statut → "Publié"
```

**Outils recommandés** :

- Scheduling X.com : Typefully (thread scheduling, analytics intégrés)
- Scheduling BlueSky : Skeetdeck ou post manuel (client léger)
- Dev.to : API REST Dev.to (publier via script depuis fichier Markdown)
- Tracking : CF Analytics referrer (gratuit, déjà en place)

**Handoff @fullstack** : si scheduling automatisé custom souhaité, endpoint `/api/social/generate` (prompt → draft post calibré brand voice) + `/api/social/schedule` (post vers Buffer/Typefully API). Priorité basse V1 — manuel suffisant à 8 posts/mois.

---

## Créneaux de publication optimaux

| Réseau    | Créneau                  | Jour                           |
| --------- | ------------------------ | ------------------------------ |
| X.com     | 9h-11h EST (15h-17h CET) | Mardi, jeudi                   |
| BlueSky   | 10h-12h EST              | Mardi, jeudi (identique X.com) |
| Dev.to    | 8h-10h EST               | Lundi, mercredi                |
| HN        | 9h-11h EST               | Lundi, mardi                   |
| GitHub PR | N/A (soumission directe) | N/A                            |

---

**Handoff → @copywriter**

- Fichier produit : `/docs/social/editorial-calendar-90d.md`
- Décisions prises : 24 posts sur 90 jours, 8/mois, mix 50/30/20 (P1/P2/P3), 5 réseaux (X.com + BlueSky + Dev.to + GitHub + HN)
- Points d'attention : les claims chiffrés de chaque post sont sourcés (colonne "Source du claim"). @copywriter doit écrire les drafts en respectant la source et en ajoutant la citation explicite. Posts conditionnels = placeholders à activer si actualité LLM forte la semaine concernée. Post #24 (review 90j) doit utiliser données réelles CF Analytics — ne pas inventer.
