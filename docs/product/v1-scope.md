<!-- Version: 2026-05-05T14:30 — @product-manager — Phase 0 v2 wave 2 — V1 Scope DevRefs PIVOT 100% B2A -->

# V1 Scope — DevRefs v2

## Résumé exécutif

- **Mindset IA** : V1 COMPLÈTE (pas MVP minimal — cf. founder-prefs Thomas).
- **Pivot acté 2026-05-05** : 100 % B2A pure agents IA. Stripe humain banni comme pilier. 2 offres x402 distinctes (Calcul coût + Audit).
- **Hypothèse business centrale v2** : "Un agent IA achète-t-il en autonomie un Pack pré-payé x402 ($10 Pack Standard) ET un Audit one-shot ($9.99) ?"
- **3 endpoints V1** : `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit` (ajout pivot v2).
- **29 features RETENUES** (17 features épics + 3 nouvelles audit/pack + 9 support obligatoires conformité/UX).
- **7 features REPORTÉES V2** conservées avec raison explicite.
- **Critères de succès recalibrés** : J7 binaire = >= 1 paiement x402 réel d'un agent IA autonome ; J30 >= 50 € net ; J90 >= 200 € net ; M+6 >= 600 € net (= 66 ventes/mois mix packs $10 + audits $9.99, cf. `agent-economics.md` § C.2).
- **3 risques majeurs** identifiés et mitigés.
- Source pricing officielle : `docs/ia/agent-economics.md` § C.1. Zéro invention.

---

## 1. Features RETENUES V1

### 1.1 Endpoints API et fraîcheur (chemin critique)

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F1 — `/api/llm-prices?model=X` (12 modèles : OpenAI/Anthropic/Google/Mistral, cron 6 h, JSON typé) | 5 | 1.0 | Drive direct paiements x402 pack (cible 66 transactions/mois) |
| F2 — `/api/sdk-status?pkg=X` (50 SDKs npm + GitHub releases, cron 24 h) | 4 | 0.8 | Diversification revenue + différenciation |
| F3 — JSON-LD `Dataset` avec `dateModified` ISO 8601 + `sameAs` source officielle | 5 | 1.0 | Différenciateur unique vs concurrents (G1 GEO) |
| F4 — Header HTTP `Last-Modified` aligné JSON-LD | 3 | 1.0 | Standard machine-readable + cache HTTP agent |
| F5 — Champ `effective_cost_factor` Opus 4.7 (1.35) dans payload pricing | 5 | 1.0 | Différenciation immédiate vs pricepertoken |
| F6 — Cron sources officielles (Anthropic/OpenAI/Google/Mistral/DeepSeek + npm + GitHub) | 5 | 0.8 | Garantit fraîcheur signalée — prérequis F1+F2+F3 |
| F7 — IndexNow push Bing après chaque update cron | 3 | 0.8 | Accélère indexation crawler agent (Bing/Perplexity) |

### 1.2 Paiement et auth — 100 % B2A pur (chemin critique)

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F8 — Middleware x402 UNIFIÉ pour 3 endpoints (Coinbase facilitator USDC Base, HTTP 402 spec + body augmenté `alternative_cost_estimate` + `roi_summary` + `freshness_proof` + `payload_preview`, cf. `x402-response-spec.md`) | 5 | 0.8 | Drive ALL paiements x402 — 100 % du revenu cible |
| F8b — Pack pré-payé KV quota lookup (achat 1 signature x402 → réservation quota KV → calls suivants lookup < 50 ms p95) | 5 | 0.8 | Réduit friction x402 par-call — augmente ARPU |
| F9 — Stripe Payment Link top-up wallet sponsor uniquement (pas offre commerciale) | 2 | 1.0 | Rampe onboarding sponsor wallet — marginale, pas KPI principal |
| F10 — JWT HMAC 24 h non reconductible (émis après top-up Stripe wallet sponsor, identité fallback) | 3 | 1.0 | Auth optionnel sponsor + sécurité |
| F11 — Cookie `Secure;HttpOnly;SameSite=Strict` JWT (cf. @legal INF-10) | 2 | 1.0 | Conformité OWASP/CNIL + UX sponsor |
| F12 — Activation Stripe Tax (cf. @legal H4) | 3 | 1.0 | Conformité TVA OSS B2C UE (même si marginal) |
| F13 — Watermark HMAC `_signature` sur payloads (anti-redistribution) | 3 | 0.8 | Protection IP + traçabilité |
| F14 — Rate-limit applicatif par wallet (1 000 req/jour pay-per-call, 100 000 req/jour pack actif) et par JWT (10 000 req/jour) | 3 | 1.0 | Anti-fraude + cohérence CGV |

**Note v2** : F9/F10/F11 conservées car sponsor wallet top-up (humain) est marginalement utile pour l'onboarding, mais leur RICE est volontairement abaissé — elles ne sont PLUS des features piliers comme en v1. Le persona secondaire sponsor est réel mais le flux est : sponsor top-up wallet agent → agent paie en x402. Stripe ne génère pas de revenu direct DevRefs.

### 1.3 Endpoint audit post-flight — NOUVEAU v2 (chemin critique)

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F1b — `/api/agent-audit` (POST, 5 heuristiques statiques, score 0-100, recommendations[] avec patch JSON Schema-validable + auto_applicable, garantie 50 % refund si savings_pct < 15 % à 30j, cf. `agent-audit-spec.md`) | 5 | 0.8 | Ticket moyen $9.99 = 2e driver revenue, ROI 10×+ sur 3 mois pour agent >= 5M tokens/mois |
| F1c — Validation input audit avant 402 (somme share_pct = 100, min 3 traces, max 50, payload <= 100 KB, warning si monthly_volume_estimate < 5M) | 4 | 1.0 | Qualité output audit + prévention abus |

### 1.4 Découvrabilité agent + landing sponsor

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F15 — `llms.txt` racine référençant 3 endpoints monétisés (F1 + F2 + F1b audit) avec pricing pack x402 | 5 | 0.8 | Découvrabilité agent #1 — prérequis crawl agent |
| F16 — Landing publique `/` (HTML statique < 50 KB, hero démo JSON payload pricing, hero 2 démo audit score JSON, hero "Cost intelligence for AI agents — know before you spend, optimize after you ship") | 4 | 1.0 | Conviction sponsor humain + GEO entité nommée + conversion pack |
| F17 — Sitemap.xml + robots.txt explicite | 3 | 1.0 | Indexation Google/Bing + GEO Perplexity |
| F18 — OpenAPI 3.1 spec avec extension `x-x402` (couvrant les 3 endpoints) | 4 | 0.8 | Découvrabilité MCP-compatible + doc agent |
| F19 — Page `/about/data-sources` (transparence provenance) | 3 | 1.0 | Verifiable value + conformité aval clients IA |
| F20 — Page `/about/data-schema` (schéma payload pricing + audit pour acheteurs) | 3 | 1.0 | Doc agent + transparence |

### 1.5 Pages légales (obligatoires)

| Feature | Impact (1-5) | Confidence | Justification |
|---|---|---|---|
| F21 — Page `/legal/cgv` (clause x402, garantie ROI 50 % refund audit, irrévocabilité on-chain) | 4 | 1.0 | Obligatoire avant 1ère transaction (legal-audit P0) — MISE À JOUR v2 : inclure clause audit |
| F22 — Page `/legal/privacy` | 4 | 1.0 | Obligatoire RGPD + conformité Stripe + Coinbase |
| F23 — Page `/legal/mentions-legales` | 3 | 1.0 | Obligatoire LCEN 2004 |
| F24 — Page `/bot` (User-Agent doc cf. @legal INF-9) | 2 | 1.0 | Best practice TOS scraping |

### 1.6 Mesure et dashboards

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F25 — Dashboard interne consolidé (CF Analytics + Coinbase + Stripe en 1 page, events `pack_*` + `audit_*`, retrait events Stripe humain pilier) | 4 | 0.8 | Pilotage KPI + diagnostic Phase 4 |
| F26 — Page `/dashboard?token=JWT` interne sponsor (nb queries 24 h, quota pack restant, wallet balance) | 3 | 1.0 | UX sponsor humain post top-up |

**Total V1** : 29 features (F1, F1b, F1c, F2-F20, F21-F26 + F8b = 29 items). Toutes implémentables sur stack Cloudflare Workers + KV.

---

## 2. Features REPORTÉES V2 (raison explicite obligatoire)

| Feature V2 | Raison report |
|---|---|
| Subscription Pro $29/mois (x402 V2 récurrent SIWx + deferred payment) | [HYPOTHÈSE H7] x402 V2 SDKs stables Q3 2026. V1 mesure signal demande. Si >= 5 agents expriment besoin subscription → V2 priorité haute. |
| Dashboard équipe / multi-utilisateur | (b) Dépendance retour utilisateur V1 — persona CFO/VP Eng V2 candidat (personas.md § 3.2). Si signal demande émerge V1 → V2. |
| Export CSV mensuel agrégé pour CFO | (b) Idem dashboard équipe. |
| Endpoint `/api/model-deprecations` | (a) Bundle élargi cible M+12 (project-context.md). Attendre validation H1 J7. |
| Endpoint `/api/embedding-prices` | (a) Idem — attendre validation H1. |
| MCP server officiel DevRefs | (a) [HYPOTHÈSE H9] appétence non testée — sondage E3 Dev.to comments en V1. Si >= 3 demandes → V2 haute. |
| Multi-facilitator x402 Solana | (a) H7 Coinbase stable 12+ mois — code Worker portable suffit. Si H7 invalidée → V2. |
| Cost Regression Alerts (3e offre sticky multi-provider) | (a) Conditionnée signal demande post-V1 (brand-platform v2 § 7 + creative-brief v2 § 5). |

**Aucune feature reportée pour cause "trop complexe", "trop long", "trop cher"** — mindset IA appliqué.

---

## 3. Critères de succès V1 (recalibrés v2)

### 3.1 KPI North Star primaire

| Échelle | Cible v2 | Mesure | Décision si atteinte |
|---|---|---|---|
| **J7** | >= 1 paiement x402 réel d'un agent IA autonome (test E1 binaire) | Coinbase facilitator dashboard | OUI : continuer roadmap V2. NON : diagnostic SEO/GEO avant pivot. |
| **J30** | >= 50 € revenu net x402 (= ~5 packs $10 ou ~5 audits $9.99) | CF Analytics + Coinbase consolidé (F25) | Confirme adoption initiale. |
| **J90** | >= 200 € revenu net x402 | Idem F25 | Validation mid-term — décision push V2 (subscription, endpoints additionnels) |
| **M+6** | >= 600 € revenu net (KPI North Star) = 66 ventes/mois mix packs + audits | Idem F25 | Validation finale V1 — go V2 ou pivot |

**Décomposition 66 ventes/mois** (cf. `agent-economics.md` § C.2) :
- 33 packs Standard $10 + 33 audits $9.99 = $660/mois ≈ 600 €/mois ✓
- OU 66 packs Standard $10 seuls = $660/mois ✓
- OU 14 packs Pro $50 = $700/mois ✓ (persona Pro plus rare V1)

### 3.2 KPIs leading (input metrics)

| KPI | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|
| Paiements x402 autonomes / 24 h | >= 1 | >= 2 | >= 3 |
| Crawl agent uniques / 24 h (CF Analytics + bot detection) | >= 5 | >= 30 | >= 200 |
| Ratio crawl → paiement | >= 5 % | >= 10 % | >= 15 % |
| Audits vendus / mois | N/A | >= 5 | >= 30 |
| Citations Perplexity / Claude / ChatGPT ("DevRefs") | N/A | >= 1 | >= 10 |
| % payloads avec `dateModified` < 6 h pricing / < 24 h SDK (santé cron) | 100 % | 100 % | 100 % |
| Latence p95 endpoints (3 endpoints) | < 200 ms | < 200 ms | < 200 ms |

### 3.3 KPIs qualitatifs

- >= 1 mention DevRefs sur HN/Reddit/Dev.to/X comme "B2A done right" ou "x402-native API example" à M+3
- Trigger pivot bascule audit-only : si revenu Audit > 70 % à M+3-M+6 → pipeline Offre 2 exclusive (cf. `creative-brief.md` v2 § 5)
- Aucun cease-and-desist reçu de sources scrapées (Anthropic/OpenAI/Google/Mistral) à M+6

---

## 4. Hypothèse business centrale (pari V1 reformulée v2)

> **"Un agent IA achète-t-il en autonomie un Pack pré-payé x402 ($10 Pack Standard) ET un Audit one-shot ($9.99) ?"**

C'est l'agrégat des hypothèses H1 + H2 + H10 (cf. `assumption-map.md` v2). La V1 doit répondre OUI ou NON via le test E1 J7 binaire.

### 4.1 Décision si OUI (>= 1 paiement x402 J7)

- Continuer roadmap V2 : subscription Pro $29/mois (si signal), endpoints additionnels, MCP server.
- Bump ticket si ARPU > 15 $/client → Pack Pro $50 upsell.
- Push agressif GEO + Dev.to scaling.

### 4.2 Décision si NON (0 paiement x402 J7)

- Diagnostic prioritaire : (a) SEO/GEO (agents ne trouvent pas DevRefs → push GEO + IndexNow) ; (b) signal `llms.txt` (revue technique) ; (c) adoption x402 < 2 % en 2026 (cf. agent-economics.md § D.1 R1).
- Si J14 toujours 0 paiement x402 → diagnostic marché : agents pas encore matures x402 → pivot stratégie acquisition (Dev.to tutorials x402, GEO citations).
- Dernier recours : réactiver Stripe humain comme offre principale transitoire (perte différenciation B2A mais revenu).

### 4.3 Décision si AMBIGU (1-4 paiements x402 J7)

- Continuer V1, étendre mesure à J30. Pas de pivot mais pas de scaling agressif.

---

## 5. Dépendances (chemin critique technique v2)

### 5.1 Chemin critique strict (ordre obligatoire)

```
1. Naming validé — DevRefs + devrefs.dev (FAIT)
2. Domaine devrefs.dev acheté + Cloudflare Pages + Workers setup (@infrastructure Phase 2)
3. Cron sources officielles (F6) → KV cache → données disponibles
4. Endpoints F1 + F2 read-only KV (sans auth — test interne)
5. Middleware x402 UNIFIÉ (F8) → applique sur F1 + F2 + F1b (3 endpoints)
   ├── HTTP 402 spec + body augmenté (x402-response-spec.md)
   ├── Coinbase facilitator integration
   ├── Pack pré-payé KV quota lookup (F8b) — signature par pack, pas par call
   └── Watermark HMAC F13
6. Endpoint audit F1b + validation input F1c
7. Stripe top-up wallet sponsor F9 (marginale) + JWT F10 + cookie F11 (optionnels, non-critiques)
8. Rate-limit F14 (wallet + JWT)
9. Landing publique F16 (hero pricing + hero audit) + pages support (F19, F20, F24) + pages légales F21 v2 (clause audit)
10. llms.txt F15 (3 endpoints) + sitemap F17 + OpenAPI F18 (3 endpoints)
11. Dashboard interne F25 (events pack_* + audit_*) + page /dashboard F26
12. IndexNow push F7 (automatique post-cron)
13. QA Phase 3 (32 gates G1-G32 + GP1-GP10 testeur-agent-ia)
14. Publication landing + 2 posts Dev.to + 1 post Reddit
```

**Delta vs v1** : Stripe Payment Link monte après F8 (pas prioritaire), audit endpoint F1b/F1c s'insère entre F8 et F7, middleware x402 unifié pour 3 endpoints (pas 2), pack KV lookup (F8b) dans le même bloc que F8.

### 5.2 Dépendances externes (bloquantes V1)

| Dépendance | Owner | Bloquant V1 ? | Plan B |
|---|---|---|---|
| Coinbase x402 facilitator opérationnel | Coinbase | OUI | Self-host facilitator ou pivot Stripe-only transitoire |
| Cloudflare Workers + Pages free tier | Cloudflare | OUI | Upgrade Workers Paid 5 $/mois |
| Domaine `devrefs.dev` disponible | Cloudflare/Porkbun | OUI | Fallback `devrefs.io` |
| Email `dpo@coinbase.com` répond DPA x402 | Coinbase DPO | NON V1 | Action P0 @legal en parallèle |
| Immatriculation auto-entreprise BNC | Thomas + INPI | OUI avant 1ère tx | Action P0 @legal Phase 5 — délai 7-14 jours |
| Stripe Payment Link disponible | Stripe | NON critique V1 (marginale) | N/A — Stripe reste en option top-up sponsor |

---

## 6. Risques (recalibrés v2)

### Risque 1 — Technique : stabilité Coinbase x402 facilitator

| Champ | Valeur |
|---|---|
| **Probabilité** | Faible (Foundation sept 2025 + ~119M tx Base mars 2026) |
| **Impact** | Critique — sans x402 facilitator, 100 % du revenu cible s'effondre (v2 sans fallback Stripe pilier) |
| **Mitigation** | (a) Code Worker portable Deno/Bun/Node, (b) plan B Solana facilitator V2, (c) Stripe top-up wallet comme signal d'intérêt humain même si x402 down |
| **Trigger révision** | Si Coinbase x402 down > 24 h cumulatif sur 30 jours → V2 multi-facilitator immédiat |

### Risque 2 — Marché : adoption x402 < 2 % en 2026

| Champ | Valeur |
|---|---|
| **Probabilité** | Moyenne — 28 k$/jour mars 2026 x402 réel mais pas signal "DevRefs" spécifique |
| **Impact** | Critique — invalide H1 + H10, pas de revenu x402 |
| **Mitigation** | (a) Test E1 J7 binaire pour pivot rapide, (b) Audit $9.99 ticket élevé = 60 audits/mois suffisent pour 600 €/mois même volume bas, (c) push GEO + Dev.to tutorials x402 pour augmenter découvrabilité, (d) packs $10-$50 réduisent volume d'agents nécessaires |
| **Trigger révision** | 0 paiement x402 J7 + diagnostic SEO/GEO OK → réactiver Stripe humain transitoire |

### Risque 3 — Produit : Audit ROI sur-estimé sur agent déjà optimisé

| Champ | Valeur |
|---|---|
| **Probabilité** | Faible-moyenne — économies 35-55 % basées heuristiques mid-range |
| **Impact** | Modéré — perte crédibilité si savings_pct < 15 % sur 1er audit → garantie CGV activée |
| **Mitigation** | (a) Garantie CGV "savings_pct < 15 % à 30j → remboursement 50 %" (cf. agent-audit-spec.md § D.4), (b) Limiter audit aux agents > 5M tokens/mois (warning dans 402 si monthly_volume_estimate < 5M), (c) score 0-100 transparent avec breakdown par heuristique |
| **Trigger révision** | Si > 20 % des audits déclenchent garantie remboursement → revoir heuristiques + seuil recommandé |

---

## 7. Validation cohérence V1-scope v2

### 7.1 Checklist anti-fausse-promesse

- [x] 3 endpoints documentés dans llms.txt = 3 endpoints implémentés (F1 + F2 + F1b)
- [x] Pricing affiché landing = pricing CGV = pricing agent-economics.md § C.1 (source unique)
- [x] Garantie "savings_pct < 15 % → refund 50 %" dans CGV et dans 402 body (cohérent agent-audit-spec.md)
- [x] Aucune mention Stripe humain comme offre commerciale principale
- [x] Hero landing = hero acté Thomas 2026-05-05 ("Cost intelligence for AI agents — know before you spend, optimize after you ship")
- [x] Zéro fausse promesse : 12 modèles couverts → 12 implémentés, 50 SDKs → 50 implémentés

### 7.2 Checklist Mindset IA

- [x] V1 complète (toutes features valeur persona incluses, dont audit endpoint)
- [x] Aucune feature retirée pour "trop complexe" / "trop long"
- [x] Plan par dépendances, pas timeline en semaines
- [x] Verdicts GO/NO-GO basés valeur persona (test E1 J7 binaire), pas ROI humain

### 7.3 Checklist agents testeurs (Phase 3)

- [x] @testeur-agent-ia : simule agent IA qui fetch llms.txt → 402 → pack x402 → audit x402 → réception report
- [x] @testeur-sponsor-humain : simule dev humain top-up wallet sponsor via Stripe → vérifie que le flux est clair

### 7.4 Checklist conformité v2

- [x] CGV v2 avec clause audit garantie ROI (handoff @legal session 3)
- [x] Zéro-PII confirmé : input audit (config agent, traces) ne contient pas de données personnelles
- [x] Watermark HMAC sur payloads audit inclus

### 7.5 Phase 4 flags (post-launch)

- [x] @sales-enablement Phase 4 : F27 playbook commercial (upsell audit post-pricing call) + F28 ROI calculator agent (calcul break-even pack)
- [x] @growth Phase 4 : F29 data story "Opus 4.7 +35 % tokenizer" + F30 data story "Top 10 SDKs breaking changes"

---

## 8. Synthèse exécutive

| Question | Réponse v2 |
|---|---|
| **Quoi V1 ?** | 29 features (17 épics + 3 audit/pack + 9 support) couvrant 5 opportunités + conformité |
| **Pourquoi cette V1 ?** | Hypothèse fondatrice v2 "agent achète Pack x402 + Audit x402 en autonomie" testée binaire J7 |
| **Pour qui ?** | Persona principal agent IA autonome (payeur unique x402, 80 % copy) + persona secondaire sponsor wallet humain (top-up, 15 %, pas payeur offre commerciale) |
| **Qu'est-ce qui n'est PAS V1 ?** | 8 features V2 explicitement reportées (subscription $29/mois, dashboard team, Cost Regression Alerts, etc.) |
| **Quel est le test ?** | E1 J7 binaire — >= 1 paiement x402 agent IA réel = OUI, 0 = diagnostic, ambigu = J30 |
| **Quels sont les risques ?** | 3 majeurs (Coinbase x402 stabilité, adoption x402 2026, audit ROI sur-estimé) — tous mitigés |

---

## 9. Handoff structuré

**Handoff → @data-analyst (wave 3 v2)**
- Nouvelles features à instrumenter :
  - `audit_request_received` (F1b — payload size, monthly_volume_estimate, framework)
  - `audit_402_served` (avant paiement audit — roi_summary affiché dans 402 body)
  - `audit_paid_x402` (paiement $9.99 ou pack $49 — wallet, format one-shot vs pack)
  - `audit_delivered` (score + savings_pct + nb recommendations)
  - `pack_purchased` (F8b — pack size $5/$10/$50, wallet)
  - `pack_quota_consumed` (F8b — calls restants, endpoint appelé)
  - `pack_expired` (quota épuisé ou TTL expiré)
  - `sponsor_topup_stripe` (Stripe top-up wallet, marginale, pas event principal)
- Events à RETIRER du tracking plan : `stripe_link_clicked_human`, `stripe_payment_success_human`, `jwt_issued_human` (ces events représentaient le Stripe humain pilier v1 — désormais marginaux, conserver uniquement `sponsor_topup_stripe` en remplacement)

**Handoff → @legal (session 3)**
- Clause `/api/agent-audit` à ajouter aux CGV : input config agent non-personnelle, garantie ROI "savings_pct < 15 % à 30j → refund 50 %", irrévocabilité paiement x402 one-shot
- Retirer des CGV/privacy les sections qui positionnent Stripe humain comme offre commerciale principale (conserver uniquement comme "service de top-up wallet sponsor optionnel")
- Vérifier conformité de la garantie refund 50 % vs droit à la rétractation FR

**Handoff → @ux / @design (Phase 1)**
- 3 endpoints au lieu de 2 : parcours agent enrichi avec audit upsell post-pricing call (après 402 pricing, proposer audit si agent a >= 5M tokens/mois estimés)
- Landing v2 : 2 heroes JSON (pricing payload + audit score JSON), pas 1
- Parcours sponsor wallet : top-up Stripe → balance USDC → agent utilise en x402 (pas : Stripe → JWT → accès illimité)

**Handoff → @copywriter (Phase 1)**
- Hero acté : "Cost intelligence for AI agents — know before you spend, optimize after you ship"
- 2 offres à mettre en avant : Pack Standard $10 (Offre 1) + Audit $9.99 (Offre 2) — JAMAIS Stripe humain en hero
- Verbatims V2 persona agent : V2 (frustration multi-sources) + V5 (schema SDK obsolète). V4 (Stripe Link 4,99 €/jour) est ARCHIVÉ v2 — ne plus utiliser
- Prix ronds interdits en charm pricing — $10 et $9.99 sont les prix finaux arrêtés

---
