<!-- Version: 2026-05-05T14:45 — @product-manager — Phase 0 v2 wave 2 — Roadmap RICE DevRefs PIVOT 100% B2A -->

# Roadmap — DevRefs v2

## Résumé exécutif

- **Horizon** : 6 mois (M0 → M+6). Plan par dépendances strictes (pas timeline en semaines, cf. CLAUDE.md règle n°5).
- **Méthode** : RICE (Reach × Impact × Confidence / Effort). Effort calibré IA (1 = trivial < 1 h, 5 = lourd > 1 jour).
- **Pivot v2 acté 2026-05-05** : 3 endpoints V1 (pas 2), middleware x402 unifié, Stripe rétrogradé, pack KV quota lookup ajouté.
- **20 features V1 retenues** (recompte : F1 + F1b + F1c + F2 à F26 hors doublons, soit 20 items RICE scorés).
- **8 features V2 reportées** explicitement + 4 features Phase 4 post-launch.
- **Chemin critique v2** : middleware x402 unifié 3 endpoints → pack KV quota lookup → audit endpoint → landing v2 → llms.txt 3 endpoints → dashboard.
- **Phase 4 flags** : @sales-enablement (F27 playbook upsell audit + F28 ROI calculator) + @growth (F29 data story Opus tokenizer + F30 data story SDKs breaking changes).

---

## 1. Légende RICE

| Composante | Échelle |
|---|---|
| **Reach** (R) | 1 = quelques agents, 5 = tous les agents qui crawlent DevRefs |
| **Impact** (I) | 1 = marginal, 5 = critique pour KPI North Star |
| **Confidence** (C) | 0.5 = preuve faible, 0.8 = moyenne, 1.0 = forte |
| **Effort** (E) | 1 = trivial < 1 h IA, 2 = < 4 h, 3 = < 1 jour, 4 = 1-3 jours, 5 = > 3 jours |
| **Score** | (R × I × C) / E. Plus haut = plus prioritaire |

**Note IA** : effort en heures-IA, parallélisation par défaut.

---

## 2. Features V1 — scoring RICE v2

### 2.1 Endpoints API et fraîcheur (chemin critique)

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité |
|---|---|---|---|---|---|---|---|
| F1 — `/api/llm-prices?model=X` (12 modèles, cron 6 h, JSON typé + `effective_cost_factor`) | 5 | 5 | 1.0 | 3 | **8.33** | Drive paiements x402 pack (cible 33+ packs $10/mois) | O1 + O2 |
| F1b — `/api/agent-audit` POST (5 heuristiques statiques, score 0-100, recommendations[] + patch JSON, garantie 50 % refund, cf. `agent-audit-spec.md`) | 4 | 5 | 0.8 | 4 | **4.00** | Ticket $9.99 = 2e driver revenue, ROI 10×+ 3 mois agent >= 5M tok | O5 (nouveau) |
| F1c — Validation input audit avant 402 (share_pct=100, traces 3-50, <= 100 KB, warning < 5M) | 4 | 4 | 1.0 | 1 | **16.00** | Qualité output audit + prévention abus | O5 |
| F2 — `/api/sdk-status?pkg=X` (50 SDKs npm, parser CHANGELOG, cron 24 h) | 4 | 4 | 0.8 | 3 | **4.27** | Diversification revenue + différenciation | O1 + O2 |
| F3 — JSON-LD `Dataset` `dateModified` ISO 8601 + `sameAs` source officielle | 5 | 5 | 1.0 | 1 | **25.00** | Différenciateur unique vs concurrents (G1 GEO) | O1 |
| F4 — Header HTTP `Last-Modified` aligné JSON-LD | 4 | 3 | 1.0 | 1 | **12.00** | Standard machine-readable + cache HTTP | O1 |
| F5 — Champ `effective_cost_factor` Opus 4.7 (1.35) payload pricing | 5 | 5 | 1.0 | 1 | **25.00** | Différenciation immédiate vs pricepertoken | O1 |
| F6 — Cron sources officielles (Anthropic/OpenAI/Google/Mistral/DeepSeek + npm + GitHub) | 5 | 5 | 0.8 | 4 | **5.00** | Garantit fraîcheur signalée — prérequis F1+F2 | O1 |
| F7 — IndexNow push Bing après chaque update cron | 3 | 3 | 0.8 | 1 | **7.20** | Accélère indexation crawler agent (Bing/Perplexity) | O3 indirect |

### 2.2 Paiement et auth — 100 % B2A pur (chemin critique)

| Feature | R | I | C | E | Score v2 | Lien KPI North Star | Opportunité | Delta v1→v2 |
|---|---|---|---|---|---|---|---|---|
| F8 — Middleware x402 UNIFIÉ 3 endpoints (Coinbase facilitator, HTTP 402 body augmenté `alternative_cost_estimate` + `roi_summary` + `freshness_proof` + `payload_preview`, cf. `x402-response-spec.md`) | 5 | 5 | 0.8 | 4 | **5.00** | Drive 100 % revenue cible | O3 | Extension 2→3 endpoints + body augmenté |
| F8b — Pack pré-payé KV quota lookup (1 signature x402 → quota KV → calls suivants < 50 ms p95) | 5 | 5 | 0.8 | 3 | **6.67** | Réduit friction x402 par-call → augmente ARPU | O3 | NOUVEAU v2 |
| F9 — Stripe top-up wallet sponsor (marginale — pas offre commerciale, pas pilier revenue) | 2 | 2 | 1.0 | 1 | **4.00** | Rampe onboarding sponsor uniquement | O4 réduit | **Score abaissé v2** (v1 = 20.00) |
| F10 — JWT HMAC 24 h (émis après top-up Stripe sponsor uniquement) | 2 | 2 | 1.0 | 2 | **2.00** | Auth fallback sponsor | O4 réduit | **Score abaissé v2** |
| F11 — Cookie `Secure;HttpOnly;SameSite=Strict` JWT | 2 | 2 | 1.0 | 1 | **4.00** | Conformité OWASP/CNIL | O4 réduit | Score abaissé v2 |
| F12 — Activation Stripe Tax | 2 | 3 | 1.0 | 1 | **6.00** | Conformité TVA (même si marginal) | O4 | Inchangé |
| F13 — Watermark HMAC `_signature` sur payloads (pricing + audit) | 3 | 3 | 0.8 | 2 | **3.60** | Protection IP + traçabilité (3 endpoints) | O3 | Extension audit |
| F14 — Rate-limit par wallet (1 000 req/jour pay-per-call, 100 000/jour pack actif) et JWT (10 000/jour) | 4 | 3 | 1.0 | 2 | **6.00** | Anti-fraude + cohérence CGV | O3 | Paliers pack ajoutés v2 |

### 2.3 Découvrabilité agent + landing sponsor

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité |
|---|---|---|---|---|---|---|---|
| F15 — `llms.txt` racine (3 endpoints monétisés : F1 + F2 + F1b audit, avec pricing pack x402) | 5 | 5 | 0.8 | 1 | **20.00** | Découvrabilité agent #1 | O2 + O3 |
| F16 — Landing publique `/` (HTML < 50 KB, 2 heroes JSON : pricing payload + audit score JSON, hero "Cost intelligence for AI agents") | 5 | 4 | 1.0 | 3 | **6.67** | Conviction sponsor + GEO entité + conversion pack | O4 |
| F17 — Sitemap.xml + robots.txt explicite | 4 | 3 | 1.0 | 1 | **12.00** | Indexation Google/Bing + GEO Perplexity | O4 indirect |
| F18 — OpenAPI 3.1 spec + extension `x-x402` (3 endpoints) | 4 | 4 | 0.8 | 2 | **6.40** | Découvrabilité MCP-compatible + doc agent | O2 + O3 |
| F19 — Page `/about/data-sources` | 3 | 3 | 1.0 | 1 | **9.00** | Verifiable value + conformité EU AI Act | O1 |
| F20 — Page `/about/data-schema` (pricing + audit schema) | 3 | 3 | 1.0 | 1 | **9.00** | Doc agent + transparence | O2 |

### 2.4 Pages légales (obligatoires)

| Feature | R | I | C | E | Score | Justification |
|---|---|---|---|---|---|---|
| F21 — Page `/legal/cgv` v2 (clause x402 + garantie ROI 50 % refund audit + irrévocabilité on-chain) | 5 | 4 | 1.0 | 1 | **20.00** | Obligatoire avant 1ère transaction — MISE À JOUR v2 avec clause audit |
| F22 — Page `/legal/privacy` | 5 | 4 | 1.0 | 1 | **20.00** | Obligatoire RGPD + Coinbase + Stripe |
| F23 — Page `/legal/mentions-legales` | 4 | 3 | 1.0 | 1 | **12.00** | Obligatoire LCEN 2004 |
| F24 — Page `/bot` | 2 | 2 | 1.0 | 1 | **4.00** | Best practice TOS scraping |

### 2.5 Mesure et dashboards

| Feature | R | I | C | E | Score | Lien KPI North Star |
|---|---|---|---|---|---|---|
| F25 — Dashboard interne consolidé (CF Analytics + Coinbase + Stripe, events `pack_*` + `audit_*`, retrait events Stripe humain pilier) | 3 | 4 | 0.8 | 3 | **3.20** | Pilotage KPI + diagnostic Phase 4 |
| F26 — Page `/dashboard?token=JWT` sponsor (quota pack restant, wallet balance, nb queries) | 2 | 2 | 1.0 | 2 | **2.00** | UX sponsor post top-up |

### 2.6 Phase 4 — Post-launch (flags autres agents)

| Feature | R | I | C | E | Score | Owner | Notes v2 |
|---|---|---|---|---|---|---|---|
| F27 — Playbook commercial post-launch (upsell audit post-pricing call + relance agents actifs sans audit) | 2 | 3 | 0.8 | 2 | **2.40** | @sales-enablement Phase 4 | Réorienté v2 : upsell audit (pas Stripe) |
| F28 — ROI calculator agent (calcul break-even pack $10 vs tokens cramés) | 2 | 3 | 0.8 | 2 | **2.40** | @sales-enablement Phase 4 | Recalibré v2 : pack pas Stripe Link |
| F29 — Data story earned media : "Opus 4.7 +35 % tokenizer" (basée `effective_cost_factor`) | 3 | 3 | 0.8 | 2 | **3.60** | @growth Phase 4 | Inchangé |
| F30 — Data story earned media : "Top 10 SDKs breaking changes Q1-Q2 2026" (basée `/api/sdk-status`) | 3 | 3 | 0.8 | 2 | **3.60** | @growth Phase 4 | Inchangé |

---

## 3. Features V2 reportées (raison explicite)

| Feature V2 | Raison report | Hypothèse à valider en V1 |
|---|---|---|
| Subscription Pro $29/mois (x402 V2 SIWx + deferred payment) | [HYPOTHÈSE H7] x402 V2 SDKs stables Q3 2026 — V1 packs only | Signal demande >= 5 agents expriment besoin subscription |
| Dashboard équipe / multi-utilisateur | (b) Persona CFO/VP Eng V2 candidat — attendre signal demande V1 | Persona V2 confirmé ? |
| Export CSV mensuel agrégé CFO | (b) Idem dashboard équipe | Idem |
| Endpoint `/api/model-deprecations` | (a) Bundle cible M+12 — attendre validation H1 J7 | H1 J7 binaire OUI |
| Endpoint `/api/embedding-prices` | (a) Idem | Idem |
| MCP server officiel DevRefs | (a) [HYPOTHÈSE H9] appétence non testée — sondage E3 Dev.to | >= 3 demandes explicites |
| Multi-facilitator x402 Solana | (a) [HYPOTHÈSE H7] Coinbase stable 12+ mois — code portable suffit | Si Coinbase down > 24 h/mois |
| Cost Regression Alerts (3e offre future) | (a) Conditionnée signal demande post-V1 (creative-brief v2 § 5) | Trigger : revenu Audit > 70 % M+3-M+6 |

**Aucune feature reportée pour "trop complexe" ou "trop cher"** — mindset IA appliqué.

---

## 4. Plan par dépendances (chemin critique v2)

### 4.1 Bloc 0 — Fondations stratégiques (Phase 0 v1 + v2 — FAIT)

```
@creative-strategy v2 (brand-platform + personas + competitive-benchmark + creative-brief)  [DONE]
@legal (legal-audit + rgpd-checklist + cgu-draft + privacy-policy)                          [DONE]
@ia v2 (agent-integration + agent-economics + x402-response-spec + agent-audit-spec)       [DONE]
@product-manager v2 (ce fichier + v1-scope + backlog + discovery-map + assumption-map)     [EN COURS]
```

### 4.2 Bloc 1 — Pré-build (Phase 0 wave 3-4)

Prérequis avant ouverture chantier @fullstack :

```
@data-analyst v2 (kpi-framework + tracking-plan + dashboard specs — pack_* + audit_* events)
@ux (parcours agent x402 : 402 pricing → pack → 402 audit → report ; parcours sponsor top-up)
@design (design tokens agent-first + 2 heroes JSON : pricing + audit)
@copywriter (hero acté + FAQ + 2 offres pricing + llms.txt content — sans Stripe humain pilier)
@seo + @geo (entités nommées + claims vérifiables + JSON-LD spec)
@ia (OpenAPI 3.1 spec 3 endpoints + x-x402 + llms.txt structure)
```

Tous parallélisables.

### 4.3 Bloc 2 — V1 build (Phase 1 — @fullstack pipeline serré)

Ordre de dépendance technique (chemin critique v2) :

```
1. Cloudflare Workers + KV setup + domaine devrefs.dev acheté
2. Cron sources officielles (F6) → KV cache pricing + SDK
   ├── Anthropic/OpenAI/Google/Mistral/DeepSeek pricing scrape
   ├── npm registry + GitHub releases scrape (50 SDKs)
   └── Parser (JSON-LD Dataset + dateModified + sameAs + effective_cost_factor)
3. Endpoint /api/llm-prices?model=X (F1) — read-only KV
4. Endpoint /api/sdk-status?pkg=X (F2) — read-only KV
5. Middleware x402 UNIFIÉ (F8) — applique sur F1 + F2 + F1b (3 endpoints)
   ├── HTTP 402 spec + body augmenté (x402-response-spec.md)
   ├── Coinbase facilitator USDC Base settle
   ├── Pack pré-payé KV quota lookup (F8b) — 1 signature → quota → calls lookup < 50 ms
   └── Watermark HMAC _signature (F13)
6. Endpoint /api/agent-audit (F1b) + validation input (F1c)
   ├── 5 heuristiques statiques (model downgrade, prompt caching, batch, tool trim, effort mismatch)
   ├── Score 0-100 + recommendations[] + patch JSON Schema-validable
   └── Garantie 50% refund dans response body si savings_pct < 15%
7. Rate-limit F14 (wallet paliers pay-per-call vs pack actif)
8. Stripe top-up wallet sponsor F9 (marginale) + JWT F10 + cookie F11
9. Activation Stripe Tax F12
10. Landing publique / (F16) — HTML < 50 KB
    ├── Hero 1 : démo JSON payload pricing avec effective_cost_factor
    ├── Hero 2 : démo JSON audit score (score 62/100 + savings_pct 40%)
    ├── Hero text : "Cost intelligence for AI agents — know before you spend, optimize after you ship"
    └── JSON-LD inline Dataset + WebAPI (3 endpoints)
11. Pages support : /about/data-sources (F19), /about/data-schema (F20), /bot (F24)
12. Pages légales v2 : /legal/cgv (F21 + clause audit garantie ROI), /legal/privacy (F22), /legal/mentions-legales (F23)
13. llms.txt F15 (3 endpoints : F1 + F2 + F1b + pricing pack) + sitemap F17 + OpenAPI F18 (3 endpoints)
14. Dashboard interne F25 (events pack_* + audit_*) + page /dashboard F26 (sponsor)
15. IndexNow push F7 (auto post-cron)
16. QA Phase 3 (32 gates G1-G32 + GP1-GP10 testeur-agent-ia + @testeur-sponsor-humain)
17. Publication landing + 2 posts Dev.to (tutorials x402 pack + audit) + 1 post Reddit
```

**Delta clé v1→v2** :
- Étape 5 : middleware x402 étendu à 3 endpoints (pas 2)
- Étape 5 : F8b pack KV quota lookup ajouté dans le même bloc (signature par pack, pas par call)
- Étape 6 : F1b audit endpoint ajouté (absent de v1)
- Étape 8 : Stripe rétrogradé APRÈS audit — plus prioritaire que Stripe
- Étape 10 : landing v2 avec 2 heroes JSON (pricing + audit)

### 4.4 Bloc 3 — QA + Review (Phase 3)

```
@qa (tests E2E 3 endpoints + pack quota + audit report)
@testeur-agent-ia (simule agent IA : llms.txt → 402 pricing → pack x402 → 402 audit → audit report)
@testeur-sponsor-humain (simule dev humain top-up wallet → vérifie flux clair)
@reviewer (32/32 G1-G32 PASS + GP1-GP10 + GC1-GC10)
```

### 4.5 Bloc 4 — Mesure (Phase 4)

```
@data-analyst (dashboard live CF Analytics + Coinbase consolidé, alertes seuils)
@growth (plan d'action selon résultats J7 : si < 1 paiement x402 → diagnostic GEO/SEO)
Plan d'action J7 :
  - 0 paiement x402 : diagnostic GEO/SEO → push + 5 keywords secondaires
  - 1-5 paiements x402 : continuer V1, pas de scaling agressif
  - > 5 paiements x402 J7 : push agressif Dev.to + GEO + audit upsell
  - Revenu Audit > 70% M+3 : trigger bascule pipeline audit-only (creative-brief v2 § 5)
```

---

## 5. Classement RICE — top 10 features à prioriser

| Rang | Feature | Score RICE | Priorité bloc |
|---|---|---|---|
| 1 | F3 — JSON-LD dateModified | 25.00 | Bloc 2 étape 2 |
| 2 | F5 — effective_cost_factor | 25.00 | Bloc 2 étape 2 |
| 3 | F1c — Validation input audit | 16.00 | Bloc 2 étape 6 |
| 4 | F4 — Header Last-Modified | 12.00 | Bloc 2 étape 2 |
| 5 | F17 — Sitemap.xml + robots.txt | 12.00 | Bloc 2 étape 13 |
| 6 | F21 — CGV v2 | 20.00 | Bloc 2 étape 12 |
| 7 | F22 — Privacy | 20.00 | Bloc 2 étape 12 |
| 8 | F15 — llms.txt 3 endpoints | 20.00 | Bloc 2 étape 13 |
| 9 | F8b — Pack KV quota lookup | 6.67 | Bloc 2 étape 5 |
| 10 | F1 — Endpoint llm-prices | 8.33 | Bloc 2 étape 3 |

**Note** : RICE inférieur ≠ moindre importance. F8 (score 5.00) est critique chemin critique mais effort E=4. F8b (6.67) est ajout v2 stratégique (réduction friction x402).

---

## 6. Validation cohérence roadmap v2

- [x] 3 endpoints couverts par middleware x402 unifié (F1 + F2 + F1b)
- [x] Pack KV quota lookup (F8b) intégré dans chemin critique — signature par pack pas par call
- [x] Stripe rétrogradé (score RICE F9 = 4.00 vs 20.00 en v1) — pas dans chemin critique principal
- [x] Audit endpoint (F1b) scoré RICE 4.00 mais business impact critique (ticket $9.99, 2e driver revenue)
- [x] Phase 4 flags @sales-enablement + @growth recalibrés (upsell audit vs Stripe)
- [x] Chemin critique v2 documenté avec delta vs v1 explicite
- [x] 100 % cohérence avec `agent-economics.md` § C.1 (pricing source unique)
- [x] Anti-placeholder : 0 occurrence (zéro "TBD" ou "À COMPLÉTER")
