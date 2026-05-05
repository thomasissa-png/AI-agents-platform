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
- **Verbatims persona** : `[BLOCK_IA]` — À définir par @ia en Phase 0a. Cible : 3-5 verbatims structurés combinant (a) extraits de logs/telemetry d'agents IA qui ont halluciné sur un prix LLM ou un schema SDK obsolète, (b) signaux comportementaux (séquences `WebSearch` → parsing de 5 sources → réponse contradictoire). Format : phrase ou bloc de log exploitable par @copywriter pour le copy landing et par @ux pour les parcours.

---

## Positionnement
- **Promesse unique** : **Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper.** JSON natif x402, JSON-LD `dateModified` quotidien, llms.txt explicite, page < 50 KB.
- **Ton de marque** : Direct, technique, agent-first. Le copy parle aux deux audiences (agent qui crawle ET humain qui supervise) sans condescendance pour aucun des deux.
- **3 mots qui DÉFINISSENT la marque** : Fresh — Atomic — Verifiable
- **3 mots qui ne DÉFINISSENT PAS la marque** : `[BLOCK_IA]` — À définir par @ia en Phase 0a. Cible : 3 mots qui décrivent ce qu'un agent IA NE recherche PAS dans une source de référence technique. Chaque mot exclu doit représenter un anti-pattern réel dans la consommation de données par un agent.
- **Concurrent principal** : **pricepertoken.com** (le plus établi en SEO sur "LLM pricing"). Concurrents secondaires : costgoat.com, devtk.ai.
- **Notre différence clé vs lui** : `[BLOCK_IA]` — À définir par @ia en Phase 0a. Formulation cible : une phrase qui (a) nomme l'anti-pattern de pricepertoken pour un agent IA (HTML lourd, pas d'endpoint JSON, pas de signal de fraîcheur structuré), (b) nomme la solution DevRefs en termes consommables par un agent (endpoint x402, JSON-LD `dateModified`, payload < 50 KB, llms.txt).

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

---

## Performance des agents

> Ce tableau mesure la qualité de chaque intervention. Rempli par l'agent après livraison, validé/corrigé par @reviewer.
> Un agent avec 2+ interventions à <3/5 en spécificité → son prompt doit être revu.

| Agent | Date | Livrable | Complétude | Cohérence | Actionnabilité | Messages | Spécificité | Notes |
|-------|------|----------|------------|-----------|----------------|----------|-------------|-------|
| | | | | | | | | |

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
