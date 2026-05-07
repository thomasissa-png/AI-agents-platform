# Archive project-context — DevRefs

Sections archivées de `project-context.md` lors de l'audit TTL Session 7 (2026-05-07).
Conservé pour audit historique. Non lu par les agents (cf. CLAUDE.md commandement 8).

---

## Section A — Plan d'exécution prévu (V1, version brief consensus initial)

> Plan extrait du brief consensus 88 % (Round 1 @elon × @growth × @ia + Round 2 @reviewer). À ré-arbitrer par @orchestrator après remplissage des `[BLOCK_IA]` par @ia.

- **Phase 0a — Cadrage IA-first (préalable)** : @ia remplit les 3 blocs `[BLOCK_IA]` ci-dessus + audit du positionnement vs ce qui convainc réellement un agent IA en 2026.
- **Phase 0 — Fondations (~4 h)** : @creative-strategy (naming définitif + brand platform compact) + @copywriter (copy landing publique) + @design (design tokens minimaliste) en parallèle.
- **Phase 1 — V1 complète (~8 h)** : @fullstack en pipeline serré.
  - Cloudflare Worker `/api/llm-prices` (scrape officiel 12 modèles + KV cache + cron 6 h)
  - Cloudflare Worker `/api/sdk-status` (npm + GitHub releases + parser CHANGELOG sur 50 SDKs)
  - Middleware x402 sur les 2 endpoints (Coinbase facilitator)
  - Stripe Payment Link 4,99 €/jour + JWT validation
  - Page HTML statique `/llm-prices` avec JSON-LD `Dataset` + `dateModified` + llms.txt + sitemap.xml + robots.txt explicite
- **Phase 2 — Acquisition 24 h (~3 h)** : @growth + @seo en parallèle.
  - IndexNow push Bing après chaque mise à jour
  - 2 posts Dev.to via API REST avec mention URL endpoints
  - 1 post Reddit r/ClaudeAI ou r/LocalLLaMA
  - Validation : `curl perplexity.ai/search?q=llm+pricing+2026` après 24 h
- **Phase 3 — QA + Reviewer (~2 h)** : @qa + @reviewer.
  - Test live avec 3 agents réels : Claude Code (MCP server x402), Cursor agent, AgentKit
  - Verdict gates : 32/32 G1-G32 PASS + GP1-GP10 (testeur-persona-agent) + GC1-GC10 (testeur-client-du-persona)
  - Walkthrough post-code reviewer obligatoire
  - Convergence protocol si score < 9/10
- **Phase 4 — Mesure 5 jours** : @data-analyst + @growth.
  - Dashboard live (CF Analytics + Coinbase + Stripe consolidé en 1 page)
  - Plan d'action selon résultats J7 :
    - Si < 5 ventes : diagnostic SEO/GEO (pas le produit)
    - Si 5-15 ventes : bump 0,49 € → 0,99 € + ajout 5 keywords secondaires
    - Si > 15 ventes : push agressif SDK Status upsell + élargir à 100 SDKs
- **Phase 5 — Conformité (semaine 2)** : @legal.
  - Déclaration BNC crypto auto-entrepreneur si revenus dépassent 200 €
  - CGV + mentions légales sur la landing
  - Politique confidentialité (très courte : aucune donnée perso stockée)

### Agents custom à créer via @agent-factory (avant Phase 3)

- **`@testeur-agent-ia`** : simule un vrai agent IA (Claude Code/Cursor/AgentKit) qui crawle, parse `llms.txt`, détecte `HTTP 402`, exécute le paiement x402, valide le payload reçu. Différent du testeur-persona standard qui simule un humain.
- **`@testeur-developpeur-superviseur`** : simule l'humain qui supervise un agent et achète Stripe Link 4,99 €/jour. Vérifie que le funnel humain marche (landing → CTA → Stripe → JWT).

### Risques identifiés et mitigations

| Risque                                                                                      | Probabilité        | Mitigation                                                                                        |
| ------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| Volume 8-15 K rech/mois est `[HYPOTHÈSE]` non-mesurée                                       | Moyenne            | KPI J7 = test binaire. Si 0 crawl, pivot mot-clé.                                                 |
| Concurrence pricepertoken/costgoat                                                          | Confirmée forte    | Différenciation stricte : x402-natif + atomique + `dateModified`. Refuser la course aux features. |
| Demande micropaiement agent encore embryonnaire (Coindesk mars 2026 = 28 k$/jour réel x402) | Moyenne            | Stripe Link humain en fallback assure un revenu même si agents pas matures.                       |
| Régulation crypto FR (PSD3, MiCA)                                                           | Faible court terme | Handoff @legal Phase 5. Auto-entreprise + déclaration BNC.                                        |
| Anthropic / OpenAI lance le même produit gratuit                                            | Faible             | Niche trop petite pour eux. On a 12-18 mois d'avance estimés.                                     |

### Bonus fraîcheur — différenciation immédiate vs pricepertoken

Opus 4.7 inflate son tokenizer de +35 % silencieusement ([source Finout](https://www.finout.io/blog/claude-opus-4.7-pricing-the-real-cost-story-behind-the-unchanged-price-tag)) — à intégrer dans le payload pricing comme champ `effective_cost_factor`. Différenciation immédiate vs pricepertoken qui ne capte pas ce signal.

---

## Section B — Historique des interventions agents (Phase 0-3, Sessions 1-5)

> Entrées archivées car > 5 sessions (CLAUDE.md commandement 8). Détails complets dans l'historique git.

| Agent              | Date       | Livrable produit                                                                                                                      |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| @orchestrator      | 2026-05-05 | `project-context.md` initial — Mapping brief DevRefs sur template Gradient, 3 BLOCK_IA en attente                                     |
| @ia                | 2026-05-05 | Phase 0a — remplissage 3 BLOCK_IA (5 verbatims, 3 mots négatifs, diff vs pricepertoken)                                               |
| @legal             | 2026-05-05 | Phase 0 wave 1 — `docs/legal/legal-audit.md` + rgpd-checklist + cgu-draft + privacy-policy. GO CONDITIONNEL, zéro-PII natif           |
| @creative-strategy | 2026-05-05 | Phase 0 wave 1 — brand-platform + personas + competitive-benchmark + creative-brief. Naming DevRefs confirmé, `.dev`                  |
| @product-manager   | 2026-05-05 | Phase 0 wave 2 — discovery-map + assumption-map + product-vision + roadmap + backlog + v1-scope. RICE 17 features V1, 15 user stories |
| @data-analyst      | 2026-05-05 | Phase 0 wave 3 — kpi-framework + tracking-plan + dashboard-specs + dev-decisions. NSM revenu NET, 38 events                           |
| @creative-strategy | 2026-05-05 | **Phase 0 v2 RELANCE** — refonte 4 livrables strategy (pivot pure B2A 100% agents IA, 2 offres x402)                                  |
| @ia                | 2026-05-05 | Phase 0 v2 — 4 specs fondatrices PIVOT 100% B2A pure (agent-integration + agent-economics + x402-response-spec + agent-audit-spec)    |
| @product-manager   | 2026-05-05 | Phase 0 v2 wave 2 — refonte 6 livrables produit + pricing-strategy.md NOUVEAU. 29 features V1, 21 user stories                        |
| @data-analyst      | 2026-05-05 | Phase 0 v2 wave 3 — refonte 4 livrables analytics. 47 events actifs v2                                                                |
| @legal             | 2026-05-05 | Phase 0 v2 session 3 — review et patch 4 livrables légaux v2 (5 questions PII tranchées, 12 events validés zéro-PII)                  |
| @design            | 2026-05-05 | Phase 1 conception — design-system.md + page-compositions.md (12 composants V1, 5 surfaces)                                           |
| @ux                | 2026-05-05 | Phase 1 conception — user-flows.md (6 parcours, matrice persona × surface)                                                            |
| @copywriter        | 2026-05-05 | Phase 1 conception — brand-voice.md (refonte v2) + landing.md (NOUVEAU)                                                               |
| @qa                | 2026-05-05 | Phase 1 conception — qa-strategy.md (pyramide 5 niveaux, 32 gates)                                                                    |
| @product-manager   | 2026-05-05 | Phase 1 — functional-specs.md (RELANCE post-timeout). 10 endpoints, 6 KV namespaces, 5 crons                                          |
| @agent-factory     | 2026-05-06 | Phase 2 — testeur-agent-ia.md + testeur-sponsor-humain.md (gates GP1-GP10 + GC1-GC10)                                                 |
| @infrastructure    | 2026-05-06 | Phase 2 setup — wrangler.toml + ci.yml + husky + 7 fichiers config CI/CD                                                              |
| @fullstack         | 2026-05-06 | Phase 4a+4b — fondation backend Worker + 3 endpoints monétisés (105 tests Vitest, bundle 33 KB)                                       |
| @fullstack         | 2026-05-06 | Phase 4c+4d — 5 crons + frontend HTML statique complet (12 fichiers public/, 12 favicons placeholders)                                |
| @fullstack         | 2026-05-06 | Phase 4e+4f — Stripe top-up + Coinbase webhooks + JWT + 5 emails + viem ecrecover EIP-191 + 47 events + Playwright                    |
| @seo               | 2026-05-06 | Phase 3 visibilité — seo-audit.md (19 findings, 10 keywords B2A)                                                                      |
| @geo               | 2026-05-06 | Phase 3 visibilité — geo-strategy.md (5 axes audit, 5 stratégies off-site, 10 prompts tests)                                          |
| @design            | 2026-05-06 | Phase 5b — assets favicon design final + OG image (logo.svg, og-image.svg, manifest, README-thomas)                                   |
| @fullstack         | 2026-05-06 | Phase 5b — 9 fixes mineurs identifiés par testeurs + @seo                                                                             |
| @copywriter        | 2026-05-06 | Phase 3 visibilité — 3 articles prêts à publier (Dev.to ×2 + Reddit r/ClaudeAI)                                                       |
| @reviewer          | 2026-05-06 | Phase 5 — audit-final.md (GO CONDITIONNEL 9.06/10, 28/32 G + 13/20 GP/GC PASS)                                                        |

---

## Section C — Verbatim V4 v1 (déprécié pivot v2 2026-05-05)

**V4 — Verbatim persona secondaire (dev humain qui bascule sur Stripe Link)**

> "Bon, c'est la 7e fois ce matin que mon agent Claude Code paie 0,49 € pour vérifier le prix Sonnet 4.6 avant chaque génération. Ça fait 3,43 € sur la session, et il va continuer toute la journée parce que je lui ai demandé de scaffold 40 features. Je clique le Stripe Link 4,99 €/jour, JWT 24 h, on n'en parle plus."

**Statut** : DÉPRÉCIÉ pivot v2 2026-05-05. Le persona V4 reste valide en v2 (sponsor humain top-up wallet) mais avec verbatim réécrit dans `docs/strategy/personas.md` v2 § 2.4.
