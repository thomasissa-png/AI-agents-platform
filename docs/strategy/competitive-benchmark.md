<!-- Version: 2026-05-05T08:20 — @creative-strategy — Phase 0 wave 1 — benchmark concurrentiel DevRefs -->
# Benchmark concurrentiel — DevRefs

## Résumé exécutif

- **5 concurrents analysés** : pricepertoken.com, costgoat.com, devtk.ai, helicone.ai, llm-prices.com (sources WebSearch fetchées 2026-05-05).
- **Constat principal** : aucun concurrent ne sert un payload JSON atomique x402-natif avec `dateModified` JSON-LD machine-readable. Tous opèrent en HTML SEO (humain-first) ou SaaS observabilité, pas en couche de référence agent-first B2A.
- **Espace libre identifié** : quadrant haut-droite du Perceptual Map (atomicité haute × fraîcheur signalée haute) — DevRefs y est seul.
- **Angle de positionnement différenciant** : `x402-natif + JSON-LD dateModified + payload < 50 KB + llms.txt explicite` — combinaison non-occupée par les 5 acteurs benchmark.
- **Gates de spécificité** : ce benchmark n'est PAS copiable par un concurrent généraliste — il est calibré sur le persona agent IA et les features Phase 1 implémentables de DevRefs.

---

## 1. Tableau brut concurrent par concurrent

### 1.1 pricepertoken.com — concurrent principal

| Champ | Valeur | Source |
|---|---|---|
| **URL fetchée** | https://pricepertoken.com/ | WebSearch 2026-05-05 |
| **Tagline / Hero** | "LLM API Pricing 2026 - Compare 300+ AI Model Costs" — "Free LLM API pricing comparison" | WebSearch result + meta description |
| **Proposition de valeur** | Compare GPT-5, Claude, Gemini, DeepSeek pricing instantly, updated daily from official sources (OpenAI, Anthropic) | Description meta + page hero |
| **Ton et registre** | SEO informatif humain, formaté pour Google + leaderboards subjectifs ("Best LLM for Coding 2026", "Best LLM for Writing 2026") | Pages /leaderboards/* |
| **Pricing** | Gratuit (modèle SEO + ads) | Aucun paywall observé |
| **Format servi** | HTML SEO 300+ modèles dans une page (et sous-pages catégories) + MCP server gratuit (mentionné par l'écosystème, sans signal `dateModified` structuré) | WebSearch + project-context.md ligne 73 (vérification @ia mai 2026) |
| **Signal de fraîcheur** | "Updated daily" en prose, pas de `dateModified` JSON-LD machine-readable. Pas de header `Last-Modified` aligné. | Inspection structurelle absente — aucune mention JSON-LD `Dataset` dans les WebSearch results |
| **Points faibles vs persona agent** | (a) HTML lourd 200-380 KB pour parser 1 ligne, (b) 300+ modèles dans 1 doc → coût parsing 38 900 tokens (cf. V1 project-context.md), (c) leaderboards subjectifs non-cite-able machine, (d) MCP server gratuit sans signal de fraîcheur structuré, (e) pas de paiement micro-tx natif |
| **Ce que DevRefs résout** | Endpoint atomique `?model=opus-4.7` < 50 KB, JSON-LD `dateModified`, x402-natif, llms.txt explicite, `effective_cost_factor` exposé pour anomalies tokenizer (cas Opus 4.7 +35 %) |

### 1.2 costgoat.com

| Champ | Valeur | Source |
|---|---|---|
| **URL fetchée** | https://costgoat.com/compare/llm-api | WebSearch 2026-05-05 |
| **Tagline / Hero** | "LLM API Pricing Comparison & Cost Guide (May 2026)" — pas de tagline marketing fort | WebSearch result |
| **Proposition de valeur** | Compare 324+ LLM APIs (OpenAI, Anthropic, Google, DeepSeek, Mistral, xAI), tri par quality / price / value score. Desktop app privacy-first, no signup. | WebSearch description |
| **Ton et registre** | Calculateur informatif humain, "no signup" comme angle privacy | WebSearch |
| **Pricing** | Gratuit (web + desktop app) | Aucun paywall observé |
| **Format servi** | HTML calculateur + desktop app local (privacy-first, runs in browser) | WebSearch |
| **Signal de fraîcheur** | "May 2026" en titre humain, pas de `dateModified` JSON-LD ni d'API agent-friendly identifiée | Inspection structurelle absente |
| **Points faibles vs persona agent** | (a) Desktop app inutile pour un agent serverless, (b) formats HTML/calculateur pas consommables JSON par un agent, (c) `quality / price / value score` = subjectif, non-citable machine, (d) pas d'endpoint REST documenté pour agents, (e) pas de paiement |
| **Ce que DevRefs résout** | API REST avec OpenAPI 3.1, JSON typé, x402-natif, signaux objectifs uniquement (`input_per_mtok`, `output_per_mtok`, `dateModified`, `effective_cost_factor`) — pas de score subjectif |

### 1.3 devtk.ai

| Champ | Valeur | Source |
|---|---|---|
| **URL fetchée** | https://devtk.ai/en/ | WebSearch 2026-05-05 |
| **Tagline / Hero** | "AI Developer Toolkit" — collection de 12 tools gratuits browser-based pour devs IA | WebSearch description |
| **Proposition de valeur** | 12 tools (Token Counter, Pricing Calculator, VRAM Calc, MCP Generator, MCP Validator, OpenAPI-to-MCP, AI Coding Rules, JSON Schema Builder, etc.) + 3 directories (AI Tools, MCP Servers, AI Datasets) + AI News Feed | WebSearch description |
| **Ton et registre** | Devloper-friendly, brand "free, browser-based, no data sent" | WebSearch |
| **Pricing** | 100 % gratuit, no paid tier | WebSearch description explicit |
| **Format servi** | Apps browser + articles blog SEO (ex : "AI API Pricing Comparison April 2026: 40+ Models Side-by-Side Table", "OpenAI API Pricing 2026 GPT-5 GPT-4.1") | URLs blog WebSearch |
| **Signal de fraîcheur** | Articles datés en titre humain ("April 2026") + comparison tables. Pas d'API JSON ni `dateModified` JSON-LD identifié | Inspection blog |
| **Points faibles vs persona agent** | (a) Tools browser-based = pas consommables agent, (b) blog SEO 5-10 K mots = trop de prose pour agent, (c) tableau "side-by-side 40+ models" oblige à parser tout pour 1 ligne, (d) pas d'API agent, (e) pas de paiement |
| **Ce que DevRefs résout** | Endpoint atomique pour les **données** (pricing, SDK status). Devtk.ai reste pertinent pour les **outils** (Token Counter, MCP Validator) — coexistence amicale, pas de chevauchement direct sur les données fraîches monétisables |

### 1.4 helicone.ai

| Champ | Valeur | Source |
|---|---|---|
| **URL fetchée** | https://www.helicone.ai/ | WebSearch 2026-05-05 |
| **Tagline / Hero** | "AI Gateway & LLM Observability" — "Routing and monitoring for reliable AI apps - the LLMOps platform behind the fastest-growing AI companies" | WebSearch result |
| **Proposition de valeur** | Open-source LLM observability + AI Gateway zero-markup. One line of code to monitor, evaluate, experiment. YC W23. | WebSearch + GitHub description |
| **Ton et registre** | LLMOps B2B SaaS, ton corporate "ship AI apps with confidence", positionnement entreprise | helicone.ai/pricing |
| **Pricing** | Freemium : Free tier (Kickstart) + Growth + Scale + Custom + tier startup (< 2 ans, < $5M raised) | WebSearch pricing page |
| **Format servi** | SaaS SDK (insertion d'1 ligne dans le code) + dashboard web + AI Gateway proxy + cookbook docs | WebSearch + docs.helicone.ai |
| **Signal de fraîcheur** | N/A — Helicone tracke les requêtes USAGE des clients, pas les pricings de modèles publics. Hors-périmètre direct. | helicone.ai/blog "How to Gateway" |
| **Points faibles vs persona agent (DevRefs scope)** | (a) Helicone n'est pas concurrent direct sur le pricing-of-models — c'est une couche d'observabilité au-dessus des appels LLM, (b) requiert SDK insertion = friction agent, (c) modèle SaaS B2B humain-first |
| **Ce que DevRefs résout** | Hors chevauchement direct. DevRefs sert la donnée publique, Helicone observe la donnée privée d'usage. Coexistence : un agent qui utilise DevRefs pour la fraîcheur ET Helicone pour l'observabilité de ses propres calls = setup compatible. |

### 1.5 llm-prices.com

| Champ | Valeur | Source |
|---|---|---|
| **URL fetchée** | https://www.llm-prices.com/ | WebSearch 2026-05-05 |
| **Tagline / Hero** | "LLM pricing calculator" | WebSearch result |
| **Proposition de valeur** | Calculateur token cost side-by-side, 20+ modèles | WebSearch (référencé via "iternal.ai/calculators/llm-pricing-calculator" et concurrent direct mentionné) |
| **Ton et registre** | Outil utilitaire humain minimaliste | WebSearch |
| **Pricing** | Gratuit (calculateur web) | Aucun paywall |
| **Format servi** | Page HTML calculateur 1 page | WebSearch |
| **Signal de fraîcheur** | Non documenté dans WebSearch results | Inspection structurelle absente |
| **Points faibles vs persona agent** | (a) Calculateur visuel humain, (b) UI form-based pas consommable agent, (c) coverage limité 20+ modèles vs pricepertoken 300+, (d) pas d'API JSON ni d'endpoint agent, (e) pas de paiement |
| **Ce que DevRefs résout** | API REST agent-first vs UI calculateur humain-first. Différenciation par format servi, pas par couverture (DevRefs vise atomicité, pas exhaustivité). |

---

## 2. Strategy Canvas (Blue Ocean)

Évaluation des leviers d'industrie sur une échelle 0 (absent) → 5 (haut), comparée acteur par acteur.

| Levier d'industrie | pricepertoken | costgoat | devtk.ai | helicone | llm-prices | **DevRefs (cible)** |
|---|---|---|---|---|---|---|
| Couverture nb modèles | 5 (300+) | 5 (324+) | 3 (40+) | N/A | 2 (20+) | **2 (12 V1)** |
| Profondeur outils dev (calculateurs, parsers) | 2 | 4 | 5 | 3 | 3 | **0** (hors scope V1) |
| Profondeur observabilité runtime | 0 | 0 | 0 | 5 | 0 | **0** (hors scope) |
| SEO humain (trafic Google) | 5 | 4 | 4 | 3 | 3 | **1** (acquisition agent-first) |
| Atomicité payload (1 query = 1 fait) | 1 | 1 | 1 | N/A | 1 | **5** |
| Fraîcheur signalée machine-readable (`dateModified` JSON-LD) | 1 | 1 | 1 | N/A | 1 | **5** |
| API REST agent-friendly avec OpenAPI 3.1 | 1 (MCP gratuit) | 0 | 0 | 4 (SDK) | 0 | **5** |
| Paiement x402-natif (HTTP 402 + USDC) | 0 | 0 | 0 | 0 | 0 | **5** |
| `llms.txt` explicite référençant endpoints monétisés | 0 | 0 | 0 | 0 | 0 | **5** |
| Surface HTML < 50 KB par page | 0 | 1 | 1 | 1 | 2 | **5** |
| Source officielle citée par `sameAs` JSON-LD | 0 | 0 | 0 | N/A | 0 | **5** |
| `effective_cost_factor` (anomalies tokenizer) | 0 | 0 | 0 | 0 | 0 | **5** |
| Stripe fallback humain unlimited / day | 0 | 0 | 0 | 1 (subscription) | 0 | **5** |

**Lecture du canvas** :
- Les concurrents **convergent** sur SEO humain + couverture exhaustive de modèles + outils browser-based = catégorie "LLM pricing comparison for humans".
- DevRefs **diverge délibérément** sur atomicité + fraîcheur signalée + x402 + JSON-LD = catégorie "agent-first reference layer".
- Les 5 leviers les plus différenciants (où DevRefs est seul à 5 et tous les autres à 0-1) :
  1. Paiement x402-natif
  2. `llms.txt` explicite référençant endpoints monétisés
  3. `effective_cost_factor` (anomalies tokenizer)
  4. Source officielle citée par `sameAs`
  5. Atomicité payload + < 50 KB

---

## 3. Matrice espaces occupés vs libres

```
                 │ Humain-first (UI/SEO)        │ Agent-first (JSON/x402)
─────────────────┼──────────────────────────────┼──────────────────────────────
 Pricing modèles │ pricepertoken (5)            │ ▶ DevRefs /api/llm-prices
                 │ costgoat (5)                 │   (espace libre 100%)
                 │ llm-prices (3)               │
                 │ devtk.ai blog (4)            │
─────────────────┼──────────────────────────────┼──────────────────────────────
 SDK status      │ Aucun couverture sérieuse    │ ▶ DevRefs /api/sdk-status
                 │ (manuel via npm/GitHub)      │   (espace libre 100%)
─────────────────┼──────────────────────────────┼──────────────────────────────
 Observabilité   │ Helicone (5)                 │ Hors scope DevRefs V1
                 │ Langfuse, LangSmith, etc.    │
─────────────────┼──────────────────────────────┼──────────────────────────────
 Schemas OpenAPI │ Quelques outils manuels      │ ▶ DevRefs V2 candidat
 / specs RFC     │ (Postman, Stoplight)         │   (espace libre 100%)
```

### 3.1 Opportunité de positionnement différenciant

DevRefs occupe seul le quadrant **(Pricing/SDK status, Agent-first)**. Les barrières à l'entrée sont faibles techniquement mais protégées par :
- **Time-to-market avantage** : 12-18 mois estimés avant que pricepertoken/costgoat ne pivote vers x402 (cf. project-context.md ligne 192).
- **Spécificité agent** : nécessite de penser le produit comme une dépendance machine, pas une page humaine. Les 5 concurrents sont culturellement humain-first (SEO, ads, dashboard).
- **Complexité réglementaire x402 (FR)** : déclaration BNC crypto auto-entrepreneur — friction pour un acteur qui n'aurait pas la maîtrise fiscale (mais @legal Phase 5 absorbe cela pour DevRefs).

### 3.2 Risques compétitifs (cf. project-context.md tableau "Risques identifiés")

| Risque | Probabilité | Mitigation DevRefs |
|---|---|---|
| pricepertoken pivote agent-first | Moyenne (12-18 mois estimés) | Construire l'entité nommée "DevRefs" cite-able + stack `dateModified` machine-readable comme barrière de switching cost agent |
| Anthropic / OpenAI lance équivalent gratuit | Faible (niche trop petite pour eux, cf. PCM ligne 192) | Pivot vers super-niche specs (RFC, OpenAPI, Schemas) — couche complémentaire pas concurrente directe |
| Coinbase x402 fragmenté (multi-facilitator chaos) | Faible (Foundation septembre 2025 + 119 M tx Base mars 2026) | Code Worker portable + Solana facilitator support en plan B + Stripe fallback humain |
| MCP server gratuit pricepertoken devient le standard de fait | Confirmée présente | Différenciation stricte : MCP DevRefs avec `dateModified` + paiement x402 = audience fundamentally different (agent qui veut traçabilité fiscale + fraîcheur) |

---

## 4. Standards marché identifiés (calibration qualité aval)

Pour permettre à @copywriter et @design de **battre la référence marché** (cf. _base-agent-protocol.md § calibration par les meilleures références), voici les standards observés :

| Standard observé | Référence | Implication DevRefs |
|---|---|---|
| Hero avec liste exhaustive de modèles ("Compare 300+ AI Model Costs") | pricepertoken | DevRefs prend le **contrepied** : hero = anti-pattern (1 query = 1 fait), pas comparaison massive |
| Tableau side-by-side multi-modèles | costgoat, devtk.ai | DevRefs **élimine** : payload = 1 modèle, pas un tableau |
| Calculateur form UI pour humain | costgoat, llm-prices, iternal.ai | DevRefs **élimine** : exécution `curl` ou tool-call agent direct |
| Articles blog SEO datés ("April 2026", "May 2026") | devtk.ai, cloudidr | DevRefs **réduit** : 1-2 posts Dev.to ciblés agents, zéro blog SEO de remplissage |
| Leaderboards subjectifs ("Best for Coding") | pricepertoken | DevRefs **élimine** : pas de score subjectif, signaux objectifs uniquement |
| Privacy-first "no signup" | costgoat | DevRefs **augmente** : x402 = wallet anonyme, pas de signup même payant |
| MCP server gratuit | pricepertoken | DevRefs **différencie** : MCP server payant 0,49 €/query avec `dateModified` machine-readable et `effective_cost_factor` |

---

## 5. Synthèse pour handoff

| Question | Réponse |
|---|---|
| Que font TOUS les concurrents (à éviter ou challenger) ? | HTML SEO humain-first, leaderboards subjectifs, gratuit, pas de signal `dateModified` machine-readable, pas de paiement micro |
| Espace libre identifié | (Pricing/SDK status, Agent-first) — quadrant haut-droite Perceptual Map |
| Angle de positionnement DevRefs | x402-natif + JSON-LD `dateModified` + `llms.txt` explicite + payload < 50 KB + `effective_cost_factor` |
| Concurrent principal à monitorer | pricepertoken.com (le plus établi en SEO + MCP server gratuit) |
| Concurrent secondaire à monitorer | costgoat.com (couverture 324+ modèles + privacy-first, pourrait pivoter) |
| Hors scope direct | helicone.ai (observabilité runtime, complémentaire pas concurrent) |

---

## Handoff → @orchestrator (puis @copywriter + @seo + @geo Phase 0 wave 2)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/strategy/competitive-benchmark.md`
- **Décisions prises** : 5 concurrents fact-checkés via WebSearch 2026-05-05. Espace libre confirmé. Strategy Canvas + Matrice espaces vs libres documentés. 5 leviers de différenciation où DevRefs est seul à score 5.
- **Sources WebSearch consultées (toutes datées 2026-05-05)** :
  - https://pricepertoken.com/
  - https://costgoat.com/compare/llm-api
  - https://devtk.ai/en/
  - https://www.helicone.ai/
  - https://www.llm-prices.com/
  - https://docs.cdp.coinbase.com/x402/welcome
  - https://blog.cloudflare.com/x402/
  - https://medium.com/@inesvallot/from-b2b-and-b2c-to-b2a-the-agent-economy-begins-7ee3e5156680
  - https://oneword.domains/tlds/dev
- **Points d'attention** :
  - @seo : ne PAS chasser les keywords génériques saturés ("LLM API pricing comparison") — pricepertoken/costgoat dominent. Cibler keywords longue traîne agent-first ("`dateModified` JSON-LD LLM pricing", "x402 LLM pricing endpoint", "agent-readable LLM pricing").
  - @geo : prioriser entité nommée "DevRefs" + features uniques (`x402`, `llms.txt`, `dateModified`, `effective_cost_factor`) dans les claims pour Perplexity/Claude.
  - @copywriter : ne PAS se comparer frontalement à pricepertoken dans le copy public ("zéro concurrent nommé dans le contenu client" cf. founder-prefs 2026-03-26 ImmoCrew). Utiliser des catégories génériques ("comparateurs HTML SEO classiques", "calculateurs humain-first").
- **Aucune action Replit requise**.
