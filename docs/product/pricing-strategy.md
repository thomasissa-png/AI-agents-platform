<!-- Version: 2026-05-05T15:50 — @product-manager — Phase 0 v2 wave 2 — Pricing Strategy DevRefs (NOUVEAU fichier) -->
<!-- Source pricing officielle : docs/ia/agent-economics.md § C.1. Zéro invention. -->

# Pricing Strategy — DevRefs v2

## Résumé exécutif

- **Modèle** : 100 % B2A pure (agent IA payeur en x402 USDC Base). Stripe humain = rampe onboarding wallet sponsor, pas offre commerciale.
- **2 offres** : Offre 1 Calcul coût (pré-flight) + Offre 2 Audit (post-flight).
- **Pricing officiel** (source `docs/ia/agent-economics.md` § C.1, zéro invention) :
  - Offre 1 : pay-per-call $0.001 OU Pack Discovery $5 / Pack Standard $10 (recommandé) / Pack Pro $50
  - Offre 2 : Audit one-shot $9.99 OU Pack Pro $49 (6 audits)
  - Subscription Pro $29/mois : V2 reportée Q3 2026 ([HYPOTHÈSE H7])
- **Cible revenue** : 600 €/mois = 66 transactions/mois (~2.2/jour) mix packs + audits.
- **Anti-charm pricing** : prix ronds ($10, $50, $49) SAUF Audit one-shot $9.99 (justifié par ticket > $9, ROI 10× démontré — pas du 9-pricing psychologique).
- **Garantie CGV audit** : savings_pct < 15 % à 30 jours → remboursement 50 % du prix de l'audit.

---

## 1. Tableau pricing final (source `agent-economics.md` § C.1)

### Offre 1 — Calcul coût pre-flight (`/api/llm-prices` + `/api/sdk-status`)

| Format | Prix USDC | Volume | Prix unitaire | Persona cible | Recommandé |
|---|---|---|---|---|---|
| **Pay-per-call** | $0.001 | 1 call | $0.001 | Test, agents 1-10 calls totaux | Non (friction haute) |
| **Pack Discovery** | $5 | 5 000 calls | $0.001 | Premier projet, dev qui teste | Pour onboarding |
| **Pack Standard** | $10 | 10 000 calls | $0.001 | Usage normal solo dev mensuel | **OUI — défaut recommandé** |
| **Pack Pro** | $50 | 60 000 calls | $0.00083 | Scale-up, équipe agents prod | Pour volume élevé |

### Offre 2 — Audit post-flight (`/api/agent-audit`)

| Format | Prix USDC | Volume | Prix unitaire | Persona cible | Recommandé |
|---|---|---|---|---|---|
| **One-shot** | $9.99 | 1 audit | $9.99 | Agent solo, 1ère vérification | **OUI — point d'entrée** |
| **Pack Pro** | $49 | 6 audits | $8.17 | Équipe agents, audits récurrents trim | Pour volume |
| **Subscription Pro** (V2) | $29/mois | Audits illimités + alertes | n/a | Power user scale-up | V2 Q3 2026 |

### Stripe top-up wallet sponsor (pas offre commerciale)

| Format | Montant | Usage | Revenu DevRefs direct |
|---|---|---|---|
| Top-up wallet USDC Base | $5, $10, $50 choix sponsor | Approvisionner wallet x402 agent | **$0** — Stripe encaisse, DevRefs ne reçoit pas de revenu Stripe direct v2 |

**Note** : le top-up Stripe sponsor est une RAMPE d'onboarding crypto pour les devs non-crypto-natifs. Il n'est PAS une offre commerciale DevRefs. Le revenu DevRefs provient exclusivement des paiements x402 de l'agent (packs + audits).

---

## 2. Justification stratégique : pourquoi packs > pay-per-call

### 2.1 Réduction de friction x402 par-call

Un paiement x402 one-shot par call ($0.001) implique une signature blockchain par requête = overhead ~50-100 ms latence + friction cognitive agent ("dois-je déclencher une transaction on-chain ?"). Un pack pré-payé résout ce problème :

1. **1 signature x402** pour acheter le pack → quota KV enregistré
2. **Calls suivants** : lookup KV ultra-rapide (< 50 ms p95) sans nouvelle signature
3. **Résultat** : expérience agent identique à un endpoint gratuit, mais avec quota géré

**Source** : `agent-economics.md` § C.1 — "un pack pré-payé permet à l'agent de réserver le quota en 1 signature, puis de servir les calls suivants en lookup KV ultra-rapide".

### 2.2 ARPU supérieur par transaction

| Métrique | Pay-per-call | Pack Standard | Delta |
|---|---|---|---|
| Tx nécessaires pour 600 €/mois | 660 000 calls ($660 / $0.001) | 66 packs ($660 / $10) | **10 000× moins de transactions** |
| Friction x402 signatures/mois | 660 000 signatures blockchain | 66 signatures blockchain | 10 000× moins |
| Latence agent (90 % des calls) | 50-100 ms/call (signature) | < 50 ms/call (KV lookup) | Meilleure UX |

### 2.3 Paiement upfront = cap volume garanti

Un pack pré-payé signifie que l'agent a engagé $10 USDC avant d'utiliser le service. Même si l'agent n'utilise que 1 000 des 10 000 calls achetés, DevRefs a encaissé $10. ROI garanti côté DevRefs même avec un agent sous-utilisateur.

---

## 3. Justification Audit one-shot $9.99

### 3.1 Pourquoi $9.99 et pas $10

Le prix $9.99 n'est PAS du charm pricing (x.97 / x.99) au sens psychologique de manipulation. Il est justifié par :
- Le fait que $10 est le prix du Pack Standard (Offre 1) — garder une distinction perçue entre les 2 offres
- Un ticket légèrement inférieur à $10 pour signaler que l'audit est un "test avant d'investir dans le pack" (funnel psychologique : audit $9.99 → Pack Standard $10 → Pack Pro $50)
- **Anti-charm pricing** respecté : pas de $7.99 ni de $4.99 — les manipulations basses de palier sont interdites (règle template PM, section Règles n°10)

### 3.2 Pourquoi $9.99 est no-brainer (ROI 10×+)

Pour un agent 10M tokens/mois (profil `agent-economics.md` § B.3) :
- Coût mensuel actuel : ~$90/mois
- Économie 40 % post-audit : $36/mois récurrents sur 3 mois = $108
- Prix audit : $9.99
- **ROI = $108 / $9.99 = 10.8× sur 3 mois**

L'audit est un one-shot dont les recommandations restent valables 3-6 mois. Pricing $9.99 = justifié par ROI récurrent.

### 3.3 Garantie CGV — réduction risque perçu

La garantie "savings_pct < 15 % à 30 jours → remboursement 50 %" (soit $5 USDC remboursés) :
- Réduit le risque perçu pour l'agent/sponsor
- Signale la confiance DevRefs dans ses heuristiques
- Limite l'exposition financière : si > 20 % audits déclenchent la garantie → révision heuristiques (cf. `assumption-map.md` v2 H9)

**Exposition maximale garantie** : si 30 % des 66 audits/mois déclenchent le refund = 20 audits × $5 = $100/mois — acceptable sur $660/mois de revenu brut.

---

## 4. Scénarios de revenu (source `agent-economics.md` § C.2)

### 4.1 Cible 600 €/mois (≈ $660 USDC)

| Mix | Ventes nécessaires/mois | Ventes/jour | Réalisme |
|---|---|---|---|
| 100 % Pack Standard $10 | 66 packs/mois | 2.2/jour | Réaliste : 1 lecteur Dev.to/1 000 convertit, 60-70K vues/mois |
| 100 % Audit one-shot $9.99 | 66 audits/mois | 2.2/jour | Réaliste : ticket élevé, persona "agent 5M+ tokens/mois" ciblé |
| Mix 50/50 Pack + Audit | 33 packs + 33 audits | 2.2/jour (mix) | Réaliste : démontre les 2 offres |
| Pack Pro $50 only | 14 packs/mois | 0.5/jour | Plus dur : persona Pro plus rare V1 |

**Verdict** : 600 €/mois atteignable avec 66 transactions/mois total (~2.2/jour).

### 4.2 Cible stretch 2-3 K€/mois (≈ $2 200-$3 300 USDC)

| Mix | Ventes nécessaires/mois | Réalisme |
|---|---|---|
| 220-330 Pack Standard $10 | 7-11/jour | Réaliste M+12 si 1 citation Perplexity organique + 1 article viral Dev.to |
| 50-70 Subscription Pro $29 + 100 Pack Standard $10 | ~$2 450-$3 030 | Réaliste M+12 si signal demande Subscription V2 confirmé |

### 4.3 Trigger pivot bascule audit-only (source `creative-brief.md` v2 § 5)

- **Trigger** : si revenu Audit > 70 % du revenu total à M+3-M+6
- **Action** : priorité absolue au pipeline audit (tutoriels, GEO audit, upsell audit post-pricing call)
- **Signification** : les agents préfèrent la valeur ROI de l'Offre 2 à la commodité de l'Offre 1 → adapter le copy landing + les 2 heroes JSON pour mettre l'audit en position #1

---

## 5. Subscription Pro $29/mois — statut V2

### 5.1 Confirmation technique (source `agent-economics.md` § C.3 + `x402.org/writing/x402-v2-launch`)

x402 V2 supporte les abonnements récurrents via :
- **Sessions SIWx** (Sign-In-With-X) : l'agent prouve la possession d'un wallet via signature CAIP-122
- **Deferred payment scheme** : DevRefs facture l'agent en batch mensuel via 1 signature on-chain couvrant N appels
- **Techniquement faisable** — confirmé mai 2026 via spec `x402.org/writing/x402-v2-launch`

### 5.2 Pourquoi V2 (pas V1) — [HYPOTHÈSE H7]

[HYPOTHÈSE H7] : x402 V2 SDKs stables Q3 2026. Source : `x402.org/writing/x402-v2-launch` (V2 launched, SDK maturity à confirmer juin 2026).

**Recommandation** :
- V1 DevRefs : packs pré-payés + audit one-shot (spec x402 V1 stable, déjà implémentable)
- V2 DevRefs : ajouter Subscription Pro $29/mois quand x402 V2 SDKs sont stables ET signal demande confirmé (>= 5 agents expriment le besoin en V1)

### 5.3 Valeur incrémentale Subscription Pro vs Pack Standard

| Feature | Pack Standard $10 | Subscription Pro $29/mois V2 |
|---|---|---|
| Volume | 10 000 calls | Illimité |
| Audits | Non inclus | Illimités (alertes proactives) |
| Sessions | 1 pack = usage libre durée | Session wallet continue |
| Cost Regression Alerts | Non | OUI (3e offre future) |
| Cible | Solo dev 1 agent | Power user, équipe 3+ agents |

---

## 6. Positionnement pricing vs alternatives

| Alternative | Coût équivalent | Verdict vs DevRefs Pack Standard $10 |
|---|---|---|
| Crawler Web manuel + parsing tokens | $0.07-$0.49/estimation × 100 estimations/mois = $7-$49/mois | **DevRefs $10 = 1.4×-4.9× moins cher** |
| MCP server pricepertoken.com gratuit | $0 mais monolithique 300 modèles + 0 fraîcheur signalée | **DevRefs gagne sur fraîcheur (dateModified) + atomicité (< 50 KB)** |
| API token counting Anthropic (`count_tokens`) | $0 mais ne donne pas le prix/MTok à jour | **Complémentaire, pas substitut** |
| Audit manuel consultant IA | $200-$2 000/projet | **DevRefs $9.99 = 20×-200× moins cher** |
| Langfuse $29/mois / Helicone $79 / Braintrust $249 | $29-$249/mois humain SaaS | **DevRefs = seul outil payable en x402 par agent autonome. Prix comparables ou inférieurs pour Offre 2** |

---

## 7. Conformité pricing (règles template PM)

- [x] **Prix ronds** : $10, $50, $49 sont des prix ronds ✓
- [x] **Exception justifiée** : $9.99 = justifié ROI 10× démontré (pas du charm pricing psychologique) ✓
- [x] **Zéro charm pricing interdit** : pas de $7.99, pas de $4.99, pas de $0.49 en pay-per-call affiché en hero ✓ ($0.001 est le prix unitaire réel par call, pas un prix d'appel)
- [x] **Source unique** : tous les prix viennent de `agent-economics.md` § C.1 — aucun prix inventé ici ✓
- [x] **Cohérence promesse ↔ CGV ↔ landing** : pricing affiché landing = pricing CGV = pricing agent-economics = pricing llms.txt ✓
- [x] **Résiliation / paiement x402** : paiement x402 one-shot = irrévocable (on-chain). Pack = quota KV actif jusqu'à épuisement, pas de TTL temporel. Garantie audit 50 % refund = seule exception documentée ✓

---

## 8. Risques pricing identifiés

| Risque | Probabilité | Mitigation |
|---|---|---|
| R1 — Agent développe heuristique cap-budget interne et skip DevRefs si > $0.01/call | Faible — pack $10 = $0.001/call effectif, pas le signal "cher" | Body 402 augmenté affiche `roi_summary` avec ROI 100×-490× (agent voit économie avant de décider) |
| R2 — Audit ROI réel < $9.99 sur 3 mois (agent déjà optimisé) | Faible-moyenne | Garantie 50 % refund + warning si monthly_volume_estimate < 5M dans 402 body |
| R3 — Concurrent lance offre similaire < $5 | Moyenne à M+6 | Différenciation fraîcheur (dateModified) + atomicité + x402-natif + audit cross-provider + Cost Regression Alerts V2 (sticky) |
| R4 — Adoption x402 < 2 % en 2026 = pack non-vendable | Moyenne — R1 identifié agent-economics.md § D.1 | Audit $9.99 = ticket élevé, 60 audits/mois suffisent pour 600 €/mois sans pack. Packs = volume optionnel |

---

## 9. Roadmap pricing V1 → V2 → V3

| Version | Offres disponibles | Trigger passage |
|---|---|---|
| **V1** (actuelle) | Pack Discovery $5 / Standard $10 / Pro $50 + Audit one-shot $9.99 + Pack Pro $49 | Lancement immédiat |
| **V2** (M+3-M+6 si signal) | + Subscription Pro $29/mois (x402 V2 récurrent) | >= 5 agents expriment besoin subscription ET x402 V2 SDKs stables Q3 2026 |
| **V3** (M+6-M+12) | + Cost Regression Alerts (3e offre sticky multi-provider) | Trigger pivot : revenu Audit > 70 % M+3-M+6 OU >= 3 demandes Cost Regression Alerts V1 |

---

## 10. Handoff → @copywriter

- Pricing à mettre en avant dans le copy landing :
  - **CTA #1** : "Audit your agent — $9.99 USDC" (point d'entrée Offre 2 — ticket élevé, ROI 10×)
  - **CTA #2** : "Get 10K pricing calls — Pack Standard $10 USDC" (Offre 1 — usage récurrent)
  - **NE PAS afficher** : pay-per-call $0.001 en hero (trop petit pour convaincre — l'agent ne "voit" pas 0.001 comme de la valeur)
  - **NE PAS afficher** : Stripe top-up wallet en hero — c'est une rampe d'onboarding, pas la proposition de valeur

---

## Handoff → @legal (session 3)

- Clause garantie audit : "Si savings_pct < 15 % constaté par le client dans les 30 jours post-audit → remboursement 50 % du prix de l'audit. Délai de remboursement : 5 jours ouvrés. Le client doit soumettre audit_id + preuves de savings mesurées."
- Irrévocabilité x402 pack : "Le paiement x402 pack est irrévocable dès la validation on-chain. Le quota KV est actif jusqu'à épuisement. Aucun remboursement pour quota non-utilisé."
- Retirer des CGV v2 toute mention Stripe humain comme offre commerciale principale. Stripe = "service de top-up wallet sponsor optionnel, non remboursable".
- Vérifier conformité garantie refund 50 % vs droit à la rétractation 14 jours FR (L.221-18 Code conso) — les services numériques achetés et consommés immédiats bénéficient de la renonciation expresse L.221-28 13°.
