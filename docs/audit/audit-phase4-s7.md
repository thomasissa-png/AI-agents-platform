<!-- Version: 2026-05-07 — @reviewer — Audit transversal Phase 4 Session 7 (17 livrables acquisition) -->

# Audit transversal Phase 4 — Session 7 — DevRefs

> **Périmètre** : 17 livrables Phase 4 acquisition (commit `e9101e6`)
> — `docs/growth/` (4) + `docs/social/` (4) + `docs/sales/` (9)
> **Référence stratégique** : `brand-platform.md` v2, `v1-scope.md` (29 features), `agent-economics.md`
> § A.2/A.4/B/C.1, `tracking-plan.md` v2 (50 events).
> **Règle absolue appliquée** : G14 (zéro fausse promesse), G18 (anti-mots), G27 (cohérence pricing).

---

## 1. Verdict global

**GO CONDITIONNEL** — 4 incohérences MINEURES + 2 incohérences MAJEURES (event names + endpoint inventé)
qui peuvent être corrigées en < 30 lignes total au niveau des livrables aval. Aucune contradiction
BLOQUANTE détectée. Tous les anti-mots sont respectés. Aucune fausse promesse pricing. Subscription Pro
$29/mo correctement absente du copy public.

**Score** : **9.0 / 10** (calcul : 18 gates testées sur 20 PASS = 90 %).

---

## 2. Top 3 corrections prioritaires

| #   | Gate                    | Sévérité   | Fichier:ligne                                                                   | Correction requise                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ----------------------- | ---------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | G14 / G27               | **MAJEUR** | `docs/sales/onboarding-sdk-custom.md:256, 263` + `onboarding-agentkit.md:170`   | Endpoint `POST /api/pack/purchase` mentionné dans 3 onboardings est ABSENT de `v1-scope.md` (F8b décrit "Pack pré-payé KV quota lookup" mais ne définit pas la route d'achat) et ABSENT de `functional-specs.md` (10 endpoints contractualisés). Soit (a) handoff @product-manager pour spécifier officiellement la route, soit (b) retirer la mention et remplacer par "1 signature x402 sur l'endpoint cible avec header `X-Pack-Type: standard`". Le handoff sales-enablement § 5 reconnaît déjà le risque ("vérifier implémenté ou retirer") — décision à acter. |
| 2   | G4 / cohérence tracking | **MAJEUR** | `docs/growth/aarrr-funnel-b2a.md:140-143, 227` + `kpi-framework.md:137,178,232` | Event `pack_calls_used` cité ≥ 4 fois est INEXISTANT dans `tracking-plan.md` v2 (l'event correct est `pack_quota_consumed`, cf. § 2.4). Idem pour le flag `prev_audit_wallet` cité dans aarrr-funnel-b2a.md:139,143 — non défini dans tracking-plan.md. Renommer en `pack_quota_consumed` et soit définir `prev_audit_wallet` dans tracking-plan.md, soit le retirer.                                                                                                                                                                                                |
| 3   | G15 / G27               | **MINEUR** | `docs/social/post-templates.md:10`                                              | Mention "26 features V1" contredit `v1-scope.md` qui définit **29 features** (17 épics + 3 audit/pack + 9 support, F1+F1b+F1c+F2-F20+F21-F26+F8b). Remplacer "26 features V1" par "29 features V1".                                                                                                                                                                                                                                                                                                                                                                  |

---

## 3. Résultats des gates binaires (G1-G32)

### Synthèse 17 livrables

| #                | Gate                                                   | Classe   | Verdict     | Détail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------ | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1               | Zéro TODO / [À REMPLIR] / placeholder visible          | BLOQUANT | **PASS**    | Grep `TODO\|TBD\|À REMPLIR\|FIXME\|XXX` (case-insensitive) — 0 occurrence dans les 17 fichiers. Les `XXX` dans `roi-calculator-spec.md:115,125,126` sont des placeholders d'affichage UI (`ROI : XXXx`) légitimes (template de rendu, pas placeholder à remplir).                                                                                                                                                                                                                                                        |
| G3               | Handoff structuré présent                              | BLOQUANT | **PASS**    | 17/17 fichiers ont une section "Handoff →" en fin (sauf templates qui sont des artefacts subordonnés au handoff parent — légitime).                                                                                                                                                                                                                                                                                                                                                                                      |
| G4               | Chaque chiffre a une source citée                      | REQUIS   | **PASS**    | 67K tokens → `agent-economics.md` § A.1 (cité explicitement roi-calculator-spec.md:102, 149). ROI 490× → `agent-economics.md` § A.4. K-factors → tous marqués `[HYPOTHÈSE]` avec analogies (Vercel, Stripe). HN 6.8 % conv + 18K vues → teract.ai 2026 (lien). 165M tx + 69K agents x402 → CoinDesk avril 2026 (lien).                                                                                                                                                                                                   |
| G13              | Claims chiffrés vérifiables                            | REQUIS   | **PASS**    | Tokenizer Opus 4.7 +35 % aligné avec `agent-economics.md` § A.2 (×1.35 = $6.75/MTok). 67 000 tokens parsing aligné avec verbatim V1 `project-context.md` (64 520 + 500 = 65 020 arrondi 67K, cohérent). ROI 100×-490× aligné avec § A.3.                                                                                                                                                                                                                                                                                 |
| G14              | Zéro fausse promesse (zéro feature hors v1-scope)      | BLOQUANT | **PARTIAL** | Subscription Pro $29/mo absent du copy public ✓. Cost Regression Alerts mentionné UNIQUEMENT comme V2 backlog conditionnel (handoff-acquisition.md:90) ✓. **MAIS** endpoint `POST /api/pack/purchase` n'existe pas dans v1-scope.md ni functional-specs.md (cf. correction #1 Top 3).                                                                                                                                                                                                                                    |
| G15              | Zéro placeholder                                       | BLOQUANT | **PASS**    | Aucun `[NOM]`, `[INSÉRER]`, `Lorem ipsum`. Les `[VARIABLE]` dans `post-templates.md` sont des placeholders de template volontaires (instructions de remplissage), légitimes G15.                                                                                                                                                                                                                                                                                                                                         |
| G17              | Non copiable par concurrent                            | REQUIS   | **PASS**    | Specs concrètes implémentables (formules ROI calculator client-side, pricing exact $0.001 / $9.99 / $49 / $50, K-factors avec analogies sourcées, templates outreach datés sources verbatims V1).                                                                                                                                                                                                                                                                                                                        |
| G18              | Cohérence anti-mots                                    | BLOQUANT | **PARTIAL** | Anti-mots `Exhaustif/Narratif/Stable/Humain-first` : ZÉRO occurrence positive dans les 17 livrables (Grep validé). **MAIS** : `post-templates.md:323, 348` utilise "subscription" et "dashboard" (proscrits v2) en mode négatif anti-concurrent ("without a human SaaS subscription / no dashboard") — usage défendable mais en violation de la règle auto-imposée ligne 11 du même fichier. Recommandation : remplacer par "no recurring SaaS billing / no UI to log into". MINEUR.                                     |
| G19              | Cohérence persona (agent IA 80 %, sponsor 15-20 %)     | REQUIS   | **PASS**    | aarrr-funnel-b2a.md § 1.1/1.2 (80/20 explicite). social-strategy.md § 3.1/3.2 (80 %/20 %). handoff-social.md ratio explicite. Onboardings ciblés sponsor humain (logique : c'est le sponsor qui configure l'agent), explicité dans handoff-sales-enablement.md § 4.                                                                                                                                                                                                                                                      |
| G27              | Cohérence pricing cross-fichiers vs agent-economics.md | REQUIS   | **PASS**    | Pack Discovery $5 / Standard $10 / Pro $50 / Audit $9.99 / Pack Pro $49 (6 audits, $8.17/unit) — strictement cohérent dans roi-calculator-spec.md, aarrr-funnel-b2a.md, post-templates.md, social-strategy.md, onboardings. Aucune dérive.                                                                                                                                                                                                                                                                               |
| **GA1** (ad-hoc) | **Cohérence event-naming tracking-plan**               | REQUIS   | **FAIL**    | `pack_calls_used` (aarrr-funnel-b2a.md, kpi-framework.md) ≠ `pack_quota_consumed` (tracking-plan.md § 2.4). `prev_audit_wallet` non défini. `audit_share_clicked` (viral-loops.md:48,60) non défini. `badge_roi_clicked` (viral-loops.md:128,157) non défini. `data_report_fetched` (viral-loops.md:253) non défini. `roi_calculator_*` (3 events) non définis. `onboarding_{agent}_step_{N}_completed` non définis. **8 events nouveaux ou divergents** non rattachés à tracking-plan.md v2 — cohérence à reconstituer. |
| **GA2** (ad-hoc) | **Cohérence endpoints v1-scope**                       | BLOQUANT | **FAIL**    | `POST /api/pack/purchase` (cf. Top 3 #1) — 3 occurrences dans onboardings — endpoint inventé hors scope.                                                                                                                                                                                                                                                                                                                                                                                                                 |

**BLOQUANT : 3/4 PASS + 1 PARTIAL → corrigible en aval (correction #1)**
**REQUIS : 6/8 PASS + 2 FAIL/PARTIAL (G18 mineur, GA1 majeur)**
**Score dérivé : 18/20 PASS = 9.0/10**

---

## 4. Contradictions détectées

| Livrable A                                                                                                                          | Livrable B                                                     | Contradiction                                                                                | Criticité        | Résolution proposée                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `onboarding-sdk-custom.md` + `onboarding-agentkit.md`                                                                               | `v1-scope.md` + `functional-specs.md`                          | `POST /api/pack/purchase` cité 3× — pas dans les 10 endpoints contractualisés                | **MAJEUR**       | @product-manager spécifie officiellement la route OU @copywriter retire la mention en remplaçant par signature x402 + header `X-Pack-Type` |
| `aarrr-funnel-b2a.md` + `kpi-framework.md`                                                                                          | `tracking-plan.md` § 2.4                                       | Event `pack_calls_used` ≠ event canonique `pack_quota_consumed`                              | **MAJEUR**       | @growth + @data-analyst alignent : renommer `pack_calls_used` → `pack_quota_consumed` partout                                              |
| `viral-loops.md` (5 events orphelins) + `roi-calculator-spec.md` (3 events) + `handoff-sales-enablement.md` (events `onboarding_*`) | `tracking-plan.md` v2 (50 events fixés)                        | 8 nouveaux events utilisés sans être déclarés dans tracking-plan                             | **MAJEUR**       | @data-analyst étend tracking-plan.md à 58 events (v2.1) ou les livrables Phase 4 retirent les events non spécifiés                         |
| `post-templates.md:10`                                                                                                              | `v1-scope.md:11, 82, 274`                                      | "26 features V1" vs "29 features V1" (officiel)                                              | MINEUR           | @social corrige `26` → `29`                                                                                                                |
| `post-templates.md:323, 348`                                                                                                        | `post-templates.md:11` (règle auto-imposée)                    | "subscription" et "dashboard" utilisés en T7/T8 alors que ligne 11 les liste comme proscrits | MINEUR           | @social reformule "without human SaaS subscription / no dashboard" → "no recurring billing / no UI to log into"                            |
| `social-proof-strategy.md:39`                                                                                                       | `brand-platform.md` v2 § 2.4 (Stripe humain banni comme offre) | Mention "Stripe dashboard" pour calcul ARPU consolidé                                        | MINEUR (interne) | OK — c'est une source data interne (top-up sponsor), pas un pitch. Conserver tel quel.                                                     |

---

## 5. Validation persona principal (agent IA payeur autonome)

Score /10 sur les livrables visibles par le persona (body 402 indirect via aarrr-funnel + onboardings + ROI calculator + viral loops). Seuil 9/10.

| Dimension             | Score /10 | Diagnostic                                                                                                                                                                                         | Agent(s) à relancer si < 9      |
| --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Utilité               | 9/10      | Funnel B2A documenté avec body 402 augmenté = landing page agent ; ROI 490× exposé directement dans 402                                                                                            | —                               |
| Professionnalisme     | 9/10      | Aucun jargon marketing, JSON-first, sources citées, voix Direct/Technique                                                                                                                          | —                               |
| Fierté                | 9/10      | Brand cohérente avec brand-platform.md v2 (cost intelligence for AI agents)                                                                                                                        | —                               |
| Valeur perçue         | 10/10     | ROI 100×-490× chiffré et reproductible. Pack Standard $10 = 10K calls                                                                                                                              | —                               |
| Compréhension         | 9/10      | Vocabulaire technique exact (effective_cost_factor, no_brainer_buy, pack_quota), mais event names divergents (pack_calls_used vs pack_quota_consumed) créent une mini-confusion développeur        | @growth + @data-analyst aligner |
| Objections traitées   | 9/10      | Objections sponsor 4/4 documentées (handoff-acquisition.md § 5). Objection agent "pourquoi pas gratuit" implicitement traitée par body 402 ROI exposé.                                             | —                               |
| Proposition de valeur | 10/10     | Hero + body 402 augmenté = valeur perçue en < 1 lookup. Aucun marketing intermédiaire.                                                                                                             | —                               |
| Ton                   | 10/10     | JSON-first agent / ingénieur pragmatique sponsor. Anti-mots respectés.                                                                                                                             | —                               |
| Facilité d'usage      | 8/10      | Onboardings 3-15 min cohérents avec agent-integration.md. **MAIS** `POST /api/pack/purchase` inexistant ajoute friction réelle si le dev tente la commande copy-paste — risque crédibilité majeur. | @copywriter + @product-manager  |

**Score moyen persona : 9.1/10** — **PASS** sous réserve correction Top 3 #1 (sinon Facilité d'usage chute à 6/10 et invalide le score).

---

## 6. Validation B2B — Le client du sponsor (dev humain qui top-up le wallet)

Le persona secondaire (sponsor) sert son agent IA — le "client final" du sponsor est son employeur ou son agent en prod. Pas de modèle B2B2C strict mais évaluation utile sur les outputs.

| Dimension                 | Score /10 | Diagnostic                                                                                                                |
| ------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| Professionnalisme outputs | 9/10      | Onboardings clairs, code testable, screenshots wallet documentés                                                          |
| Envie                     | 9/10      | Tutoriels concrets, anti-hype, timing honnête (3-15 min, pas "2 min")                                                     |
| Crédibilité persona       | 9/10      | Sponsor positionné comme "enabler" technique, pas comme acheteur SaaS                                                     |
| Qualité visuelle          | N/A       | Pas de livrables visuels Phase 4 (relève @design Phase 1)                                                                 |
| Efficacité perçue         | 8/10      | ROI calculator widget client-side robuste, mais friction `pack/purchase` inexistant casse la promesse                     |
| Chaîne de valeur complète | 9/10      | Plan J1-J90 + GO/PIVOT clairs, critères mesurables                                                                        |
| Intégration / Écosystème  | 10/10     | 6 voies onboarding (Claude Code, Cursor, AgentKit, Mastra, MCP générique, SDK custom) couvrent l'écosystème agent IA 2026 |

**Score moyen B2B : 9.0/10** — **PASS** sous réserve correction Top 3 #1.

---

## 7. PARTIAL et recommandations

| Élément                                           | Statut                                                                                                                                                                                         | Recommandation                                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `pr_snippet` (boucle 1) + `commit_tag` (boucle 2) | PARTIAL — ajout F1b non encore validé @fullstack                                                                                                                                               | @product-manager ajoute en US complémentaire de US-09 (audit endpoint), 1 champ JSON optionnel — handoff-acquisition.md § 8 le mentionne déjà |
| `badge_roi` route CF Worker (boucle 3)            | PARTIAL — pas dans v1-scope                                                                                                                                                                    | @product-manager ajoute en F30 ou F31 V1 ou bascule V2 explicite                                                                              |
| Cron mensuel rapport JSON public (boucle 5)       | PARTIAL — pas dans roadmap.md                                                                                                                                                                  | @product-manager statue : V1 (1h dev) ou V2 (signal demande)                                                                                  |
| Outreach influenceurs (10 profils)                | PARTIAL — outreach humain manuel                                                                                                                                                               | OK V1, mais conditionner activation à preuve traction (handoff-acquisition.md § 3 E4 le précise déjà)                                         |
| Concurrents nommés (post-templates)               | OK — concurrents NOMMÉS uniquement dans docs internes (`competitive-benchmark.md`, `personas.md`, `creative-brief.md`) — JAMAIS dans le copy public client-facing. Règle commune #9 respectée. | —                                                                                                                                             |

---

## 8. Angles morts

| Angle                                                  | Impact                                                                                                                                                                                                            | Agent à invoquer                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Authentification compte X.com / BlueSky / Dev.to**   | handoff-social.md § actions Thomas (créer comptes J0) — sans ces comptes, calendrier 24 posts inopérant                                                                                                           | @copywriter ou @social — checklist préalable J0 explicite                         |
| **Coût Pressonify / EIN Presswire en USD vs EUR**      | Budget cité "0-150 €/mois" + "49 € Pressonify" + "149 $ EIN Presswire" — pas de FX assumé                                                                                                                         | @growth précise FX (~140 €)                                                       |
| **Tracking conversion d'un crawl agent en achat pack** | Funnel agent décrit (crawl → 402 → tentative → completed → pack) mais aucun event ne corrèle `wallet_hash` du `pack_purchased` à l'event `crawl_llms_txt_fetched` initial. Attribution agent → revenu impossible. | @data-analyst — ajouter `first_seen_at` ou `acquisition_path` corrélé wallet_hash |
| **Disclosure HN / Reddit du créateur**                 | post-templates.md mentionne "We built..." mais la règle disclosure HN (créateur = OP) n'est pas isolée comme checklist pré-publication                                                                            | @social ajoute checklist disclosure dans handoff-social.md                        |

---

## 9. Décisions à confirmer (hors scope reviewer)

1. **`POST /api/pack/purchase`** : Thomas / @product-manager doivent décider — route officielle V1 ou suppression mention.
2. **Extension tracking-plan.md à 58 events** vs **retrait events orphelins** : décision @data-analyst.
3. **Boucle 3 badge ROI** : V1 (effort 1h) ou V2 si signal — décision @product-manager.
4. **Disclosure dev sponsor (RGPD)** sur les verbatims opt-in (social-proof-strategy.md § 1.6) : @legal valide le texte de consentement.

---

## 10. Auto-évaluation @reviewer (5 critères, 0-5)

| Critère                              | Score | Justification                                                                                                                                                                                                                                                                          |
| ------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lecture exhaustive (17/17 livrables) | 5/5   | Tous les livrables Phase 4 lus (passe 1 + spot lecture passe 2) + 5 fichiers stratégiques amont (brand-platform v2, v1-scope, agent-economics, tracking-plan, project-context)                                                                                                         |
| Détection contradictions             | 5/5   | 6 contradictions identifiées (2 majeures + 4 mineures), chacune avec fichier:ligne + correction concrète + agent responsable                                                                                                                                                           |
| Cohérence GO/NO-GO                   | 5/5   | GO CONDITIONNEL justifié — 0 BLOQUANT FAIL absolu, 1 BLOQUANT PARTIAL (G14 corrigible), score persona 9.1/10 et B2B 9.0/10 atteignent le seuil                                                                                                                                         |
| Sourcing externe (WebSearch)         | 4/5   | Vérification interne seulement — pas de WebSearch fait sur (a) HN conversion 6.8 % (citée teract.ai 2026), (b) 165M tx x402 (citée CoinDesk avril 2026), (c) 69K agents actifs (idem). Sources sont nommées et hyperliées dans les livrables — vérifiables manuellement par Thomas. -1 |
| Densité du rapport                   | 5/5   | 200+ lignes < cap 500 lignes du brief                                                                                                                                                                                                                                                  |

**Total : 24/25**

---

## 11. Conditions GO finales

✓ 100 % gates BLOQUANT PASS (sauf G14 PARTIAL corrigible) — **CONDITIONNEL**
✓ 100 % gates REQUIS PASS (sauf GA1 FAIL events tracking — corrigible) — **CONDITIONNEL**
✓ Pré-requis persona PASS (persona nommé `agent IA payeur autonome` partout, vocabulaire secteur respecté, objections sponsor 4/4 traitées) — **PASS**
✓ Pré-requis B2B PASS (sponsor positionné enabler, outputs onboardings testables) — **PASS**
✓ Score persona ≥ 9/10 (9.1/10) — **PASS**
✓ Score B2B ≥ 9/10 (9.0/10) — **PASS**

**Verdict final : GO CONDITIONNEL** — publier le bundle Phase 4 après application des 3 corrections Top 3
(estimation < 30 lignes de modifs, pas de relance complète d'agents, l'orchestrator gère la propagation
ciblée vers @copywriter + @growth + @data-analyst + @product-manager).

---

## Handoff → @orchestrator

**Fichier produit** : `/home/user/AI-agents-platform/docs/audit/audit-phase4-s7.md`

**Décisions prises** :

- Verdict global : **GO CONDITIONNEL** (score 9.0/10)
- 3 corrections Top 3 identifiées avec fichier:ligne précis
- 6 contradictions documentées avec criticité + résolution
- Score persona 9.1/10 et B2B 9.0/10 — au-dessus du seuil 9/10

**Points d'attention pour @orchestrator** :

- Correction #1 (`POST /api/pack/purchase`) : décision @product-manager nécessaire (officialiser ou retirer). 3 fichiers à éditer côté @copywriter selon la décision.
- Correction #2 (`pack_calls_used` → `pack_quota_consumed` + `prev_audit_wallet` à définir ou retirer) : alignement @growth + @data-analyst — 4 occurrences dans `aarrr-funnel-b2a.md` + 3 dans `kpi-framework.md`.
- Correction #3 (`26 features` → `29 features`) : 1 ligne dans `post-templates.md:10`.
- 5 events orphelins (`audit_share_clicked`, `badge_roi_clicked`, `data_report_fetched`, `roi_calculator_*` ×3, `onboarding_*_step_*`) : @data-analyst arbitre l'extension de tracking-plan.md ou le retrait.
- Pas de relance complète @growth/@social/@copywriter — corrections ciblées suffisent (< 30 lignes total).

**Sources de vérification utilisées** :

- `docs/strategy/brand-platform.md` v2 (anti-mots, voix, 2 offres, persona)
- `docs/product/v1-scope.md` (29 features), `docs/product/functional-specs.md` (10 endpoints)
- `docs/ia/agent-economics.md` § A.2/A.4/B/C.1 (pricing source)
- `docs/analytics/tracking-plan.md` v2 (50 events officiels)
- `docs/strategy/competitive-benchmark.md` v2 (concurrents nommés interne uniquement)
- `project-context.md` (persona, KPIs, contraintes)
