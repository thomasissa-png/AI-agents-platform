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

### Phase 0 v2 wave 2 — `EN ATTENTE prochaine session`
- @product-manager refonte v1-scope/roadmap/backlog/discovery-map/assumption-map/pricing-strategy (intégration 3e endpoint /api/agent-audit + pricing pack pré-payé)
- @data-analyst refonte kpi-framework/tracking-plan/dashboard-specs (KPIs adaptés pricing pack + B2A pure)

### Phase 0 v2 wave 3 — `EN ATTENTE session 3`
- @legal review CGU/privacy/mentions (retirer sections Stripe humain, ajouter clause `/api/agent-audit` + garantie ROI 50% refund si savings_pct < 15% à 30j)
- Checkpoint final V2 → lancement Phase 1 (build)

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

## 📋 MEMO DE REPRISE — Prochaine session (Phase 0 v2 wave 2)

**Statut au 2026-05-05 (fin session 1)** :
- Phase 0 v1 : waves 1-3 produites (4730 lignes) — **OBSOLÈTES sur les zones impactées par le pivot v2** (cf. ci-dessous)
- Audits triangulés @ia/@elon/@moi : 5,78/10 moyen → AJUSTER
- **Décision fondateur 2026-05-05** : pivot 100% B2A pure agents IA, 2 offres x402, Stripe humain banni
- Phase 0 v2 wave brand+specs : **COMPLETE** (4 specs @ia + 4 livrables strategy refondus, 5/5/5/5/5 chacun, cohérence cross-fichiers PASS)
- Compteur producteur Tasks session 1 : 8 (cap atteint)
- 4 P1 learnings capitalisés et propagés (Coinbase x402 DPA, TVA hybride, B2A 2 testeurs, pivot business model en cours Phase 0)

**À faire en SESSION 2 (commande de reprise ci-dessus)** :

### Étape 1 — Lecture de reprise (5 min)
1. `project-context.md` (sections Promesse + Modèle économique + Cible mises à jour v2)
2. `docs/orchestration-plan.md` (ce fichier)
3. `docs/strategy/brand-platform.md` v2 (promesse Cost intelligence + 2 offres + sponsor wallet)
4. `docs/ia/agent-economics.md` (pricing officiel : Pack Standard $10 + Audit $9.99)
5. `docs/ia/agent-audit-spec.md` (3e endpoint `/api/agent-audit` à intégrer en v1-scope)

### Étape 2 — Wave 2 v2 : @product-manager refonte (1 Task producteur)
**Mission** : refondre 6 livrables produit pour intégrer le pivot.
- `docs/product/v1-scope.md` v2 — AJOUTER 3e endpoint `/api/agent-audit` + pricing pack pré-payé en remplacement de la grille 0,49 €/query + 4,99 €/jour Stripe ; SUPPRIMER Stripe Payment Link humain comme feature pilier ; conserver Stripe en option marginale top-up wallet sponsor.
- `docs/product/roadmap.md` v2 — RICE re-scorée avec 3e endpoint, chemin critique re-tracé (middleware x402 unifié pour 3 endpoints, pas 2).
- `docs/product/backlog.md` v2 — user stories audit endpoint (US-16 à US-20 par exemple), V4 verbatim humain réécrit en sponsor.
- `docs/product/discovery-map.md` v2 — opportunité O5 (auto-optimisation agent post-flight) ajoutée.
- `docs/product/assumption-map.md` v2 — H9 ajouté (audit ROI 30-50% économies réelles validable).
- `docs/product/pricing-strategy.md` v2 — NOUVEAU fichier : pack pré-payé x402, garantie 50% refund si savings < 15% à 30j.
- Référence inputs : 4 specs @ia + 4 livrables @creative-strategy v2 + lessons-learned.

### Étape 3 — Wave 3 v2 : @data-analyst refonte (1 Task producteur)
**Mission** : refondre 4 livrables analytics pour pricing pack + B2A pure.
- `docs/analytics/kpi-framework.md` v2 — KPI North Star = revenu net x402 (Stripe humain retiré formule), AARRR adapté pricing pack (events `pack_purchased`, `pack_quota_consumed`), validation persona sponsor wallet (top-up events).
- `docs/analytics/tracking-plan.md` v2 — ajouter events `pack_*` + `audit_*`, retirer events `stripe_*` humain (sauf top-up sponsor optionnel marginal).
- `docs/analytics/dashboard-specs.md` v2 — 4 zones recadrées (Revenue x402 / Activation funnel agent / Cohérence promesse↔réalité / Discovery Dev.to+Reddit), retirer zone humain.
- `docs/dev-decisions.md` v2 — append section "Implémentation pricing pack" (KV quota lookup, signature x402 par pack pas par call) + "Implémentation audit endpoint" (heuristiques statiques sans IA runtime).

**Compteur cible session 2** : 2 Tasks producteur (PM + DA), checkpoint utilisateur intermédiaire si nécessaire.

**À faire en SESSION 3** :
- @legal review CGU/privacy/mentions v2 (retirer sections Stripe humain pilier, ajouter clause `/api/agent-audit` + garantie ROI)
- Checkpoint final V2 Phase 0 (présenter consolidation + GO/AJUSTER avant Phase 1)
- Lancement Phase 1 (build) si GO : @ux + @design + @copywriter + @product-manager (specs fonctionnelles) + @qa (tests dérivés)

**Risques connus à monitorer** :
- R1 P1 — adoption x402 < 2% en 2026 = pari fondateur assumé. Mitigation : test E1 J7 binaire, packs réduisent volume nécessaire.
- R2 P1 — Anthropic / OpenAI peut shipper Token Counting + Optimizer natif 6-12 mois. Mitigation : audit cross-provider exclusif.
- R3 P2 — Coinbase x402 facilitator stabilité. Mitigation : code Worker portable + plan B Solana V2.
- R4 P2 — Audit ROI sur-estimé sur agent déjà optimisé. Mitigation : garantie CGV "savings_pct < 15% à 30j → refund 50%".

**Décisions verrouillées (ne pas re-débattre en session 2)** :
- Naming DevRefs + domaine devrefs.dev
- Pivot 100% B2A pure agents IA
- 2 offres : Calcul coût + Audit (3 endpoints)
- Pricing : Pack Standard $10 / Audit $9.99 / Subscription Pro $29/mo V2
- Hero : "Cost intelligence for AI agents — know before you spend, optimize after you ship"
- Persona principal payeur unique = agent IA / persona secondaire = sponsor wallet
- 3e offre future V2 : Cost Regression Alerts (sticky non-commoditizable)
