<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Handoff sales enablement -->

# Handoff Sales Enablement Phase 4 — DevRefs

## Destinataires

- **Thomas** (fondateur) : actions manuelles J0
- **@growth** : pipeline acquisition DevRefs (Dev.to, Reddit, GEO)
- **@social** : calendrier social X.com / BlueSky / Dev.to

---

## 1. Fichiers livrés

| Fichier                                  | Type                                  | Statut |
| ---------------------------------------- | ------------------------------------- | ------ |
| `docs/sales/roi-calculator-spec.md`      | Spec technique + copy widget JS       | LIVRÉ  |
| `docs/sales/onboarding-claude-code.md`   | Tutoriel 6-10 min                     | LIVRÉ  |
| `docs/sales/onboarding-cursor.md`        | Tutoriel 8-12 min                     | LIVRÉ  |
| `docs/sales/onboarding-agentkit.md`      | Tutoriel 3-5 min                      | LIVRÉ  |
| `docs/sales/onboarding-mastra.md`        | Tutoriel 5-8 min                      | LIVRÉ  |
| `docs/sales/onboarding-mcp-generic.md`   | Tutoriel 10-15 min                    | LIVRÉ  |
| `docs/sales/onboarding-sdk-custom.md`    | Tutoriel Python + TypeScript 5-10 min | LIVRÉ  |
| `docs/sales/social-proof-strategy.md`    | Stratégie social proof V1             | LIVRÉ  |
| `docs/sales/handoff-sales-enablement.md` | Ce fichier                            | LIVRÉ  |

---

## 2. Décisions de copy prises — non négociables

| Décision                                                                        | Justification                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Temps d'intégration affichés honnêtement (3-15 min selon agent, jamais "2 min") | `agent-integration.md` § 6 anti-fausse promesse. Un dev qui rate la promesse ne convertit pas. |
| Framework AIDA/PAS/FAB documenté par fichier                                    | Obligation protocole @copywriter                                                               |
| Zéro testimonial fictif V1                                                      | `founder-prefs` S8 + G15 + règle @copywriter absolue                                           |
| ROI 490× sourcé exclusivement depuis `agent-economics.md` § A.4                 | Règle G4 (chiffres sourcés)                                                                    |
| CTA d'achat en fin de tutoriel, pas en hero                                     | `founder-prefs` Conviction-first                                                               |
| Compteur social proof masqué tant que 0 paiement réel                           | Anti-promesse non tenue G14                                                                    |
| Subscription Pro $29/mo jamais mentionné                                        | Décision fondateur — V2 reportée (HYPOTHÈSE H7)                                                |
| `effective_cost_factor` Opus 4.7 = 1.35 repris tel quel                         | Source `agent-economics.md` § A.2 + `brand-platform.md` RTB                                    |

---

## 3. Critères qualité onboarding (KPIs @growth)

### Taux de complétion onboarding

| Seuil                                            | Interprétation                                | Action                          |
| ------------------------------------------------ | --------------------------------------------- | ------------------------------- |
| > 70% complètent jusqu'au step "1ère query test" | Bon onboarding                                | Continuer, pas de modification  |
| 50-70%                                           | Friction à identifier (quel step abandonne ?) | A/B test sur le step incriminé  |
| < 50%                                            | Problème structurel                           | Réécriture complète du tutoriel |

**Mesure** : CF Analytics events `onboarding_{agent}_step_{N}_completed` (à implémenter via JavaScript snippet dans la page de doc — handoff @fullstack).

### Time-to-1st-payment

| Cible                                     | Mesure                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| < 15 min depuis l'arrivée sur le tutoriel | Timestamp 1er call réussi (CF Analytics `api_call_completed` + timestamp onboarding_start) |

Si time-to-1st-payment > 30 min → simplifier les prérequis (wallet setup est le point de friction n°1).

---

## 4. Critères pivot V2 si conv < 2%

Si le taux de conversion landing → premier achat reste < 2% après J30 avec les onboardings V1 :

### Pivot A — Simplification onboarding

Action : créer un "setup wizard" interactif (formulaire step-by-step) sur `devrefs.dev/start` qui guide le dev à travers wallet setup + config MCP en 5 étapes visuelles.

Owner : @fullstack (tech) + @ux (parcours) + @copywriter (copy wizard).

### Pivot B — Changer le point d'entrée

Action : proposer un **trial gratuit** (3 calls offerts sans wallet, résolution automatique via wallet DevRefs subsidié) pour permettre au dev de voir le JSON retourné avant de s'engager sur x402.

Owner : @ia (faisabilité technique) + @product-manager (impact pricing).

### Pivot C — Concentrer sur l'Audit $9.99

Si conv pack Offre 1 < 2% mais conv Audit $9.99 > 2% → déprioriser les onboardings pack et concentrer le copy sur l'audit (ticket plus élevé, meilleur ARPU, moins de volume nécessaire pour 600 €/mois).

Trigger : si `% revenu Audit > 70%` à M+3 (cf. `brand-platform.md` § 6 trigger pivot audit-only).

### Pivot D — Test du challenger hero

Activer le hero alternatif A/B test : _"Your agent burns 67K tokens to find one price. We sell that price for $0.001."_ (cf. `brand-platform.md` § 2.2 hero challenger).

Owner : @copywriter + @growth (A/B test setup).

---

## 5. Actions immédiates par destinataire

### Thomas (J0, manuelles)

- [ ] Vérifier que `https://devrefs.dev/api/llm-prices?model=opus-4.7` retourne un `HTTP 402` correct (test curl avant toute publication des onboardings)
- [ ] Créer un wallet test dédié ($10 USDC) pour valider les snippets des tutoriels
- [ ] Ajouter `docs/sales/` dans la navigation de `devrefs.dev/docs` (ou Notion public si pas de doc site)

### @fullstack (dépendances techniques)

- [ ] Implémenter le ROI calculator widget selon `roi-calculator-spec.md`
  - Fichiers : `public/roi-calculator.ts` + bundle `public/roi-calculator.min.js`
  - CDN path : `https://devrefs.dev/roi-calculator.min.js`
  - Events CF Analytics : `roi_calculator_viewed`, `roi_calculator_interacted`, `roi_calculator_cta_clicked`
- [ ] Ajouter les events CF Analytics onboarding (optionnel V1) : `onboarding_{agent}_step_{N}_completed`
- [ ] Vérifier que `POST /api/pack/purchase` (mentionné dans les tutoriels) est implémenté — sinon retirer la mention ou remplacer par le lien vers la page d'achat

### @growth

- [ ] Utiliser `onboarding-claude-code.md` comme base pour le post Dev.to prioritaire (format 800-1000 mots)
- [ ] Utiliser `onboarding-agentkit.md` comme base pour le deuxième post Dev.to (format identique)
- [ ] Reddit : 1 post r/ClaudeAI ou r/agenticsystems (angle : "how I made my agent pay for its own data")
- [ ] Monitorer Coinbase dashboard J0 → déclencher l'affichage du compteur social proof au 1er paiement réel

### @social

- [ ] Série de 3 posts X.com / BlueSky :
  1. J0 : "DevRefs est live — ton agent paie $0.001 pour du JSON daté au lieu de cramer 67K tokens"
  2. J7 : "Premier paiement x402 autonome reçu — [données réelles]" (si disponible)
  3. J30 : "Data story : X paiements, ARPU $Y, voici ce que les agents ont vraiment acheté"

---

## 6. Ce qui N'est PAS dans ce livrable (périmètre exclu)

| Élément exclu                            | Raison                                                              | Owner correct                    |
| ---------------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| Copy landing page v2 complète            | Déjà produit en Phase 0 (brand-platform.md)                         | @copywriter Phase 0              |
| Brand voice guide complet                | Produit dans creative-brief.md                                      | @creative-strategy               |
| Playbook upsell complet F27              | Partiellement couvert — le ROI calculator couvre l'essentiel de F28 | Compléter si signal besoin       |
| Email sequences automatisées             | Non demandé explicitement dans le brief Phase 4                     | @copywriter à invoquer si besoin |
| Ad copy templates (Google/Meta/LinkedIn) | Budget acquisition = 0 € en V1 (acquisition 100 % organique)        | À produire si budget alloué      |

---

## 7. Auto-évaluation @copywriter (5 critères, score 0-5)

| Critère                          | Score | Justification                                                                                                                                                                            |
| -------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G1 — Zéro TODO / placeholder** | 5/5   | Aucun TODO ni placeholder dans les 8 fichiers                                                                                                                                            |
| **G4 — Chiffres sourcés**        | 5/5   | Tous les chiffres tracés vers `agent-economics.md` § A.2/A.4/C.1 ou `agent-integration.md`                                                                                               |
| **G14 — Zéro fausse promesse**   | 5/5   | Temps d'intégration honnêtes, compteur social proof conditionné au 1er paiement réel, Subscription Pro absente                                                                           |
| **G15 — Zéro placeholder**       | 5/5   | Zéro occurrence de "TODO", "TBD", "À compléter" dans les 8 fichiers                                                                                                                      |
| **G17 — Non copiable**           | 4/5   | Verbatims datés et chiffrés (HN #44682465, tokenizer Opus 4.7 ×1.35, 67K tokens mesurés). -1 car les snippets de code sont par nature généralisables (normal pour un tutoriel technique) |

**Score global : 24/25**

---

**Handoff → @orchestrator**

- Fichiers produits : 9 fichiers dans `docs/sales/`
- Décisions verrouillées : temps honnêtes (3-15 min), zéro testimonial fictif, compteur conditionné au 1er paiement, Subscription Pro absente
- Points d'attention @fullstack : (1) vérifier `POST /api/pack/purchase` implémenté avant publication des onboardings, (2) ROI calculator widget à builder selon spec
- Points d'attention @growth : les tutoriels sont prêts pour Dev.to — Claude Code et AgentKit en priorité 1 et 2
- Mise à jour `project-context.md` historique : ligne ajoutée (voir ci-dessous)
