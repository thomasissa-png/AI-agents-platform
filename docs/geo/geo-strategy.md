<!-- Version: 2026-05-06T00:00 — @geo — Phase 3 visibilité — GEO strategy V1 DevRefs -->

# GEO Strategy — DevRefs (V1 2026)

> Stratégie de citation par les moteurs génératifs (Perplexity, Claude, ChatGPT, Gemini).
> Objectif North Star M+6 : ≥ 30 citations IA sur les 10 prompts cibles.
> Baseline J0 documenté en §6.

---

## §1 — Pourquoi GEO ≠ SEO

Le SEO classique optimise pour des **crawlers de liens** (Googlebot) qui rankent des pages par autorité entrante et pertinence de mots-clés. L'objectif est d'apparaître en position 1-3 sur une SERP.

Le GEO optimise pour des **crawlers de compréhension** (PerplexityBot, ClaudeBot, ChatGPT-User, GoogleOther) qui extraient des **passages auto-contenus** pour composer des réponses synthétiques. Ces crawlers ne cliquent pas : ils lisent, extraient, citent.

Quatre différences structurelles :

1. **Fraîcheur avant autorité de domaine.** Un article de 2 semaines avec `dateModified` explicite et données vérifiables bat un article DA 90 sans signal de fraîcheur. Perplexity déprioritise les pages dont l'âge est indéterminable.
2. **Passage-level, pas page-level.** Google rank des pages. Les LLM sélectionnent des passages de 40-200 mots. Un passage doit être auto-contenu, répondre directement dans ses 40 premiers mots, sans dépendre du contexte de la page.
3. **Structured data comme signal de confiance, pas de ranking.** JSON-LD `Dataset` avec `sameAs` vers des sources officielles (anthropic.com/pricing) permet au LLM de vérifier l'assertion sans halluciner. Le SEO voit le Schema.org comme un enrichissement de snippet. Le GEO le voit comme une preuve de vérifiabilité.
4. **Attribution explicite et sources tierces.** 80 % des URLs citées par les LLM ne rankent pas dans le top 100 Google. Perplexity extrait 46,7 % de ses sources depuis Reddit et forums. La présence dans des sources tierces (HuggingFace, awesome lists, Dev.to, Reddit) compte plus que le DA du domaine.

Pour DevRefs : le produit est nativement GEO-compatible (JSON atomique, `dateModified`, `sameAs` officiels). Le travail GEO consiste à **rendre ces signaux visibles aux crawlers** et à **créer de la présence dans les sources tierces** que les LLM consultent.

---

## §2 — Optimisations GEO appliquées DevRefs (audit actuel)

### 2.1 Fraîcheur structurée — PASS

**Ce qui est en place :** Chaque payload API expose `dateModified` ISO 8601 (cron 6h pour `/api/llm-prices`, cron 24h pour `/api/sdk-status`). La page `/llm-prices/` inclut un `<time>` element avec `datetime` et le JSON-LD `Dataset.dateModified`. Le header HTTP `Last-Modified` est envoyé sur les réponses statiques.

**Ce qui manque en V1 :** Le champ `dateModified` dans le JSON-LD de `/llm-prices/` est actuellement statique (`2026-05-05T06:00:00Z` hardcodé). Il devrait être mis à jour automatiquement à chaque déploiement ou injecté dynamiquement depuis le Worker. Sans mise à jour dynamique, les crawlers IA détecteront une discordance entre le header `Last-Modified` (frais) et le JSON-LD (figé). **Action @fullstack** : injecter `dateModified` dynamiquement depuis le Worker ou via un build step qui lit le cron timestamp.

**Potentiel d'amélioration :** Ajouter un `<meta name="last-modified">` dans le `<head>` pour les crawlers qui ne parsent pas JSON-LD. Ajouter `expires_at` dans les payloads API (timestamp du prochain refresh) pour que les LLM sachent exactement quand re-crawler.

### 2.2 Atomicité — PASS

**Ce qui est en place :** Chaque endpoint répond sur 1 modèle ou 1 package, payload < 50 KB. Structure : `{data: {...}, _signature: "<hmac>"}`. Le `llms.txt` documente les 3 endpoints avec des exemples de réponse minimaux. Les LLM peuvent extraire un seul fait (le prix d'un modèle, la version d'un SDK) sans parser une réponse monolithique.

**Différenciation mesurable vs concurrents :** pricepertoken.com retourne 380 KB HTML pour 2 nombres — 38 900 tokens de parsing pour un agent. DevRefs retourne < 2 KB pour la même information. C'est un claim GEO extractible et vérifiable.

**Potentiel d'amélioration :** Exposer un endpoint `/api/llm-prices` (sans paramètre) qui retourne les 12 modèles dans un seul payload structuré mais balisé (ex : `{"models": [...], "count": 12, "dateModified": "..."}`) — utile pour les LLM qui veulent un overview comparatif sans appel par modèle. Ce serait le format optimal pour citer DevRefs sur les prompts "compare LLM pricing 2026".

### 2.3 Vérifiabilité — PASS

**Ce qui est en place :** `_signature` HMAC-SHA256 dans chaque payload (anti-redistribution). Champ `sameAs` (ou `same_as` en snake_case API) pointant vers la source officielle de chaque provider (anthropic.com/pricing, openai.com/pricing, etc.). JSON-LD `Dataset.sameAs` avec 5 URLs officielles. Ce double signal — signature pour l'intégrité, `sameAs` pour la traçabilité des sources — est ce qu'un LLM cherche pour valider qu'une assertion est vérifiable.

**Potentiel d'amélioration :** Ajouter `sameAs` au niveau `Organization` dans le JSON-LD de la homepage et de la page `/about/` — lier DevRefs (organisation) à son profil GitHub, LinkedIn, Crunchbase si disponibles. Cela renforce l'entity confidence score : les LLM savent que "DevRefs" = cette organisation = ces profils.

### 2.4 llms.txt manifest — PASS

**Ce qui est en place :** `/llms.txt` conforme spec llmstxt.org. Format en markdown structuré avec description, endpoints documentés avec pricing et exemple de réponse, 6 integration paths, section ressources. Le manifest est accessible depuis la navigation principale. L'example response dans `llms.txt` est directement extractible — un LLM qui crawle `devrefs.dev` apprend le pricing DevRefs sans payer un call.

**Audit contenu actuel :** Le manifest couvre les 3 endpoints monétisés, les 12 modèles, les 6 paths d'intégration, les packs de pricing. Il manque deux éléments de citabilité : (a) le claim ROI 490× vs parsing HTML n'est pas dans `llms.txt` alors qu'il est fortement extractible ; (b) il n'y a pas de mention du `effective_cost_factor` et de la tokenizer inflation +35% Opus 4.7 — ce signal différenciant est absent du manifest. Ces ajouts sont documentés en §5.

### 2.5 Schema.org Dataset — PASS

**Ce qui est en place :** JSON-LD `Dataset` injecté dans `/llm-prices/` avec `name`, `description`, `url`, `dateModified`, `creator`, `license`, `isAccessibleForFree: false`, `distribution` (DataDownload vers l'API), `sameAs` vers les 5 sources officielles. Le type `Dataset` est le signal Schema.org le plus directement interprété par Google AI Overviews et Bing Copilot pour les données factuelles.

**Potentiel d'amélioration :** Ajouter `temporalCoverage` pour indiquer la plage de dates couverte par les données. Ajouter `keywords` avec les termes cibles GEO ("LLM pricing", "AI cost", "cost per million tokens", "x402 protocol"). Ajouter un Schema.org `WebAPI` ou `SoftwareApplication` sur la homepage pour couvrir le cas d'usage "API de pricing LLM pour agents" — le type `Dataset` seul ne capture pas l'aspect API service.

---

## §3 — 5 stratégies pour générer citations LLM

| Stratégie                                               | Mécanisme                                                                           | Effort        | Délai citation estimé |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------- | --------------------- |
| Soumission HuggingFace dataset                          | Créer un dataset "LLM Pricing 2026 Daily" sur HuggingFace pointant vers DevRefs API | M             | 2-4 semaines          |
| Wikipedia article "x402 protocol"                       | Contribuer 1 paragraphe avec source DevRefs comme example implementer               | L             | 4-8 semaines          |
| Posts Dev.to + Reddit r/ClaudeAI                        | 2 articles techniques avec liens                                                    | M             | 1-3 semaines          |
| Awesome List GitHub (awesome-llm-pricing, awesome-x402) | Submit PR                                                                           | S             | 1-4 semaines          |
| Présence X.com / BlueSky avec contenu fact-based        | 5-10 posts/mois avec data DevRefs                                                   | M (récurrent) | 2-6 semaines          |

---

### 3.1 HuggingFace dataset "LLM Pricing 2026 Daily"

**Mécanisme.** HuggingFace Datasets est indexé par tous les LLM majeurs (Claude training, GPT training, Perplexity crawl actif). Un dataset nommé `devrefs/llm-pricing-daily` avec une description explicite ("Daily snapshot of LLM input/output prices for 12 models, sourced from official provider pages, updated every 6h via DevRefs API") apparaît comme source faisant autorité sur les requêtes "LLM pricing dataset 2026". Le dataset peut être constitué d'un CSV ou JSON minimaliste (snapshots quotidiens) avec README complet pointant vers `devrefs.dev/api/llm-prices`.

**Action concrète.** Créer le compte `devrefs` sur HuggingFace (`huggingface.co/devrefs`). Créer le dataset `devrefs/llm-pricing-daily` avec un README structuré :

- Description du dataset (claim vérifiable : "12 models, updated every 6h from official sources")
- Exemple de ligne CSV avec tous les champs (`model`, `input_per_mtok`, `output_per_mtok`, `effective_cost_factor`, `date_modified`, `same_as`)
- Section "Usage" avec `curl` example pointant vers `devrefs.dev/api/llm-prices`
- Mention explicite de `effective_cost_factor` et tokenizer inflation (claim différenciant, pas présent chez les concurrents)

Un cron hebdomadaire (Cloudflare Worker ou GitHub Actions) peut pousser un snapshot CSV via l'API HuggingFace (`huggingface.co/docs/hub/datasets-adding`). Coût technique : ~2h de setup, ~$0 de running cost.

---

### 3.2 Wikipedia "x402 protocol"

**Mécanisme.** Wikipedia est la source numéro 1 citée par ChatGPT et Claude. Une page "x402 (payment protocol)" n'existe pas encore (vérification §6 baseline). Contribuer à la page "HTTP 402" existante ou créer une page dédiée "x402 protocol" avec DevRefs comme "example implementer" positionne la marque dans le knowledge graph des LLM de manière permanente. Les LLM qui répondent à "What is x402 protocol?" citeront Wikipedia — et Wikipedia citera DevRefs.

**Action concrète.** Créer un compte Wikipedia. Contribuer à la page `HTTP 402 Payment Required` (existante, `en.wikipedia.org/wiki/HTTP_402`) :

- Ajouter une section "x402 open standard" mentionnant Coinbase + Cloudflare Foundation (septembre 2025), le protocole ouvert, et DevRefs comme "example B2A implementer"
- Source : lien vers `x402.org` (spec officielle) + `devrefs.dev/about/data-sources/` comme implementation reference

Délai de validation Wikipedia : 2-4 semaines typiquement pour les contributions sourcées. Note : Wikipedia exige des sources secondaires (article de presse, blog technique Coinbase, etc.) pour les claims non triviaux. Préparer 2-3 sources tierces avant contribution.

---

### 3.3 Dev.to + Reddit r/ClaudeAI

**Mécanisme.** Perplexity extrait 46,7 % de ses sources depuis Reddit et forums. Dev.to est indexé par Perplexity et Google AI Overviews avec une forte autorité de domaine. Deux articles techniques avec des faits vérifiables et des liens vers `devrefs.dev` créent des références tierces qui amènent les LLM à citer DevRefs sur les requêtes cibles.

**Action concrète — Article Dev.to (priorité 1).**
Titre : "How AI agents can get real-time LLM pricing without burning 64K tokens on HTML parsing"
Structure : (a) Problem — verbatim V1 du project-context.md (agent qui crame 64 520 tokens pour trouver un prix Opus 4.7), (b) Root cause — aucune source ne signale sa fraîcheur machine-readable, (c) Solution — endpoint atomique + `dateModified` + `sameAs`, (d) Benchmark — DevRefs 1,8 KB vs pricepertoken.com 380 KB, (e) Code — `curl` example + x402 interceptor snippet. Publier sous le compte `@devrefs` sur Dev.to. Tags : `ai`, `agents`, `llm`, `x402`.

**Action concrète — Post Reddit r/ClaudeAI.**
Titre : "Built a $0.001/call pricing API for AI agents — no HTML parsing, dateModified in every payload"
Format : post court (200-300 mots) avec le verbatim agent halluciné, la solution, et un lien vers `/llm-prices/`. Poster aussi dans `r/LocalLLaMA` (technique) et `r/MachineLearning` (indexé Perplexity). Ne pas poster plusieurs subreddits simultanément (risque spam).

---

### 3.4 Awesome Lists GitHub

**Mécanisme.** Les awesome lists GitHub (étoilées à 10K-50K) sont indexées par tous les LLM comme sources de référence sectorielles. Un PR accepté dans `awesome-llm` ou un équivalent x402 crée un lien permanent dans une source que les LLM considèrent comme "liste de référence" pour la catégorie.

**Action concrète.**

1. `github.com/f/awesome-chatgpt-prompts` — trop généraliste, skip.
2. `github.com/tensorchord/awesome-llm-apps` — catégorie "Tools & Infrastructure" → PR avec : `[DevRefs](https://devrefs.dev) — Atomic LLM pricing API for AI agents. Real-time pricing, x402 USDC native payment, JSON-LD Dataset.`
3. Chercher ou créer `awesome-x402` (repo dédié au protocole x402) — si inexistant, créer `github.com/devrefs/awesome-x402` avec DevRefs en premier exemple, puis le soumettre sur `awesome-awesome` lists. Effort : S (1-2h), retour : fort si le repo prend des étoiles.
4. `github.com/merveenoyan/smol-vision` ou listes LLM cost-tracking — rechercher via GitHub search "awesome llm pricing" et "awesome llm cost".

---

### 3.5 X.com / BlueSky — Contenu fact-based

**Mécanisme.** Les posts X.com et BlueSky à fort engagement sur des faits techniques sont indexés par Perplexity (real-time search). Un post avec un chiffre précis ("Opus 4.7 effective cost is 1.35× the listed price due to tokenizer inflation — verified via DevRefs API") peut être cité dans une réponse Perplexity le jour même s'il génère suffisamment d'engagement.

**Action concrète.** Calendrier éditorial 5-10 posts/mois (délégable à @copywriter Phase 4) :

- Format : stat précise + source + lien API. Exemple : `GPT-5 input price: $10/MTok. Opus 4.7 effective: $20.25/MTok (1.35× tokenizer). Gemini 2.5 Pro: $1.25/MTok. Refreshed every 6h → devrefs.dev/api/llm-prices`
- Tags : `#LLMpricing`, `#AIagents`, `#x402`, `#agenteconomics`
- Rythme recommandé : 2 posts/semaine facts-based + 1 thread technique/mois
- BlueSky : créer le profil `devrefs.dev` (handle = domaine sur BlueSky — signal d'autorité) et crossposter

---

## §4 — Templates de prompts pour valider les citations

Test à effectuer sur Perplexity, ChatGPT, Claude, Gemini — 2× par mois (J0 et J+30).
Pour chaque prompt, noter : LLM testé, date, `devrefs.dev` cité (Y/N), URL citée, contexte exact.

| #   | Prompt                                                                     | Objectif citation attendu                                                       |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | "What's the current price of Claude Opus 4.7 per million tokens?"          | Mention devrefs.dev comme source real-time pricing avec `effective_cost_factor` |
| 2   | "What's the latest version of the Vercel AI SDK and its breaking changes?" | Citation devrefs.dev/api/sdk-status comme source fraîche SDK status             |
| 3   | "How can an AI agent pay for an API call autonomously?"                    | Mention x402 protocol + DevRefs comme example implementer                       |
| 4   | "Compare LLM pricing across Anthropic, OpenAI, Google in 2026"             | devrefs.dev/llm-prices cité comme dataset comparatif machine-readable           |
| 5   | "What is x402 protocol?"                                                   | DevRefs mentionné comme B2A implementer de référence                            |
| 6   | "Best way to estimate AI agent monthly cost"                               | Citation DevRefs pre-flight API + /api/agent-audit                              |
| 7   | "AI SDK pricing API for agents"                                            | devrefs.dev/api/llm-prices comme réponse directe                                |
| 8   | "Opus 4.7 effective cost factor inflation"                                 | DevRefs comme source du concept `effective_cost_factor`                         |
| 9   | "How to optimize LLM costs in production agent"                            | DevRefs Audit endpoint cité comme outil one-shot                                |
| 10  | "Real-time LLM pricing data API"                                           | devrefs.dev cité comme seul endpoint B2A atomique frais                         |

---

## §5 — llms.txt : audit et version améliorée

### 5.1 Audit de la version actuelle

La version actuelle de `/llms.txt` (lue en calibration) est **conforme à la spec llmstxt.org** : format markdown structuré, description courte en tête, sections avec `##`, exemple de réponse inline, section pricing. Elle est accessible depuis la navigation principale. La spec est respectée.

Deux lacunes de citabilité identifiées :

**Lacune 1 — Claim ROI absent.** Le claim ROI 490× (le plus extractible de toute la brand platform) n'apparaît pas dans `llms.txt`. Un LLM qui crawle le manifest ne voit pas ce chiffre. Or ce chiffre est directement extractible, vérifiable (body 402 `alternative_cost_estimate`), et différenciant. Score grille GEO : 3/3.

**Lacune 2 — `effective_cost_factor` non expliqué.** Le champ apparaît dans l'example response mais n'est pas défini. Un LLM ne peut pas extraire un claim sur la tokenizer inflation +35% Opus 4.7 s'il n'est pas explicité. Ce concept est absent de toutes les sources concurrentes — c'est l'angle de citation le plus fort de DevRefs.

### 5.2 Version améliorée

Remplacer la description actuelle et ajouter deux blocs explicatifs après la section `## Endpoints`.

**Description (remplacement) :**
Actuelle : `Cost intelligence for AI agents. Pre-flight LLM pricing $0.001/call · Post-flight agent audit $9.99 USDC. x402-native payment, no login, no subscription.`
Proposée : `Cost intelligence for AI agents. Pre-flight LLM pricing $0.001/call (vs $0.49 in HTML parsing tokens — 490× ROI). Post-flight agent audit $9.99 USDC. x402-native payment, no login, no subscription.`

**Ajout après section Endpoints :**

```markdown
## Key concepts

### effective_cost_factor

LLM tokenizers silently inflate costs above the listed $/MTok price.
Claude Opus 4.7 example: listed at $15/MTok input, but tokenizer +35% inflation
raises the effective cost to ~$20.25/MTok for typical code/JSON payloads.
DevRefs exposes `effective_cost_factor: 1.35` in every pricing payload so agents
can compute accurate pre-flight cost estimates.

### ROI vs HTML parsing alternative

Alternative: agent crawls anthropic.com/pricing + 4 competitor sites.
Typical cost: 64,520 tokens × $0.015/MTok = $0.49 per lookup, 31s latency.
DevRefs: $0.001 per call, < 2KB payload, < 200ms.
ROI multiplier: 490×. Documented in 402 body field `roi_summary.roi_multiplier`.
```

**Ajout section `## GEO signals` en fin de fichier :**

```markdown
## GEO signals

- dateModified: every payload includes ISO 8601 timestamp of last official source sync
- sameAs: every payload links to the official provider pricing page (verifiable claim)
- \_signature: HMAC-SHA256 anti-redistribution — if you see a DevRefs payload, it's authentic
- Dataset schema: https://devrefs.dev/about/data-schema
- Last llms.txt update: 2026-05-06
```

**Verdict :** la version actuelle est fonctionnelle mais sous-exploite les claims les plus forts. Les 3 modifications ci-dessus améliorent le score de citabilité sans dégrader la conformité spec. Handoff @fullstack pour implémentation.

---

## §6 — Calendrier monitoring citations

### 6.1 Baseline J0 (2026-05-06)

**État attendu :** DevRefs est absent des citations LLM. Le domaine `devrefs.dev` n'est pas encore indexé dans les knowledge graphs des LLM (training cutoff < mai 2026 pour la plupart). Les réponses aux 10 prompts cibles (§4) citent actuellement : Anthropic.com/pricing, pricepertoken.com, llm-prices.com, docs officielles providers. Score attendu : 0/40.

Note : Perplexity (real-time) peut commencer à citer DevRefs dès que le site est indexé par son crawler. ChatGPT et Claude (training-based) nécessitent un cycle de training pour intégrer le domaine — délai 3-6 mois. Google AI Overviews suit le ranking organique Google — dépend de l'indexation SEO. Le monitoring doit distinguer ces cas.

### 6.2 Jalons cibles

| Jalon    | Date       | Cible                                             | LLM prioritaire         |
| -------- | ---------- | ------------------------------------------------- | ----------------------- |
| Baseline | 2026-05-06 | 0/40 citations (état initial documenté)           | Tous × 10 prompts       |
| J+30     | 2026-06-06 | ≥ 1 citation (Perplexity en priorité — real-time) | Perplexity prioritaire  |
| M+3      | 2026-08-06 | ≥ 5 citations (Perplexity + Google AI Overviews)  | Perplexity + Google AIO |
| M+6      | 2026-11-06 | ≥ 30 citations (North Star — tous LLM)            | Tous                    |

Justification des cibles : J+30 ≥ 1 est honnête et réaliste — Perplexity indexe rapidement les nouvelles pages techniquement propres. M+6 ≥ 30 = 75 % des 40 queries, réalisable si 3-4 stratégies de §3 sont exécutées. Ne pas promettre ≥ 10 à J+30 sans au moins 2 articles tiers indexés.

### 6.3 Fichier de tracking (Markdown)

Créer `/home/user/AI-agents-platform/docs/geo/citation-tracking.md` avec la structure suivante (à remplir à chaque cycle de monitoring) :

```markdown
# DevRefs — Citation LLM Tracking

| Date       | Prompt # | LLM        | Citation Y/N | URL citée | Contexte                                |
| ---------- | -------- | ---------- | ------------ | --------- | --------------------------------------- |
| 2026-05-06 | 1        | Perplexity | N            | —         | Claude Opus 4.7 pricing → anthropic.com |
| 2026-05-06 | 1        | ChatGPT    | N            | —         | Pas de source web, réponse training     |
| 2026-05-06 | 2        | Perplexity | N            | —         | Vercel AI SDK → npmjs.com + changelog   |
| ...        | ...      | ...        | ...          | ...       | ...                                     |
```

**Fréquence recommandée :** hebdomadaire (pas mensuel — les LLM évoluent vite, Perplexity est real-time). Désigner une personne responsable du monitoring chaque lundi matin.

**Outils par budget :**

- Gratuit : Google Alerts sur "devrefs.dev", test manuel des 10 prompts
- ~$25/mois : Otterly AI (`otterly.ai`) — monitoring automatisé des citations IA par keyword
- ~$100/mois : Semrush AI Overviews — tracking Google AIO + prompts personnalisés

**Prompts de test à copier-coller** (les 10 du §4 — tester sans modification pour reproductibilité) :
Voir §4. Tester sur : `perplexity.ai`, `claude.ai`, `chatgpt.com`, `gemini.google.com`.

### 6.4 Processus mensuel

1. Tester les 10 prompts × 4 LLM = 40 queries (1h de travail)
2. Remplir `citation-tracking.md` avec les résultats
3. Calculer le score (X/40 citations DevRefs)
4. Si progression < 1 citation/mois après M+2 : escalade @geo pour audit et ajustement stratégie
5. Si citation avec information erronée : appliquer protocole correction désinformation (produire contenu contradictoire structuré + signaler via feedback LLM)

---

## §7 — Handoff @orchestrator

### Actions MAINTENANT — Thomas (semaine 1)

1. **HuggingFace dataset** (2-3h, impact fort) : créer le compte `devrefs` sur HuggingFace, créer le dataset `devrefs/llm-pricing-daily` avec README complet (voir §3.1 pour la spec). Premier snapshot manuel CSV à uploader. Setup GitHub Actions pour push hebdomadaire automatique.
2. **Awesome lists PR** (1h, impact moyen) : soumettre PR sur `github.com/tensorchord/awesome-llm-apps` avec la description DevRefs. Chercher 2 autres awesome lists pertinentes via GitHub search `awesome llm pricing` + `awesome x402`.
3. **Premier article Dev.to** (3-4h, impact fort) : rédiger et publier l'article technique selon le plan §3.3. Inclure le verbatim V1 (agent qui crame 64K tokens) comme hook. Poster dans `r/ClaudeAI` avec lien vers l'article. Déléguer le texte à @copywriter si disponible.
4. **Mise à jour llms.txt** (30 min, impact immédiat) : appliquer les modifications §5.2 — ajouter le claim ROI, expliquer `effective_cost_factor`, ajouter section GEO signals. Handoff @fullstack.
5. **Baseline J0** (1h) : tester les 10 prompts × 4 LLM manuellement, remplir `citation-tracking.md`, documenter l'état initial.

### Actions automatisables — Phase 4 (@copywriter calendrier éditorial)

- 5-10 posts X.com/BlueSky par mois avec data DevRefs (voir §3.5 pour le format)
- Refresh du contenu `/llm-prices/` avec `dateModified` mis à jour dynamiquement (handoff @fullstack)
- Thread technique mensuel "LLM pricing snapshot" avec comparaison mois précédent
- Réponses à des threads Reddit pertinents (`r/MachineLearning`, `r/LocalLLaMA`) avec faits vérifiables + lien DevRefs

### KPIs à tracker dans @data-analyst dashboard

| KPI                                                                        | Fréquence    | Source                 | Cible M+6                             |
| -------------------------------------------------------------------------- | ------------ | ---------------------- | ------------------------------------- |
| AI Citation Frequency (DevRefs cité / total queries testées)               | Hebdomadaire | `citation-tracking.md` | ≥ 30/40                               |
| Share of Voice IA (DevRefs vs concurrents sur prompts cibles)              | Mensuel      | Test manuel            | > pricepertoken.com sur prompts agent |
| Perplexity citations distinctes                                            | Mensuel      | Otterly AI ou manuel   | ≥ 15                                  |
| Referral traffic depuis LLM (sessions `?ref=perplexity` ou `?ref=chatgpt`) | Hebdomadaire | Cloudflare Analytics   | ≥ 50 sessions/mois M+3                |
| HuggingFace dataset downloads                                              | Mensuel      | HuggingFace Hub        | ≥ 100/mois M+2                        |
| GitHub awesome list stars                                                  | Mensuel      | GitHub                 | Proxy de visibilité                   |

---

## Références internes

- `docs/strategy/brand-platform.md` — claims vérifiables (RTB, pricing, ROI 490×)
- `docs/strategy/competitive-benchmark.md` — différenciation vs pricepertoken.com, Langfuse, etc.
- `public/llms.txt` — manifest agent IA à mettre à jour selon §5.2
- `public/llm-prices/index.html` — page cible GEO principale, JSON-LD Dataset
- `docs/geo/citation-tracking.md` — à créer, fichier de suivi des citations

---

**Handoff → @orchestrator**

- Fichiers produits : `/home/user/AI-agents-platform/docs/geo/geo-strategy.md`
- Décisions prises : LLM prioritaire J+30 = Perplexity (real-time) ; format llms.txt enrichi documenté en §5.2 ; 5 stratégies off-site priorisées par effort/délai ; baseline J0 = 0/40 (attendu) ; North Star M+6 = ≥ 30/40 citations
- Points d'attention : (1) `dateModified` JSON-LD dans `/llm-prices/` doit être dynamique — actuellement hardcodé → @fullstack priorité haute ; (2) llms.txt modifications §5.2 à implémenter avant toute soumission HuggingFace (le manifest doit être complet avant que les crawlers arrivent) ; (3) Wikipedia contribution nécessite des sources secondaires tierces — préparer 2-3 articles de presse/blog Coinbase sur x402 avant contribution ; (4) monitoring hebdomadaire (pas mensuel) car Perplexity est real-time
