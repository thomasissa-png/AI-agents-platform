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

### Phase 1 — Conception — `EN ATTENTE`
- **Agents** : @ux, @design, @copywriter, @product-manager (specs fonctionnelles), @qa (tests dérivés)
- **Sub-phase 1b — Test persona** : @testeur-agent-ia (à créer via @agent-factory) sur les wireframes
- **Livrables principaux** : `docs/ux/user-flows.md`, `docs/design/design-system.md`, `docs/design/page-compositions.md`, `docs/copy/landing.md`, `docs/copy/brand-voice.md`, `docs/product/functional-specs.md`, `docs/qa/qa-strategy.md`

### Phase 2 — Développement — `EN ATTENTE`
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

### Phase 0 v2 session 3 — `EN ATTENTE prochaine session`
- @legal review CGU/privacy/mentions v2 (retirer sections Stripe humain pilier, ajouter clause `/api/agent-audit` + garantie ROI 50% refund si savings_pct < 15% à 30j)
- 5 questions PII data-analyst à trancher (wallet_hash SHA256, tx_hash on-chain, customer_id Stripe, droit rétractation L.221-18 vs garantie refund, contenu audit input mémoire Worker)
- Checkpoint final V2 → GO/AJUSTER avant Phase 1 (build)

## Métriques live

| Phase | Agents | Parallèles | Relances | P0 | Coût estimé | Statut |
|---|---|---|---|---|---|---|
| 0a | 1 (@ia) | 0 | 0 | 0 | ~$3-5 | COMPLETE |
| 0 (wave 1) | 2 (@creative-strategy + @legal) | 2 | 0 | 0 | ~$8-12 | COMPLETE |
| 0 (wave 2) | 1 (@product-manager) | 0 | 0 | 0 | ~$4-6 | COMPLETE |
| 0 (wave 3) | 1 (@data-analyst) | 0 | 0 | 0 | ~$3-5 | COMPLETE |
| 0 (wave 4) | 6 multi (messaging + pricing) | partiel | 0 | 0 | ~$15-25 | REPORTÉE Phase 1 |
| 1 | 5 | 3 | — | — | ~$20-30 | EN ATTENTE |
| 2 | 5 + 2 testeurs | partiel | — | — | ~$25-40 | EN ATTENTE |
| 3 | 3 | 3 | — | — | ~$8-12 | EN ATTENTE |
| 4 | 4 | 2 | — | — | ~$12-18 | EN ATTENTE |
| 5 | 5 | partiel | — | — | ~$15-25 | EN ATTENTE |

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

| # | Sévérité | Agent source | Agent cible | Problème | Statut |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

## Décisions d'arbitrage

| # | Sujet | Décision | Justification | Agents impactés |
|---|---|---|---|---|
| 1 | Naming "DevRefs" working name vs final | Working name retenu pour cadrage. Naming définitif arbitré par @creative-strategy en Phase 0 wave 1 | Le brief listait 4 alternatives sans tranche. Arbitrage stratégique = compétence creative-strategy. | tous |
| 2 | Concurrent principal singulier | pricepertoken.com retenu (le plus établi SEO) | Brief listait 3 concurrents. Positionnement net = un concurrent référent. À challenger par @ia/@creative-strategy si signal contraire. | creative-strategy, ia |
| 3 | Phase 0 enrichie d'une phase 0a IA-first | Phase 0a prérequise (BLOCK_IA dans project-context.md) | Persona = agent IA autonome. 3 champs critiques requièrent expertise @ia avant que les autres agents puissent travailler. | ia, tous aval |
| 4 | Stack IA runtime = aucun | Validé. Aucune IA dans le runtime (cron scrape simple). | Le brief le précise. Évite cargo-culting "il faut de l'IA". | ia, fullstack |

## Reprise après interruption

Pour reprendre en nouvelle session :
```
Lis project-context.md et docs/orchestration-plan.md, continue où on s'est arrêté.
```

---

## 📋 MEMO DE REPRISE — Prochaine session (Session 3 — @legal review v2 + checkpoint final)

**Numéro de session prochaine** : Session 3 du projet DevRefs.

**Statut au 2026-05-05 (fin session 2)** :
- Phase 0 v2 wave brand+specs : **COMPLETE session 1** (4 specs @ia + 4 livrables strategy v2)
- Phase 0 v2 wave 2 : **COMPLETE session 2** (@product-manager — 7 livrables produit, 5/5/5/5/5, pivot pricing intégré)
- Phase 0 v2 wave 3 : **COMPLETE session 2** (@data-analyst — 4 livrables analytics, 5/5/5/5/5, 47 events actifs)
- Compteur producteur Tasks session 2 : 2 (PM + DA), cohérence cross-wave validée
- 0 P0/P1 learning non-propagé en attente
- Branch active : `claude/devrefs-s2-phase0-v2-wave2-vm2Em` (pousser vers `claude/devrefs-s3-legal-review-v2-XXXX` en session 3)

**À faire en SESSION 2 (commande de reprise ci-dessus)** :

### Étape 1 — Lecture de reprise session 3 (5-7 min)
1. `project-context.md` (sections Modèle économique + Cible v2)
2. `docs/orchestration-plan.md` (ce fichier — section Phase 0 v2 session 3)
3. `docs/product/pricing-strategy.md` v2 (garantie ROI 50% refund + scénarios revenu)
4. `docs/analytics/tracking-plan.md` v2 (47 events, dont 12 nouveaux audit/pack/sponsor)
5. `docs/dev-decisions.md` v2 (handoff @legal — 5 questions PII spécifiques)
6. `docs/legal/legal-audit.md` v1 (à reviewer pour v2)
7. `docs/legal/cgu-draft.md` v1 (clauses Stripe humain pilier à retirer + clause /api/agent-audit à ajouter)
8. `docs/legal/privacy-policy.md` v1 (zéro-PII confirmé v1, à valider sur 12 nouveaux events)

### Étape 2 — @legal review v2 (1 Task producteur)
**Mission** : reviewer et patcher 4 livrables legal pour intégrer pivot v2 + 12 nouveaux events.
- `docs/legal/legal-audit.md` v2 — retirer §§ Stripe humain pilier, ajouter §§ audit endpoint (clause garantie ROI 50% refund) + §§ pack pré-payé x402 (irrévocabilité on-chain, expiration quota, droit rétractation L.221-18 vs L.221-28 13°).
- `docs/legal/cgu-draft.md` v2 — clause `/api/agent-audit` (input non persisté, output watermark HMAC, garantie savings_pct ≥ 15% sur 30j sinon refund 50%) + clause `pack_purchased` (validity period, non-refundable, transferable wallet only) + retrait clauses Stripe humain pilier (conserver clauses Stripe top-up sponsor marginales).
- `docs/legal/privacy-policy.md` v2 — confirmer zéro-PII sur 12 nouveaux events. Trancher 5 questions PII data-analyst : (a) `wallet_hash` SHA256 (pseudonyme RGPD ou non ?), (b) `tx_hash` on-chain stocké 30j CF AE (PII si combinable avec on-chain explorer ?), (c) `customer_id` Stripe (pseudonyme interne sans email — PII résiduelle si stocké côté DevRefs ?), (d) garantie refund vs droit rétractation L.221-18 14j (renonciation L.221-28 13° suffisante pour service numérique consommé immédiatement ?), (e) contenu `agent_config` + `sample_traces` audit input (mémoire Worker uniquement, jamais persisté — suffisant pour conformité ?).
- `docs/legal/rgpd-checklist.md` v2 — réévaluer 43 items dont les nouveaux events impactent (probablement ~5 items à ajuster).
- Référence inputs : tracking-plan v2 (47 events), pricing-strategy v2 (garantie + packs), agent-audit-spec.md (heuristiques + watermark HMAC).

### Étape 3 — Checkpoint final V2 Phase 0 → GO/AJUSTER avant Phase 1
**Mission** : @orchestrator consolide les 11 livrables Phase 0 v2 (4 strategy + 4 ia + 7 product + 4 analytics + 1 dev-decisions + 4 legal v2) et présente synthèse à Thomas pour arbitrage GO/AJUSTER avant lancement Phase 1 (build).
- Critères GO Phase 1 : 0 contradiction cross-fichier, 0 placeholder, 100% gates G7+G15+G17+G32 PASS, 4 actions P0 @legal exécutables hors-code (Coinbase DPA, BNC stablecoin, Stripe Tax, immatriculation auto-entreprise).
- Si GO : lancer Phase 1 conception — @ux + @design + @copywriter + @product-manager (specs fonctionnelles) + @qa (tests dérivés). Estimation 5 agents en parallèle.

**Compteur cible session 3** : 1 Task producteur (@legal) + 1 consolidation @orchestrator + checkpoint utilisateur OBLIGATOIRE.

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
