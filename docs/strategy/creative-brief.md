<!-- Version: 2026-05-05T16:00 — @creative-strategy — Phase 0 v2 RELANCE — creative brief refondu pour pure B2A 2 offres x402 -->
# Brief créatif — DevRefs (v2 pure B2A)

## Résumé exécutif

- **Pivot v2** : DevRefs = produit 100 % B2A pure, **2 offres en x402 USDC** (calcul coût pre-flight + audit post-flight). Aucune offre Stripe humaine pilier — Stripe peut rester en option top-up wallet sponsor mais n'est plus une offre commerciale.
- **Hero retenu Thomas** : *"Cost intelligence for AI agents — know before you spend, optimize after you ship."*
- **3 piliers transversaux** (déclassés sous "Cost intelligence") : Fresh — Atomic — Verifiable.
- **Anti-mots v2** : Exhaustif — Narratif — Stable — **Humain-first** (nouveau).
- **Persona principal** : Agent IA autonome PAYEUR (unique). **Persona secondaire** : Dev humain SPONSOR (top-up wallet, pas payeur).
- **Pricing officiel** repris depuis `docs/ia/agent-economics.md` § C.1 — aucune invention.
- **Brief unifié** pour 9 agents aval : @copywriter, @design, @growth, @seo, @geo, @product-manager, @data-analyst, @legal, @fullstack.

---

## 1. Décisions verrouillées Thomas (à propager partout)

| Décision | Source |
|---|---|
| 100 % B2A pure (pas Stripe humain pilier) | Brief Thomas Phase 0 v2 |
| 2 offres en x402 USDC | `agent-economics.md` § C.1 |
| Hero "Cost intelligence for AI agents — know before you spend, optimize after you ship." | Brief Thomas (challengeable Phase 4 mesure si conv < 2 %) |
| Pricing Offre 1 : pay-per-call $0.001 OR Pack Discovery $5 / Standard $10 / Pro $50 | `agent-economics.md` § C.1 |
| Pricing Offre 2 : Audit one-shot $9.99 OR Pack Pro $49 (6 audits) | `agent-economics.md` § C.1 |
| Subscription Pro $29/mo réservé V2 (x402 V2 sessions Q3 2026) | `agent-economics.md` § C.3 [HYPOTHÈSE H7] |
| 3e offre future V2 : Cost Regression Alerts (sticky multi-provider) | Brief Thomas v2 |
| Naming `DevRefs` + domaine `devrefs.dev` (inchangé) | brand-platform.md v2 § 1 |
| 3 piliers Fresh / Atomic / Verifiable gardés mais sous-message principal | brand-platform.md v2 § 2 |
| Anti-mots : Exhaustif / Narratif / Stable / **Humain-first** (nouveau) | brand-platform.md v2 § 4.2 |
| Persona V4 réécrit : sponsor wallet (pas Stripe payeur) | personas.md v2 § 2 |
| Persona V6 nouveau : agent demande audit après cramer budget | personas.md v2 § 1.6 |
| Concurrents indirects audit : Langfuse / Helicone / Braintrust / LangSmith / Latitude | competitive-benchmark.md v2 § 2.1 |
| Trou marché : audit cross-provider payable agent x402 | competitive-benchmark.md v2 § 2.2 |
| Risque concurrence 6-12 mois : Anthropic Token Counting + Claude Code Optimizer | competitive-benchmark.md v2 § 3.1 |
| Trigger pivot bascule audit-only : si revenu Audit > 70 % à M+3-M+6 | brand-platform.md v2 § 6 |
| Agents testeurs renommés : @testeur-agent-ia + @testeur-sponsor-humain | brand-platform.md v2 § 7 |

---

## 2. Brief par agent aval

### 2.1 @copywriter

**Mission v2** : produire le copy landing publique + FAQ + body 402 + llms.txt + boilerplates pour les 2 offres.

**Inputs obligatoires** :
- `brand-platform.md` v2 (hero, voice, vocabulaire, anti-mots Humain-first)
- `personas.md` v2 (persona principal payeur, V6 nouveau audit, V4 réécrit sponsor)
- `competitive-benchmark.md` v2 (positionnement vs Langfuse/Helicone/Braintrust)
- `agent-economics.md` (pricing exact, ROI 490× et 10×+ à citer)
- `x402-response-spec.md` (body 402 augmenté à formuler)

**Livrables** :
- `docs/copy/landing-hero.md` — hero "Cost intelligence for AI agents — know before you spend, optimize after you ship." + sous-titre opérationnel + 2 blocs offre + 1 paragraphe sponsor (15 % du copy)
- `docs/copy/faq.md` — 10-12 questions axées agent (pas humain) — "How do I pay $0.001 in x402?", "What's in the audit report?", "Why no Langfuse-style dashboard?"
- `docs/copy/body-402.md` — strings utilisées dans le body 402 (`instructions_for_agent` + `verdict` formats) cohérent `x402-response-spec.md`
- `docs/copy/llms-txt.md` — contenu `llms.txt` à la racine, référence 3 endpoints monétisés avec descriptions courtes

**Interdits** : "Stripe Link 4,99 €/jour", "humain superviseur", "dashboard", "subscription" (sauf V2 backlog mention).

**Anti-fausse-promesse** : ne JAMAIS mentionner Subscription Pro ou Cost Regression Alerts comme V1.

### 2.2 @design

**Mission v2** : design tokens + iconographie + 1 maquette landing minimaliste 100 % agent-first.

**Inputs obligatoires** :
- `brand-platform.md` v2 (3 piliers, voice, anti-mots)
- `personas.md` v2 (verbatim V1 bloc tool-call JSON exploitable hero tel quel)

**Livrables** :
- `docs/design/design-tokens.md` — palette 2-3 couleurs (terminal vert / fond sombre / accent USDC bleu), typographie monospace Inter / JetBrains Mono, spacing 4px grid, dark mode by default
- `docs/design/iconography.md` — icones agent (terminal, JSON, schémas, wallet), zéro humain souriant, zéro équipe, zéro dashboard de SaaS classique
- `docs/design/landing-mockup.md` — wireframe basse-fid landing : (a) hero "Cost intelligence for AI agents…" + bloc tool-call JSON V1 exploitable tel quel comme hero visuel, (b) 2 blocs offres côte-à-côte avec curl examples, (c) section sponsor wallet en bas (15 %), (d) FAQ + footer technique. Cible : page < 50 KB total CSS+HTML.

**Interdits** : screenshots de dashboards, photos d'humains/équipes, illustrations type Notion (sourires), iconographie SaaS classique.

### 2.3 @growth

**Mission v2** : plan d'acquisition 100 % organique pour atteindre 5+ paiements x402 J7, 50 €/mois J30.

**Inputs obligatoires** :
- `personas.md` v2 (canaux : où vit l'agent payeur ?)
- `agent-economics.md` § C.2 (volume nécessaire 600 €/mois = 66 ventes/mois ~2.2/jour)

**Livrables** :
- `docs/growth/acquisition-plan.md` — 3 canaux prioritaires : (1) Dev.to articles techniques "How my agent saves $400/mo with x402 audit", (2) Reddit r/ClaudeAI + r/LocalLLaMA + r/AI_Agents, (3) X/Twitter dev IA (Anthropic devrels, Cursor team, AgentKit community)
- `docs/growth/content-calendar.md` — 8-10 posts en 30 jours, mix Offre 1 (pre-flight ROI 490×) + Offre 2 (audit ROI 10×+) + 1 post sponsor wallet pédagogique
- `docs/growth/indexnow-strategy.md` — push Bing IndexNow après chaque cron 6h pricing + après chaque release SDK status, cible citation Perplexity J30

**Anti-fausse-promesse** : ne JAMAIS prétendre "100 % automated growth" — Phase 4 mesure J7 binaire bloquante (cf. `v1-scope.md` § 4).

### 2.4 @seo

**Mission v2** : positionner DevRefs sur entités "cost intelligence agents", "x402 audit", "agent-first pricing API".

**Inputs obligatoires** :
- `brand-platform.md` v2 § 6 (triggers réévaluation entité nommée)
- `competitive-benchmark.md` v2 (concurrents indirects à dépositionner)

**Livrables** :
- `docs/seo/keyword-map.md` — 15-20 keywords primaires + secondaires : "x402 LLM pricing", "agent cost optimization API", "LLM audit one-shot", "cross-provider LLM audit", "anthropic openai pricing API agent"
- `docs/seo/onpage-checklist.md` — JSON-LD `Dataset` + `SoftwareApplication` + `Product` + sitemap + robots.txt explicite + `llms.txt` racine
- `docs/seo/competitor-displacement.md` — fiches comparatives `/vs-langfuse`, `/vs-helicone`, `/vs-pricepertoken` factuelles (anti-mention concurrent par nom dans copy client-facing — cf. règles communes #9, mais OK dans pages comparatives techniques)

### 2.5 @geo (visibilité IA)

**Mission v2** : maximiser citations Perplexity / Claude / ChatGPT sur "LLM pricing 2026", "cost optimization for AI agents", "x402 API examples".

**Inputs obligatoires** :
- `brand-platform.md` v2 (entité nommée stable + RTB chiffrés)
- `agent-economics.md` (chiffres exacts à inclure dans copy crawlable LLM)

**Livrables** :
- `docs/geo/llms-txt-spec.md` — fichier `llms.txt` à la racine, syntaxe valide (Anthropic spec sept 2024), référence explicite aux 3 endpoints monétisés + extrait pricing + extrait ROI
- `docs/geo/factual-prompts.md` — 10-15 questions types posées à Perplexity/Claude/ChatGPT pour mesurer pickup citation organique : "What's the cheapest API to get LLM pricing for an autonomous agent?", "How to audit an AI agent's cost in one shot?"
- `docs/geo/citation-tracker.md` — protocole manuel V1 (V2 si ahrefs Brand Radar budgétisé) : 3× par semaine vérifier 10 prompts → enregistrer dans tableau + action si pickup < 1/mois après J30

### 2.6 @product-manager

**Mission v2** : refondre roadmap + backlog avec 2 offres v2, ajouter V2 candidates (Subscription Pro + Cost Regression Alerts).

**Inputs obligatoires** :
- `brand-platform.md` v2 (brand architecture + V2 candidates)
- `personas.md` v2 (V6 audit nouveau + V4 sponsor réécrit)
- `agent-economics.md` (volume 600 €/mois, mix transactions)

**Livrables** :
- `docs/product/roadmap.md` mise à jour v2 — Phase 1 V1 = 3 endpoints monétisés (`/api/llm-prices` + `/api/sdk-status` + `/api/agent-audit`), retirer Stripe Link 4,99 €/jour comme feature core, ajouter doc sponsor wallet
- `docs/product/backlog.md` mise à jour v2 — user stories revues : US-04 (Stripe Link humain) → archivée v2, US-XX nouvelle (sponsor top-up wallet doc), US-YY nouvelle (Audit Offre 2)
- `docs/product/v1-scope.md` mise à jour v2 — 3 endpoints monétisés au lieu de 2, hypothèse business centrale ajustée : "Un agent IA achète-t-il en autonomie un calcul coût $0.001 ET un audit $9.99 en x402 ?"
- `docs/product/backlog-v2.md` — Subscription Pro $29/mo + Cost Regression Alerts (3e offre future) en V2 conditionnée signal demande

### 2.7 @data-analyst

**Mission v2** : refondre KPI framework + tracking plan avec 2 offres v2, split ARPU agent vs sponsor humain.

**Inputs obligatoires** :
- `agent-economics.md` (cibles 600 €/mois, métriques succès)
- `competitive-benchmark.md` v2 (NSM cohérent vs concurrents indirects)
- Fichier existant `docs/analytics/kpi-framework.md` (à mettre à jour)

**Livrables** :
- `docs/analytics/kpi-framework.md` mise à jour v2 — NSM = revenu NET mensuel x402 (Stripe Link rétrogradé en métrique secondaire optionnelle top-up rampe sponsor), split ARPU Offre 1 vs Offre 2, métrique critique : ratio % revenu Audit (trigger pivot si > 70 % à M+3)
- `docs/analytics/tracking-plan.md` mise à jour v2 — events `payment_audit_completed`, `payment_audit_pack_purchased`, `audit_recommendations_applied` (V2 si signal), retirer events `stripe_link_*` comme primaires
- `docs/analytics/dashboard-specs.md` mise à jour v2 — zone admin : "% revenu Audit" en KPI principal (trigger pivot), "ratio Offre 1 packs vs pay-per-call", "ROI démontré moyen Offre 2 (savings_pct distribution)"

### 2.8 @legal

**Mission v2** : ajuster CGV + privacy pour Audit Offre 2 + retirer dépendance Stripe pilier.

**Inputs obligatoires** :
- `agent-economics.md` § D.4 (garantie remboursement 50 % si savings_pct < 15 %)
- `personas.md` v2 (sponsor wallet pas Stripe payeur)

**Livrables** :
- `docs/legal/cgu-draft.md` mise à jour v2 — clause Audit Offre 2 (garantie remboursement, limite agents > 5M tokens/mois recommandée, disclaimers heuristiques statiques pas IA runtime), retirer clauses Stripe Link 4,99 €/jour comme offre commerciale principale (rester pour fallback technique uniquement)
- `docs/legal/privacy-policy.md` mise à jour v2 — section Audit : sample traces envoyées par l'agent → traitement éphémère 24h max, pas de stockage persistent, pas de PII (engagement sponsor humain doit anonymiser sample traces avant envoi)
- `docs/legal/legal-audit.md` mise à jour v2 — section additionnelle Audit Offre 2 (responsabilité recommandations, opt-out garantie, jurisprudence "AI advisory liability" 2026 si existe)

### 2.9 @fullstack

**Mission v2** : implémenter `/api/agent-audit` (Offre 2 nouveau) + retirer feature Stripe Link comme core.

**Inputs obligatoires** :
- `x402-response-spec.md` § 3.3 (body 402 audit complet à implémenter)
- `agent-economics.md` § C.1 (pricing exact $9.99 + Pack Pro $49)
- `docs/ia/agent-audit-spec.md` (5 heuristiques statiques — non lu par @creative-strategy car non-critique pour brief, à lire par @fullstack)

**Livrables techniques** (résumé high-level — détails dans `docs/dev-decisions.md` à mettre à jour) :
- Cloudflare Worker `/api/agent-audit` POST (input config + sample traces, output JSON avec 5 heuristiques + recommendations + savings_pct)
- Middleware x402 pour Offre 2 ($9.99 USDC) cohérent avec middleware Offre 1
- Body 402 augmenté pour les 3 endpoints (Pricing + SDK + Audit) avec `alternative_cost_estimate`, `roi_summary`, `freshness_proof`, `payload_preview`, `packs_available`
- Doc `/docs/sponsor` pour top-up wallet (Coinbase Wallet / MetaMask / Rainbow + screenshot + FAQ comptable BNC)
- Stripe Link DÉCLASSÉ — peut rester en option backlog rampe top-up sponsor mais retiré du chemin critique V1

---

## 3. Cohérence inter-agents (matrice)

| Agent | Doit lire | Doit produire | Doit s'aligner avec |
|---|---|---|---|
| @copywriter | brand-platform v2 + personas v2 + agent-economics + x402-response-spec | Hero, FAQ, body 402, llms.txt | Voice 3 traits, anti-mots Humain-first, V6 verbatim audit |
| @design | brand-platform v2 + personas v2 (V1 hero exploitable) | Tokens, icones, mockup landing | Iconographie pure agent, < 50 KB, dark mode |
| @growth | personas v2 + agent-economics § C.2 | Plan acquisition + content calendar + IndexNow | Volume 66 ventes/mois, J7 binaire |
| @seo | brand-platform v2 + competitive-benchmark v2 | Keyword map + on-page + comp-displacement | Entités "cost intelligence agents", `/vs-*` factuelles |
| @geo | brand-platform v2 + agent-economics chiffres | llms.txt + factual prompts + citation tracker | Citations Perplexity/Claude/ChatGPT mesurées manuel V1 |
| @product-manager | brand-platform v2 + personas v2 + agent-economics | Roadmap v2 + backlog v2 + v1-scope v2 | 3 endpoints monétisés, V2 Subscription + Cost Regression Alerts |
| @data-analyst | competitive-benchmark v2 + agent-economics | KPI v2 + tracking v2 + dashboard v2 | NSM net x402, % revenu Audit trigger pivot |
| @legal | agent-economics § D.4 + personas v2 | CGU + privacy + legal-audit v2 | Garantie remboursement Audit, Stripe non pilier |
| @fullstack | x402-response-spec + agent-economics + agent-audit-spec | `/api/agent-audit` + middleware x402 v2 + body 402 augmenté | 3 endpoints monétisés, body 402 conforme spec |

---

## 4. Anti-règles globales (renforcement)

| Règle | Application |
|---|---|
| **Aucune mention Stripe humain pilier en client-facing** | Stripe = option rampe top-up sponsor, jamais "offre" DevRefs |
| **Anti-mot "Humain-first"** | Tout copy "Pour les développeurs qui veulent…" doit être réécrit "Ton agent…" |
| **Aucune feature non listée Phase 1 v2** | Subscription Pro $29/mo et Cost Regression Alerts NE DOIVENT PAS apparaître en copy V1 |
| **Verbatims V1-V6 = scénarios analytiques** | Reformulés first-person générique, JAMAIS attribués à un nom de persona fictif |
| **Anti-vendor lock-in** | Cloudflare/Coinbase factuels, jamais survendus. Plan B Solana documenté |
| **Pricing repris depuis @ia spec** | Aucune invention — `agent-economics.md` § C.1 fait foi |
| **Conviction-first** | CTAs en fin de parcours, pas en hero (cf. founder-prefs Sarani S8) |
| **Mention concurrent par nom** | OK uniquement dans pages comparatives techniques `/vs-*`, JAMAIS en hero ou body principal |

---

## 5. Synthèse exécutive (handoff)

| Élément | Décision v2 |
|---|---|
| **Hero retenu** | Cost intelligence for AI agents — know before you spend, optimize after you ship. |
| **2 offres** | Calcul coût ($0.001/call ou packs) + Audit ($9.99 one-shot ou Pack Pro $49) |
| **Pricing source** | `docs/ia/agent-economics.md` § C.1 — repris tel quel |
| **Persona principal** | Agent IA payeur (80 % copy) |
| **Persona secondaire** | Sponsor wallet humain (15 % copy) |
| **Anti-mot ajouté v2** | Humain-first |
| **Concurrents indirects audit** | Langfuse / Helicone / Braintrust / LangSmith / Latitude (tous SaaS humain) |
| **Trou marché** | Audit cross-provider payable agent x402, one-shot |
| **3e offre future V2** | Cost Regression Alerts (sticky multi-provider, x402 V2 sessions) |
| **Trigger pivot** | Bascule audit-only si revenu Audit > 70 % à M+3-M+6 |
| **9 agents aval briefés** | @copywriter, @design, @growth, @seo, @geo, @product-manager, @data-analyst, @legal, @fullstack |

---

## Handoff @creative-strategy → @orchestrator (Phase 0 v2 RELANCE)

- Statut : COMPLETE (ce fichier)
- Brief unifié pour 9 agents aval avec décisions verrouillées Thomas propagées
- Pricing source = `agent-economics.md` § C.1 (aucune invention)
- Anti-mot "Humain-first" propagé en règle globale
- Stripe rétrogradé en option rampe top-up sponsor (pas pilier)
- 3e offre future V2 (Cost Regression Alerts) en backlog @product-manager conditionnée signal demande
- Trigger pivot bascule audit-only documenté (% revenu Audit > 70 %)
