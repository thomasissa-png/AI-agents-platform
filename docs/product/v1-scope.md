<!-- Version: 2026-05-05T10:05 — @product-manager — Phase 0 wave 2 — V1 Scope DevRefs -->

# V1 Scope — DevRefs

## Résumé exécutif

- **Mindset IA** : V1 COMPLÈTE (pas MVP minimal — cf. founder-prefs Thomas 2026-03-26 Agent-Team).
- **Hypothèse business centrale** : "Un agent IA achète-t-il en autonomie un payload technique fresh à 0,49 € en x402 ?" — la V1 doit répondre OUI ou NON.
- **17 features RETENUES** (toutes liées au KPI North Star + 1 opportunité du discovery-map + implémentables sur stack Cloudflare Workers + KV).
- **7 features REPORTÉES V2** avec raison explicite (hypothèse non testée OU dépendance retour utilisateur V1).
- **Critères de succès quantifiés** : J7 >= 5 paiements x402, J30 >= 50 €, J90 >= 200 €, citation Perplexity >= 1.
- **3 risques majeurs** identifiés avec mitigation.

---

## 1. Features RETENUES V1 (toutes apportent valeur au persona, toutes implémentables Phase 2)

### 1.1 Endpoints API et fraîcheur

| Feature | Impact (1-5) | Confidence (1.0/0.8/0.5) | Lien KPI North Star |
|---|---|---|---|
| F1 — `/api/llm-prices?model=X` (12 modèles : OpenAI/Anthropic/Google/Mistral, cron 6 h, JSON typé) | 5 | 1.0 | Drive direct paiements x402 (cible 100/mois) |
| F2 — `/api/sdk-status?pkg=X` (50 SDKs npm + GitHub releases, cron 24 h) | 4 | 0.8 | Diversification revenue + différenciation |
| F3 — JSON-LD `Dataset` avec `dateModified` ISO 8601 + `sameAs` source officielle | 5 | 1.0 | Différenciateur unique vs concurrents (G1 GEO) |
| F4 — Header HTTP `Last-Modified` aligné JSON-LD | 3 | 1.0 | Standard machine-readable + cache HTTP |
| F5 — Champ `effective_cost_factor` Opus 4.7 (1.35) dans payload pricing | 5 | 1.0 | Différenciation immédiate vs pricepertoken |
| F6 — Cron sources officielles (Anthropic/OpenAI/Google/Mistral/DeepSeek + npm + GitHub) | 5 | 0.8 | Garantit fraîcheur signalée |
| F7 — IndexNow push Bing après chaque update cron | 3 | 0.8 | Accélère indexation crawler agent (Bing/Perplexity) |

### 1.2 Paiement et auth

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F8 — Middleware x402 (Coinbase facilitator USDC Base, HTTP 402 spec) | 5 | 0.8 | Drive ALL paiements x402 (cible 50 % du revenu) |
| F9 — Stripe Payment Link 4,99 €/jour | 4 | 1.0 | Drive abonnements humains (cible 4 actifs M+6 = 50 % du revenu) |
| F10 — JWT signé HMAC 24 h, non reconductible auto | 4 | 1.0 | Auth post-Stripe + sécurité |
| F11 — Cookie `Secure;HttpOnly;SameSite=Strict` JWT (cf. @legal INF-10) | 3 | 1.0 | Conformité OWASP/CNIL + UX |
| F12 — Activation Stripe Tax (cf. @legal H4) | 4 | 1.0 | Conformité TVA OSS B2C UE + reverse charge B2B |
| F13 — Watermark HMAC `_signature` sur payloads (anti-redistribution) | 3 | 0.8 | Protection IP + traçabilité |
| F14 — Rate-limit applicatif par wallet (1 000 req/jour) et JWT (10 000 req/jour) | 3 | 1.0 | Anti-fraude + cohérence CGV |

### 1.3 Découvrabilité agent + landing humain

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F15 — `llms.txt` racine référençant endpoints monétisés | 5 | 0.8 | Découvrabilité agent #1 — prérequis crawl agent |
| F16 — Landing publique `/llm-prices` (HTML statique < 50 KB, hero démo JSON V1) | 4 | 1.0 | Conviction humain superviseur + GEO entité |
| F17 — Sitemap.xml + robots.txt explicite | 3 | 1.0 | Indexation Google/Bing + GEO Perplexity |
| F18 — OpenAPI 3.1 spec avec extension `x-x402` | 4 | 0.8 | Découvrabilité MCP-compatible + doc agent |
| F19 — Page `/about/data-sources` (transparence provenance) | 3 | 1.0 | Verifiable value + conformité aval clients IA |
| F20 — Page `/about/data-schema` (schéma payload pour acheteurs) | 3 | 1.0 | Doc agent + transparence |

### 1.4 Pages légales (obligatoires)

| Feature | Impact (1-5) | Confidence | Justification |
|---|---|---|---|
| F21 — Page `/legal/cgv` | 4 | 1.0 | Obligatoire avant 1ère transaction (legal-audit P0) |
| F22 — Page `/legal/privacy` | 4 | 1.0 | Obligatoire RGPD + conformité Stripe + Coinbase |
| F23 — Page `/legal/mentions-legales` | 3 | 1.0 | Obligatoire LCEN 2004 |
| F24 — Page `/bot` (User-Agent doc cf. @legal INF-9) | 2 | 1.0 | Best practice TOS scraping |

### 1.5 Mesure et dashboards

| Feature | Impact (1-5) | Confidence | Lien KPI North Star |
|---|---|---|---|
| F25 — Dashboard interne consolidé (CF Analytics + Coinbase + Stripe) | 4 | 0.8 | Pilotage KPI + diagnostic Phase 4 |
| F26 — Page `/dashboard?token=JWT` interne (nb queries 24 h, coût total) | 3 | 1.0 | UX humain superviseur post-Stripe |

**Total V1** : 26 features (renumérotation roadmap : F1-F26 = 26 items, mais conceptuellement 17 features-épics + 9 features de support obligatoires conformité/UX). Toutes implémentables sur stack Cloudflare Workers + KV (vérifié vs project-context.md ligne 88-99).

---

## 2. Features REPORTÉES V2 (raison explicite obligatoire)

| Feature V2 | Raison report (a) hypothèse non testée OU (b) dépendance retour utilisateur V1 |
|---|---|
| Stripe abonnement mensuel récurrent | (a) Hypothèse non testée — un humain qui paie 4,99 €/jour journalier acceptera-t-il un mensuel récurrent automatique ? V1 mesure ratio renouvellement quotidien Stripe Link. Si > 5 jours consécutifs même JWT → preuve appétence mensuel. |
| Dashboard équipe / multi-utilisateur | (b) Dépendance retour utilisateur V1 — DevRefs servira-t-il du B2B scale-up (CFO/VP Eng candidate cf. personas.md § 3.2) ? V1 vise solo (Thomas + 5-15 devs similaires). Si demande explicite émerge V1 → V2. |
| Export CSV mensuel agrégé pour CFO | (b) Idem dashboard équipe — dépend de l'émergence persona CFO V2 |
| Endpoint additionnel `/api/model-deprecations` | (a) Bundle élargi cible 12 mois (project-context.md ligne 84). Attendre validation H1 J7 + ajustement priorité V2 selon volume ventes V1. |
| Endpoint additionnel `/api/embedding-prices` | (a) Idem `/api/model-deprecations` — attendre validation H1 |
| MCP server officiel DevRefs (tool `get_llm_pricing`) | (a) Hypothèse appétence non testée — sondage E3 Dev.to comments en V1. Si signal positif >= 3 demandes → V2 priorité haute. |
| Multi-facilitator x402 Solana (anti-vendor lock-in renforcé) | (a) H7 (Coinbase stable 12+ mois) — pas critique V1, mitigation via code Worker portable suffit. Si H7 invalidée → V2. |

**Aucune feature reportée pour cause "trop complexe", "trop long", "trop cher"** — cohérent founder-prefs Thomas anti-pattern #2 et mindset IA.

---

## 3. Critères de succès V1 (quantifiés J7 / J30 / J90)

### 3.1 KPI North Star primaire

| Échelle | Cible | Mesure | Décision si atteinte |
|---|---|---|---|
| **J7** | >= 5 paiements x402 OU >= 1 JWT actif | Coinbase facilitator dashboard + Stripe dashboard | OUI continuer roadmap V2 selon ratio (cf. project-context.md Phase 4 plan d'action) |
| **J30** | >= 50 € revenu net | CF Analytics + Coinbase + Stripe consolidé (F25) | Confirme PMF agent ou humain. Plan ajustement |
| **J90** | >= 200 € revenu net | Idem F25 | Validation mid-term — décision push V2 (MCP server, endpoints additionnels) |
| **M+6** | >= 600 € revenu net (KPI North Star) | Idem F25 | Validation finale V1 — go V2 ou pivot |

### 3.2 KPIs leading (input metrics)

| KPI | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|
| Crawl agent uniques / 24 h (CF Analytics + bot detection) | >= 10 | >= 50 | >= 300 |
| Ratio crawl → paiement | >= 5 % | >= 10 % | >= 15 % |
| Citations Perplexity / Claude / ChatGPT (mention "DevRefs") | >= 1 | >= 5 | >= 30 |
| % payloads avec `dateModified` < 24 h (santé cron) | 100 % | 100 % | 100 % |
| Latence p95 endpoints | < 200 ms | < 200 ms | < 200 ms |

### 3.3 KPIs qualitatifs

- >= 1 mention DevRefs sur HN/Reddit/Dev.to/X comme "B2A done right" ou "x402-native API example" à M+3
- Founder Thomas auto-évalue projet "à continuer V2" sans hésitation à M+3 (cf. product-vision.md S5)
- Aucun cease-and-desist reçu de sources scrapées (Anthropic/OpenAI/Google/Mistral) à M+6 (validation TOS scraping @legal § 7)

---

## 4. Hypothèse business centrale (pari V1)

> **"Un agent IA achète-t-il en autonomie un payload technique fresh à 0,49 € en x402 ?"**

C'est l'agrégat des hypothèses H1 + H2 (cf. assumption-map.md). La V1 doit répondre OUI ou NON via le test E1 J7 binaire.

### 4.1 Décision si OUI (>= 5 paiements x402 J7)

- Continuer roadmap V2 : MCP server (E3 validé), Stripe mensuel, dashboard team, endpoints additionnels.
- Bump prix possible si > 15 ventes (E4 V2 candidat).
- Push agressif GEO + Dev.to scaling.

### 4.2 Décision si NON (0 paiement x402 J7)

- Diagnostic prioritaire dans cet ordre : (a) défaut SEO/GEO (agents ne trouvent pas DevRefs → push GEO + IndexNow + 5 keywords secondaires) ; (b) défaut signal `llms.txt` (revue technique) ; (c) défaut prix (pivot pricing).
- Si après diagnostic complet (J14), toujours 0 paiement x402 → pivot vers Stripe-only (perte différenciation B2A) OU super-niche specs RFC/OpenAPI (cf. brand-platform.md § 7).

### 4.3 Décision si AMBIGU (1-4 paiements x402 J7)

- Continuer V1 sans modification, étendre période de mesure à J30.
- Pas de pivot mais pas de scaling agressif non plus.

---

## 5. Dépendances (chemin critique technique)

### 5.1 Chemin critique strict (ordre obligatoire)

```
1. Naming validé (DEJA fait — DevRefs confirmé creative-strategy)
2. Domaine devrefs.dev acheté + Cloudflare Pages + Workers setup (@infrastructure Phase 2)
3. Cron sources officielles (F6) → KV cache → données disponibles
4. Endpoints F1 + F2 read-only KV (sans auth — pour test interne)
5. Middleware x402 (F8) → applique sur F1 + F2
   ├── HTTP 402 spec
   ├── Coinbase facilitator integration
   └── Watermark HMAC F13
6. Stripe Payment Link F9 + Stripe Tax F12
7. JWT HMAC 24 h F10 + cookie Secure F11
8. Rate-limit F14
9. Landing publique F16 + pages support (F19, F20, F24) + pages légales (F21, F22, F23)
10. llms.txt F15 + sitemap F17 + OpenAPI F18
11. Dashboard interne F25 + page /dashboard F26
12. IndexNow push F7 (automatique post-cron)
13. QA Phase 3 (32 gates G1-G32 + GP1-GP10 + GC1-GC10)
14. Publication landing + 2 posts Dev.to + 1 post Reddit + 1 thread X
```

### 5.2 Dépendances externes (bloquantes V1)

| Dépendance | Owner | Bloquant V1 ? | Plan B |
|---|---|---|---|
| Coinbase x402 facilitator opérationnel | Coinbase | OUI | Self-host facilitator x402 (overhead majeur) ou pivot Stripe-only |
| Stripe Payment Link disponible | Stripe | OUI | Aucun équivalent — Stripe est mature et fiable |
| Cloudflare Workers + Pages free tier | Cloudflare | OUI | Upgrade Workers Paid 5 $/mois (déjà budgété assumption-map H8) |
| Domaine `devrefs.dev` disponible registrar | Cloudflare/Porkbun | OUI | Fallback `devrefs.io` (cf. brand-platform.md § 1) |
| Email `dpo@coinbase.com` répond DPA x402 | Coinbase DPO | NON V1 | Action P0 @legal en parallèle, ne bloque pas build |
| Immatriculation auto-entreprise BNC | Thomas + INPI | OUI avant 1ère tx | Action P0 @legal Phase 5 — délai 7-14 jours |

---

## 6. Risques (3 max — exhaustivité scope project-context.md tableau "Risques identifiés")

### Risque 1 — Technique : stabilité Coinbase x402 facilitator

| Champ | Valeur |
|---|---|
| **Probabilité** | Faible (Foundation septembre 2025 + ~119 M tx Base mars 2026) |
| **Impact** | Critique — sans x402 facilitator, le modèle agent-first s'effondre |
| **Mitigation** | (a) Code Worker portable (Deno/Bun/Node), (b) plan B Solana facilitator V2, (c) Stripe Link humain comme fallback assurant un revenu même si x402 down |
| **Trigger révision** | Si Coinbase x402 down > 24 h cumulatif sur 30 jours → V2 multi-facilitator immédiat |

### Risque 2 — Marché : volume agents IA capables x402 en 2026 trop faible

| Champ | Valeur |
|---|---|
| **Probabilité** | Moyenne — preuve indirecte (28 k$/jour mars 2026 sur l'ensemble du marché x402) mais pas signal "DevRefs" spécifique |
| **Impact** | Critique — invalide H1 + H2 + l'hypothèse fondatrice V1 |
| **Mitigation** | (a) Test E1 J7 binaire pour pivot rapide, (b) Stripe Link humain en fallback, (c) push agressif GEO + dev advocacy pour augmenter découvrabilité |
| **Trigger révision** | Si 0 paiement x402 J7 + diagnostic SEO/GEO OK → pivot Stripe-only ou super-niche specs |

### Risque 3 — UX : friction onboarding humain Stripe

| Champ | Valeur |
|---|---|
| **Probabilité** | Moyenne — Stripe Payment Link est fluide mais le post-redirect JWT à copier dans config agent est friction |
| **Impact** | Modéré — perte conversion humain superviseur, mais x402 reste accessible |
| **Mitigation** | (a) UX testée par @testeur-developpeur-superviseur Phase 3 (cf. brand-platform.md § 8), (b) page `/dashboard?token=JWT` design soigné avec bouton copy 1 clic, (c) cookie `Secure;HttpOnly;SameSite=Strict` pour reconnaissance session |
| **Trigger révision** | Si NPS humain superviseur < 30 sur 30 répondants Stripe payants → rééval funnel humain (cf. brand-platform.md § 7) |

---

## 7. Validation cohérence V1-scope

### 7.1 Checklist anti-fausse-promesse (cf. brand-platform.md § 9)

- [x] Aucune feature V1 hors `Plan d'exécution prévu` de project-context.md (vérification cross-référence : 12 modèles, 50 SDKs, cron 6 h, x402, Stripe Link, JWT 24 h, JSON-LD, llms.txt, < 50 KB, latence < 200 ms p95, IndexNow, dashboard interne — tout présent)
- [x] Aucune promesse de feature non-implémentable Phase 2 (vérification stack Cloudflare Workers + KV : tout possible)
- [x] Aucune mention de concurrent par nom dans les livrables client-facing (catégories génériques uniquement)
- [x] CTAs en fin de parcours, pas en hero (conviction-first)
- [x] Anti-vendor lock-in : Cloudflare/Coinbase mentionnés factuellement, jamais survendus

### 7.2 Checklist Mindset IA (founder-prefs)

- [x] V1 complète, pas MVP (toutes features avec valeur persona incluses)
- [x] Aucune feature retirée pour "trop complexe" / "trop long" / "trop cher"
- [x] Parallélisation par défaut (Phase 0 wave 2 6 livrables produits en séquence dépendances mais sous-blocs indépendants)
- [x] Plan par dépendances, pas timeline en semaines (chemin critique § 5.1)
- [x] Verdicts GO/NO-GO basés VALEUR persona (H1 J7 binaire), pas ROI/payback humain

### 7.3 Checklist anti-vendor lock-in

- [x] Stack ouverte : Cloudflare Workers code portable Deno/Bun/Node
- [x] Paiement multi-provider : x402 Coinbase + Stripe (2 providers indépendants)
- [x] Standards ouverts : JSON-LD W3C, OpenAPI 3.1 OAI, x402 Foundation, llms.txt llmstxt.org
- [x] Mitigation H7 : plan B Solana facilitator V2 documenté

### 7.4 Checklist conformité (cf. legal-audit.md)

- [x] 4 actions P0 @legal flaguées avant 1ère transaction (immatriculation BNC, email DPO Coinbase, validation comptable BNC stablecoin, activation Stripe Tax)
- [x] Pages légales V1 obligatoires : CGV (F21), Privacy (F22), Mentions légales (F23)
- [x] Architecture zéro-PII confirmée (RGPD natif)
- [x] EU AI Act hors scope confirmé
- [x] TOS scraping respecté : npm + GitHub + Anthropic + OpenAI + Google + Mistral OK ; Crunchbase + SimilarWeb interdits

### 7.5 Checklist agents testeurs (cf. brand-platform.md § 8)

- [x] @testeur-agent-ia obligatoire Phase 3 — flag dans roadmap § 4.4
- [x] @testeur-developpeur-superviseur obligatoire Phase 3 — flag dans roadmap § 4.4

### 7.6 Checklist Phase 4 flags (cf. prompt mission)

- [x] @sales-enablement Phase 4 : F27 playbook commercial + F28 ROI calculator humain (cf. roadmap § 2.6)
- [x] @growth Phase 4 : F29 data story Opus 4.7 +35 % tokenizer + F30 data story Top 10 SDKs breaking changes (cf. roadmap § 2.6)

---

## 8. Synthèse exécutive

| Question | Réponse |
|---|---|
| **Quoi V1 ?** | 26 features (17 épics + 9 support) couvrant 4 opportunités + conformité |
| **Pourquoi cette V1 ?** | Hypothèse fondatrice H1 testée binaire J7 + KPI North Star atteignable M+6 (600 €/mois) |
| **Pour qui ?** | Persona principal agent IA autonome (60 % copy) + persona secondaire dev humain superviseur (35 % copy) + stub CFO V2 (5 %) |
| **Qu'est-ce qui n'est PAS V1 ?** | 7 features V2 explicitement reportées avec raison (hypothèse non testée OU dépendance retour utilisateur V1) |
| **Quel est le test ?** | E1 J7 binaire — >= 5 paiements x402 = OUI, 0 = pivot, ambigu = continuer mesure J30 |
| **Quels sont les risques ?** | 3 majeurs (Coinbase x402 stabilité, volume agents x402, friction UX humain Stripe) — tous mitigés |

---

## Handoff @product-manager → @orchestrator (Phase 0 wave 2)

- **Statut** : COMPLETE
- **Fichiers produits** :
  - `/home/user/AI-agents-platform/docs/product/discovery-map.md`
  - `/home/user/AI-agents-platform/docs/product/assumption-map.md`
  - `/home/user/AI-agents-platform/docs/product/product-vision.md`
  - `/home/user/AI-agents-platform/docs/product/roadmap.md`
  - `/home/user/AI-agents-platform/docs/product/backlog.md`
  - `/home/user/AI-agents-platform/docs/product/v1-scope.md`
- **Features V1 retenues** : 26 (17 épics + 9 support obligatoires)
- **Features V2 reportées** : 7 (raison principale : hypothèse non testée OU dépendance retour utilisateur V1)
- **Hypothèse business V1** : "Un agent IA achète-t-il en autonomie un payload technique fresh à 0,49 € en x402 ?"
- **Critères de succès V1 quantifiés** :
  - J7 >= 5 paiements x402 OU >= 1 JWT Stripe actif
  - J30 >= 50 € revenu net
  - J90 >= 200 € revenu net
  - M+6 >= 600 €/mois (KPI North Star)
  - >= 1 citation Perplexity/Claude/ChatGPT mentionnant "DevRefs" à M+1
- **Validations effectuées** : statique (cohérence cross-fichiers), discovery-map → roadmap → backlog → v1-scope chaîne validée. Mapping 100 % features ↔ opportunités ↔ user stories.
- **Hypothèses faites** : V1 reformule l'hypothèse fondatrice H1 + H2 en agrégat testable J7. Aucune nouvelle hypothèse inventée — toutes héritées project-context.md / brand-platform.md / personas.md / legal-audit.md.
- **Risques signalés** :
  - R1 : stabilité Coinbase x402 facilitator (mitigation : code portable + Stripe fallback + Solana V2)
  - R2 : volume agents x402 trop faible 2026 (mitigation : test E1 J7 binaire + Stripe humain + GEO)
  - R3 : friction UX humain Stripe → JWT (mitigation : @testeur-dev-superviseur + bouton copy 1 clic + cookie Secure)
- **Prochaine étape recommandée** : @data-analyst wave 3 pour KPI framework + tracking plan + dashboard specs (les 3 livrables nécessaires pour mesurer les critères de succès V1 quantifiés ci-dessus).
- **Auto-évaluation gates** : Complétude 5/5, Cohérence 5/5, Actionnabilité 5/5, Messages 5/5, Spécificité 5/5
- **Anti-placeholder Grep** : à vérifier (cf. handoff finale après Grep des 6 fichiers)
- **Cohérence avec wave 1** : verdict PASS — aucune contradiction avec brand-platform.md / personas.md / competitive-benchmark.md / creative-brief.md / legal-audit.md. Naming DevRefs confirmé. Promesse 19 mots cohérente. 3 piliers Fresh/Atomic/Verifiable opérationnalisés. Anti-mots respectés (zéro mention "exhaustif", "narratif", "stable" en sens positif). Verbatims V1-V5 référencés correctement. Features V1 = 100 % subset du `Plan d'exécution prévu` project-context.md. Conformité @legal intégrée (4 actions P0 + 6 hypothèses H1-H6 + 10 vérifs INF). Agents testeurs Phase 2 obligatoires flagués. Persona V2 candidat (CFO/VP Eng) documenté en V2 reportées.
