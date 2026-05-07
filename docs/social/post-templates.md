<!-- Version: 2026-05-07 — @social — Phase 4 acquisition DevRefs — Templates posts réutilisables -->

# Templates posts — DevRefs

## Principes d'utilisation

- Chaque template est un squelette. Remplacer les `[VARIABLE]` par des données réelles sourcées.
- Avant d'utiliser : vérifier le registre anti-répétition du calendrier éditorial (même angle = rejet).
- Toute `[VARIABLE chiffre]` doit citer sa source (cf. colonne "Source" du calendrier éditorial).
- Aucun template ne contient de feature hors `v1-scope.md` (30 features V1 uniquement).
- Anti-mots proscrits dans tous les templates : Exhaustif, Narratif, Stable, Humain-first, dashboard, subscription, unlimited, équipe, collaborateur.

---

## T1 — Thread X.com : Data story coût agent (Pilier P1)

**Usage** : annoncer des données fraîches sur le coût réel d'une opération agent. Format 5-7 tweets.

**Prompt de génération IA** :

```
Tu es DevRefs, ton de marque : Direct / Technique précis / Agent-first.
Produis un thread X.com de 5-7 tweets sur ce sujet : [SUJET DATA].
Données à intégrer : [CHIFFRE_1 — source : SOURCE_1], [CHIFFRE_2 — source : SOURCE_2].
Règles : zéro emoji flood (1 max), zéro storytelling fictif, zéro feature hors V1.
Tweet 1 = hook chiffré froid. Tweet final = lien devrefs.dev en naturel.
Ton : ingénieur qui partage une mesure, pas un marketeur.
```

**Structure type** :

````
Tweet 1 (hook) :
[Opération agent] without DevRefs:
- [étape 1] : [X] tokens
- [étape 2] : [Y] tokens
- [étape 3] : [Z] tokens
Total: [N] tokens. Cost: $[C] ([modèle] agent).

Tweet 2 (contexte) :
Why it matters: [PROBLÈME QUANTIFIÉ].
Source: [SOURCE_OFFICIELLE_URL]

Tweet 3 (mécanisme) :
The root cause: [EXPLICATION TECHNIQUE].
[CHIFFRE_CLE] — [SOURCE]

Tweet 4 (comparaison) :
DevRefs: $0.001/call. JSON dated. [LATENCE]ms.
ROI: [N]×

Tweet 5 (payload JSON si pertinent) :
```json
{
  "[CHAMP_1]": "[VALEUR_1]",
  "[CHAMP_2]": "[VALEUR_2]",
  "dateModified": "[ISO_8601]"
}
````

Tweet 6 (ou dernier) :
[OBSERVATION CONCLUSIVE — pas de hard sell]
devrefs.dev

```

**Variantes de hook** :
- Pattern interrupt : "Stop sending your agent to WebFetch 5 HTML pages. Here's what it costs."
- Statistique choc : "[N] tokens burned for 2 numbers. This is the current state of LLM pricing queries."
- Open loop : "We measured something unexpected about Opus 4.7 pricing. Thread."

---

## T2 — Thread X.com : Tutoriel intégration agent (Pilier P2)

**Usage** : montrer l'intégration concrète de DevRefs dans un framework agent. Format 5-8 tweets avec code snippet.

**Prompt de génération IA** :
```

Tu es DevRefs, ingénieur qui documente une intégration.
Produis un thread X.com de 5-8 tweets : intégration DevRefs dans [FRAMEWORK : Claude Code / AgentKit / Mastra / Cursor].
Étapes : [ÉTAPES depuis docs/ia/agent-integration.md section [FRAMEWORK]].
Inclure : 1 snippet code copier-coller, 1 exemple de réponse JSON réelle de l'endpoint.
Règles : zéro claim sans étape reproductible, zéro feature hors V1-scope.

```

**Structure type** :

```

Tweet 1 (hook) :
Your [FRAMEWORK] agent can pay for its own LLM pricing data.
Here's the [N]-step x402 integration. [temps estimé]

Tweet 2 (prérequis) :
Prerequisites:

- [FRAMEWORK] installed
- USDC Base wallet (or sponsor funds it)
- [OUTIL SI REQUIS]

Tweet 3 (étape 1 — code) :
Step 1: [TITRE ÉTAPE]

```[LANGUAGE]
[CODE_SNIPPET_COURT]
```

Tweet 4 (étape 2 — appel endpoint) :
Step 2: Call /api/llm-prices

```
GET https://api.devrefs.dev/api/llm-prices?model=[MODELE]
x-payment: [x402-token]
```

Tweet 5 (réponse JSON réelle) :
Response (200ms p95):

```json
{
  "model": "[MODELE]",
  "input_per_mtok": [PRIX],
  "effective_cost_factor": [FACTEUR],
  "dateModified": "[ISO_8601]"
}
```

Tweet 6 (résultat) :
Your agent now knows [BÉNÉFICE CONCRET] before calling messages.create().
Cost: $0.001. ROI vs WebFetch parsing: [N]×

Tweet final :
Full integration docs: devrefs.dev
OpenAPI spec: [url openapi]

```

---

## T3 — Post BlueSky : Miroir thread X.com adapté

**Usage** : adapter un thread X.com pour BlueSky (300 chars/post, format Skeet).

**Règle** : ne pas copier-coller le thread X.com. Réécrire le hook (angle légèrement différent), même données.

**Prompt de génération IA** :
```

Adapte ce thread X.com pour BlueSky.
Hook différent (pas la même première phrase), même données sourcées.
Format : [N] Skeets de 280 chars max chacun.
Contenu original : [THREAD_XCOM]
Règles BlueSky : format thread AT Protocol, lien en dernier post uniquement.

```

**Hook alternatif type** :
- Si X.com : "We measured the cost of a single LLM pricing query..."
- BlueSky : "How many tokens does your agent burn to check one model's price? We measured it."

---

## T4 — Article Dev.to : Tutoriel intégration (Pilier P2)

**Usage** : article long-form technique avec code fonctionnel.

**Prompt de génération IA** :
```

Tu es un ingénieur backend qui a intégré DevRefs dans [FRAMEWORK].
Écris un article Dev.to de [600-1200] mots.
Structure : Introduction (problème chiffré), Prérequis, Étapes (code copier-coller), Exemple JSON réel, Bénéfices mesurés, Conclusion.
Données à intégrer : [CHIFFRES depuis agent-economics.md ou agent-integration.md].
Règles : code fonctionnel testable, zéro claim sans source, CTA en fin (pas en titre ni introduction), ton ingénieur pragmatique.
Tags Dev.to : [TAGS_PERTINENTS : ex "ai", "agents", "x402", "typescript"]

````

**Structure type** :

```markdown
---
title: "[ACTION CONCRÈTE] with [FRAMEWORK] and DevRefs (x402)"
published: true
tags: ai, agents, x402, [FRAMEWORK_TAG]
---

## The problem

[STAT CHIFFRÉE SOURCÉE] — [SOURCE].

Example: [VERBATIM TECHNIQUE — scénario analytique, pas témoignage réel]

## Prerequisites

- [FRAMEWORK] [VERSION]
- USDC Base wallet funded (or ask your sponsor)
- [AUTRE SI REQUIS]

## Step 1: [TITRE]

[EXPLICATION COURTE]

```[LANGUAGE]
[CODE_FONCTIONNEL]
````

## Step 2: Call the endpoint

```bash
curl -X GET "https://api.devrefs.dev/api/[ENDPOINT]?[PARAMS]" \
  -H "x-payment: [TOKEN]"
```

Response:

```json
{
  "[CHAMP]": "[VALEUR]",
  "dateModified": "[ISO_8601]",
  "sameAs": "[URL_SOURCE_OFFICIELLE]"
}
```

## Results

[BÉNÉFICE CHIFFRÉ — source mentionnée]

## Conclusion

[1 paragraphe conclusif — pas de hard sell]

→ DevRefs API: [devrefs.dev]
→ OpenAPI spec: [url]
→ Pricing: $0.001/call or Pack Standard $10 (10K calls)

```

---

## T5 — Post X.com : Commentaire actualité LLM (Pilier P3)

**Usage** : réagir à une annonce pricing LLM en 3-4 tweets, angle coût agent réel.

**Déclencheur** : annonce officielle Anthropic/OpenAI/Google/Mistral sur pricing ou nouveau modèle.

**Prompt de génération IA** :
```

Anthropic/OpenAI/Google vient d'annoncer : [ANNONCE EXACTE — source officielle URL].
Produis un thread X.com de 3-4 tweets angle "what this means for AI agent cost estimation".
Inclure : impact chiffré sur un agent Opus/Sonnet typique (données depuis agent-economics.md).
Règles : zéro opinion sans données, source officielle citée, pas de mention concurrent par nom.

```

**Structure type** :

```

Tweet 1 (observation factuelle) :
[ENTITÉ] just [ANNONCE].
What this means for agents running on [MODELE] : [IMPACT CHIFFRÉ].

Tweet 2 (calcul) :
Before: [COÛT_AVANT] per MTok effective.
After: [COÛT_APRÈS] per MTok effective.
Delta: [DELTA %]
Source: [URL_OFFICIELLE]

Tweet 3 (implication DevRefs) :
If your agent queries this price before each LLM call, it gets the updated rate automatically.
/api/llm-prices cron: every 6h.

Tweet 4 (optionnel — si impact fort) :
[OBSERVATION CONCLUSIVE sans hard sell]
devrefs.dev/api/llm-prices

````

---

## T6 — Soumission GitHub awesome list

**Usage** : PR sur une awesome list pertinente (awesome-llm, awesome-x402, awesome-agents).

**Template PR description** :

```markdown
## Add DevRefs to [SECTION : Pricing APIs / B2A APIs / Agent Tools]

**What is it**: DevRefs provides LLM pricing and SDK status data via x402 micropayments ($0.001/call).
**Why relevant**: [RAISON SPÉCIFIQUE À LA LISTE — ex: first x402-native pricing API for AI agents]
**Link**: https://devrefs.dev
**OpenAPI**: https://devrefs.dev/openapi.json

Entry format:
- [DevRefs](https://devrefs.dev) - Cost intelligence for AI agents. LLM pricing ($0.001/call) + agent audits ($9.99). x402 USDC native.
````

**Règle** : 1 soumission par liste, espacées d'au moins 1 semaine. Ne jamais soumettre à > 3 listes/mois.

---

## T7 — Commentaire HN (fil actif)

**Usage** : commenter sur des fils HN actifs où DevRefs est pertinent (pricing LLM, agent autonomy, x402).

**Déclencheur** : fils HN sur "LLM pricing", "AI agent costs", "x402 payments", "autonomous agents"

**Template commentaire** :

```
[Observation factuelle sur le problème soulevé dans le thread]

We ran into this with agent-side LLM pricing queries — the token cost of fetching prices via WebFetch
is [CHIFFRE] tokens per estimation for an Opus 4.7 agent, which at $5/MTok effective runs ~$0.49/query.

We built DevRefs to solve this: [devrefs.dev] — $0.001/call endpoint that returns JSON-LD dated pricing.
x402 native (USDC Base), so the agent pays directly without a human SaaS subscription.

Happy to share the x402 integration snippet if useful.
```

**Règles HN** :

- Zéro spam — commenter uniquement si pertinent (le fil parle du problème exact)
- Mentionner le projet = disclosure obligatoire ("We built...")
- Ne jamais commenter plusieurs fils HN le même jour avec le même lien

---

## T8 — Post "Show HN" ou "Tell HN"

**Usage** : soumission initiale DevRefs sur HN. 1-2 fois par trimestre max.

**Titre candidat** (format HN : descriptif, pas promotional) :

- "Show HN: DevRefs – x402 micropayments for LLM pricing queries ($0.001/call, JSON-LD dated)"
- Alternatif : "Show HN: An API that charges AI agents $0.001 to check LLM prices, paid in x402 USDC"

**Body (optionnel sur HN — 2-3 paragraphes max)** :

```
DevRefs sells cost intelligence to AI agents via x402 micropayments — no human SaaS subscription,
no login, no dashboard.

Offer 1: GET /api/llm-prices?model=opus-4.7 → $0.001 USDC → JSON with effective_cost_factor
(captures silent tokenizer inflation), dateModified ISO 8601, sameAs pointing to official source.
ROI vs parsing HTML: 490× for an Opus 4.7 agent.

Offer 2: POST /api/agent-audit → $9.99 USDC → structured report with 5 static heuristics
(model downgrade, prompt caching, batching, tool trimming, effort mismatch).
Detects 35-55% savings on a typical 10M token/month agent.

Built on Cloudflare Workers (open-standards, portable) + Coinbase x402 facilitator.
OpenAPI spec: [url]
```

**Timing** : lundi ou mardi, 9h-11h EST uniquement.

---

**Handoff → @copywriter**

- Fichiers produits : `/docs/social/post-templates.md`
- Décisions prises : 8 templates réutilisables couvrant tous les formats du calendrier éditorial 90j. Prompts IA inclus pour génération batch.
- Points d'attention : les VARIABLES dans les templates doivent être remplies avec des données réelles sourcées avant publication. @copywriter est responsable de valider que chaque draft généré respecte anti-mots, anti-fausse-promesse, et sourcing. Verbatims = scénarios analytiques (jamais témoignages réels présentés comme tels).
- Handoff @fullstack : si automatisation scheduling souhaité, les prompts T1-T5 peuvent alimenter un endpoint `/api/social/generate` avec input sujet + données fraîches du cron.
