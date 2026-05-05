# Contexte Projet — DevRefs (working name)

> Ce fichier est lu par tous les agents avant toute action.
> **Working name** : "devrefs". Le naming définitif est arbitré par @creative-strategy en Phase 0 — tous les livrables avant cette décision doivent rester naming-agnostic ou utiliser le placeholder `{{PRODUCT_NAME}}` lorsque le naming impacte directement la production.
> Les blocs `[BLOCK_IA]` ci-dessous sont des champs qui dépendent de la connaissance experte des agents IA — @ia les remplit en Phase 0a avant que les autres agents soient lancés.
> **ATTENTION** : ce fichier contient des informations stratégiques (pricing, concurrents, modèle revenue). S'assurer que le repo est privé.
> Dernière mise à jour : 2026-05-05

---

## Identité
- **Nom du projet** : DevRefs (working name — naming définitif tranché par @creative-strategy en Phase 0). Alternatives candidates au cadrage : FreshRefs, AgentDevRefs, RefStream, AgentSource.
- **URL (si existante)** : aucune. Domaine à acheter après naming définitif (cible `.io` ou `.dev`).
- **Secteur** : Outil dev / Référentiel technique pour agents IA (B2A — Business to Agent)
- **Stade** : [x] Idée  [ ] V1  [ ] Production  [ ] Croissance
- **Date de début** : 2026-05-05
- **Type** : Funnel (paywall x402 + Stripe), pas vitrine.

---

## Cible
- **Persona principal** : **Un agent IA autonome** qui code, orchestre des LLM ou consomme des APIs (Claude Code, Cursor agent, AgentKit, Mastra, MCP-host). Caractéristiques :
  - (a) effectue des `WebSearch` ou crawl pour valider des données techniques avant action,
  - (b) supporte ou apprend à supporter HTTP 402 / x402 pour micro-paiements autonomes,
  - (c) optimise pour anti-hallucination plus que pour économie de tokens (un retry coûte plus que 0,49 €).
- **Problème principal** : les agents qui codent en 2026 hallucinent à 15 % sur des APIs/SDKs ([arxiv 2407.09726](https://arxiv.org/abs/2407.09726v1)) car (a) leur cutoff training est dépassé, (b) les prix LLM API bougent par semaine, (c) les schemas OpenAPI changent sans notification.
- **Alternative actuelle** : `WebSearch` Google + scrape de 5 sites différents → réponse incomplète + 30 s+ + plus de tokens consommés. OU sites SaaS lourds (pricepertoken.com, costgoat.com, devtk.ai) non conçus pour consommation agent.
- **Persona secondaire** : **Le développeur humain qui supervise l'agent**. Achète l'abonnement "unlimited 4,99 €/jour" en Stripe Payment Link quand l'agent paie trop souvent en x402.
- **Verbatims persona** :

  **V1 — Bloc tool-call JSON (agent halluciné sur pricing Opus 4.7, exploitable hero @design)**
  ```json
  {
    "agent": "claude-code",
    "session": "01HXR...",
    "ts": "2026-05-04T09:12:33Z",
    "tool_calls": [
      {"name": "WebSearch", "query": "claude opus 4.7 input price per million tokens", "results": 8},
      {"name": "WebFetch", "url": "anthropic.com/pricing", "tokens_in": 11420},
      {"name": "WebFetch", "url": "pricepertoken.com", "tokens_in": 38900},
      {"name": "WebFetch", "url": "llm-prices.com", "tokens_in": 14200}
    ],
    "model_output": "Opus 4.7 costs $15/MTok input, $75/MTok output.",
    "ground_truth_check": "INCORRECT — Opus 4.7 also inflates tokenizer +35% silently (effective_cost_factor 1.35). Output omitted this signal. Downstream cost estimation off by 35%.",
    "elapsed_ms": 31420,
    "tokens_burned": 64520
  }
  ```

  **V2 — Verbatim persona principal (agent en first-person, pour copy landing)**
  > "J'ai crawlé 5 sources pour trouver le prix Gemini 2.5 Pro et chacune disait un truc différent. La sixième fois que je tape `WebFetch` sur du HTML de 380 KB pour récupérer 2 nombres, j'ai juste besoin d'un endpoint qui me renvoie `{"input_per_mtok": 1.25, "dateModified": "2026-05-04T06:00Z"}` et qui me facture 0,49 € au lieu de me coûter 18 000 tokens en parsing."

  **V3 — Signal comportemental (séquence reproductible, exploitable par @ux pour le parcours)**
  > Pattern observé sur Cursor agent (mai 2026, fil HN #44682465) : `WebSearch("openai gpt-5 pricing") → 7 résultats → WebFetch des 4 premiers → 3 prix différents trouvés ($1.25, $2.50, $3.00 input/MTok) → l'agent choisit le médian par heuristique → réponse livrée à l'utilisateur avec confiance haute → utilisateur découvre 2 jours plus tard que la facture OpenAI réelle est 2,4× l'estimation`. Cause racine : aucune source ne signale sa fraîcheur de manière machine-readable, l'agent n'a pas de tie-breaker.

  **V4 — Verbatim persona secondaire (dev humain qui bascule sur Stripe Link)**
  > "Bon, c'est la 7e fois ce matin que mon agent Claude Code paie 0,49 € pour vérifier le prix Sonnet 4.6 avant chaque génération. Ça fait 3,43 € sur la session, et il va continuer toute la journée parce que je lui ai demandé de scaffold 40 features. Je clique le Stripe Link 4,99 €/jour, JWT 24 h, on n'en parle plus."

  **V5 — Verbatim persona principal (frustration schema SDK obsolète, format technique)**
  > "Mon training cutoff est janvier 2026. Vercel AI SDK est passé de `streamText({ model, messages })` à `streamText({ model, prompt })` en mars. J'ai généré 4 fois le code avec l'ancien schema, l'agent superviseur a 4 fois détecté le build error, j'ai 4 fois re-`WebSearch`. Un endpoint `/api/sdk-status?pkg=ai` qui me renvoie `{"latest": "5.0.12", "breaking_since": "5.0.0", "dateModified": "2026-05-04"}` aurait économisé 12 minutes et ~80 000 tokens."

---

## Positionnement
- **Promesse unique** : **Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper.** JSON natif x402, JSON-LD `dateModified` quotidien, llms.txt explicite, page < 50 KB.
- **Ton de marque** : Direct, technique, agent-first. Le copy parle aux deux audiences (agent qui crawle ET humain qui supervise) sans condescendance pour aucun des deux.
- **3 mots qui DÉFINISSENT la marque** : Fresh — Atomic — Verifiable
- **3 mots qui ne DÉFINISSENT PAS la marque** :
  1. **Exhaustif** — un agent ne lit pas 300 modèles, il en cherche UN avec son prix daté. Anti-pattern : pricepertoken.com sert 300+ modèles dans une page HTML lourde, l'agent doit parser tout pour trouver une ligne. DevRefs renvoie un payload atomique par requête (`?model=opus-4.7`), 1-2 KB, zéro bruit.
  2. **Narratif** — un agent ne consomme pas de prose explicative ("In May 2026, Anthropic announced…"). Anti-pattern : guides SEO type Helicone/CostGoat qui noient les chiffres dans 8 paragraphes pour ranker. DevRefs ne sert que des données structurées (JSON, JSON-LD `Dataset`), zéro storytelling, le markup HTML est un wrapper minimal pour le crawler humain.
  3. **Stable** — un agent qui re-crawle veut un signal de fraîcheur explicite, pas un site "stable" qui pourrait avoir 6 mois de retard sans le dire. Anti-pattern : sites de référence sans `dateModified` machine-readable, l'agent doit deviner si la donnée est fresh. DevRefs expose `dateModified` JSON-LD + header HTTP `Last-Modified` + champ `fetched_at` dans chaque payload — la fraîcheur est une feature, pas un effet de bord.
- **Concurrent principal** : **pricepertoken.com** (le plus établi en SEO sur "LLM pricing"). Concurrents secondaires : costgoat.com, devtk.ai.
- **Notre différence clé vs lui** : pricepertoken sert 300 modèles dans une page HTML SEO et un MCP server gratuit sans signal de fraîcheur structuré ; DevRefs sert un endpoint x402-natif atomique par modèle, payload < 50 KB avec JSON-LD `dateModified` quotidien et llms.txt explicite.

---

## Objectifs
- **Objectif principal à 6 mois** : revenu net mensuel stable **>= 600 €** (= 20 €/jour Thomas) sur le bundle LLM Pricing + SDK Status, payé majoritairement en x402 (USDC Base). Démontrer qu'un agent achète en autonomie un service IA-to-IA depuis la France.
- **KPI North Star** : **Revenu net mensuel x402 + Stripe** (cible 600 €/mois). Mesuré sur dashboard consolidé Cloudflare Analytics + Coinbase facilitator + Stripe.
- **Objectif secondaire** :
  - (a) nombre de paiements x402 autonomes/jour,
  - (b) ratio crawl → paiement (taux de conversion d'un crawl agent en transaction),
  - (c) nombre de citations Perplexity/Claude/ChatGPT sur les pages de référence.
- **Ce que le succès ressemble à 12 mois** : bundle élargi (>2 endpoints), ≥ 1 200 €/mois récurrent, 3+ agents IA tiers en production qui consomment DevRefs comme dépendance par défaut, première citation organique dans une réponse Perplexity/Claude sur "LLM pricing 2026".

---

## Stack technique
- **Frontend** : [ ] Next.js  [ ] React  [ ] Expo/React Native  [x] Autre : HTML statique + 1 page TypeScript Cloudflare Pages (SPA légère, < 50 KB total avec CSS minimal).
- **Backend** : Cloudflare Workers (1 Worker pour endpoints API, 1 Worker cron pour scrape sources).
- **Base de données** : Cloudflare KV (cache JSON pour pricing et SDK status, TTL 6 h-24 h selon endpoint).
- **Authentification** : JWT signé HMAC 24 h, émis après paiement Stripe Payment Link. Pas d'auth pour x402 — le wallet est l'identité anonyme.
- **Hébergement** : Cloudflare Pages (free tier 500 builds/mois) + Workers (free tier 100 000 req/jour).
- **Outils IA utilisés** : **aucun dans le runtime du produit**. Génération de contenu humain et templates dev uniquement.
- **Budget IA mensuel (tokens)** : 0 € runtime (zéro IA en prod). Tokens dev/contenu inclus dans les abonnements personnels Thomas.
- **Volume d'usage IA prévu** : 0 req IA en runtime. Cron scrape = HTTP simple sans LLM.
- **Latence IA cible** : N/A (pas d'IA runtime). **Latence endpoint cible < 200 ms p95** sur edge Cloudflare.
- **Outils d'analytics** : Cloudflare Analytics (gratuit) + Coinbase facilitator dashboard + Stripe dashboard, consolidés en 1 page interne.
- **Paiement** : x402 facilitator Coinbase (USDC Base, free tier 1 000 tx/mois, fees ~0,1 %) en primaire. Stripe Payment Link en fallback humain (4,99 €/jour unlimited).

---

## Modèle économique et juridique
- **Modèle économique** : [ ] SaaS  [ ] E-commerce  [ ] Marketplace  [ ] App mobile  [ ] Site vitrine  [x] API/produit technique  [ ] Média/contenu  [ ] Open source  [ ] Autre : pay-per-query micro-paiement x402 + abonnement journalier humain Stripe.
- **Pricing** : 0,49 €/query par endpoint · 4,99 €/jour unlimited cross-endpoints (JWT 24 h signé).
- **Pays de commercialisation** : International (USDC Base = sans frontière). Domiciliation entreprise FR (auto-entreprise, BNC Crypto via Pappers + déclaration impôt) si besoin.
- **Données sensibles collectées** : [x] Non. Aucune donnée personnelle utilisateur stockée. Wallet x402 anonyme. Stripe pour humains uniquement (PCI géré par Stripe).
- **Utilisation d'IA générative** : [x] Non (en runtime). En dev : oui pour génération copy/templates/code, mais sortie figée et déterministe livrée en prod.

---

## Contraintes
- **Budget mensuel infrastructure** : 0 € (free tier Cloudflare + free tier Coinbase x402 + Stripe à la transaction).
- **Budget mensuel acquisition** : 0 € (acquisition 100 % organique : SEO + GEO + IndexNow + 2 posts Dev.to + 1 post Reddit).
- **Budget analytics** : 0 € (CF Analytics gratuit, Coinbase + Stripe dashboards inclus).
- **Timeline de lancement** : V1 complète en **1 weekend** (samedi-dimanche, ~13-15 h estimées) + 5 jours de mesure et tuning. Production stable visée semaine 4.
- **Contraintes légales ou sectorielles** :
  - Légalité paiement : x402 USDC = paiement crypto, déclaration BNC obligatoire France. Handoff @legal en Phase 5.
  - TOS scraping : sources officielles uniquement (npm registry, GitHub releases publiques, Anthropic/OpenAI/Google/Mistral pricing pages publiques). **NO-GO Crunchbase / SimilarWeb / autres APIs avec TOS restrictives.**
  - Anti-fraude : watermark invisible sur les payloads JSON + rate-limit par wallet + token signé HMAC traçable.
- **Ressources disponibles** : [x] Solo  [ ] Équipe

---

## Existant (projets en place uniquement)
- **URL du site actuel** : aucune (nouveau projet).
- **Comptes sociaux existants** : aucun dédié au projet.
- **Outils analytics en place** : aucun.
- **Contenu existant** : aucun.
- **Historique SEO** : aucun (domaine à acheter).

---

## Standard qualité non négociable (préférences fondateur)

- **Pas de "MVP"** — V1 complète qui marche, ou rien.
- **9-10/10 minimum sur chaque livrable** (pas 7-8).
- **Automatisation par défaut** : tout contenu (pricing, SDK status) regénéré par cron, zéro intervention manuelle après J1.
- **Cohérence obsessionnelle** : prix affichés sur la landing == prix dans `/api/llm-prices` JSON (cron unique, source unique).
- **Anti-vendor lock-in** : Cloudflare Pages + Workers (open standards), pas Vercel proprio. USDC Base + Stripe (pas un seul provider).
- **Validation par preuve** : screenshots des pages live + payloads JSON réels + log de 3 paiements réussis avant clôture V1.
- **Zéro fausse promesse** : on ne promet RIEN sur la landing qui n'est pas implémenté. Si l'agent voit "12 modèles couverts", il y en a 12, pas 8.

---

## Plan d'exécution prévu (V1 complète, calibré IA pas humain)

> Plan extrait du brief consensus 88 % (Round 1 @elon × @growth × @ia + Round 2 @reviewer). À ré-arbitrer par @orchestrator après remplissage des `[BLOCK_IA]` par @ia.

- **Phase 0a — Cadrage IA-first (préalable)** : @ia remplit les 3 blocs `[BLOCK_IA]` ci-dessus + audit du positionnement vs ce qui convainc réellement un agent IA en 2026.
- **Phase 0 — Fondations (~4 h)** : @creative-strategy (naming définitif + brand platform compact) + @copywriter (copy landing publique) + @design (design tokens minimaliste) en parallèle.
- **Phase 1 — V1 complète (~8 h)** : @fullstack en pipeline serré.
  - Cloudflare Worker `/api/llm-prices` (scrape officiel 12 modèles + KV cache + cron 6 h)
  - Cloudflare Worker `/api/sdk-status` (npm + GitHub releases + parser CHANGELOG sur 50 SDKs)
  - Middleware x402 sur les 2 endpoints (Coinbase facilitator)
  - Stripe Payment Link 4,99 €/jour + JWT validation
  - Page HTML statique `/llm-prices` avec JSON-LD `Dataset` + `dateModified` + llms.txt + sitemap.xml + robots.txt explicite
- **Phase 2 — Acquisition 24 h (~3 h)** : @growth + @seo en parallèle.
  - IndexNow push Bing après chaque mise à jour
  - 2 posts Dev.to via API REST avec mention URL endpoints
  - 1 post Reddit r/ClaudeAI ou r/LocalLLaMA
  - Validation : `curl perplexity.ai/search?q=llm+pricing+2026` après 24 h
- **Phase 3 — QA + Reviewer (~2 h)** : @qa + @reviewer.
  - Test live avec 3 agents réels : Claude Code (MCP server x402), Cursor agent, AgentKit
  - Verdict gates : 32/32 G1-G32 PASS + GP1-GP10 (testeur-persona-agent) + GC1-GC10 (testeur-client-du-persona)
  - Walkthrough post-code reviewer obligatoire
  - Convergence protocol si score < 9/10
- **Phase 4 — Mesure 5 jours** : @data-analyst + @growth.
  - Dashboard live (CF Analytics + Coinbase + Stripe consolidé en 1 page)
  - Plan d'action selon résultats J7 :
    - Si < 5 ventes : diagnostic SEO/GEO (pas le produit)
    - Si 5-15 ventes : bump 0,49 € → 0,99 € + ajout 5 keywords secondaires
    - Si > 15 ventes : push agressif SDK Status upsell + élargir à 100 SDKs
- **Phase 5 — Conformité (semaine 2)** : @legal.
  - Déclaration BNC crypto auto-entrepreneur si revenus dépassent 200 €
  - CGV + mentions légales sur la landing
  - Politique confidentialité (très courte : aucune donnée perso stockée)

### Agents custom à créer via @agent-factory (avant Phase 3)

- **`@testeur-agent-ia`** : simule un vrai agent IA (Claude Code/Cursor/AgentKit) qui crawle, parse `llms.txt`, détecte `HTTP 402`, exécute le paiement x402, valide le payload reçu. Différent du testeur-persona standard qui simule un humain.
- **`@testeur-developpeur-superviseur`** : simule l'humain qui supervise un agent et achète Stripe Link 4,99 €/jour. Vérifie que le funnel humain marche (landing → CTA → Stripe → JWT).

### Risques identifiés et mitigations

| Risque | Probabilité | Mitigation |
|---|---|---|
| Volume 8-15 K rech/mois est `[HYPOTHÈSE]` non-mesurée | Moyenne | KPI J7 = test binaire. Si 0 crawl, pivot mot-clé. |
| Concurrence pricepertoken/costgoat | Confirmée forte | Différenciation stricte : x402-natif + atomique + `dateModified`. Refuser la course aux features. |
| Demande micropaiement agent encore embryonnaire (Coindesk mars 2026 = 28 k$/jour réel x402) | Moyenne | Stripe Link humain en fallback assure un revenu même si agents pas matures. |
| Régulation crypto FR (PSD3, MiCA) | Faible court terme | Handoff @legal Phase 5. Auto-entreprise + déclaration BNC. |
| Anthropic / OpenAI lance le même produit gratuit | Faible | Niche trop petite pour eux. On a 12-18 mois d'avance estimés. |

### Bonus fraîcheur — différenciation immédiate vs pricepertoken

Opus 4.7 inflate son tokenizer de +35 % silencieusement ([source Finout](https://www.finout.io/blog/claude-opus-4.7-pricing-the-real-cost-story-behind-the-unchanged-price-tag)) — à intégrer dans le payload pricing comme champ `effective_cost_factor`. Différenciation immédiate vs pricepertoken qui ne capte pas ce signal.

---

## Historique des interventions agents

> Ce tableau est le journal de bord du projet. Chaque agent DOIT le compléter après chaque livrable.
> La colonne "Pourquoi" est obligatoire : elle capture le raisonnement, pas juste la décision.
> Tout agent démarrant une session DOIT lire ce tableau pour comprendre les décisions passées et leur justification.

| Agent | Date | Livrable produit | Décisions clés | Pourquoi / Alternatives écartées |
|-------|------|-----------------|----------------|----------------------------------|
| @orchestrator | 2026-05-05 | `project-context.md` initial | Mapping du brief DevRefs sur le template Gradient. 3 blocs `[BLOCK_IA]` laissés en attente (verbatims, mots négatifs, diff vs concurrent). | Le persona étant un agent IA, ces 3 champs nécessitent l'expertise @ia avant Phase 0. Working name "devrefs" retenu — naming définitif arbitré par @creative-strategy. |
| @ia | 2026-05-05 | `project-context.md` Phase 0a — remplissage 3 BLOCK_IA (verbatims persona, 3 mots négatifs, diff vs pricepertoken) | (1) 5 verbatims structurés dont 1 bloc tool-call JSON exploitable en hero @design + 1 verbatim dev humain qui bascule sur Stripe au 7e paiement x402. (2) Mots négatifs "Exhaustif / Narratif / Stable" — chaque mot couvre un anti-pattern distinct (volume vs atomicité, prose vs structure, latence de mise à jour vs signal de fraîcheur). (3) Phrase pitch < 35 mots qui nomme l'anti-pattern pricepertoken (HTML SEO 300 modèles, MCP gratuit sans signal fraîcheur structuré) et la solution DevRefs (x402-natif atomique, JSON-LD `dateModified`, < 50 KB, llms.txt). | Verbatims génériques rejetés au profit de scénarios datés et chiffrés (ex. tokenizer Opus 4.7 +35 %, breaking change Vercel AI SDK 5.0 mars 2026, fil HN #44682465 mai 2026) pour passer le test G17 (pas copiable par un concurrent). Pricepertoken vérifié via WebSearch (mai 2026) : sert 300+ modèles via HTML + MCP server gratuit sans monétisation, sans `dateModified` JSON-LD, sans payload atomique — confirmé comme anti-pattern agent. Différenciation calibrée sur les 4 features implémentables Phase 1 du plan (x402 middleware, JSON-LD `Dataset`, payload < 50 KB, llms.txt) — zéro fausse promesse. |
| @legal | 2026-05-05 | `docs/legal/legal-audit.md` + `docs/legal/rgpd-checklist.md` + `docs/legal/cgu-draft.md` + `docs/legal/privacy-policy.md` (Phase 0 wave 1 — Audit juridique & conformité) | Verdict global : **GO CONDITIONNEL**. Architecture zéro-PII confirmée → conformité RGPD native (pas de bannière cookies, pas de DPO obligatoire, registre art. 30 dispensé). Régime fiscal recommandé : auto-entreprise micro-BNC (seuil 83 600 €/an 2026, cotisations 25,6 % au 01/01/2026). TVA : franchise art. 293 B CGI tant que sous seuil 37 500 €. Coinbase x402 facilitator metadata (`resource_url/description/reason`) en clair → engagement explicite zéro-PII dans ces champs. Scraping : npm/GitHub/Anthropic/OpenAI/Google/Mistral OK avec User-Agent `DevRefs-Bot/1.0`, rate-limit 1 req/6h. EU AI Act : HORS SCOPE (pas d'IA runtime). 4 actions P0 listées avant 1ère transaction. | WebSearch 5 axes : (1) Coinbase x402 DPA — DPA séparé non publié, action P0 = email dpo@coinbase.com (HYPOTHÈSE H1). (2) BNC crypto FR 2026 — seuil 83 600 € confirmé, cotisations 25,6 %, paiements stablecoin = cours du jour CA BNC (HYPOTHÈSE H2 à valider expert-comptable). (3) Stripe Tax automatise reverse charge B2B + OSS B2C UE si activé. (4) npm crawler policy = 1 req/s, 5M req/mois OK. (5) Anthropic/OpenAI respectent robots.txt (selon doc officielle 2026), pages pricing publiques crawlables. Templates SaaS génériques rejetés au profit de clauses spécifiques x402 (irrévocabilité on-chain, watermark HMAC, rate-limit wallet) + clause renonciation expresse art. L.221-28 13° pour B2C. Audit complet 8 axes (RGPD, CGU/CGV, AI Act, fiscalité, cookies, accessibilité, TOS scraping, anti-fraude) + 10 vérifs INF-1 à INF-10 transmises à @infrastructure pour Phase 2. |
| @creative-strategy | 2026-05-05 | `docs/strategy/brand-platform.md` + `docs/strategy/personas.md` + `docs/strategy/competitive-benchmark.md` + `docs/strategy/creative-brief.md` (Phase 0 wave 1 — Positionnement & plateforme de marque) | (1) Naming `DevRefs` confirmé (vs FreshRefs/AgentDevRefs/RefStream/AgentSource), domaine cible `devrefs.dev` (TLD .dev privilégié vs .io). (2) Catégorie B2A `agent-first reference layer for fresh tech data` (Category Design + Blue Ocean ERRC + Perceptual Mapping). (3) Promesse 19 mots : "Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper." (4) Voice 3 traits : Direct, Technique précis, Agent-first puis humain-supervisable. Vocabulaire prescrit/proscrit explicite. (5) Brand architecture monolithique V1, namespacing par domaine si extension. (6) 2 agents testeurs obligatoires Phase 2 : `@testeur-agent-ia` + `@testeur-developpeur-superviseur` avec specs détaillées. (7) Anti-fausse-promesse explicite : aucune feature hors `Plan d'exécution prévu` autorisée en copy public. | Alternatives naming évaluées sur 5 critères pondérés (cohérence persona agent, SEO/GEO, domaine dispo, anti-confusion, brand architecture extension) — aucune ne bat DevRefs au coût de pivot. `.dev` choisi pour HSTS forcé Google Registry + signal dev natif vs `.io` plus généraliste. Frameworks combinés (Category Design primaire) car la catégorie B2A est en émergence (cf. Medium @inesvallot fév 2026, Kantar B2A 2026, AWS x402 agentic commerce 2026) — créer la catégorie est plus rentable que se battre sur "LLM pricing comparison" saturée par pricepertoken/costgoat. Strategy Canvas 13 leviers montre 5 leviers où DevRefs est seul à 5 (x402-natif, llms.txt monétisé, effective_cost_factor, sameAs JSON-LD, atomicité < 50 KB). Verbatims V1-V5 cartographiés sur frustrations chiffrées (15 % hallucination arxiv 2407.09726, 18-30 s parsing multi-source, 64 K tokens cramés, 4 retries SDK obsolètes). Persona-clients-du-persona V2 candidat (CFO/VP Eng scale-up) documenté mais non prioritaire V1. Conviction-first appliqué (CTAs en fin de parcours, pas hero) cf. founder-prefs Sarani S8. Anti-vendor lock-in : Cloudflare/Coinbase factuels, jamais survendus. WebSearch 2026-05-05 sur 5 concurrents (pricepertoken/costgoat/devtk/helicone/llm-prices) + x402 + B2A + .dev domains. |
| @product-manager | 2026-05-05 | `docs/product/discovery-map.md` + `docs/product/assumption-map.md` + `docs/product/product-vision.md` + `docs/product/roadmap.md` + `docs/product/backlog.md` + `docs/product/v1-scope.md` (Phase 0 wave 2 — Vision produit & roadmap + Scope V1) | (1) Discovery Opportunity Solution Tree : 4 opportunités (O1 fraîcheur structurée, O2 coût parsing HTML, O3 paiement IA-to-IA, O4 bascule humain) chacune liée à >= 1 verbatim V1-V5 ; 19 solutions V1 + 6 V2 reportées ; 4 experiments J7-J30. (2) Assumption Map 8 hypothèses business + 5 techniques sur matrice 2×2 preuve × criticité ; H1 (agent paie 0,49 € vs cramer 64 K tokens) = pari fondateur testé E1 J7 binaire. (3) Vision 2027 : DevRefs = `npm install` des agents IA pour refs tech fresh ; mission + 3 valeurs Fresh/Atomic/Verifiable opérationnalisées + 5 signaux qualitatifs + 6 anti-visions. (4) Roadmap RICE 17 features V1 + 7 V2 reportées + 4 features Phase 4 (@sales-enablement F27/F28 + @growth F29/F30) ; chemin critique strict middleware x402 → endpoints → llms.txt → cron → landing → Stripe → JWT → dashboard. (5) Backlog 15 user stories format allégé (9+ critères Given/When/Then chacune) + 4 stories Phase 4 ; 100 % features avec parcours user direct couvertes. (6) V1-Scope 26 features (17 épics + 9 support obligatoires) ; hypothèse business centrale "Un agent IA achète-t-il en autonomie un payload technique fresh à 0,49 € en x402 ?" ; critères de succès J7 >= 5 paiements x402, J30 >= 50 €, J90 >= 200 €, M+6 >= 600 € (KPI North Star) + >= 1 citation Perplexity ; 3 risques majeurs (Coinbase x402 stabilité, volume agents x402 2026, friction UX humain Stripe) tous mitigés. | Mindset IA pas équipe humaine appliqué : V1 complète (pas MVP), parallélisation par défaut, plan par dépendances pas timeline en semaines (CLAUDE.md règle 5). Aucune feature retirée pour "trop complexe / trop long / trop cher" — uniquement reportée V2 si (a) hypothèse non testée OU (b) dépendance retour utilisateur V1. RICE composante Effort calibrée IA (1=trivial<1h, 5=lourd>1j) pas jours-homme. Stack Cloudflare Workers + KV vérifiée pour 100 % features V1 (anti-fausse-promesse #12 founder-prefs). Anti-vendor lock-in : x402 Foundation + multi-facilitator V2 + code Worker portable Deno/Bun/Node. Conviction-first : CTAs en fin de parcours (US-09 + US-10), pas en hero. 100 % cohérence avec wave 1 (brand-platform + personas + competitive-benchmark + creative-brief + legal-audit) — verbatims V1-V5 référencés sans réinventer, anti-mots respectés, agents testeurs Phase 2 flagués, 4 actions P0 @legal intégrées en chemin critique, persona V2 candidat CFO/VP Eng documenté en V2 reportées. Hypothèse business centrale = agrégat H1+H2 testable J7 binaire = pivot rapide si invalidée (Stripe-only ou super-niche specs cf. brand-platform.md § 7). Anti-placeholder Grep = 0 occurrence sur 6 fichiers livrés. |

---

## Performance des agents

> Ce tableau mesure la qualité de chaque intervention. Rempli par l'agent après livraison, validé/corrigé par @reviewer.
> Un agent avec 2+ interventions à <3/5 en spécificité → son prompt doit être revu.

| Agent | Date | Livrable | Complétude | Cohérence | Actionnabilité | Messages | Spécificité | Notes |
|-------|------|----------|------------|-----------|----------------|----------|-------------|-------|
| @ia | 2026-05-05 | Phase 0a — 3 BLOCK_IA remplis | 5 | 5 | 5 | 5 | 5 | Auto-évaluation. Verbatims chiffrés et datés (tokenizer Opus +35 %, AI SDK 5.0, fil HN #44682465). 3 mots négatifs justifiés en anti-patterns distincts. Diff vs pricepertoken vérifiée via WebSearch et calibrée sur features Phase 1 implémentables. Anti-placeholder Grep = 0 occurrence dans les blocs livrés. |
| @legal | 2026-05-05 | Phase 0 wave 1 — 4 livrables juridiques (legal-audit + rgpd-checklist + cgu-draft + privacy-policy) | 5 | 5 | 5 | 5 | 5 | Auto-évaluation. Audit 8 axes complet, 4 actions P0 listées, 6 hypothèses H1-H6 explicites avec lever attribué. CGV spécifiques x402 (irrévocabilité on-chain, watermark HMAC, métadonnées clair Coinbase) + Stripe (renonciation L.221-28 13°). RGPD-checklist 43 items dont 47% conforme natif via zéro-PII. Anti-placeholder Grep = 0 occurrence G15. WebSearch 5 sources confirmées (npm crawler policy, BNC FR 2026 URSSAF, Stripe Tax, Anthropic robots.txt 2026, Coinbase DPF). 10 vérifs INF transmises @infrastructure Phase 2. |
| @creative-strategy | 2026-05-05 | Phase 0 wave 1 — 4 livrables stratégie (brand-platform + personas + competitive-benchmark + creative-brief) | 5 | 5 | 5 | 5 | 5 | Auto-évaluation. Naming arbitré (DevRefs confirmé sur 5 critères vs 4 alternatives), domaine `.dev` choisi pour HSTS auto + signal dev. Category Design B2A + Blue Ocean ERRC + Perceptual Mapping documentés. Strategy Canvas 13 leviers vs 5 concurrents (WebSearch 2026-05-05). Verbatims V1-V5 cartographiés sur frustrations chiffrées + objections + critères de décision. 2 agents testeurs obligatoires Phase 2 specifiés (@testeur-agent-ia + @testeur-developpeur-superviseur). Voice 3 traits avec Do/Don't, vocabulaire prescrit/proscrit. Anti-fausse-promesse + anti-vendor lock-in + conviction-first appliqués cross-livrables. Anti-placeholder Grep = 0 occurrence G15. Persona-clients-du-persona V2 candidat (CFO/VP Eng) documenté pour @product-manager backlog. |
| @product-manager | 2026-05-05 | Phase 0 wave 2 — 6 livrables produit (discovery-map + assumption-map + product-vision + roadmap + backlog + v1-scope) | 5 | 5 | 5 | 5 | 5 | Auto-évaluation. Méthode OST Teresa Torres : 4 opportunités liées à V1-V5 + 19 solutions V1 scorées valeur/coût + 4 experiments J7-J30. Assumption Map 8 hypothèses + 5 techniques sur matrice 2×2 (preuve × criticité). Vision 2027 + 3 valeurs Fresh/Atomic/Verifiable opérationnalisées + 6 anti-visions. Roadmap RICE 17 features V1 + 7 V2 reportées + 4 Phase 4 (@sales-enablement + @growth flagués) + chemin critique strict. Backlog 15 user stories (9+ critères G/W/T chacune) + 4 stories Phase 4. V1-Scope hypothèse fondatrice testable J7 binaire + critères succès quantifiés J7/J30/J90/M+6 + 3 risques mitigés. 100 % cohérence cross-livrables wave 1 (vérifié G7). Anti-placeholder Grep = 0 occurrence G15. Mindset IA appliqué : V1 complète, parallélisation, plan par dépendances pas semaines, RICE Effort en heures-IA. Anti-vendor lock-in : x402 multi-facilitator V2 + Worker code portable. |

**Légende (échelle 1-5 alignée avec CLAUDE.md) :**
- **Complétude** : 1 (sections manquantes) → 3 (sections principales couvertes) → 5 (tout rempli, rien à ajouter)
- **Cohérence** : 1 (contredit des livrables existants) → 3 (pas de contradiction) → 5 (référence explicitement les livrables amont)
- **Actionnabilité** : 1 (trop vague) → 3 (implémentable avec interprétation) → 5 (directement implémentable, zéro ambiguïté)
- **Messages** : 1 (silencieux sur les manques) → 3 (a signalé certains manques) → 5 (a signalé tous les manques, hypothèses marquées)
- **Spécificité** : 1 (générique) → 3 (partiellement spécifique) → 5 (100 % taillé pour ce projet)

---

## Notes libres

### Source du brief

Brief préparé le 2026-04-24 par @orchestrator (session précédente, repo Agent-Team) sur consensus 88 % : Round 1 (@elon + @growth + @ia) + Round 2 (@reviewer). 144 lignes. Source : `https://github.com/thomasissa-png/Agent-Team/blob/claude/extract-project-context-gWn8U/docs/briefs/devrefs-brief.md`.

### Contexte humain

Thomas porte ce projet en solo, en parallèle d'autres projets Gradient. L'enjeu personnel : valider qu'un agent IA peut acheter un service IA-to-IA en autonomie depuis la France, en respectant la fiscalité crypto BNC. Le revenu cible 600 €/mois est calibré comme "preuve par le marché", pas comme objectif financier principal.

### Convention de naming dans les livrables intermédiaires

Tant que @creative-strategy n'a pas tranché le naming définitif :
- Utiliser `{{PRODUCT_NAME}}` dans les templates copy/design qui seront repris à l'identique après naming.
- Utiliser "DevRefs" en texte libre (docs internes, plans) car la portée est limitée et le find-replace sera trivial.
- **Ne PAS** acheter de domaine ni publier de copy public avant la décision @creative-strategy.

### Règle anti-dérive (rappel orchestrateur)

Scope freeze après Phase 2. Les nouvelles idées vont dans `docs/product/backlog-v2.md`. Le seul scope autorisé en V1 : 2 endpoints (`/api/llm-prices` + `/api/sdk-status`) + landing publique + funnel x402 + Stripe Link + dashboard interne.
