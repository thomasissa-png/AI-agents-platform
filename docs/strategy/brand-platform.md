<!-- Version: 2026-05-05T15:30 — @creative-strategy — Phase 0 v2 RELANCE — refonte pure B2A 100% agents IA, 2 offres x402 -->
# Plateforme de marque — DevRefs (v2 pure B2A)

## Résumé exécutif

- **Pivot v2** : DevRefs devient un produit **100% B2A pur** (Business-to-Agent). Le persona principal est l'**agent IA payeur autonome**. Le dev humain est rétrogradé en **sponsor wallet** (top-up), pas en payeur.
- **Catégorie créée** : **Cost intelligence for AI agents** — pre-flight (estimation coût avant action) + post-flight (audit ROI après cycle). Trou de marché : aucun outil concurrent ne facture l'agent en x402, tous facturent l'humain en SaaS dashboard ($29-$249/mo).
- **2 offres v2** : (1) Calcul coût (`/api/llm-prices` + `/api/sdk-status`) en pay-per-call $0.001 ou packs $5/$10/$50 USDC ; (2) Audit (`/api/agent-audit`) en one-shot $9.99 USDC ou Pack Pro $49 (6 audits). Subscription Pro $29/mo réservé V2 (x402 V2 sessions).
- **Pricing officiel** : repris tel quel de `docs/ia/agent-economics.md` (validation @ia Spec 2). Aucune invention.
- **3 piliers techniques transversaux** (déclassés sous le message principal "Cost intelligence") : **Fresh — Atomic — Verifiable**.
- **Anti-mots** : Exhaustif — Narratif — Stable — **Humain-first** (nouveau v2).
- **Dépendances aval** : @copywriter (hero v2 cost intelligence), @design (icono pure agent, terminal/JSON, zéro humain), @growth (canaux Dev.to/Reddit/X dev IA), @seo + @geo (entités "cost intelligence agents", "x402 audit"), @ux (parcours 100% agent), @ia (specs MCP/llms.txt 2 offres), @product-manager (backlog Subscription Pro V2), @data-analyst (KPIs ARPU agent vs sponsor split).

---

## 1. Naming (inchangé v2)

**`DevRefs`** confirmé. Domaine **`devrefs.dev`** (TLD .dev privilégié — HSTS forcé Google Registry, signal dev natif). Aucun pivot naming en v2 — la racine "Dev + Refs" reste pertinente pour l'agent qui code (refs techniques) et le dev sponsor (signal namespace dev).

Brand architecture étendue v2 :

```
DevRefs (marque unique monolithique)
├── DevRefs Pricing       → /api/llm-prices       (Offre 1 — pre-flight)
├── DevRefs SDK           → /api/sdk-status       (Offre 1 — pre-flight)
└── DevRefs Audit         → /api/agent-audit      (Offre 2 — post-flight)
```

V2 candidate (M+3 si signal demande) : **DevRefs Cost Regression Alerts** (sticky multi-provider, abonnement Subscription Pro $29/mo en x402 V2 sessions).

---

## 2. Promesse v2 (refonte complète)

### 2.1 Promesse unique v2

> **Cost intelligence for AI agents — know before you spend, optimize after you ship.**

Variante FR (site bilingue plus tard) : **L'intelligence de coût pour agents IA — sache avant de dépenser, optimise après avoir shippé.**

### 2.2 Hero retenu (challengeable mais candidat verrouillé Thomas)

> **Cost intelligence for AI agents — know before you spend, optimize after you ship.**

Hero alternatif (challenger interne, à A/B-tester en Phase 4 mesure si conversion < 2 %) :
- *"Your agent burns 67K tokens to find one price. We sell that price for $0.001."*

### 2.3 Reasons To Believe (RTB) v2

| RTB | Source vérifiable |
|---|---|
| ROI 100×-490× sur Offre 1 vs parsing HTML alternatif | `docs/ia/agent-economics.md` § A.3 + `x402-response-spec.md` § 2.1 `alternative_cost_estimate` exposé dans body 402 |
| ROI 10×+ sur Offre 2 audit sur 3 mois pour agent ≥ 5M tokens/mois | `agent-economics.md` § B.3 — économie 35-55 % heuristiques statiques |
| Cron 6h pricing + 24h SDK, `dateModified` ISO 8601 dans chaque payload | Cloudflare Worker cron, JSON-LD `Dataset`, header HTTP `Last-Modified` |
| Payload < 50 KB, JSON typé, atomique (1 query = 1 fait) | Mesure `Content-Length` + tests Phase 3 QA |
| Paiement x402 natif (USDC Base, Coinbase facilitator, settle < 2s, fee ~$0.0001) | `docs.cdp.coinbase.com/x402` + middleware Cloudflare Workers |
| Réponse 402 augmentée : `alternative_cost_estimate`, `roi_summary`, `freshness_proof`, `payload_preview` | `docs/ia/x402-response-spec.md` § 2 |
| Concurrents indirects (Langfuse $29/mo, Helicone $79/mo, Braintrust $249/mo) facturent humains, pas agents | `docs/strategy/competitive-benchmark.md` v2 |

### 2.4 Anti-fausses-promesses v2

Le copy public ne mentionne JAMAIS :
- "Subscription Pro $29/mo" (V2 réservé, x402 V2 SDKs Q3 2026 [HYPOTHÈSE H7])
- "Cost Regression Alerts" (V2 si signal demande)
- "Stripe humain pilier" (banni v2 — Stripe peut rester en fallback technique top-up wallet sponsor mais JAMAIS pitché comme offre)
- "Dashboard humain" (anti-pattern v2 — DevRefs est API-only, no UI to log into)

---

## 3. Hiérarchie de messages (refonte 2 offres)

### 3.1 Message principal (tagline)

> **Cost intelligence for AI agents.**

Sous-titre opérationnel : *Pre-flight pricing in $0.001/call. Post-flight audits in $9.99/run. Paid in x402 USDC, no human in the loop.*

### 3.2 Messages par offre

#### Offre 1 — Calcul coût (pre-flight)

| Élément | Contenu |
|---|---|
| **Claim** | "Know before you spend. `GET /api/llm-prices?model=opus-4.7` → $0.001 USDC → JSON typé daté en 200 ms." |
| **RTB** | Cron 6h sources officielles, `dateModified` JSON-LD, `effective_cost_factor` (capte tokenizer +35% Opus 4.7), `alternative_cost_estimate` dans body 402 montre ROI 490× directement |
| **Exemple agent** | `{"model": "opus-4.7", "input_per_mtok": 5, "effective_cost_factor": 1.35, "dateModified": "2026-05-05T06:00:00Z", "sameAs": "https://www.anthropic.com/pricing"}` |
| **Pricing** | $0.001/call OU Pack Discovery $5 (5K calls) / Standard $10 (10K, recommandé) / Pro $50 (60K) |

#### Offre 2 — Audit (post-flight)

| Élément | Contenu |
|---|---|
| **Claim** | "Optimize after you ship. `POST /api/agent-audit` → $9.99 USDC → rapport heuristiques + savings_pct + recommendations." |
| **RTB** | 5 heuristiques statiques (model downgrade, prompt caching, batch parallélisation, tool description trimming, effort level mismatch) — économie 35-55 % cumulée mid-range, ROI ≥ 10× sur 3 mois pour agent ≥ 5M tokens/mois |
| **Exemple agent** | `{"score": 67, "monthly_cost_current_usd": 90, "monthly_cost_optimized_usd": 54, "savings_pct": 40, "recommendations_count": 8}` |
| **Pricing** | $9.99 one-shot OU Pack Pro $49 (6 audits, $8.17/unit) |

### 3.3 Messages par étape funnel (100% agent)

| Étape | Message | Cible | Canal type |
|---|---|---|---|
| **Découverte agent** | "Ton agent crame 67K tokens × $0.49 (Opus 4.7) pour parser le pricing d'un modèle. DevRefs : $0.001/call, JSON daté, 200 ms." | Agent qui crawle `llms.txt` ou tombe sur 402 | `llms.txt`, OpenAPI, citation Perplexity |
| **Conviction agent** | "Body 402 augmenté : `roi_summary.verdict: no_brainer_buy`, `alternative_cost_usd_opus_4_7: 0.49`, `roi_multiplier: 490`. L'agent décide en 1 lookup." | Agent qui reçoit 402 et évalue payer ou skip | Réponse 402 elle-même |
| **Décision agent** | "Pack Standard $10 = 10K calls @ $0.001. Réduit friction signature x402 par call à 1 signature pour 10K." | Agent qui veut optimiser ARPU côté DevRefs + UX côté lui | `packs_available` dans body 402 |

### 3.4 Message persona secondaire — sponsor wallet humain

> "Ton agent paie en x402 sur son wallet. Tu top-up le wallet quand le solde descend (ex : $10 USDC Base via Coinbase Wallet ou MetaMask). Pas de Stripe, pas d'abonnement humain, pas de dashboard à logger. Tu sponsorises l'agent, l'agent décide seul."

### 3.5 Elevator pitch v2 (30 secondes, 100% B2A)

> "DevRefs vend de la cost intelligence aux agents IA en x402 USDC. Offre 1 (pre-flight) : ton agent paie $0.001 par call pour connaître le prix exact d'un modèle ou la version d'un SDK avant d'agir — vs $0.49 cramés en parsing HTML 5 sources. Offre 2 (post-flight) : ton agent paie $9.99 pour un audit qui détecte 35-55% d'économies sur sa config (model downgrade, prompt caching, batching, tool trimming). Pas de SaaS dashboard humain — Langfuse $29/mo, Helicone $79/mo, Braintrust $249/mo facturent les humains. DevRefs facture les agents directement, en USDC, sans compte. C'est la première brique d'une économie agentic native."

### 3.6 Boilerplate v2

#### Court (X bio, 160 chars)
> DevRefs — cost intelligence for AI agents. Pre-flight pricing $0.001/call, post-flight audits $9.99. x402 USDC native. No SaaS dashboard, agents only.

#### Long (Dev.to about, 120 mots)
> DevRefs vend de la cost intelligence directement aux agents IA, en x402 USDC, sans humain dans la boucle. Offre 1 : ton agent paie $0.001 par call sur `/api/llm-prices` ou `/api/sdk-status` et reçoit un JSON daté avec `effective_cost_factor` (capte les tokenizer-inflations silencieuses), `dateModified` ISO 8601, et `alternative_cost_estimate` dans le body 402 qui prouve ROI 490× vs parsing HTML. Offre 2 : ton agent paie $9.99 sur `/api/agent-audit`, reçoit un rapport 5 heuristiques (downgrade modèle, prompt caching, batching, tool trimming, effort mismatch) qui détecte 35-55% d'économies. Pas de Langfuse $29/mo, Helicone $79/mo, Braintrust $249/mo — c'est une couche API pour agents, pas un dashboard pour humains.

---

## 4. Voice & Tone (ajustement v2)

### 4.1 Voice — 3 traits constants (mise à jour)

| Trait | Définition opérationnelle |
|---|---|
| **Direct** | Phrases courtes, sujet-verbe-complément. Aucun adverbe modal. Aucun adjectif marketing creux. |
| **Technique précis** | Chiffres datés et sourcés, jamais d'arrondis flous. Pricing repris depuis `agent-economics.md`. |
| **Agent-first absolu** (renforcé v2) | Le copy parle à l'agent. Le sponsor humain est mentionné une seule section pour le top-up wallet. Plus de "humain superviseur" comme cible primaire ou secondaire de copy. |

### 4.2 Vocabulaire — additions v2

**Prescrits v2** : `cost intelligence`, `pre-flight`, `post-flight`, `pay-per-call`, `pack pré-payé`, `audit one-shot`, `savings_pct`, `recommendations`, `heuristiques statiques`, `model downgrade`, `prompt caching`, `batch parallélisation`, `tool description trimming`, `effort level mismatch`, `effective_cost_factor`, `tokenizer inflation`, `ROI multiplier`, `no_brainer_buy`, `wallet sponsor`, `top-up`.

**Proscrits v2** (additions) : `dashboard`, `équipe`, `collaborateur`, `humain superviseur` (en pitch produit — uniquement OK en doc technique top-up wallet), `Stripe Link 4,99 €/jour` (banni v2), `JWT 24h` (uniquement OK en backlog technique sponsor wallet), `unlimited`, `subscription` (sauf V2 backlog explicite).

**Anti-mot ajouté v2** : **Humain-first**. Tout copy "humain-first" est rejeté. Si un texte commence par "Pour les développeurs qui veulent…", il doit être réécrit en "Ton agent…".

---

## 5. Brand Architecture v2

### 5.1 V1 v2 — Monolithique, 2 offres

```
DevRefs (marque unique)
├── Offre 1 — Pre-flight Cost Calculator
│   ├── /api/llm-prices       (12 modèles V1)
│   └── /api/sdk-status       (50 SDKs V1)
└── Offre 2 — Post-flight Audit
    └── /api/agent-audit      (5 heuristiques V1)
```

Pas de sous-marques. Pas de produit "DevRefs Pro" ou "DevRefs Enterprise". 1 marque, 2 offres, 3 endpoints monétisés.

### 5.2 V2 candidate (M+3 si signal demande)

- **DevRefs Cost Regression Alerts** (sticky multi-provider, 3e offre future) : monitoring continu des coûts d'un agent, alerte si le coût/token augmente > X% sur N jours. Pricing cible : Subscription Pro $29 USDC/mois en x402 V2 sessions (deferred payment scheme + SIWx). Conditionné à : (a) x402 V2 SDKs stables [HYPOTHÈSE H7 — Q3 2026], (b) signal demande post-V1 (3+ agents demandent l'endpoint).

### 5.3 Anti vendor lock-in (renforcé v2)

Cloudflare Workers/Pages + Coinbase x402 facilitator = choix d'infra **factuels, jamais survendus** dans le copy. x402 = protocole ouvert (Coinbase + Cloudflare Foundation septembre 2025). Code Worker portable Deno/Bun/Node. Plan B Solana facilitator V2 si Coinbase instable (cf. risque R1 `agent-economics.md` § D.2). **Pas de Stripe pilier en v2** — Stripe peut rester en option de top-up wallet sponsor humain mais n'est plus une offre commerciale DevRefs.

---

## 6. Triggers de réévaluation stratégique v2

| Trigger | Seuil | Action |
|---|---|---|
| **% revenu Audit > 70 %** sur M+3 à M+6 | Audit (Offre 2) génère > 70 % du revenue total | **Bascule audit-only V2** — déprécier Offre 1 calcul coût (devient gratuite/SDK open-source comme lead magnet), focus produit + GTM 100 % sur Audit |
| Adoption x402 < 2 % en 2026 | Volume x402 mensuel global < seuil ou DevRefs < 5 paiements J7 | Diagnostic SEO/GEO d'abord, puis pivot ticket plus élevé : pousser Audit one-shot $9.99 (60 audits/mois = 600 €/mois sans dépendre du volume Pack Standard) |
| Concurrent direct lance audit cross-provider en x402 | Anthropic / OpenAI / Coinbase lance équivalent gratuit ou low-cost | Rééval pivot vers super-niche : audit specs RFC/W3C ou audit MCP servers cross-host |
| Signal demande Subscription Pro | ≥ 5 agents/mois demandent abonnement explicite (via header HTTP custom ou support inbox) | Activer V2 Subscription Pro $29/mo + Cost Regression Alerts (priorité haute backlog @product-manager) |
| Saturation entité nommée "DevRefs" | < 1 citation Perplexity/mois après 6 mois | Rééval brand visibility (pas naming) — investir GEO + IndexNow + 3 articles Dev.to/mois |
| Kill-switch x402 protocole | x402 Foundation se fragmente OU Coinbase retire facilitator | Bascule Solana facilitator OU bascule full Stripe Connect humain (perte différenciation B2A — pivot fondamental) |
| NPS sponsor humain négatif sur top-up wallet UX | Sur 30 sponsors interrogés, > 50 % "trop friction crypto" | Ajouter Stripe → USDC bridge automatisé (pas Stripe pilier, juste rampe top-up) |

---

## 7. Agents spécialisés recommandés (v2 ajustement)

| Agent | Type | Rôle v2 | Justification |
|---|---|---|---|
| `@testeur-agent-ia` | Testeur persona principal | Incarne agent IA réaliste qui (a) crawle `llms.txt`, (b) reçoit 402 sur Offre 1 ET Offre 2, (c) parse `alternative_cost_estimate` + `roi_summary`, (d) décide pay/skip/upgrade-pack en autonomie, (e) mesure tokens consommés et latence p95 | Persona principal = agent IA payeur autonome. v2 doit tester les 2 offres distinctement (pre-flight + post-flight) et le no-brainer ratio 490× exposé dans body 402 |
| `@testeur-sponsor-humain` (renommé v2 — ex `@testeur-developpeur-superviseur`) | Testeur persona secondaire | Incarne dev sponsor qui top-up le wallet de son agent (ex : $10 USDC Base via Coinbase Wallet ou MetaMask). Vérifie friction onboarding crypto, friction réconciliation BNC fiscale, anxiété wallet vide bloquant l'agent | Persona secondaire v2 = sponsor wallet, PAS payeur. Le test critique = "puis-je top-up sans friction et sans peur de perdre la main sur le budget ?" — différent du test v1 (bascule Stripe Link) |

→ **Handoff @agent-factory** : créer ces 2 agents en Phase 2 (avant Phase 3 QA) sur la base des specs ci-dessus + de `personas.md` v2 + `creative-brief.md` v2.

---

## 8. Synthèse exécutive (handoff aval v2)

| Élément | Décision v2 |
|---|---|
| **Naming** | DevRefs (inchangé) |
| **Domaine** | devrefs.dev (inchangé) |
| **Catégorie v2** | Cost intelligence for AI agents (B2A pure) |
| **Hero retenu** | Cost intelligence for AI agents — know before you spend, optimize after you ship. |
| **2 offres v2** | Calcul coût ($0.001/call ou packs $5/$10/$50) + Audit ($9.99 one-shot ou Pack Pro $49) |
| **3 piliers transversaux** | Fresh — Atomic — Verifiable (gardés mais déclassés sous "Cost intelligence") |
| **Anti-mots** | Exhaustif — Narratif — Stable — **Humain-first** (nouveau v2) |
| **Persona principal** | Agent IA autonome PAYEUR (unique) |
| **Persona secondaire** | Dev humain SPONSOR (top-up wallet, pas payeur) |
| **Brand architecture** | Monolithique, 2 offres / 3 endpoints. V2 candidate : Cost Regression Alerts |
| **Agents testeurs** | @testeur-agent-ia + @testeur-sponsor-humain (renommé v2) |
| **Trigger pivot Audit-only** | Si % revenu Audit > 70 % à M+3-M+6 |

---

## Handoff @creative-strategy → @orchestrator (Phase 0 v2 RELANCE)

- Statut : COMPLETE (ce fichier)
- Décisions Thomas verrouillées propagées : 100 % B2A pure, 2 offres x402, hero Cost intelligence, anti-mot Humain-first ajouté, persona sponsor (pas payeur)
- Pricing repris tel quel depuis `agent-economics.md` § C.1
- Triggers v2 ajoutés : bascule audit-only si revenu Audit > 70 %
- 2 agents testeurs renommés/ajustés v2
- Références aval : `personas.md` v2, `competitive-benchmark.md` v2, `creative-brief.md` v2
