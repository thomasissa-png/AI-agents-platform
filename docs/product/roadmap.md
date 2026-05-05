<!-- Version: 2026-05-05T09:35 — @product-manager — Phase 0 wave 2 — Roadmap RICE 6 mois DevRefs -->

# Roadmap — DevRefs

## Résumé exécutif

- **Horizon** : 6 mois (M0 → M+6, échelle 1 mois). Plan par dépendances strictes (pas timeline en semaines, cf. CLAUDE.md règle n°5).
- **Méthode** : RICE (Reach × Impact × Confidence / Effort) sur chaque feature. Effort calibré IA (1 = trivial < 1 h, 5 = lourd > 1 jour).
- **17 features V1 retenues** (issues du discovery-map § 3). 7 features V2 reportées explicitement.
- **Chemin critique V1** : middleware x402 → endpoints atomiques → llms.txt → cron sources → landing publique → Stripe Link + JWT → dashboard interne → publication.
- **Phase 4 flags** : @sales-enablement (playbook commercial post-launch + ROI calculator humain) + @growth (data stories earned media).
- **Dépendances aval** : `backlog.md` (user stories pour chaque feature), `v1-scope.md` (scope final).

---

## 1. Légende RICE

| Composante | Échelle |
|---|---|
| **Reach** (R) | 1 = quelques agents, 5 = tous les agents qui crawlent DevRefs |
| **Impact** (I) | 1 = marginal, 5 = critique pour KPI North Star |
| **Confidence** (C) | 0.5 = preuve faible, 0.8 = moyenne, 1.0 = forte |
| **Effort** (E) | 1 = trivial < 1 h IA, 2 = < 4 h, 3 = < 1 jour, 4 = 1-3 jours, 5 = > 3 jours |
| **Score** | (R × I × C) / E. Plus haut = plus prioritaire |

**Note IA-pas-équipe-humaine** : effort en heures-IA, pas jours-homme. La parallélisation est la norme.

---

## 2. Features candidates V1 — scoring RICE

### 2.1 Endpoints API et fraîcheur (chemin critique)

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité (discovery-map) |
|---|---|---|---|---|---|---|---|
| F1 — Endpoint `/api/llm-prices?model=X` (12 modèles : OpenAI/Anthropic/Google/Mistral, cron 6 h, JSON typé) | 5 | 5 | 1.0 | 3 | 8.33 | Drive direct paiements x402 (>= 100/mois cible) | O1 + O2 |
| F2 — Endpoint `/api/sdk-status?pkg=X` (50 SDKs npm, parser CHANGELOG GitHub, cron 24 h) | 4 | 4 | 0.8 | 3 | 4.27 | Diversification revenue + différenciation vs concurrents | O1 + O2 |
| F3 — JSON-LD `Dataset` avec `dateModified` ISO 8601 + `sameAs` source officielle | 5 | 5 | 1.0 | 1 | 25.00 | Différenciateur unique vs concurrents (G1 GEO) | O1 |
| F4 — Header HTTP `Last-Modified` aligné JSON-LD | 4 | 3 | 1.0 | 1 | 12.00 | Standard machine-readable + cache HTTP | O1 |
| F5 — Champ `effective_cost_factor` Opus 4.7 dans payload pricing | 5 | 5 | 1.0 | 1 | 25.00 | Différenciation immédiate vs pricepertoken (cf. project-context.md ligne 196) | O1 |
| F6 — Cron sources officielles (Anthropic/OpenAI/Google/Mistral/DeepSeek pricing pages + npm + GitHub releases) | 5 | 5 | 0.8 | 4 | 5.00 | Garantit fraîcheur signalée | O1 |
| F7 — IndexNow push Bing après chaque update cron | 3 | 3 | 0.8 | 1 | 7.20 | Accélère indexation crawler agent (Bing/Perplexity) | O3 indirect (visibilité agent) |

### 2.2 Paiement et auth (chemin critique)

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité |
|---|---|---|---|---|---|---|---|
| F8 — Middleware x402 (Coinbase facilitator, USDC Base, HTTP 402 spec) | 5 | 5 | 0.8 | 4 | 5.00 | Drive ALL paiements x402 (50 % minimum revenue cible) | O3 |
| F9 — Stripe Payment Link 4,99 €/jour | 5 | 4 | 1.0 | 1 | 20.00 | Drive abonnements humains (cible 4 actifs M+6 = 50 % revenue) | O4 |
| F10 — JWT signé HMAC 24 h, non reconductible | 5 | 4 | 1.0 | 2 | 10.00 | Auth post-Stripe + sécurité | O4 |
| F11 — Cookie `Secure;HttpOnly;SameSite=Strict` JWT (cf. @legal INF-10) | 4 | 3 | 1.0 | 1 | 12.00 | Conformité OWASP/CNIL + UX humain | O4 |
| F12 — Activation Stripe Tax (cf. @legal H4) | 3 | 4 | 1.0 | 1 | 12.00 | Conformité TVA OSS B2C UE + reverse charge B2B | O4 |
| F13 — Watermark HMAC `_signature` sur payloads (anti-redistribution) | 3 | 3 | 0.8 | 2 | 3.60 | Protection IP + traçabilité | O3 |
| F14 — Rate-limit applicatif par wallet (1 000 req/jour) et par JWT (10 000 req/jour) | 4 | 3 | 1.0 | 2 | 6.00 | Anti-fraude + cohérence CGV @legal § 8 | O3 |

### 2.3 Découvrabilité agent + landing humain

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité |
|---|---|---|---|---|---|---|---|
| F15 — `llms.txt` racine référençant endpoints monétisés | 5 | 5 | 0.8 | 1 | 20.00 | Découvrabilité agent #1 — sans cela, pas de crawl agent | O2 + O3 |
| F16 — Landing publique `/llm-prices` (HTML statique < 50 KB, JSON-LD inline, hero démo JSON V1) | 5 | 4 | 1.0 | 3 | 6.67 | Conviction humain superviseur + GEO entité nommée | O4 |
| F17 — Sitemap.xml + robots.txt explicite | 4 | 3 | 1.0 | 1 | 12.00 | Indexation Google/Bing + GEO Perplexity | O4 indirect |
| F18 — OpenAPI 3.1 spec avec extension `x-x402` | 4 | 4 | 0.8 | 2 | 6.40 | Découvrabilité MCP-compatible + doc agent | O2 + O3 |
| F19 — Page `/about/data-sources` (transparence provenance — recommandation @legal § 3.2 EU AI Act) | 3 | 3 | 1.0 | 1 | 9.00 | Verifiable value + conformité aval clients IA | O1 (Verifiable) |
| F20 — Page `/about/data-schema` (schéma payload pour acheteurs) | 3 | 3 | 1.0 | 1 | 9.00 | Doc agent + transparence | O2 |

### 2.4 Pages légales (obligatoires)

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité |
|---|---|---|---|---|---|---|---|
| F21 — Page `/legal/cgv` (intégration draft @legal cgu-draft.md) | 5 | 4 | 1.0 | 1 | 20.00 | Obligatoire avant 1ère transaction (legal-audit P0) | Conformité |
| F22 — Page `/legal/privacy` (intégration draft @legal privacy-policy.md) | 5 | 4 | 1.0 | 1 | 20.00 | Obligatoire RGPD + conformité Stripe + Coinbase | Conformité |
| F23 — Page `/legal/mentions-legales` (mentions LCEN + identification éditeur) | 4 | 3 | 1.0 | 1 | 12.00 | Obligatoire LCEN 2004 | Conformité |
| F24 — Page `/bot` (User-Agent `DevRefs-Bot/1.0` documentation cf. @legal INF-9) | 2 | 2 | 1.0 | 1 | 4.00 | Best practice TOS scraping | Conformité |

### 2.5 Mesure et dashboards

| Feature | R | I | C | E | Score | Lien KPI North Star | Opportunité |
|---|---|---|---|---|---|---|---|
| F25 — Dashboard interne consolidé (CF Analytics + Coinbase + Stripe en 1 page) | 3 | 4 | 0.8 | 3 | 3.20 | Pilotage KPI + diagnostic Phase 4 (project-context.md ligne 169) | O4 (humain) |
| F26 — Page `/dashboard?token=JWT` interne (nb queries 24 h, coût total) | 3 | 3 | 1.0 | 2 | 4.50 | UX humain superviseur post-Stripe | O4 |

### 2.6 Phase 4 (post-launch — flags pour autres agents)

| Feature | R | I | C | E | Score | Owner | Notes |
|---|---|---|---|---|---|---|---|
| F27 — Playbook commercial post-launch (relance prospects ayant cliqué Stripe sans conclure) | 2 | 2 | 0.8 | 2 | 1.60 | @sales-enablement Phase 4 | Flag obligatoire — cf. prompt mission |
| F28 — ROI calculator humain superviseur (calcul break-even x402 → Stripe Link) | 2 | 3 | 0.8 | 2 | 2.40 | @sales-enablement Phase 4 | Flag obligatoire — cf. prompt mission |
| F29 — Data story earned media : "Opus 4.7 +35 % tokenizer" (analysis basée payload `effective_cost_factor`) | 3 | 3 | 0.8 | 2 | 3.60 | @growth Phase 4 | Flag earned media — cf. prompt mission |
| F30 — Data story earned media : "Top 10 SDKs avec breaking changes Q1-Q2 2026" (basée /api/sdk-status) | 3 | 3 | 0.8 | 2 | 3.60 | @growth Phase 4 | Flag earned media — cf. prompt mission |

---

## 3. Features V2 reportées (avec raison explicite)

| Feature V2 | Raison report | Hypothèse à valider en V1 avant V2 |
|---|---|---|
| Stripe abonnement mensuel récurrent | Hypothèse non testée : un humain qui paie 4,99 €/jour journalier acceptera-t-il un mensuel ? Test V1 : ratio renouvellement quotidien Stripe Link | H3 partiel + retour utilisateur V1 nécessaire |
| Dashboard équipe / multi-utilisateur | Hypothèse non testée : DevRefs servira-t-il du B2B scale-up (CFO/VP Eng candidate) ou rester B2A solo ? V1 vise solo (Thomas + 5-15 devs similaires) | Persona V2 candidat (cf. personas.md § 3.2) — attendre signal demande explicite |
| Export CSV mensuel agrégé pour CFO | Idem dashboard équipe — dépend de l'émergence persona CFO V2 | Idem |
| Endpoint additionnel `/api/model-deprecations` | Bundle élargi cible 12 mois (project-context.md ligne 84). Attendre validation H1 J7 + ajustement priorité V2 selon volume ventes V1 | E1 J7 binaire + ajustement V2 selon Phase 4 plan d'action |
| Endpoint additionnel `/api/embedding-prices` | Idem `/api/model-deprecations` | Idem |
| MCP server officiel DevRefs (tool `get_llm_pricing`) | Hypothèse appétence non testée — sondage E3 Dev.to comments en V1 | E3 (cf. discovery-map § 4) |
| Multi-facilitator x402 Solana (anti-vendor lock-in renforcé) | H7 (Coinbase stable 12+ mois) — pas critique V1, mitigation via code Worker portable suffit | Veille H7 |

---

## 4. Plan par dépendances (chemin critique)

### 4.1 Bloc 0 — Fondations stratégiques (Phase 0 wave 1-2 — DÉJÀ FAIT/EN COURS)

```
@creative-strategy (brand-platform, personas, competitive-benchmark, creative-brief)  [DONE]
@legal (legal-audit, rgpd-checklist, cgu-draft, privacy-policy)                       [DONE]
@product-manager (discovery-map, assumption-map, product-vision, roadmap, backlog,    [EN COURS]
                  v1-scope)
```

### 4.2 Bloc 1 — Pré-build (Phase 0 wave 3-4)

Prérequis avant ouverture du chantier @fullstack :

```
@data-analyst (kpi-framework + tracking-plan + dashboard specs)
@ux (parcours agent + parcours humain + 5 états UI)
@design (design tokens minimaliste agent-first + iconographie)
@copywriter (hero + FAQ + body + OpenAPI descriptions + llms.txt content)
@seo + @geo (entités nommées + claims vérifiables + JSON-LD spec)
@ia (MCP server specs + llms.txt structure + OpenAPI 3.1 avec x-x402)
```

Tous parallélisables (aucune dépendance entre eux après strategic foundation).

### 4.3 Bloc 2 — V1 build (Phase 1 — @fullstack pipeline serré)

Ordre de dépendance technique :

```
1. Cloudflare Workers + KV setup + domaine devrefs.dev acheté
2. Cron sources officielles (F6) → KV cache pricing + SDK
   ├── Anthropic/OpenAI/Google/Mistral/DeepSeek pricing scrape
   ├── npm registry + GitHub releases scrape (50 SDKs)
   └── Parser robuste (JSON-LD `Dataset` génération + `dateModified` + `sameAs` + `effective_cost_factor`)
3. Endpoint `/api/llm-prices?model=X` (F1) — read-only KV
4. Endpoint `/api/sdk-status?pkg=X` (F2) — read-only KV
5. Middleware x402 (F8) — applique sur F1 + F2
   ├── HTTP 402 spec (header structuré + body JSON x402)
   ├── Coinbase facilitator integration (USDC Base settle)
   └── Watermark HMAC `_signature` (F13)
6. Stripe Payment Link (F9) + activation Stripe Tax (F12)
7. JWT HMAC 24 h (F10) + cookie Secure;HttpOnly;SameSite=Strict (F11)
8. Rate-limit applicatif par wallet/JWT (F14)
9. Landing publique `/llm-prices` (F16) — HTML statique < 50 KB
   ├── Hero démo JSON (V1 anonymisé)
   ├── FAQ 12 questions
   ├── CTAs en bas (curl + Stripe Link)
   └── JSON-LD inline `Dataset` + `WebAPI`
10. Pages support : /about/data-sources (F19), /about/data-schema (F20), /bot (F24)
11. Pages légales : /legal/cgv (F21), /legal/privacy (F22), /legal/mentions-legales (F23)
12. llms.txt (F15) + sitemap.xml + robots.txt (F17) + OpenAPI 3.1 /openapi.json (F18)
13. Page /dashboard?token=JWT (F26)
14. Dashboard interne consolidé (F25) — accessible Thomas only
15. IndexNow push Bing (F7) — automatique post-cron
```

**Chemin critique strict** : F8 (middleware x402) doit exister avant que F1 puisse être commercialisé. F9 + F10 + F11 doivent exister avant que la landing F16 puisse pointer vers Stripe.

### 4.4 Bloc 3 — Acquisition + QA (Phase 2 + Phase 3)

```
@growth + @seo (parallèle)
├── 2 posts Dev.to via API REST
├── 1 post Reddit r/ClaudeAI ou r/LocalLLaMA
├── 1 thread X/Twitter technique
└── IndexNow push Bing automatisé (déjà F7)

@agent-factory (préalable Phase 3)
├── @testeur-agent-ia (specs cf. brand-platform.md § 8)
└── @testeur-developpeur-superviseur (specs cf. brand-platform.md § 8)

@qa + @reviewer (Phase 3)
├── Test live 3 agents (Claude Code MCP, Cursor agent, AgentKit)
├── Gates 32/32 G1-G32 PASS
├── Gates GP1-GP10 (testeur-agent-ia)
├── Gates GC1-GC10 (testeur-developpeur-superviseur)
└── Convergence protocol si score < 9/10
```

### 4.5 Bloc 4 — Mesure + scaling (Phase 4 — 5 jours puis continu)

```
J1-J7 : mesure E1 (test binaire H1)
├── J7 plan d'action selon résultats (cf. project-context.md Phase 4)
├── Si < 5 ventes : diagnostic SEO/GEO
├── Si 5-15 : test E4 bump 0,49 € → 0,99 €
└── Si > 15 : push agressif SDK Status + élargir 100 SDKs

@sales-enablement (Phase 4)
├── F27 — Playbook commercial post-launch
└── F28 — ROI calculator humain superviseur

@growth (Phase 4)
├── F29 — Data story "Opus 4.7 +35 % tokenizer"
└── F30 — Data story "Top 10 SDKs breaking changes Q1-Q2 2026"

@data-analyst (continu)
├── Mesure KPI North Star mensuel
├── Diagnostic input metrics
└── Rapport M+1, M+3, M+6
```

### 4.6 Bloc 5 — Conformité (Phase 5)

```
@legal (Phase 5)
├── Déclaration BNC crypto auto-entrepreneur (P0 cf. legal-audit)
├── Email dpo@coinbase.com (P0 H1 cf. legal-audit)
├── Validation expert-comptable traitement BNC stablecoin (P0 H2)
└── Vérification trimestrielle Stripe Tax + déclarations TVA si seuil approché
```

---

## 5. Synthèse RICE — Top 10 prioritaires V1

| Rang | Feature | Score RICE |
|---|---|---|
| 1 | F3 — JSON-LD `Dataset` avec `dateModified` | 25.00 |
| 2 | F5 — `effective_cost_factor` Opus 4.7 | 25.00 |
| 3 | F9 — Stripe Payment Link 4,99 €/jour | 20.00 |
| 4 | F15 — llms.txt | 20.00 |
| 5 | F21 — Page CGV | 20.00 |
| 6 | F22 — Page Privacy | 20.00 |
| 7 | F4 — Header `Last-Modified` | 12.00 |
| 8 | F11 — Cookie Secure JWT | 12.00 |
| 9 | F12 — Stripe Tax | 12.00 |
| 10 | F17 — Sitemap.xml + robots.txt | 12.00 |
| 10 | F23 — Mentions légales | 12.00 |

Note : F1 (endpoint LLM prices) est score 8.33 mais c'est le **chemin critique** — sans lui, aucun autre score ne s'active. La priorisation RICE pure ne reflète pas les dépendances. Le plan par dépendances § 4.3 est la source de vérité d'exécution.

---

## 6. Mapping features ↔ opportunités (validation discovery-map)

| Opportunité | Features V1 retenues |
|---|---|
| O1 — Fraîcheur structurée | F3, F4, F5, F6, F19 |
| O2 — Coût parsing HTML | F1, F2, F15, F18, F20 |
| O3 — Paiement IA-to-IA | F8, F13, F14 + indirect F7, F15 |
| O4 — Bascule humain | F9, F10, F11, F12, F16, F25, F26 |
| Conformité | F21, F22, F23, F24 |

100 % des features V1 sont mappées sur une opportunité ou conformité — aucune feature orpheline. Conforme exigence prompt mission.

---

## 7. Checkpoints et validations

| Checkpoint | Critère go/no-go | Owner |
|---|---|---|
| Fin Phase 0 wave 1 | Brand platform + legal-audit livrés et validés | @orchestrator |
| Fin Phase 0 wave 2 | discovery-map + assumption-map + product-vision + roadmap + backlog + v1-scope livrés (PASS gates BLOQUANT) | @orchestrator |
| Fin Phase 1 build | Tous F1-F26 implémentés. Test e2e curl sur 12 modèles + 50 SDKs réussi. | @fullstack + @qa |
| Fin Phase 3 QA | 32 gates G1-G32 PASS + GP1-GP10 + GC1-GC10. Score >= 9/10. | @reviewer |
| Fin Phase 4 J7 | Test E1 binaire — décision pivot/continuer | @data-analyst + @moi |
| Fin Phase 4 M+1 | KPI tracking : revenu net mensuel mesuré, plan ajustement | @data-analyst + @moi |
| Fin Phase 4 M+6 | KPI North Star atteint (>= 600 €/mois) ou plan révisé | @moi |

---

## Handoff → @product-manager (étape suivante : backlog.md puis v1-scope.md)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/product/roadmap.md`
- **Décisions prises** : 17 features V1 retenues + 7 V2 reportées + 4 features Phase 4 (sales-enablement + growth) + chemin critique documenté.
- **Points d'attention** :
  - Plan par dépendances strictes, pas timeline en semaines/jours (CLAUDE.md règle n°5).
  - F8 middleware x402 = chemin critique. Sans lui, aucune monétisation possible.
  - Gates Phase 3 G1-G32 + GP1-GP10 + GC1-GC10 non-négociables (founder 9/10 minimum).
  - Phase 4 flags @sales-enablement (F27 + F28) et @growth (F29 + F30) explicitement intégrés à la roadmap.
- **Aucune action Replit requise**.
