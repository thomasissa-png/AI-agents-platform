<!-- Version: 2026-05-05T09:00 — @product-manager — Phase 0 wave 2 — Opportunity Solution Tree DevRefs -->

# Discovery Map — DevRefs

## Résumé exécutif

- **Objectif** : cartographier les opportunités produit qui mènent au KPI North Star (600 €/mois revenu net x402+Stripe à 6 mois) via la méthode Opportunity Solution Tree (Teresa Torres).
- **Outcome désiré** : >= 100 paiements x402 0,49 €/mois OU >= 4 abonnements Stripe 4,99 €/jour soutenus, OU mix équivalent à 600 €/mois net.
- **4 opportunités** identifiées, chacune liée à >= 1 verbatim persona V1-V5 documenté dans `docs/strategy/personas.md`.
- **Solutions** scorées valeur/coût (échelle 1-5). Toute solution dans la roadmap V1 DOIT être rattachée à une opportunité ici.
- **Experiments** définis pour les 3 solutions à preuve faible (sondage Reddit, teasing Dev.to, prototype `curl` partagé).
- **Dépendances aval** : `assumption-map.md` (hypothèses critiques), `roadmap.md` (priorisation RICE), `v1-scope.md` (scope final).

---

## 1. Outcome désiré (lié au KPI North Star)

| Élément | Valeur |
|---|---|
| **KPI North Star** | Revenu net mensuel x402 + Stripe = 600 €/mois (cf. project-context.md ligne 79) |
| **Outcome produit** | Un agent IA autonome paie en x402 (0,49 €/query) un payload technique fresh ET/OU son superviseur humain bascule sur Stripe Link (4,99 €/jour) quand l'agent paie en boucle |
| **Échelle de réussite** | M+1 >= 50 €, M+3 >= 200 €, M+6 >= 600 € (cf. brief @growth Phase 4 dans project-context.md) |
| **Outcome leading metric** | Ratio crawl agent → paiement >= 5 % à J7, >= 10 % à M+1, >= 15 % à M+6 (cf. creative-brief.md § 3.4) |
| **Outcome qualitatif** | >= 1 citation organique Perplexity/Claude/ChatGPT mentionnant "DevRefs" à M+1 (>= 5 à M+3, >= 30 à M+6) |

---

## 2. Opportunités (4 — chacune liée à un verbatim documenté)

### O1 — Absence de signal de fraîcheur structuré machine-readable

**Description** : aucune source pricing/SDK existante (pricepertoken, costgoat, devtk.ai, llm-prices, helicone) ne sert un `dateModified` JSON-LD machine-readable. Un agent qui crawle 5 sources obtient 3 réponses différentes (cf. V3) sans tie-breaker possible. La fraîcheur est devinée, pas signalée.

**Verbatims liés** :
- **V1** (project-context.md lignes 32-48) — bloc tool-call Opus 4.7 : agent halluciné, sortie `INCORRECT` car aucune source ne signale l'inflation tokenizer +35 % datée.
- **V3** (project-context.md ligne 53-54) — Cursor agent fil HN #44682465 : 4 sources WebFetched → 3 prix différents → heuristique médian → facture réelle 2,4× l'estimation, découvert 2 jours plus tard.

**Frustration quantifiée** : 15 % hallucination APIs/SDKs (arxiv 2407.09726), 31 420 ms perdues/query, 64 520 tokens cramés/query.

**Lien KPI North Star** : un agent qui voit `dateModified` < 24 h dans un payload structuré préfère 1 paiement 0,49 € à 5 crawls HTML hallucinés. Convertit le crawl en paiement.

### O2 — Coût parsing HTML disproportionné pour extraire des faits atomiques

**Description** : extraire 2 nombres (input/output per MTok) d'une page pricepertoken exige 38 900 tokens parsés (1 page = 200-380 KB de HTML SEO, leaderboards, prose narrative). Multiplié par 5 sources crawlées = ~64 000 tokens cramés/tâche de fraîcheur. Latence cumulative 18-30 s.

**Verbatims liés** :
- **V2** (project-context.md ligne 51) — agent first-person : "La sixième fois que je tape `WebFetch` sur du HTML de 380 KB pour récupérer 2 nombres, j'ai juste besoin d'un endpoint qui me renvoie `{"input_per_mtok": 1.25, "dateModified": "..."}` et qui me facture 0,49 € au lieu de me coûter 18 000 tokens en parsing."
- **V1** (38 900 tokens parsés sur pricepertoken — ground truth INCORRECT).

**Frustration quantifiée** : 18 000 tokens/parsing × 5 sources = ~90 000 tokens/tâche, ROI break-even en faveur du paiement 0,49 € dès que le coût d'un crawl dépasse l'équivalent de 0,49 € (cf. competitive-benchmark.md § 1.1).

**Lien KPI North Star** : un agent dont le superviseur a configuré "tokens budget < 50 000/tâche fraîcheur" voit `Content-Length: 1.5 KB` sur DevRefs vs `380 KB` sur HTML SEO → préfère DevRefs systématiquement. Drive volume de paiements x402.

### O3 — Absence de protocole de paiement IA-to-IA standardisé adapté aux micro-tx

**Description** : avant x402 (mai 2025 — Coinbase Foundation), aucun protocole HTTP standard ne permettait à un agent autonome de payer < 1 € sans signup, KYC, session. Stripe API exige un compte client + carte enregistrée, hors-cible pour un agent serverless qui spawn et meurt en quelques secondes. ChatGPT plugins exigent OAuth humain.

**Verbatims liés** :
- **V4** (project-context.md ligne 57) — dev humain superviseur : "C'est la 7e fois ce matin que mon agent Claude Code paie 0,49 € pour vérifier le prix Sonnet 4.6 avant chaque génération." Confirme que les agents PEUVENT payer en x402, mais le pattern crée une 2e frustration (côté humain) qui est l'opportunité O4.
- **V2** (agent first-person souhaite "qui me facture 0,49 €" — accepte le paiement comme natif).

**Frustration quantifiée** : x402 settle en < 2 s, fee ~$0.0001, zéro KYC, ~119 M tx Base + 35 M Solana en mars 2026 (cf. brand-platform.md § 3.3 RTB). Le protocole existe et est mature, mais les endpoints commercialisés sont rares (premier cas commercial documenté = Coindesk mars 2026 = 28 k$/jour de volume agrégé total marché).

**Lien KPI North Star** : DevRefs étant l'un des premiers endpoints commerciaux x402-natifs sur la verticale "ref tech data agent-first", chaque paiement réussi = preuve sociale dans la communauté agent et drive l'adoption.

### O4 — Absence de contre-mesure pour facture x402 explosive côté humain superviseur

**Description** : quand l'agent paie en x402 en boucle (7 paiements 0,49 € en 1 matinée = 3,43 €, extrapolé journée scaffold 40 features = 30-50 €), le superviseur humain a besoin d'un mécanisme de bascule vers un tarif plat journalier sans interrompre l'agent ni reconfigurer son code.

**Verbatims liés** :
- **V4** intégral : "Je clique le Stripe Link 4,99 €/jour, JWT 24 h, on n'en parle plus."

**Frustration quantifiée** : 7 paiements 0,49 € matinée = 3,43 €. Journée 40 features = ~30-50 €. Vs 4,99 € unlimited = ROI > 6× pour l'humain. Anxiété budget cloud + IA cumulative (cf. personas.md § 2.3).

**Lien KPI North Star** : Stripe Link 4,99 €/jour = 30 jours = 149,70 €/mois. Un seul superviseur abonné régulier = 25 % du KPI North Star atteint. Cible M+6 = 4 abonnés Stripe réguliers.

---

## 3. Solutions par opportunité (scorées valeur 1-5 / coût 1-5)

### Solutions pour O1 (signal de fraîcheur structuré)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S1.1 — JSON-LD `Dataset` avec `dateModified` ISO 8601 dans chaque payload | 5 | 1 | 5.00 | OUI |
| S1.2 — Header HTTP `Last-Modified` aligné JSON-LD | 4 | 1 | 4.00 | OUI |
| S1.3 — Champ `fetched_at` + `sameAs` (URL source officielle) dans payload | 5 | 1 | 5.00 | OUI |
| S1.4 — Page `/about/data-sources` (transparence provenance) | 3 | 2 | 1.50 | OUI (recommandation @legal § EU AI Act) |
| S1.5 — Champ `effective_cost_factor` (anomalie tokenizer Opus 4.7 +35 %) | 5 | 1 | 5.00 | OUI |
| S1.6 — Diff API entre 2 versions (`?since=2026-05-01`) | 3 | 4 | 0.75 | NON V2 |

### Solutions pour O2 (coût parsing HTML)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S2.1 — Endpoint `/api/llm-prices?model=X` payload < 50 KB JSON typé | 5 | 2 | 2.50 | OUI |
| S2.2 — Endpoint `/api/sdk-status?pkg=X` payload < 50 KB | 5 | 2 | 2.50 | OUI |
| S2.3 — `llms.txt` à la racine référençant endpoints monétisés | 5 | 1 | 5.00 | OUI |
| S2.4 — OpenAPI 3.1 spec avec extension `x-x402` | 4 | 2 | 2.00 | OUI |
| S2.5 — MCP server officiel DevRefs (tool `get_llm_pricing`) | 4 | 3 | 1.33 | NON V2 (hypothèse à valider via O3 V1) |
| S2.6 — Réponse compressée gzip/brotli automatique | 3 | 1 | 3.00 | OUI (Cloudflare default) |

### Solutions pour O3 (protocole paiement IA-to-IA)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S3.1 — Middleware x402 Cloudflare Worker (Coinbase facilitator USDC Base) | 5 | 3 | 1.67 | OUI (chemin critique) |
| S3.2 — Réponse HTTP 402 conforme spec x402 (header structuré + body JSON) | 5 | 1 | 5.00 | OUI |
| S3.3 — Watermark HMAC sur payloads (anti-redistribution) | 4 | 2 | 2.00 | OUI |
| S3.4 — Rate-limit applicatif par wallet | 4 | 1 | 4.00 | OUI |
| S3.5 — Support Solana facilitator x402 (multi-chain) | 2 | 3 | 0.67 | NON V2 (anti-vendor lock-in mais pas critique V1) |

### Solutions pour O4 (bascule humain superviseur)

| Solution | Valeur | Coût | Score (V/C) | Inclus V1 ? |
|---|---|---|---|---|
| S4.1 — Stripe Payment Link 4,99 €/jour | 5 | 1 | 5.00 | OUI |
| S4.2 — JWT signé HMAC valable 24 h, non reconductible auto | 5 | 2 | 2.50 | OUI |
| S4.3 — Cookie `Secure;HttpOnly;SameSite=Strict` (cf. @legal INF-10) | 4 | 1 | 4.00 | OUI |
| S4.4 — Page `/dashboard?token=JWT` interne (nb queries 24 h, coût total) | 4 | 2 | 2.00 | OUI |
| S4.5 — Activation Stripe Tax (TVA OSS B2C UE + reverse charge B2B) | 5 | 1 | 5.00 | OUI (cf. @legal H4) |
| S4.6 — Stripe abonnement mensuel récurrent | 3 | 3 | 1.00 | NON V2 (cf. creative-brief.md V2 candidates) |
| S4.7 — Dashboard team multi-utilisateur | 2 | 4 | 0.50 | NON V2 (CFO/VP Eng candidate) |
| S4.8 — Export CSV mensuel agrégé pour CFO | 2 | 3 | 0.67 | NON V2 |

---

## 4. Experiments (pour solutions à preuve faible)

### E1 — Validation appétence agent x402 (avant scaling investissement marketing)

- **Hypothèse testée** : "Un agent IA en 2026 préfère payer 0,49 € à un endpoint atomique fresh plutôt que de cramer 64 K tokens en parsing multi-source HTML."
- **Méthode** : test binaire J7 post-launch — si 0 paiement x402 enregistré côté Coinbase facilitator dans les 7 jours suivant publication `llms.txt` + 2 posts Dev.to + 1 post Reddit r/ClaudeAI → invalidation forte de l'opportunité O3.
- **Coût test** : 0 € (juste mesurer la métrique sortie de cron + Coinbase dashboard).
- **Décision si invalidé** : pivot vers Stripe-only (perte différenciation B2A) ou pivot vers super-niche specs (RFC, OpenAPI). Cf. brand-platform.md § 7 trigger "Pivot modèle économique".

### E2 — Validation conviction landing humain superviseur (avant tuning Stripe Link)

- **Hypothèse testée** : "Un dev humain qui voit le hero DevRefs pour la 1ère fois clique sur le Stripe Link 4,99 €/jour en < 30 secondes si l'angle "facture x402 explosive de ton agent" est exposé clairement."
- **Méthode** : 1 post Reddit r/ClaudeAI angle "I built an x402-native pricing API for my agent. Here's the data structure I wish existed." — mesurer ratio impressions → clicks landing → clicks Stripe Link sur 7 jours.
- **Coût test** : 0 € (post organique).
- **Décision si invalidé** : @copywriter ré-écrit hero avec angle alternatif (ex : ROI temps économisé plutôt qu'anxiété facture).

### E3 — Validation MCP server payant (avant V2 implémentation)

- **Hypothèse testée** : "Un agent MCP-host (Claude Code, Cursor avec MCP) préfère un MCP server payant avec `dateModified` à un MCP server gratuit sans signal fraîcheur (pricepertoken)."
- **Méthode** : sondage qualitatif Dev.to comments + mention dans 1er post Dev.to "would you pay 0.49€ per call for a freshness-signed MCP tool?". Pas d'implémentation MCP V1, attendre signal.
- **Coût test** : 0 € (commentaires post Dev.to).
- **Décision si validé** : MCP server entre en V2 backlog haute priorité.

### E4 — Validation prix 0,49 € (avant ajustement V2)

- **Hypothèse testée** : "0,49 € est le prix-plafond psychologique pour un agent qui décide en autonomie. Au-delà, il préfère absorber le coût parsing."
- **Méthode** : observation J7 — si > 15 ventes x402 en 7 jours → tester bump 0,49 € → 0,99 € sur 1 endpoint en J14 (split). Si < 5 ventes → pas un problème de prix mais de SEO/GEO (cf. project-context.md Phase 4 plan d'action).
- **Coût test** : 0 € (toggle prix dans Worker config).
- **Décision si invalidé** : reset 0,49 € + investissement ajouté en GEO citations (cf. @growth M+3).

---

## 5. Mapping opportunité → feature → KPI

| Opportunité | Solutions V1 retenues | Feature roadmap | KPI input mesuré |
|---|---|---|---|
| O1 — Fraîcheur structurée | S1.1, S1.2, S1.3, S1.4, S1.5 | JSON-LD `Dataset`, page `/about/data-sources`, `effective_cost_factor` | % payloads avec `dateModified` < 24 h (cible 100 %) |
| O2 — Coût parsing HTML | S2.1, S2.2, S2.3, S2.4, S2.6 | 2 endpoints atomiques, llms.txt, OpenAPI | Taille moyenne payload (cible < 50 KB), latence p95 (cible < 200 ms) |
| O3 — Paiement IA-to-IA | S3.1, S3.2, S3.3, S3.4 | Middleware x402, watermark HMAC, rate-limit wallet | Nb paiements x402/24 h (J7 >= 5) |
| O4 — Bascule humain | S4.1, S4.2, S4.3, S4.4, S4.5 | Stripe Link, JWT 24 h, dashboard interne, Stripe Tax | Nb JWT actifs/24 h (M+1 >= 1) |

---

## 6. Synthèse pour roadmap (handoff @product-manager → roadmap.md)

| Élément | Décision |
|---|---|
| **Outcome unique V1** | 600 €/mois revenu net x402 + Stripe à M+6 |
| **4 opportunités validées** | O1 fraîcheur, O2 parsing, O3 paiement IA-to-IA, O4 bascule humain |
| **Solutions V1 retenues** | 19 solutions (cf. tableaux § 3) — toutes liées à >= 1 opportunité |
| **Solutions V2 reportées** | S1.6 diff API, S2.5 MCP server, S3.5 Solana, S4.6 Stripe mensuel, S4.7 dashboard team, S4.8 export CSV |
| **Experiments à exécuter** | E1 (J7 binaire), E2 (Reddit conversion), E3 (MCP appétence), E4 (prix-plafond) |
| **Règle d'inclusion** | Une feature non rattachée à une opportunité ici = backlog V2, pas roadmap V1 |

---

## Handoff → @product-manager (étape suivante : assumption-map.md puis product-vision.md puis roadmap.md)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/product/discovery-map.md`
- **Décisions prises** : 4 opportunités, 19 solutions V1, 6 solutions V2 reportées, 4 experiments J7-J30.
- **Points d'attention** :
  - Chaque feature de roadmap.md DOIT être mappée sur une opportunité ici. Sinon → challenger.
  - L'experiment E1 (J7 binaire) est le test fondateur de l'opportunité O3 — si 0 paiement x402 = pivot.
  - Solutions V2 reportées sont déjà documentées (creative-brief.md candidates) — pas réinventer.
- **Aucune action Replit requise**.
