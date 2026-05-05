<!-- Version: 2026-05-05T15:15 — @product-manager — Phase 0 v2 wave 2 — Opportunity Solution Tree DevRefs PIVOT 100% B2A -->

# Discovery Map — DevRefs v2

## Résumé exécutif

- **Pivot acté 2026-05-05** : Stripe humain banni comme pilier. 100 % B2A pure. O4 réformulé (sponsor wallet top-up, pas "bascule Stripe Link 4,99 €/jour").
- **Objectif** : cartographier les opportunités produit menant au KPI North Star (600 €/mois revenu net x402 à 6 mois) via Opportunity Solution Tree (Teresa Torres).
- **Outcome désiré v2** : >= 66 transactions x402/mois (mix packs $10 + audits $9.99) = 600 €/mois net (cf. `agent-economics.md` § C.2).
- **5 opportunités** (O1-O4 conservées, O5 NOUVELLE — auto-optimisation post-flight via audit).
- **Solutions** scorées valeur/coût. Retrait "Stripe Link humain" de la liste solutions primaires. Ajout "Audit endpoint", "Pack pré-payé" et "x402 V2 subscription (reportée Q3 2026)".
- **Experiments** J7-J30 ajustés : E1 = >= 1 paiement x402 réel d'un agent IA J7 (binaire strict).

---

## 1. Outcome désiré v2 (lié au KPI North Star)

| Élément | Valeur v2 |
|---|---|
| **KPI North Star** | Revenu net mensuel x402 = 600 €/mois (Stripe humain retiré de la formule principale, cf. `kpi-framework.md` v2) |
| **Outcome produit** | Un agent IA autonome achète en x402 : (a) un Pack pré-payé ($5/$10/$50) pour calls pricing/SDK, ET/OU (b) un Audit one-shot ($9.99) pour optimisation post-flight. Le sponsor humain top-up le wallet USDC Base (optionnel, non-critère de succès direct) |
| **Échelle de réussite** | J7 >= 1 paiement x402 agent réel (binaire), M+1 >= 50 €, M+3 >= 200 €, M+6 >= 600 € |
| **Outcome leading** | Ratio crawl agent → paiement >= 5 % J7, >= 10 % M+1, >= 15 % M+6 |
| **Outcome qualitatif** | >= 1 citation Perplexity/Claude/ChatGPT "DevRefs" à M+1 |
| **Trigger pivot** | Revenu Audit > 70 % à M+3-M+6 → bascule pipeline audit-only (cf. `creative-brief.md` v2 § 5) |

---

## 2. Opportunités (5 — O1-O4 ajustées, O5 nouvelle)

### O1 — Absence de signal de fraîcheur structuré machine-readable

**Description** : aucune source pricing/SDK (pricepertoken, costgoat, devtk.ai, llm-prices, helicone) ne sert un `dateModified` JSON-LD machine-readable. Un agent obtient 3 réponses contradictoires sans tie-breaker.

**Verbatims liés** :
- V1 (project-context.md lignes 32-48) — bloc tool-call Opus 4.7 : output `INCORRECT`, aucune source ne signale l'inflation tokenizer +35 % datée.
- V3 (lignes 53-54) — Cursor agent fil HN #44682465 : 4 sources → 3 prix différents → heuristique médian → facture réelle 2,4× l'estimation.

**Frustration quantifiée** : 15 % hallucination APIs/SDKs (arxiv 2407.09726), 31 420 ms perdues/query, 64 520 tokens cramés.

**Lien KPI North Star** : signal `dateModified` < 6 h = décision d'achat immédiate pour l'agent. Convertit le crawl en paiement pack.

### O2 — Coût parsing HTML disproportionné pour extraire des faits atomiques

**Description** : extraire 2 nombres d'une page pricepertoken = 38 900 tokens parsés × 5 sources = ~64 000 tokens/tâche. Payload DevRefs < 50 KB, atomique, < 200 ms p95 — ROI 100×-490× vs crawl (cf. `agent-economics.md` § A.3).

**Verbatims liés** :
- V2 (ligne 51) — "La sixième fois que je tape WebFetch sur du HTML de 380 KB pour récupérer 2 nombres... $0.001 au lieu de 18 000 tokens en parsing."
- V1 (38 900 tokens pricepertoken, ground truth INCORRECT).

**Lien KPI North Star** : payload atomique < 50 KB = driver adoption pack pré-payé (l'agent voit ROI dans le 402 body augmenté `roi_summary`).

### O3 — Absence de protocole de paiement IA-to-IA standardisé adapté aux micro-tx

**Description** : avant x402, aucun protocole HTTP standard ne permettait à un agent de payer < $1 sans signup. Pack pré-payé résout la friction par-call (1 signature → quota KV → calls < 50 ms sans signature).

**Verbatims liés** :
- V2 (agent first-person accepte "qui me facture 0,49 €" comme natif).
- 28 k$/jour réel x402 mars 2026 = protocole mature mais DevRefs = premier endpoint commercial pricing agent-first.

**Lien KPI North Star** : middleware x402 unifié 3 endpoints + pack pré-payé = driver ALL revenue cible.

### O4 — Friction onboarding sponsor wallet pour agent sans crypto-natif (réformulée v2)

**Description v2** : le dev humain qui supervise un agent n'a pas forcément un wallet USDC Base configuré. L'opportunité n'est PLUS "bascule Stripe Link 4,99 €/jour illimité" mais "rampe crypto pour approvisionner le wallet x402 de son agent via Stripe top-up".

**Note pivot v2** : l'ancienne O4 "bascule humain vers Stripe Link" est archivée comme O4 v1. La nouvelle O4 est la friction d'onboarding wallet pour le sponsor — la solution est top-up Stripe vers USDC Base, pas un accès JWT illimité.

**Verbatim lié (V4 réinterprété)** :
- V4 revu v2 : "Bon, c'est la 7e fois ce matin que mon agent paie en x402. Je voudrais juste approvisionner son wallet une bonne fois pour 3 mois et ne plus y penser. Comment acheter $50 USDC Base sans aller sur Uniswap ?"

**Lien KPI North Star** : top-up Stripe → USDC Base = rampe d'adoption crypto pour sponsors non-crypto natifs. Indirect sur revenue (Stripe top-up ne génère pas de revenu DevRefs direct mais permet à l'agent de payer en x402).

### O5 — Absence d'outil d'auto-optimisation coût post-flight pour agents IA (NOUVELLE v2)

**Description** : un agent qui a généré du code pendant 1 mois n'a aucun moyen de savoir si sa configuration (mix modèles, effort levels, system prompts, tools) est optimale. Les économies 35-55 % potentielles (cf. `agent-economics.md` § B.2) restent latentes. Aucune alternative existante n'est payable en x402 : Langfuse ($29/mois SaaS humain), Helicone ($79), Braintrust ($249), LangSmith ($39/siège) — tous inaccessibles pour un agent autonome, tous nécessitent un compte humain.

**Verbatim lié (V5 adapté)** :
- V5 (ligne 60) — "Mon training cutoff est janvier 2026... 4 fois le code avec l'ancien schema. Un endpoint qui me renvoie `{'latest': '5.0.12', 'breaking_since': '5.0.0'}` aurait économisé 12 minutes et ~80 000 tokens." → Extrapolation : un endpoint qui me renvoie `{'score': 62, 'savings_pct': 40, 'recommendations': [...]}` économise $36/mois.

**Frustration quantifiée** : agent 10M tokens/mois dépense $90/mois. Audit identifie 40 % d'économies = $36/mois. Pricing DevRefs $9.99 one-shot = ROI 10.8× sur 3 mois.

**Lien KPI North Star** : Audit $9.99 = ticket élevé. 66 audits/mois = 600 €/mois seuls. Trigger pivot audit-only si revenu Audit > 70 % M+3.

---

## 3. Solutions par opportunité (scorées valeur 1-5 / coût 1-5) — v2

### Solutions pour O1 (signal de fraîcheur structuré)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S1.1 — JSON-LD `Dataset` avec `dateModified` ISO 8601 dans chaque payload | 5 | 1 | 5.00 | OUI |
| S1.2 — Header HTTP `Last-Modified` aligné JSON-LD | 4 | 1 | 4.00 | OUI |
| S1.3 — Champ `fetched_at` + `sameAs` (URL source officielle) dans payload | 5 | 1 | 5.00 | OUI |
| S1.4 — Page `/about/data-sources` (transparence provenance) | 3 | 2 | 1.50 | OUI (recommandation @legal EU AI Act) |
| S1.5 — Champ `effective_cost_factor` (anomalie tokenizer Opus 4.7 +35 %) | 5 | 1 | 5.00 | OUI |
| S1.6 — Diff API entre 2 versions (`?since=2026-05-01`) | 3 | 4 | 0.75 | NON V2 |

### Solutions pour O2 (coût parsing HTML)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S2.1 — Endpoint `/api/llm-prices?model=X` payload < 50 KB JSON typé | 5 | 2 | 2.50 | OUI |
| S2.2 — Endpoint `/api/sdk-status?pkg=X` payload < 50 KB | 5 | 2 | 2.50 | OUI |
| S2.3 — `llms.txt` racine (3 endpoints + pricing pack) | 5 | 1 | 5.00 | OUI |
| S2.4 — OpenAPI 3.1 spec + extension `x-x402` (3 endpoints) | 4 | 2 | 2.00 | OUI |
| S2.5 — MCP server officiel DevRefs | 4 | 3 | 1.33 | NON V2 ([HYPOTHÈSE H9] appétence à valider E3) |
| S2.6 — Réponse compressée gzip/brotli | 3 | 1 | 3.00 | OUI (Cloudflare default) |

### Solutions pour O3 (paiement IA-to-IA)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? | Delta v1→v2 |
|---|---|---|---|---|---|
| S3.1 — Middleware x402 UNIFIÉ Cloudflare Worker (3 endpoints + body augmenté) | 5 | 3 | 1.67 | OUI (chemin critique) | Étendu à 3 endpoints, body augmenté |
| S3.1b — Pack pré-payé KV quota lookup ($5/$10/$50, 1 signature → quota → calls < 50 ms) | 5 | 2 | 2.50 | OUI (NOUVEAU v2) | — |
| S3.2 — HTTP 402 spec conforme + body augmenté (`roi_summary` + `alternative_cost_estimate` + `freshness_proof` + `payload_preview`) | 5 | 1 | 5.00 | OUI | Enrichi v2 |
| S3.3 — Watermark HMAC sur payloads (pricing + audit) | 4 | 2 | 2.00 | OUI | Étendu audit |
| S3.4 — Rate-limit par wallet (paliers pay-per-call vs pack) | 4 | 1 | 4.00 | OUI | Paliers ajoutés v2 |
| S3.5 — Subscription Pro $29/mois (x402 V2 SIWx + deferred payment) | 4 | 3 | 1.33 | NON V2 Q3 2026 ([HYPOTHÈSE H7]) | Confirmé techniquement, SDK maturité Q3 2026 |
| S3.6 — Multi-facilitator Solana | 2 | 3 | 0.67 | NON V2 | Inchangé |

### Solutions pour O4 (onboarding sponsor wallet — réformulée v2)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? | Delta v1→v2 |
|---|---|---|---|---|---|
| S4.1 — Stripe top-up wallet sponsor (achat USDC Base via Stripe, marginal) | 2 | 1 | 2.00 | OUI (marginal) | **Score abaissé v2** — ancienne S4.1 "Stripe Link 4,99 €/jour" RETIRÉE |
| S4.2 — JWT HMAC 24 h optionnel (post top-up sponsor, non-principal) | 2 | 2 | 1.00 | OUI (optionnel) | **Score abaissé v2** |
| S4.3 — Cookie `Secure;HttpOnly;SameSite=Strict` | 2 | 1 | 2.00 | OUI (conformité) | Score abaissé |
| S4.4 — Page `/dashboard?token=JWT` sponsor (quota pack restant + wallet balance) | 3 | 2 | 1.50 | OUI | Recalibré v2 : quota pack + balance, pas "queries 24 h" |
| S4.5 — Activation Stripe Tax | 3 | 1 | 3.00 | OUI (conformité) | Inchangé |
| S4.6 — Stripe abonnement mensuel récurrent humain | 0 | — | N/A | NON — **RETIRÉ v2** | Écarté définitivement (Stripe humain pilier banni) |
| S4.7 — Dashboard team multi-utilisateur | 2 | 4 | 0.50 | NON V2 | Inchangé |

### Solutions pour O5 (auto-optimisation post-flight — NOUVELLES v2)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S5.1 — Endpoint `/api/agent-audit` (5 heuristiques statiques, score 0-100, patches auto-applicables) | 5 | 4 | 1.25 | OUI (chemin critique v2) |
| S5.2 — Validation input audit avant 402 (share_pct, traces 3-50, 100 KB max, warning < 5M tokens) | 5 | 1 | 5.00 | OUI |
| S5.3 — Garantie CGV "savings_pct < 15 % à 30j → refund 50 %" mentionnée dans 402 body + CGV | 5 | 1 | 5.00 | OUI |
| S5.4 — Pack Pro $49 (6 audits) pour équipes agents | 4 | 1 | 4.00 | OUI |
| S5.5 — Cost Regression Alerts (3e offre future, alertes proactives sur dégradations) | 4 | 4 | 1.00 | NON V2 (conditionnée signal demande post-V1, cf. creative-brief v2 § 5) |

---

## 4. Experiments (ajustés v2)

### E1 — Validation appétence agent x402 pack pré-payé (test fondateur J7)

- **Hypothèse testée v2** : "Un agent IA en 2026 préfère payer $10 Pack Standard x402 (10 000 calls) plutôt que cramer 64 K tokens/tâche × 10 000 requêtes = 640 M tokens."
- **Méthode** : test binaire J7 post-launch — >= 1 paiement x402 réel (pack OU audit) enregistré côté Coinbase facilitator dans les 7 jours. **Threshold abaissé vs v1 (v1 = 5 paiements, v2 = 1 paiement)** : la V2 vise à valider que la mécanique x402 fonctionne de bout en bout avec 1 agent réel, pas un volume commercial.
- **Coût test** : 0 € (mesure Coinbase dashboard).
- **Décision si invalidé** : diagnostic SEO/GEO → si toujours 0 paiement J14 → bascule Stripe humain transitoire ou pivot super-niche specs.

### E2 — Validation conviction landing sponsor (wallet top-up, pas Stripe Link illimité)

- **Hypothèse testée v2** : "Un dev sponsor arrive sur la landing, comprend en 5 secondes l'angle `Cost intelligence for AI agents`, et clique le CTA `Top-up wallet $10`."
- **Méthode** : 1 post Reddit r/ClaudeAI angle "I built an x402-native pricing + audit API for my agent — here's how it saves 40% on LLM costs". Mesurer ratio impressions → landing → CTA wallet top-up sur 7 jours.
- **Coût test** : 0 €.
- **Décision si invalidé** : @copywriter ré-écrit hero avec angle alternatif (ROI audit en premier, pas pricing).

### E3 — Validation MCP server payant (avant V2)

- **Hypothèse testée** : "Un agent MCP-host préfère un MCP server DevRefs payant avec `dateModified` à un MCP server gratuit sans fraîcheur structurée."
- **Méthode** : sondage qualitatif Dev.to comments. Si >= 3 demandes explicites → MCP server V2 haute priorité.
- **Coût test** : 0 €.

### E4 — Validation ROI audit perçu (J30 post-lancement)

- **Hypothèse testée** : "Un agent qui reçoit un rapport audit DevRefs ($9.99) et applique >= 1 patch `auto_applicable` constate savings_pct >= 15 % à 30 jours (garantie CGV non déclenchée)."
- **Méthode** : monitoring : % audits déclenchant la garantie remboursement 50 %. Seuil alerte : > 20 % audits en refund → réviser heuristiques.
- **Coût test** : 0 € (monitoring CF Analytics + logs Worker).
- **Décision si invalidé** : réviser heuristiques + relever seuil recommandé volume monthly_tokens.

---

## 5. Mapping opportunité → feature → KPI v2

| Opportunité | Solutions V1 retenues | Feature roadmap | KPI input mesuré |
|---|---|---|---|
| O1 — Fraîcheur structurée | S1.1, S1.2, S1.3, S1.4, S1.5 | JSON-LD Dataset, Last-Modified, effective_cost_factor, /about/data-sources | % payloads `dateModified` < 6 h (cible 100 %) |
| O2 — Coût parsing HTML | S2.1, S2.2, S2.3, S2.4, S2.6 | 2 endpoints atomiques, llms.txt, OpenAPI | Taille payload (cible < 50 KB), latence p95 (cible < 200 ms) |
| O3 — Paiement IA-to-IA | S3.1, S3.1b, S3.2, S3.3, S3.4 | Middleware x402 unifié 3 endpoints, pack KV quota, watermark, rate-limit | Nb paiements x402/24 h (J7 >= 1), ARPU pack |
| O4 — Onboarding sponsor wallet | S4.1, S4.3, S4.4, S4.5 | Stripe top-up wallet, cookie JWT, dashboard sponsor | Nb top-ups sponsor/mois (indicateur indirect) |
| O5 — Auto-optimisation post-flight | S5.1, S5.2, S5.3, S5.4 | /api/agent-audit, validation input, garantie CGV, pack pro $49 | Nb audits vendus/mois (cible >= 30 à M+6), savings_pct moyen audit |

---

## 6. Synthèse v2

| Élément | Décision v2 |
|---|---|
| **Outcome unique V1** | 600 €/mois revenu net x402 à M+6 (66 transactions/mois mix packs + audits) |
| **5 opportunités** | O1 fraîcheur, O2 parsing, O3 paiement IA-to-IA, O4 onboarding sponsor wallet, O5 auto-optimisation post-flight |
| **Solutions V1 retenues** | 21 solutions (vs 19 v1) — ajout S3.1b (pack pré-payé), S5.1-S5.4 (audit endpoint), retrait S4.1 (Stripe Link 4,99 €/jour illimité) |
| **Solutions V2 reportées** | S1.6 diff API, S2.5 MCP server, S3.5 Subscription Pro $29/mois, S3.6 Solana, S4.6 Stripe récurrent (RETIRÉ), S5.5 Cost Regression Alerts |
| **Experiments** | E1 (J7 binaire >= 1 paiement x402), E2 (Reddit conversion sponsor wallet), E3 (MCP appétence), E4 (audit ROI 30j) |
| **Règle d'inclusion** | Une feature non rattachée à une opportunité ici = backlog V2, pas roadmap V1 |
| **Delta v1→v2** | S4.1 v1 (Stripe Link illimité) = RETIRÉ. S3.1b (pack pré-payé) + S5.1-S5.4 (audit) = AJOUTÉS. O4 réformulée (sponsor wallet vs bascule humain). O5 créée. |
