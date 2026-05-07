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
- **Stade** : [x] Idée [ ] V1 [ ] Production [ ] Croissance
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
- **Persona secondaire (refonte v2 2026-05-05)** : **Le développeur humain SPONSOR du wallet de l'agent**. Top-up le wallet x402 USDC Base de l'agent (Coinbase Wallet, MetaMask, Rainbow — $5 à $50 USDC à la fois), n'est PAS payeur d'un service Stripe humain. La bascule "Stripe Link 4,99 €/jour unlimited humain" du V1 initial est dépréciée v2 : Stripe peut rester en option rampe top-up sponsor, jamais comme offre commerciale. Cf. `docs/strategy/personas.md` v2 § 2.
- **Verbatims persona** :

  **V1 — Bloc tool-call JSON (agent halluciné sur pricing Opus 4.7, exploitable hero @design)**

  ```json
  {
    "agent": "claude-code",
    "session": "01HXR...",
    "ts": "2026-05-04T09:12:33Z",
    "tool_calls": [
      {
        "name": "WebSearch",
        "query": "claude opus 4.7 input price per million tokens",
        "results": 8
      },
      {
        "name": "WebFetch",
        "url": "anthropic.com/pricing",
        "tokens_in": 11420
      },
      { "name": "WebFetch", "url": "pricepertoken.com", "tokens_in": 38900 },
      { "name": "WebFetch", "url": "llm-prices.com", "tokens_in": 14200 }
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

  **V4 v1 — Stripe Link humain payeur (DÉPRÉCIÉ pivot v2 2026-05-05)** : verbatim archivé `project-context-archive.md`. Le persona V4 reste valide en v2 (sponsor humain top-up wallet) avec verbatim réécrit dans `docs/strategy/personas.md` v2 § 2.4.

  **V5 — Verbatim persona principal (frustration schema SDK obsolète, format technique)**

  > "Mon training cutoff est janvier 2026. Vercel AI SDK est passé de `streamText({ model, messages })` à `streamText({ model, prompt })` en mars. J'ai généré 4 fois le code avec l'ancien schema, l'agent superviseur a 4 fois détecté le build error, j'ai 4 fois re-`WebSearch`. Un endpoint `/api/sdk-status?pkg=ai` qui me renvoie `{"latest": "5.0.12", "breaking_since": "5.0.0", "dateModified": "2026-05-04"}` aurait économisé 12 minutes et ~80 000 tokens."

---

## Positionnement

- **Promesse unique (refonte v2 2026-05-05)** : **Cost intelligence for AI agents — know before you spend, optimize after you ship.** 2 offres en x402 USDC : (1) Calcul coût pre-flight $0.001/call ou packs $5/$10/$50, (2) Audit post-flight $9.99 one-shot ou Pack Pro $49 (6 audits). 100 % B2A pure (agent payeur), pas de Stripe humain pilier. Cf. `docs/strategy/brand-platform.md` v2 § 2 + `docs/ia/agent-economics.md` § C.1 (pricing source).
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

- **Frontend** : [ ] Next.js [ ] React [ ] Expo/React Native [x] Autre : HTML statique + 1 page TypeScript Cloudflare Pages (SPA légère, < 50 KB total avec CSS minimal).
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

- **Modèle économique (refonte v2 2026-05-05)** : [x] API/produit technique — **100 % B2A pure**, micro-paiement x402 USDC sur 2 offres (Offre 1 calcul coût pre-flight + Offre 2 audit post-flight). Stripe humain n'est PLUS pilier (rétrogradé en option rampe top-up wallet sponsor uniquement).
- **Pricing v2** :
  - **Offre 1 — Calcul coût** : pay-per-call $0.001 USDC OR Pack Discovery $5 (5K calls) / Pack Standard $10 (10K, recommandé) / Pack Pro $50 (60K).
  - **Offre 2 — Audit** : one-shot $9.99 USDC OR Pack Pro $49 (6 audits).
  - **Subscription Pro $29/mo** : V2 réservé (x402 V2 sessions, Q3 2026 [HYPOTHÈSE H7 cf. agent-economics.md § C.3]).
  - **3e offre future V2** : Cost Regression Alerts (sticky multi-provider, conditionnée signal demande post-V1).
  - Source pricing officielle : `docs/ia/agent-economics.md` § C.1.
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
- **Ressources disponibles** : [x] Solo [ ] Équipe

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

> Détail complet : `docs/orchestration-plan.md` (510 lignes, source de vérité avancement projet).

Synthèse phases (mise à jour 2026-05-07) :

- **Phase 0a** : Cadrage IA-first — `COMPLETE 2026-05-05`
- **Phase 0** : Fondations stratégiques (waves 1+2+3 + relance v2 pivot 100% B2A) — `COMPLETE 2026-05-05`
- **Phase 1** : Specs IA fondatrices (4 livrables `docs/ia/`) — `COMPLETE 2026-05-05`
- **Phase 2** : Build V1 (middleware x402 + endpoints + landing + Stripe + JWT + dashboard + agents testeurs) — `COMPLETE 2026-05-06`
- **Phase 3** : Deploy CF Pages + Worker + DNS apex `devrefs.dev` — `COMPLETE 2026-05-06`
- **Phase 4** : Acquisition (growth + social + sales-enablement) — `COMPLETE 2026-05-07`
- **Phase 5** : Audit transversal @reviewer GO CONDITIONNEL 9.06/10 + sub-phase 5b — `COMPLETE 2026-05-06`
- **Phase 6 (à venir)** : Audit Phase 4 transversal + ajouts @fullstack widget ROI + activation agent.market — `Session 8`

Sections archivées vers `project-context-archive.md` Session 7 (Plan détaillé v1).

---

## Historique des interventions agents

> Ce tableau est le journal de bord du projet. Chaque agent DOIT le compléter après chaque livrable.
> La colonne "Pourquoi" est obligatoire : elle capture le raisonnement, pas juste la décision.
> Tout agent démarrant une session DOIT lire ce tableau pour comprendre les décisions passées et leur justification.

| Agent | Date | Livrable produit | Décisions clés | Pourquoi / Alternatives écartées |
| ----- | ---- | ---------------- | -------------- | -------------------------------- |

> **Entries Phase 0-3 (Sessions 1-5, 10 entrées du 2026-05-05 au 2026-05-06) archivées vers `project-context-archive.md` Section B.** Récap : @orchestrator (init), @ia (BLOCK*IA + 4 specs PIVOT), @legal (wave 1 + v2), @creative-strategy (wave 1 + RELANCE v2), @product-manager (wave 2), @data-analyst (wave 3), @reviewer (audit-final 9.06/10).
> | @fullstack | 2026-05-07 | Fix bug P2 cron-indexnow-push KV persist (`src/cron/jobs/indexnow-push.ts`) + investigation 2 autres crons SKIP (sdk-update + pack-expiry-check) + update `tests/cron-live-status.md` (FIXED) | (1) Bug confirmé : handler `runIndexNowPush` n'écrivait jamais `cron:indexnow-push:last_run` dans `CRON_STATE_KV` (interface `IndexNowEnv` n'avait même pas le binding KV). (2) Patch minimal : ajout `CRON_STATE_KV?: KVNamespace` à l'interface, helper `persistLastRun()` invoqué en fin de run dans les 3 chemins (succès, catch, early return `missing_api_key`) — pattern aligné sur `prices-update.ts` L66-70 (clé `KV_KEYS.cronLastRun("indexnow-push")`, TTL `KV_TTL.cronState` = 7j, `.catch(() => {})` non-bloquant). (3) Investigation crons SKIP : `sdk-update.ts` L76-80 + `pack-expiry-check.ts` L94-98 + `cron-health-check.ts` L57-60 persistent tous correctement leur `last_run` — aucun fix nécessaire, juste à revérifier en KV après leur prochaine fenêtre 24h post-déploiement. (4) Pre-commit check PASS : `tsc --noEmit` clean, `npm run lint` clean, `npm run build` 115.1kb 78ms. | Patch minimal strict (anti-refactor préemptif, anti-règle respectée) : aucune dépendance npm ajoutée, aucun fichier touché hors `indexnow-push.ts` + `tests/cron-live-status.md` + `project-context.md`. UTF-8 propre (commentaires sans accent dans `indexnow-push.ts` pour cohérence avec le style existant du fichier). Le `CRON_STATE_KV` est typé optionnel (`?:`) car `runIndexNowPush` est aussi appelé en chaîne depuis `prices-update` et `sdk-update` (cf. `src/cron/index.ts` L33+L41) — le binding est garanti dans `dispatchCron` mais l'optionnel évite une regression si un appelant futur omet le binding. Persiste aussi en cas d'erreur réseau ou `missing_api_key` : signal au watchdog que le handler a bien été invoqué (vs jamais déclenché par le scheduler). NE PAS commiter — orchestrator session 7. |
> | @copywriter (sales-enablement brief) | 2026-05-07 | `docs/sales/roi-calculator-spec.md` + `docs/sales/onboarding-claude-code.md` + `docs/sales/onboarding-cursor.md` + `docs/sales/onboarding-agentkit.md` + `docs/sales/onboarding-mastra.md` + `docs/sales/onboarding-mcp-generic.md` + `docs/sales/onboarding-sdk-custom.md` + `docs/sales/social-proof-strategy.md` + `docs/sales/handoff-sales-enablement.md` (Phase 4 sales-enablement) | ROI calculator spec : calcul client-side 100%, 6 modèles, 3 inputs, CTA dynamique pack Discovery/Standard/Pro. 6 tutoriels onboarding agents (temps honnêtes 3-15 min sans sur-promesse). Social proof V1 : zéro testimonial fictif, compteur conditionné au 1er paiement réel, plan rotation J0/J30/J60/J90. Handoff Thomas + @growth + @social avec critères pivot si conv < 2%. | Subscription Pro $29/mo absente (V2 reportée HYPOTHÈSE H7). Zéro testimonial inventé (règle absolue). CTA en fin de tutoriel, pas en hero (conviction-first). Tous chiffres ROI tracés vers `agent-economics.md` § A.2/A.4/C.1. Temps intégration honnêtes (anti-fausse promesse @ia § 6). |
> | @social | 2026-05-07 | `docs/social/social-strategy.md` + `docs/social/editorial-calendar-90d.md` + `docs/social/post-templates.md` + `docs/social/handoff-social.md` (Phase 4 acquisition — stratégie social media B2A pure) | X.com primaire (signal LLM), BlueSky redondance (anti vendor lock-in), Dev.to tutoriels (SEO+GEO), GitHub awesome lists (backlinks), HN candidats trimestriels. LinkedIn/Instagram/TikTok écartés (incompatibilité B2A). 8 posts/mois calibration IA (pas équipe humaine). Mix 50 % P1 Data stories / 30 % P2 Tutoriels / 20 % P3 Actualité. KPI principal : citations LLM (Perplexity/Claude/ChatGPT) > followers vanity. 24 posts sur 90 jours avec source/CTA/KPI par post. 8 templates + prompts IA génération batch. Critères pivot J30/J60/J90 documentés. | LinkedIn écarté car B2B humain incompatible B2A pure. Volume 8 posts/mois = 3-4h/mois Thomas (réaliste solo fondateur). KPI principal citations LLM car c'est le canal acquisition direct pour agents qui cherchent une source pricing via Perplexity/Claude. Zéro storytelling fictif, zéro claim sans source, zéro feature hors V1-scope. Tous les chiffres du calendrier sourçés vers `agent-economics.md` ou sources officielles Anthropic/OpenAI/Google. |
> | @growth | 2026-05-07 | `docs/growth/aarrr-funnel-b2a.md` + `docs/growth/viral-loops.md` + `docs/growth/earned-media-strategy.md` + `docs/growth/handoff-acquisition.md` (Phase 4 acquisition — plan growth complet B2A) | Funnel AARRR double persona adapté B2A (agent payeur + sponsor top-up). 5 boucles virales agent-first (K-factor 0.02-0.50 [HYPOTHÈSE]). Earned media 7 pipelines : agent.market P0 + llmstxt registres P0 + Show HN + série 6 articles Dev.to + Product Hunt. 10 cibles influenceurs (swyx, Simon Willison, Jesse Pollak). 3 templates outreach data-first. Plan 30/60/90 jours + 5 expériences RICE + critères GO/PIVOT J7 (binaire H1) + J30. Budget acquisition V1 = 0 € paid (organic only). Unit economics : CAC = 0 €, LTV = 9-45 €/wallet, LTV:CAC > 10:1. 2 ajouts @fullstack requis : pr_snippet champ F1b + badge_roi route CF Worker. | Paid acquisition écarté avant M+3 (pas de données conversion suffisantes). Canal agent.market (Coinbase) est le P0 absolu — audience native x402. Boucle 4 (llms.txt propagation) identifiée comme la plus prometteuse K-factor B2A car comportement agent natif (héritage contexte parent → sous-agents). K-factors B2A structurellement inférieurs au SaaS consumer — objectif K = 0.1-0.3 (amplification organique), pas K >= 1 (viralité explosive). Zéro programme referral humain avec cash incentives (anti-pattern audience dev IA). |
> | @reviewer | 2026-05-07 | `docs/audit/audit-phase4-s7.md` (Phase 4 Session 7 — audit transversal 17 livrables acquisition growth/social/sales) | (1) Verdict GO CONDITIONNEL 9.0/10 (18/20 gates testées PASS). (2) Top 3 corrections : (a) `POST /api/pack/purchase` mentionné dans 3 onboardings est ABSENT de v1-scope.md + functional-specs.md — décision @product-manager (officialiser ou retirer) ; (b) event `pack_calls_used` (4 occurrences aarrr-funnel-b2a + 3 kpi-framework) ≠ canonique `pack_quota_consumed` tracking-plan v2 § 2.4 + flag `prev_audit_wallet` non défini — alignement @growth + @data-analyst ; (c) `post-templates.md:10` mentionne "26 features V1" alors que v1-scope dit 29 — correction 1 ligne @social. (3) 8 events orphelins dans Phase 4 livrables (audit_share_clicked, badge_roi_clicked, data_report_fetched, roi_calculator*_×3, onboarding\___step_\*) à arbitrer @data-analyst. (4) Score persona 9.1/10, score B2B 9.0/10 — au-dessus seuil 9/10. (5) Anti-mots Exhaustif/Narratif/Stable/Humain-first 0 occurrence positive (G18 PASS). (6) Concurrents (Langfuse/Helicone/Braintrust/pricepertoken) nommés UNIQUEMENT dans docs internes strategy/personas — JAMAIS copy public client-facing (règle commune #9 PASS). (7) Subscription Pro $29/mo absent du copy public ✓. Cost Regression Alerts mentionné uniquement V2 backlog conditionnel ✓. (8) Pricing strictement cohérent vs agent-economics.md § C.1 sur tous les fichiers (G27 PASS). | Mode revue croisée standard (17 livrables > 10 → 2 passes : titres+conclusions + spot lecture incohérences). 6 contradictions documentées avec criticité + correction concrète + agent responsable. Aucune contradiction BLOQUANTE absolue — toutes corrigibles en aval (< 30 lignes total). Pas de relance complète @growth/@social/@copywriter — corrections ciblées suffisent (orchestrator gère propagation). Sourcing externe non re-vérifié WebSearch (HN 6.8 % conv, 165M tx x402, 69K agents) — sources nommées et hyperliées dans les livrables, vérifiables manuellement par Thomas. NE PAS commiter — orchestrator session 7. |
> | @qa | 2026-05-06 | Phase 5b — 12 baselines screenshots Playwright (`tests/screenshots/baseline/` 4 pages × 3 viewports = 2.9 MB) + `tests/cron-live-status.md` + `tests/audit-non-persistence-static.md` + script `tests/visual/generate-baselines-from-prod.ts` | (1) 12 baselines générées depuis devrefs.dev live (PNG 8-bit RGB fullPage). (2) Gate G26 BLOQUANT actif sur deploy-prod (ci.yml ligne 161 needs [lint-test, e2e, build] avec PIXELMATCH_THRESHOLD=100). (3) Audit RGPD non-persistance audit input PASS : 0 hit grep `kv.put.\*audit:input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | agent_config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | sample_traces`+ 0 hit`console.log.\*sample_traces`. (4) Tests cron live : 2/5 PASS (prices-update + cron-health-check), 2/5 SKIP fenêtre journalière, **1/5 FAIL** : `cron-indexnow-push`ne persiste pas son`last_run` KV → bug @fullstack à investiguer session 7. | Score auto-éval 4/5 (1 cron en bug non-bloquant — gap runtime hors périmètre @qa, @fullstack à investiguer). Pas de modif `playwright.config.ts` (anti-règle). Pas d'ajout dépendance npm. Pas de trigger manuel crons (anti-règle). Validation runtime UUID marker via Playwright reportée à CI GitHub Actions (browsers absents en sandbox local). Baselines 1280 jusqu'à 708 KB — à compresser pngquant V1.1 si repo grossit. |

---

## Mémo de reprise — dernière session

**Date de clôture** : 2026-05-07 (fin journée)
**Numéro de session** : Session 7 (clôture). Prochaine session = **Session 8**.

### Résumé session 7 (3-5 lignes)

Sanity check anti-dérive PASS (CLAUDE.md 108/125, lessons-learned 35/80, founder-prefs 136/150). Propagation des 8 learnings P0/P1 Session 6 dans 7 fichiers framework (86 insertions, agent-factory). Fix bug P2 `cron-indexnow-push` KV persist (@fullstack, pre-commit PASS, pattern aligné `prices-update.ts`). **Phase 4 acquisition livrée en parallèle** : @growth (4 fichiers AARRR funnel + viral loops + earned media + handoff), @social (4 fichiers stratégie/calendrier 90j/templates/handoff), @copywriter brief sales-enablement (9 fichiers ROI calculator + 6 onboardings agents + social-proof + handoff). Auto-évals 24/25 sur les 3 agents Phase 4.

### Travaux en cours

- ✅ Phase 4 acquisition COMPLETE (17 livrables : 4 growth + 4 social + 9 sales)
- ✅ Bug P2 cron-indexnow-push FIXED (commit Session 7)
- ✅ 8 learnings P0/P1 Session 6 propagés (statut "propagé 2026-05-07")
- ⏸ Sub-phase 2c bis (GP9/GP10 pack purchase réel) — toujours bloquée par Coinbase prod
- ⏸ Sub-phase 2d bis (GC4/GC7/GC9/GC10) — toujours bloquée par DKIM + wallet EIP-191
- ⏳ 2 ajouts @fullstack identifiés par @growth : champ `pr_snippet` rapport audit (F1b) + route badge ROI CF Worker (`/badge/roi?savings=X`) — < 2h cumul

### Prochaines actions recommandées (Session 8)

1. **Action Thomas** (~1h) : 4 actions BLOQUANTES 1ère vraie tx (toujours pendantes depuis Session 6)
   - Stripe Tax mode prod + remplir 3 placeholders légaux CGV/Privacy (SIREN SASU + adresse siège + représentant)
   - Coinbase production (KYC + facilitator key prod)
   - DNS DKIM + SPF + Domain Lockdown Mailchannels (10 min CF DNS)
   - Email DPO Coinbase `dpo@coinbase.com` pour DPA H1 (5 min)
2. **@fullstack** : 2 ajouts Phase 4 (champ `pr_snippet` F1b + route `/badge/roi`) + build widget ROI calculator selon `docs/sales/roi-calculator-spec.md`
3. **@reviewer Phase 4 audit transversal** : vérifier cohérence 17 livrables Phase 4 vs Phase 0-3 (zéro contradiction promesses, anti-mots respectés, KPIs alignés tracking-plan, pas de feature hors v1-scope)
4. **Audit TTL `project-context.md`** > 250 lignes : DRY-RUN d'archivage vers `project-context-archive.md` (sections Phase 0 v1 antérieures au pivot v2 candidates)
5. **Activation canal P0 @growth** : soumission `agent.market` Coinbase (69K agents B2A actifs) — action exécutable dès J1 (cf. `docs/growth/earned-media-strategy.md`)

### Blockers éventuels

- **Token CF API** Thomas (sessions 4-6) toujours à révoquer + recréer avec 6 scopes (cf. learning L29 propagé)
- Choix fiscal SASU vs micro-BNC à arbitrer (impact CGV/Privacy)
- Adresse SASU vs domiciliation pro 5€/mois à choisir avant publication mentions légales
- K-factors B2A documentés [HYPOTHÈSE] — pas de benchmark publié 2026, à valider J30 sur données réelles

### Nom de branche recommandé Session 8

`claude/devrefs-s8-phase4-audit-fullstack-[suffix]`

### Commande de reprise suggérée

```
Lis project-context.md (Mémo Session 7 + Historique) et docs/orchestration-plan.md. État : Phase 4 acquisition livrée (17 fichiers growth/social/sales), bug cron fixé, learnings propagés. Étape 1 : actions Thomas BLOQUANTES (toujours pendantes). Étape 2 : @fullstack 2 ajouts Phase 4 (pr_snippet F1b + badge_roi route) + build ROI calculator widget. Étape 3 : @reviewer audit Phase 4 transversal. Étape 4 : DRY-RUN audit TTL project-context.md. Mode autopilot.
```

---

## Performance des agents

> Détail Phase 0-3 archivé : `docs/agents-performance-archive.md`.

**Top 3 (Phase 0-5)** : @creative-strategy (wave 1 + v2 relance), @ia (4 specs B2A pure), @product-manager (wave 2 RICE + v1-scope) — tous 5/5/5/5/5.

**Bottom 3 (Session 8+)** : @qa Phase 5b (4/5 — 1 cron bug non-bloquant), @design Phase 5b (3/5 — 14 favicons vs 12 attendus), @infrastructure Phase 2 Étape 3 (4/5 — 6 fixes CI cascading, learning L26).

**Règle** : agent avec 2+ interventions <3/5 spécificité → prompt à revoir (`agent-factory`).

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
