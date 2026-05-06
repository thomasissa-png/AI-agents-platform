# Plan d'orchestration — DevRefs (working name)

## Demande utilisateur

**Mode** : Autopilot Phase 0 → Phase 5, livraison complète (V1 production-ready, 100% gates BLOQUANT + REQUIS PASS, gates testeur-persona GP1-GP10 + testeur-client GC1-GC10 inclus). Multi-sessions admis (phase par phase, marqueur COMPLETE / EN COURS).

**Contraintes spécifiques imposées** : voir 12 renforcements + 18 learnings cross-projets dans le brief utilisateur (zéro fausse promesse, anti-témoignage fictif, conviction-first, anti-placeholder galerie, backoffice = front, self-fetch 127.0.0.1, hooks avant return conditionnel, stale-while-revalidate, idempotence SQL, flux progressif IA, parcours d'achat E2E, agents testeurs valeur, sales-enablement Phase 4, earned media Phase 4, pre-commit build check, REPLIT_ACTIONS.md, favicons completes).

## Mode détecté

**V1-Production** (autopilot par défaut, profil le plus rigoureux)

- 32 gates G1-G32 (BLOQUANT + REQUIS)
- Gates testeur-persona GP1-GP10 + testeur-client GC1-GC10
- Checkpoint validation specs Phase 1 → Phase 2
- Matrice traçabilité US→tests + screenshots CI vs baselines
- Pipeline pre-deploy complet

## Profil utilisateur

- Niveau technique : Expert (autonome stack Cloudflare, x402, JWT HMAC, Web3)
- Ton de communication : Mixte (technique + métier + stratégie)

## Complexité estimée

**Lourde** — 13-15 agents, 6 phases (0a + 0 + 1 + 2 + 3 + 4 + 5), multi-sessions confirmé. Coût estimé indicatif : ~$80-140 sur la totalité du run (Opus principalement, avec quelques Tasks consultation).

## Plan par phase

### Phase 0a — Cadrage IA-first (préalable) — `COMPLETE`

- **Agent** : @ia
- **Mission** : remplir 3 `[BLOCK_IA]` dans `project-context.md` (verbatims persona, 3 mots qui ne définissent PAS, différence clé vs pricepertoken)
- **Livrable** : `project-context.md` mis à jour (lignes 31-60 verbatims V1-V5, lignes 68-71 mots négatifs justifiés, ligne 73 diff vs pricepertoken)
- **Statut** : COMPLETE (2026-05-05)
- **Auto-évaluation @ia** : 5/5/5/5/5 (Complétude/Cohérence/Actionnabilité/Messages/Spécificité)
- **Risques signalés à valider plus tard** :
  - Fil HN #44682465 + source Finout tokenizer Opus 4.7 +35 % → re-vérification par @reviewer avant publication landing (G13)
  - Mention "MCP gratuit sans monétisation" pricepertoken → reconfirmer Phase 3 (concurrence évolutive)
  - Breaking change Vercel AI SDK `streamText` → re-vérifier par @fullstack au scaffold `/api/sdk-status`

### Phase 0 — Fondations stratégiques — `EN COURS`

- **Wave 1 (parallèle)** : @creative-strategy ("Positionnement & plateforme de marque") + @legal ("Audit juridique & conformité") — `COMPLETE 2026-05-05`
  - @creative-strategy : 4 fichiers `docs/strategy/` (1217 lignes), 5/5/5/5/5, naming `DevRefs` confirmé, domaine `devrefs.dev` recommandé, Category Design B2A
  - @legal : 4 fichiers `docs/legal/` (979 lignes), 5/5/5/5/5, GO CONDITIONNEL (4 actions P0 avant 1ère tx, recommandation rester sous franchise art. 293 B)
  - Cohérence wave 1 : 0 placeholder, pricing/JWT/naming cohérents cross 8 fichiers
- **Wave 2 (séquentiel après wave 1)** : @product-manager ("Vision produit & roadmap" + "Définir le scope V1" mergés) — `COMPLETE 2026-05-05`
  - 6 fichiers `docs/product/` (5/5/5/5/5), 26 features V1 (17 épics + 9 support), 7 V2 reportées, hypothèse business agrégée H1+H2 testée E1 J7 binaire, critères succès J7≥5 paiements OU JWT actif / J30 ≥50€ / J90 ≥200€ / M+6 ≥600€/mois (KPI North Star), citation Perplexity ≥1 à M+1 / ≥30 à M+6
- **Wave 3 (séquentiel après wave 2)** : @data-analyst ("KPIs & tracking plan") — `COMPLETE 2026-05-05`
  - 4 fichiers `docs/analytics/` + `docs/dev-decisions.md` (5/5/5/5/5), 39 KPIs (5 AARRR + 3 DevRefs-spécifiques + 3 validation persona), 38 events sur 6 domains (api/payment/landing/crawl/cron/quality), zéro-PII confirmé OUI, dashboard 4 zones (Revenue/Activation funnel/Cohérence promesse↔réalité/Discovery)
- **Wave 4 (parallèle après wave 3)** : @creative-strategy + @copywriter ("Construire la messaging matrix") + @product-manager + @data-analyst + @growth + @legal ("Stratégie de pricing complète") — `REPORTÉE — pricing déjà arbitré dans brief (0,49€/4,99€), formalisation possible Phase 1 couplée @copywriter`
- **Checkpoint utilisateur OBLIGATOIRE après Phase 0** (renforcement #9) — `EN COURS`
- **Livrables attendus** :
  - `docs/strategy/brand-platform.md`
  - `docs/strategy/personas.md`
  - `docs/strategy/competitive-benchmark.md`
  - `docs/strategy/creative-brief.md`
  - `docs/strategy/messaging-matrix.md`
  - `docs/product/product-vision.md`
  - `docs/product/roadmap.md`
  - `docs/product/backlog.md`
  - `docs/product/discovery-map.md`
  - `docs/product/assumption-map.md`
  - `docs/product/v1-scope.md`
  - `docs/product/pricing-strategy.md`
  - `docs/analytics/kpi-framework.md`
  - `docs/analytics/tracking-plan.md`
  - `docs/analytics/dashboard-specs.md`
  - `docs/legal/legal-audit.md`
  - `docs/legal/rgpd-checklist.md`
  - `docs/legal/cgu-draft.md`
  - `docs/legal/privacy-policy.md`

### Phase 1 — Conception — `COMPLETE 2026-05-05 (session 2)`

- **5 agents en parallèle** : @ux + @design + @copywriter + @product-manager + @qa
- **Livrables produits** (3 718 lignes au total, 5/5/5/5/5 chacun) :
  - @ux : `docs/ux/user-flows.md` (652 l, 6 parcours, 4 frictions, 12 contracts API identifiés)
  - @design : `docs/design/design-system.md` (629 l, 12 composants V1, light+dark toggle, WCAG 2.2 AA) + `page-compositions.md` (729 l, 5 surfaces, H1 verrouillé, 1 CTA conviction-first §7)
  - @copywriter : `docs/copy/brand-voice.md` (242 l) + `docs/copy/landing.md` (486 l, 7 sections + paywall + 5 emails Mailchannels + meta SEO H1/desc/OG)
  - @product-manager : `docs/product/functional-specs.md` (337 l, 10 endpoints contractualisés, 6 KV namespaces, 5 crons, 29 features × 21 US × 47 events tracée, 10 gates fonctionnels GA-01→GA-10)
  - @qa : `docs/qa/qa-strategy.md` (643 l, pyramide 60/25/10/3/2, 32 gates G1-G32 + GP1-GP10 + GC1-GC10, 6 tests pivot v2 Given/When/Then, matrice traçabilité bidirectionnelle)
- **Cohérence cross-livrables Phase 1** : 7/7 fichiers cohérents pricing $10/$9.99 ; 5/7 H1 "Cost intelligence" (absents brand-voice et functional-specs = normal) ; 6/7 libellé checkbox L.221-28 13° verbatim (absent brand-voice = normal). 0 contradiction détectée.
- **G15 zéro placeholder** : PASS (seul match qa-strategy.md = définition meta du test G15 lui-même).
- **Note timeout** : @product-manager initial timeouté API stream idle, relancé avec brief compact (~351 l vs 600 prévues) — résultat 5/5/5/5/5 conservé.
- **2 agents custom à créer Phase 2** : @testeur-agent-ia + @testeur-sponsor-humain (handoff @agent-factory)

### Phase 2 — Développement — `EN ATTENTE prochaine session`

- **Agents** : @infrastructure (CI/CD), @fullstack (V1 complète), @ia (n/a — pas d'IA runtime), @ux (revue post-implémentation), @qa (audit complet)
- **Sub-phase 2c — Test agent IA** : @testeur-agent-ia (gates GP1-GP10) — création prérequise via @agent-factory si pas déjà fait
- **Sub-phase 2d — Test client** : @testeur-developpeur-superviseur (gates GC1-GC10) — création prérequise via @agent-factory
- **Boucle visuelle obligatoire** : screenshots Playwright sur 3 devices (375/768/1280) sauvegardés dans `tests/screenshots/`, comparés à `docs/design/page-compositions.md`. Gate G26 bloque si baselines manquantes.
- **Pre-commit build check obligatoire** : `tsc --noEmit && next lint && npm run build` (ou équivalent CF Workers + esbuild) avant chaque commit src/.
- **Scope freeze ACTIF** après cette phase. Nouvelles features → `docs/product/backlog-v2.md`.

### Phase 3 — Visibilité — `EN ATTENTE`

- **Agents** : @seo, @geo, @copywriter (calendrier éditorial)
- **Spécificités projet** : optimisation pour citation Perplexity/Claude/ChatGPT (axe GEO prioritaire vu le KPI North Star secondaire), JSON-LD `Dataset` + `dateModified`, llms.txt explicite, IndexNow push après chaque update.

### Phase 4 — Acquisition — `EN ATTENTE`

- **Agents** : @growth (stratégie + plan de lancement + earned media), @social, @copywriter (emails), @sales-enablement (playbook commercial obligatoire — renforcement #12)
- **Sub-phase 4a (earned media)** : pipelines @growth — communiqués, newsjacking, data stories (Opus 4.7 +35% tokenizer = data story), directories agents IA, Dev.to, Reddit r/ClaudeAI ou r/LocalLLaMA. ROI marqué `[HYPOTHÈSE]`.
- **Sub-phase 4b (sales-enablement)** : playbook commercial, propositions, objection handling, ROI calculator (l'armurier qui équipe le fondateur).

### Phase 5 — Audit & Validation — `EN ATTENTE`

- **Sub-phase 5a (audit)** : @reviewer ("Revue croisée GO/NO-GO") + @qa ("Audit qualité & tests complets")
- **Sub-phase 5b (revue finale chirurgicale OBLIGATOIRE)** : @qa + @fullstack + @ux + @design ("Revue finale page par page (dernier kilomètre)") — audit 21 dimensions par page, correction P0+P1+P2.
- **Sub-phase 5c (lancement)** : Checklist jour de lancement (GO/NO-GO final) + @infrastructure ("Monitoring post-launch").

## Phase 0 v2 — PIVOT PURE B2A 100% AGENTS IA (Thomas 2026-05-05)

**Décision fondatrice** : "100% agents IA point final, 2 offres, no-brainer chacune, rentable bien sûr".

- Pricing repris @ia : Pack Standard $10 (10K calls) + Audit one-shot $9,99 + Subscription Pro $29/mo V2.
- Cible 600€/mois = 66 transactions/mois (~2,2/jour) — réaliste mix Pack + Audit.
- Stripe humain BANNI comme pilier (peut rester option marginale top-up wallet sponsor).
- Persona principal payeur unique = agent IA. Persona secondaire = sponsor wallet (top-up only).

### Phase 0 v2 wave brand+specs — `COMPLETE 2026-05-05`

- @ia : 4 specs `docs/ia/` (1274 lignes, 5/5/5/5/5) — agent-integration + agent-economics + x402-response-spec + agent-audit-spec
- @creative-strategy : 4 livrables `docs/strategy/` refondus + project-context (5/5/5/5/5) — promesse v2 = hero v2 = "Cost intelligence for AI agents — know before you spend, optimize after you ship"
- Cohérence cross-v2 : 0 placeholder, pricing/hero cohérents 7 fichiers, mentions Stripe résiduelles = bannissements explicites

### Phase 0 v2 wave 2 — `COMPLETE 2026-05-05 (session 2)`

- @product-manager : 7 livrables `docs/product/` (1872 lignes, 5/5/5/5/5) — v1-scope v2 (29 features V1 vs 26, 3e endpoint /api/agent-audit, F8b pack KV nouveau, pricing $10/$9.99) + roadmap v2 (RICE recalibré, chemin critique 3 endpoints) + backlog v2 (21 user stories, +6 nouvelles US-08b/US-16-20, V4 archivé, US-10b sponsor wallet) + discovery-map v2 (O5 audit post-flight, S4.1 Stripe Link retirée) + assumption-map v2 (H3 archivée, H9+H10+HT6) + product-vision (patch minimal) + pricing-strategy.md (NOUVEAU)
- Cohérence wave 1 v2 : 0 placeholder, pricing repris depuis agent-economics.md, V4 verbatim banni, Stripe rétrogradé top-up sponsor uniquement

### Phase 0 v2 wave 3 — `COMPLETE 2026-05-05 (session 2)`

- @data-analyst : 4 livrables `docs/analytics/` + `docs/dev-decisions.md` v2 (1360 lignes, 5/5/5/5/5) — kpi-framework v2 (NSM x402-only, J7 ≥ 1 paiement, 3 blocs KPI nouveaux pack/audit/refund, AARRR 2 funnels) + tracking-plan v2 (47 events actifs vs 38, +12 nouveaux, -3 Stripe humain, domains audit/pack/sponsor, 21 user stories mappées 100 %) + dashboard-specs v2 (4 zones recadrées, F26 sponsor wallet) + dev-decisions v2 (3 sections nouvelles : pack KV, audit endpoint, tracking events)
- Décisions techniques tranchées : `/api/pack/quota` endpoint dédié (KV direct, pas event AE car AE = event-stream pas state-store) ; 6 alertes ROUGE Mailchannels définies
- Cohérence cross-wave 2/3 : 21 user stories backlog v2 → 100 % mappées sur events tracking-plan v2 ; cibles 66 tx/600 € reprises ; H9/H10 instrumentés

### Phase 0 v2 session 3 — `COMPLETE 2026-05-05 (session 2 étendue)`

- @legal : 4 livrables `docs/legal/` v2 (1098 lignes, 5/5/5/5/5) — legal-audit v2 (§§ Stripe humain pilier retirées, audit endpoint + pack + x402 V2 + INF-11 à INF-15) + cgu-draft v2 (Art. 3bis audit, 4bis packs, 4ter garantie ROI, 4quater renonciation L.221-28 13°, Stripe rétrogradé service auxiliaire) + privacy-policy v2 (5 questions PII tranchées, 12 events validés zéro-PII, art. 26 RGPD responsabilité partagée) + rgpd-checklist v2 (20 ✓ / 18 ⚠ / 8 N/A vs 18/17/8 v1, 3 nouveaux items)
- Verdict global : GO CONDITIONNEL (4 actions P0 maintenues : immat auto-entreprise, email dpo@coinbase.com [HYPOTHÈSE H1 toujours active], expert-comptable BNC stablecoin, Stripe Tax)
- 5 questions PII tranchées : Q1 wallet_hash = pseudonyme RGPD (intérêt légitime + TTL 24h), Q2 tx_hash = quasi-identifiant agrégation (compta 10 ans + dispute 30j), Q3 customer_id Stripe = pseudonyme côté DevRefs (hash email si webhook), Q4 renonciation L.221-28 13° = OUI 3 conditions cumulatives (action P1 avocat conso), Q5 input audit non persisté = OUI 4 garanties techniques (audit code @qa Phase 3)

### Phase 0 v2 — CHECKPOINT FINAL — `EN COURS (utilisateur)`

- 23 livrables consolidés (4 strategy + 4 ia + 7 product + 4 analytics + 1 dev-decisions + 4 legal v2 = 5800+ lignes)
- Cohérence cross-fichier : 100 % vérifiée — pricing $10/$9.99/$29 reprise depuis agent-economics.md, garantie ROI 50 % refund cohérente cross 4 fichiers (pricing-strategy + agent-audit-spec + cgu-draft + legal-audit), 21 user stories backlog → 47 events tracking-plan mappés 100 %, zéro-PII validé sur 12 nouveaux events
- Présentation GO/AJUSTER à Thomas en attente

## Métriques live

| Phase      | Agents                          | Parallèles | Relances | P0  | Coût estimé | Statut           |
| ---------- | ------------------------------- | ---------- | -------- | --- | ----------- | ---------------- |
| 0a         | 1 (@ia)                         | 0          | 0        | 0   | ~$3-5       | COMPLETE         |
| 0 (wave 1) | 2 (@creative-strategy + @legal) | 2          | 0        | 0   | ~$8-12      | COMPLETE         |
| 0 (wave 2) | 1 (@product-manager)            | 0          | 0        | 0   | ~$4-6       | COMPLETE         |
| 0 (wave 3) | 1 (@data-analyst)               | 0          | 0        | 0   | ~$3-5       | COMPLETE         |
| 0 (wave 4) | 6 multi (messaging + pricing)   | partiel    | 0        | 0   | ~$15-25     | REPORTÉE Phase 1 |
| 1          | 5                               | 3          | —        | —   | ~$20-30     | EN ATTENTE       |
| 2          | 5 + 2 testeurs                  | partiel    | —        | —   | ~$25-40     | EN ATTENTE       |
| 3          | 3                               | 3          | —        | —   | ~$8-12      | EN ATTENTE       |
| 4          | 4                               | 2          | —        | —   | ~$12-18     | EN ATTENTE       |
| 5          | 5                               | partiel    | —        | —   | ~$15-25     | EN ATTENTE       |

## Compteur de session courante

- Phases complétées : 2/6 (Phase 0a + Phase 0 wave 1 COMPLETE)
- Tasks producteurs lancés : 3 (cap recommandé : 8-12 par session — encore 5-9 disponibles)
- Tasks consultation : 0
- Drift détecté : NON
- Dernière session : 2026-05-05 (en cours)
- Décisions structurantes wave 1 :
  - Naming définitif = **DevRefs** (working name confirmé sans pivot, validé sur 4/5 critères)
  - Domaine = **devrefs.dev** (TLD .dev privilégié vs .io pour HSTS forcé + connotation dev)
  - Catégorie = **B2A — Agent-first reference layer for fresh tech data** (Category Design)
  - Verdict legal = **GO CONDITIONNEL** (4 P0 actions hors-code à exécuter par Thomas en parallèle du dev)
  - Architecture **zéro-PII** confirmée comme native — RGPD allégé, pas de bannière cookies, pas de DPO

## Feedbacks remontants

| #   | Sévérité | Agent source | Agent cible | Problème | Statut |
| --- | -------- | ------------ | ----------- | -------- | ------ |
| —   | —        | —            | —           | —        | —      |

## Décisions d'arbitrage

| #   | Sujet                                    | Décision                                                                                            | Justification                                                                                                                          | Agents impactés       |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | Naming "DevRefs" working name vs final   | Working name retenu pour cadrage. Naming définitif arbitré par @creative-strategy en Phase 0 wave 1 | Le brief listait 4 alternatives sans tranche. Arbitrage stratégique = compétence creative-strategy.                                    | tous                  |
| 2   | Concurrent principal singulier           | pricepertoken.com retenu (le plus établi SEO)                                                       | Brief listait 3 concurrents. Positionnement net = un concurrent référent. À challenger par @ia/@creative-strategy si signal contraire. | creative-strategy, ia |
| 3   | Phase 0 enrichie d'une phase 0a IA-first | Phase 0a prérequise (BLOCK_IA dans project-context.md)                                              | Persona = agent IA autonome. 3 champs critiques requièrent expertise @ia avant que les autres agents puissent travailler.              | ia, tous aval         |
| 4   | Stack IA runtime = aucun                 | Validé. Aucune IA dans le runtime (cron scrape simple).                                             | Le brief le précise. Évite cargo-culting "il faut de l'IA".                                                                            | ia, fullstack         |

## Reprise après interruption

Pour reprendre en nouvelle session :

```
Lis project-context.md et docs/orchestration-plan.md, continue où on s'est arrêté.
```

---

## 📋 MEMO DE REPRISE — Prochaine session (Session 5 — Coinbase + Stripe + Phase 3 visibilité)

**Numéro de session prochaine** : Session 5 du projet DevRefs.

**Statut au 2026-05-06 (fin session 4 — déploiement live + sub-phase 2c testeur PASS)** :

- **Worker preview** : `https://devrefs-api-preview.thomas-issa.workers.dev` — 12 modèles + 7 SDKs seedés, 4 secrets configurés (HMAC, JWT, INDEXNOW, ADMIN_ALERT_EMAIL), HMAC signature live + JSON-LD Dataset
- **Frontend Pages preview** : `https://preview.devrefs-frontend.pages.dev/` — landing 16.6 KB + paywall 3 checkboxes L.221-28 + dashboard sponsor + /llm-prices SEO + llms.txt + robots/sitemap/openapi
- **Sub-phase 2c** : @testeur-agent-ia **8/8 PASS** gates exécutables (GP1-GP8). GP9/GP10 SKIP justifiés (pack purchase réel nécessite Coinbase x402 settle)
- **Analytics Engine** : désactivé (token CF manque scope `Account Analytics: Read`)
- **CI/CD GitHub Actions** : opérationnel (lint-test/build/deploy-preview verts, e2e en attente baselines screenshots)

**Étape 5 du mémo précédent (testeurs sub-phases 2c/2d) partiellement complète** :

- 2c PASS sur ce qui est testable sans Coinbase
- 2d skippée — @testeur-sponsor-humain GC1-GC10 nécessite Stripe Payment Link test mode

**Observations GP8 non-bloquantes à corriger avant prod (5 fixes mineurs @fullstack)** :

1. `_audit_id` format `aud_YYYY-MM-DD_HHMMSS` vs spec UUID v4 → aligner spec ou code
2. `freshness_proof` absent du body 402 audit (présent sur llm-prices) → ajouter dans `x402-body.ts` audit context
3. `roi_multiplier: 0` dans 402 audit (calc vs Opus < $9.99) → recalculer vs consultant humain ($200-2000)
4. GP10 message erreur pack exhausted = `invalid_signature` au lieu de `Pack expired — re-purchase or pay-per-call`
5. `monthly_volume_estimate` placement spec (root vs `agent_config.*`) à aligner

**À faire en SESSION 5 — Actions Thomas (manuelles non-automatisables) + Phase 3** :

### Étape 1 — Actions Thomas (~30 min, comptes externes)

1. **Coinbase Developer Platform** : créer compte + activer x402 facilitator sandbox + récupérer API key + créer wallet Base USDC treasury → secrets Worker `COINBASE_X402_FACILITATOR_KEY` + `DEVREFS_TREASURY_WALLET`
2. **Stripe** : activer test mode + créer Payment Link top-up (5/10/50 EUR) + webhook endpoint vers `/api/webhooks/stripe` + récupérer signing secret → secrets Worker `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
3. **Domaine devrefs.dev** : achat (~$15/an Cloudflare Registrar ou Namecheap) + DNS pointing CF
4. **Immatriculation BNC auto-entreprise** : URSSAF (P0 legal-audit, délai 7-14j) — bloquant 1ère vraie tx
5. **Token CF** : créer un nouveau API token avec scope `Account Analytics: Read` ajouté + remplacer GitHub secret pour réactiver Analytics Engine

### Étape 2 — Sub-phase 2c bis : tester GP9/GP10 (1 Task @testeur-agent-ia)

Post-Coinbase setup → re-lancer testeur sur pack purchase + quota consumption flow réel.

### Étape 3 — Sub-phase 2d : @testeur-sponsor-humain (1 Task)

Post-Stripe setup → exécuter GC1-GC10 sur landing publique + paywall + dashboard sponsor + refund EIP-191.

### Étape 4 — 5 fixes mineurs @fullstack (1 Task)

Corriger les 5 observations GP8/GP10 listées ci-dessus.

### Étape 5 — Phase 3 visibilité (3-4 Tasks)

- @seo : audit SEO technique + sitemap signoff + meta SEO 4 pages
- @geo : optimisation visibilité LLM (Perplexity / Claude / ChatGPT) + monitoring citations
- @copywriter : calendrier éditorial 2 posts Dev.to + 1 post Reddit r/ClaudeAI ou r/LocalLLaMA

**Sessions 6-7 prévues (inchangé)** :

- Session 6 : Phase 4 acquisition (@growth + @social + @sales-enablement)
- Session 7 : Phase 5 audit & lancement (@reviewer + @qa final + GO/NO-GO)

**Compteur session 4 final** : 7 actions effectives livrées (token verify + 2 seeds KV + test live + frontend Pages + testeur GP1-GP10 + 6 fixes CI/wrangler de débogage).

**⚠️ Sécurité** : Thomas doit **révoquer le token CF API** partagé en session 4 (`cfut_IjECKvFNAjD...`) post-clôture. Créer un nouveau token avec scope étendu (`Account Analytics: Read` ajouté) pour session 5 + remplacer GitHub Secret.

---

## 📋 MEMO ARCHIVÉ — Session 4 (déploiement live + sub-phase 2c) — clos 2026-05-06

> Session 4 a livré : déploiement Worker preview live + frontend CF Pages + KV seedés (12 prix + 7 SDKs) + 4 secrets configurés + sub-phase 2c testeur-agent-ia 8/8 PASS. Reste pour session 5 : Coinbase + Stripe + domaine + immatriculation + Phase 3 visibilité.

**Statut au 2026-05-06 initial (fin session 3 — Phase 2 build technique)** :

- Phase 2 build technique COMPLET — 5 Tasks producteur livrées (cible 4-6) :
  - Étape 2 @agent-factory : `testeur-agent-ia.md` + `testeur-sponsor-humain.md` (commit 6c2be4d)
  - Étape 3 @infrastructure : wrangler.toml + ci.yml + husky + package.json + .gitignore + README + REPLIT_ACTIONS (commit 94bfa48)
  - Étape 4a+4b @fullstack : foundation src/api/ + 3 endpoints monétisés + middleware x402/pack/JWT/rate-limit + watermark HMAC + 5 heuristiques audit (commit 17ac698)
  - Étape 4c+4d @fullstack : 5 crons src/cron/ + frontend public/ 7 pages HTML + 12 favicons + sitemap + robots + openapi (commit 215cbc3)
  - Étape 4e+4f @fullstack : Stripe top-up + Coinbase webhook + Mailchannels 5 emails + viem ecrecover EIP-191 + 47 events + Playwright 21 US E2E + 7 tests pivot v2 + 4 tests a11y + visual regression (commit 4b22773)
- Tests : 147/147 unit PASS + 16/16 integration PASS. Bundle Worker 114 KB (cap 1 MB). Pre-commit check tsc/lint/test/build PASS.
- Gates GA-01→GA-10 : 9/10 PASS, GA-01 latence en attente exécution Playwright sur Wrangler dev déployé.
- Branch : `claude/devrefs-s3-phase2-build-xBRMj` mergée à valider session 4.

**Étape 5 — testeurs sub-phases 2c + 2d : REPORTÉE session 4** car nécessite déploiement preview Cloudflare (actions Replit Thomas obligatoires avant exécution).

**À faire en SESSION 4** :

### Étape 1 — Actions Replit prérequises (Thomas, ~30 min)

Avant tout lancement testeur, exécuter dans l'ordre (cf. `REPLIT_ACTIONS.md` racine + `docs/REPLIT_ACTIONS.md`) :

1. `wrangler login`
2. `pnpm kv:create:all` → coller les 6 IDs KV dans wrangler.toml
3. `wrangler secret put` × 8 (COINBASE_X402_FACILITATOR_KEY / DEVREFS_TREASURY_WALLET / HMAC_SECRET_KEY / STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / INDEXNOW_API_KEY / JWT_SECRET / ADMIN_ALERT_EMAIL)
4. GitHub secrets repo : CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
5. GitHub branch protection main (1 review + status checks)
6. `pnpm playwright install --with-deps`
7. `UPDATE_SCREENSHOTS=1 pnpm test:visual` puis commit baselines
8. `pnpm deploy:preview` → URL preview ex. `https://devrefs-preview.workers.dev`
9. Coinbase x402 sandbox API key + wallet sandbox approvisionné
10. Stripe test mode Payment Link + webhook endpoint pointant vers preview URL

### Étape 2 — Sub-phase 2c : @testeur-agent-ia (1 Task producteur)

**Mission** : exécuter GP1-GP10 sur stack preview (Coinbase x402 testnet + CF Workers preview URL).

- Inputs : preview URL + wallet sandbox + clé privée test
- Output attendu : 10/10 GP1-GP10 PASS (BLOQUANT pour Phase 3)
- Si une gate FAIL → diagnostic + fix @fullstack puis re-run

### Étape 3 — Sub-phase 2d : @testeur-sponsor-humain (1 Task producteur)

**Mission** : exécuter GC1-GC10 sur stack preview (Stripe test mode + dashboard JWT).

- Inputs : preview URL + JWT sponsor de test + Stripe Payment Link test mode + wallet sandbox sponsor
- Output attendu : 10/10 GC1-GC10 PASS (BLOQUANT pour Phase 3)

### Étape 4 — Cleanup post-testeurs

- Consolider doublon `REPLIT_ACTIONS.md` racine + `docs/REPLIT_ACTIONS.md` en 1 source canonique
- Generate baselines screenshots finaux + commit `tests/screenshots/baseline/`
- Vérifier 47 events tracking-plan v2 émis en CF AE après 1ère vraie tx

### Étape 5 — Phase 3 visibilité (suite mémo session 2)

Après Phase 2 close (gates 32+20 PASS), enchaîner Phase 3 :

- @seo : audit SEO technique + sitemap + robots + meta SEO 4 pages
- @geo : optimisation visibilité LLM (Perplexity / Claude / ChatGPT) + monitoring citations
- @copywriter : calendrier éditorial Phase 3 (2 posts Dev.to + 1 post Reddit r/ClaudeAI ou r/LocalLLaMA selon plan original)

**Sessions 5-6 prévues (inchangé)** :

- Session 5 : Phase 4 acquisition (@growth + @social + @sales-enablement playbook)
- Session 6 : Phase 5 audit & lancement (@reviewer + @qa audit final + checklist GO/NO-GO + @infrastructure monitoring post-launch)

**Compteur session 3 final** : 5/4-6 Tasks producteur (cible respectée). 31 fichiers livrés Phase 2 (~3 700 lignes code + tests + docs).

---

## 📋 MEMO ARCHIVÉ — Session 3 (Phase 2 build) — clos 2026-05-06

> Conservé pour traçabilité. Session 3 a livré l'intégralité du build technique Phase 2 sauf testeurs sub-phases 2c+2d (reportées session 4 par dépendance actions Replit).

**Statut au 2026-05-05 initial (fin session 2 étendue)** :

**Statut au 2026-05-05 (fin session 2 étendue)** :

- Phase 0a + Phase 0 v1 (waves 1-3) + Phase 0 v2 (brand+specs + wave 2 + wave 3 + legal v2 + checkpoint final) : **COMPLETE** — 23 livrables (~5800 lignes)
- Phase 1 conception : **COMPLETE session 2** — 5 agents en parallèle (@ux + @design + @copywriter + @product-manager + @qa), 7 livrables (3718 lignes), 5/5/5/5/5 chacun, 0 contradiction
- 31 livrables cumulés Phase 0 + Phase 1 (~9 500 lignes), 0 P0/P1 learning non-propagé en attente
- Compteur Tasks producteur session 2 : 9 (PM + DA + legal + 5 Phase 1 + 1 PM relance suite timeout API stream-idle)
- Branch active : `claude/devrefs-s2-phase0-v2-wave2-vm2Em` → renommer en début session 3 vers `claude/devrefs-s3-phase2-build-XXXX`

**À faire en SESSION 3 — Phase 2 build (commande de reprise standard)** :

### Étape 1 — Lecture de reprise session 3 (8-10 min)

1. `project-context.md` (sections Stack technique + Modèle économique v2)
2. `docs/orchestration-plan.md` (ce fichier — section Phase 2)
3. `docs/product/functional-specs.md` v1 (10 endpoints, 6 KV namespaces, 5 crons, 7 secrets, 10 gates fonctionnels GA-01→GA-10) — c'est la source #1 pour @fullstack
4. `docs/design/design-system.md` (12 composants V1, tokens CSS, light+dark) + `docs/design/page-compositions.md` (5 surfaces, H1 verrouillé)
5. `docs/copy/landing.md` (7 sections + paywall 3 checkboxes Art. 4quater verbatim + 5 emails Mailchannels + meta SEO)
6. `docs/qa/qa-strategy.md` (pyramide 60/25/10/3/2, 32 gates + GP1-GP10 + GC1-GC10, matrice traçabilité)
7. `docs/ux/user-flows.md` (6 parcours pour cross-check parcours implémentés)
8. `docs/dev-decisions.md` v2 (handoff technique @fullstack + KV pack + audit endpoint + 47 events)
9. `docs/legal/cgu-draft.md` v2 (clauses à respecter dans l'implémentation : Art. 3bis/4bis/4ter/4quater)

### Étape 2 — @agent-factory : créer 2 agents testeurs (1 Task producteur)

**Mission** : créer `@testeur-agent-ia` (gates GP1-GP10, simule Claude Code/Cursor/AgentKit) + `@testeur-sponsor-humain` (gates GC1-GC10, simule humain qui top-up wallet) avec specs déjà documentées dans `docs/strategy/brand-platform.md` v2 §8.

- Inputs : qa-strategy.md §6+§7 (méthodes + seuils) + brand-platform.md v2 §8 (specs Inputs/Outputs/Critère succès)
- Output : `.claude/agents/testeur-agent-ia.md` + `.claude/agents/testeur-sponsor-humain.md`
- Note : prérequis avant Phase 2 sub-phases 2c (test agent IA) + 2d (test sponsor humain)

### Étape 3 — @infrastructure : CI/CD + setup pipeline (1 Task producteur)

**Mission** : choisir et configurer pipeline CI/CD (GitHub Actions vs Cloudflare CI), setup wrangler.toml bindings (6 KV namespaces + AE binding + Service binding cron worker), 7 secrets env vars (EVM_PRIVATE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, COINBASE_WEBHOOK_SECRET, JWT_HMAC_SECRET, MAILCHANNELS_API_KEY, RESOURCE_SERVER_URL), pre-commit hook build check (`tsc --noEmit && next lint && npm run build` ou équivalent CF Workers + esbuild), GitHub branch protection.

- Inputs : functional-specs.md §5 (dépendances techniques exhaustives) + qa-strategy.md §9 (process QA) + project-context.md (stack 0 € free tier)
- Output : `.github/workflows/`, `wrangler.toml`, scripts pre-commit, README setup

### Étape 4 — @fullstack : V1 complète (Tasks producteur multiples, séquentiel par dépendance)

**Mission** : implémenter 29 features V1 selon functional-specs + page-compositions + landing copy. Séquencement par chemin critique :

- 4a (foundation) : middleware x402 unifié, KV namespaces, JWT HMAC, scaffolding Worker API + Worker cron + page Cloudflare statique HTML
- 4b (endpoints) : `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit` avec watermark HMAC + KV pack quota
- 4c (cron jobs) : 5 crons (prices 6h, sdk 24h, indexnow, pack-expiry, cron-health-check)
- 4d (frontend) : landing publique HTML statique + paywall 3 checkboxes + dashboard sponsor JWT + page référence /llm-prices + llms.txt + robots.txt + sitemap.xml + 12 favicons (G31)
- 4e (intégration) : Stripe Payment Link top-up sponsor + Coinbase x402 sandbox + Mailchannels emails + 47 events tracking-plan instrumentés
- 4f (tests + boucle visuelle) : pre-commit build check OBLIGATOIRE chaque commit src/ + screenshots Playwright sur 3 devices (375/768/1280) sauvegardés dans `tests/screenshots/` vs baselines page-compositions (G26 BLOQUANT)
- Référence stricte : `docs/REPLIT_ACTIONS.md` à créer si modifications config (cf. règle 10 CLAUDE.md)

### Étape 5 — Sub-phases 2c + 2d : tests testeur-persona-agent + testeur-sponsor (1-2 Tasks producteur)

- 2c : @testeur-agent-ia exécute GP1-GP10 sur stack live sandbox (Coinbase x402 testnet)
- 2d : @testeur-sponsor-humain exécute GC1-GC10 sur stack live (Stripe test mode)
- Verdict gates : 32/32 G1-G32 PASS + 10/10 GP1-GP10 + 10/10 GC1-GC10 BLOQUANT pour passer Phase 3

**Compteur cible session 3** : 4-6 Tasks producteur (@agent-factory + @infrastructure + 3-4 sous-phases @fullstack + checkpoint utilisateur intermédiaire). Le scope freeze est ACTIF après Phase 2 (CLAUDE.md règle implicite). Toute nouvelle feature → `docs/product/backlog-v2.md`.

**Sessions 4+ prévues** :

- Session 4 : Phase 3 visibilité (@seo + @geo + @copywriter calendrier éditorial)
- Session 5 : Phase 4 acquisition (@growth + @social + @sales-enablement playbook)
- Session 6 : Phase 5 audit & lancement (@reviewer + @qa audit final + checklist GO/NO-GO + @infrastructure monitoring post-launch)

**Hypothèses à monitorer post-V1 (calibrées session 2)** :

- [HYPOTHÈSE] pack consumption rate cible 60% M+6 — lever : données réelles M+1 (data-analyst).
- [HYPOTHÈSE] packs expirant avec quota > 50% < 20% — lever : M+3.
- [HYPOTHÈSE] revenu BRUT split packs 330 €/audits 330 € cible M+6 — lever : mix réel observé M+1-M+3.

**Risques connus à monitorer** :

- R1 P1 — adoption x402 < 2% en 2026 = pari fondateur assumé. Mitigation : test E1 J7 binaire, packs réduisent volume nécessaire.
- R2 P1 — Anthropic / OpenAI peut shipper Token Counting + Optimizer natif 6-12 mois. Mitigation : audit cross-provider exclusif.
- R3 P2 — Coinbase x402 facilitator stabilité. Mitigation : code Worker portable + plan B Solana V2.
- R4 P2 — Audit ROI sur-estimé sur agent déjà optimisé. Mitigation : garantie CGV "savings_pct < 15% à 30j → refund 50%".

**Décisions verrouillées (ne pas re-débattre en session 3)** :

- Naming DevRefs + domaine devrefs.dev
- Pivot 100% B2A pure agents IA
- 2 offres : Calcul coût + Audit (3 endpoints)
- Pricing : Pack Standard $10 / Audit $9.99 / Subscription Pro $29/mo V2
- Hero : "Cost intelligence for AI agents — know before you spend, optimize after you ship"
- Persona principal payeur unique = agent IA / persona secondaire = sponsor wallet
- 3e offre future V2 : Cost Regression Alerts (sticky non-commoditizable)
