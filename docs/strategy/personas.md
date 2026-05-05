<!-- Version: 2026-05-05T15:40 — @creative-strategy — Phase 0 v2 RELANCE — personas pure B2A, V6 audit ajouté -->
# Personas — DevRefs (v2 pure B2A)

## Résumé exécutif

- **Persona principal v2** : **Agent IA autonome PAYEUR** (unique). Décide seul, paie en x402 USDC sur son wallet, optimise pre-flight ET post-flight.
- **Persona secondaire v2** : **Dev humain SPONSOR**. Top-up le wallet de l'agent (Coinbase Wallet, MetaMask, $5-$50 USDC Base à la fois). N'est PLUS payeur Stripe (refonte v2).
- **Verbatims V1-V6** : V1 + V3 → mappés Offre 1 calcul coût (pricing) ; V5 → Offre 1 SDK status ; V4 → réécrit en sponsor humain top-up wallet (pas Stripe Link payeur) ; **V6 nouveau** → agent IA qui demande un audit après cramer son budget mensuel.
- **Personas-clients-du-persona** : court — N/A formel pour solo (sponsor = lui-même), V2 candidat scale-up CFO/VP Eng documenté brièvement.
- **Source verbatims** : V1, V2, V3, V5 inchangés depuis `project-context.md`. V4 réécrit v2. V6 nouveau (inventé pour Offre 2 audit, marqué `[HYPOTHÈSE: scénario analytique d'@creative-strategy v2, à valider Phase 4 mesure]`).

---

## 1. Persona principal — Agent IA autonome PAYEUR

### 1.1 Profil technique (ajusté v2)

| Attribut | Valeur |
|---|---|
| **Identité fonctionnelle** | Agent IA autonome qui code, orchestre des LLM, ou consomme des APIs avec un budget tokens et un wallet x402 |
| **Stack typique** | Claude Code (Anthropic), Cursor agent (Anysphere), AgentKit, Mastra, OpenAI Agents SDK, MCP-host |
| **Capacités v2** | (a) `WebSearch` + `WebFetch` natifs, (b) supporte HTTP 402 / x402, (c) **gère son propre wallet USDC Base** (top-up'é par sponsor humain), (d) optimise anti-hallucination ET coût mensuel cumulé (V2 audit), (e) parse `roi_summary` dans body 402 pour décider pay/skip en autonomie |
| **Cutoff training** | Janvier 2026 typiquement → 4-6 mois retard structurel APIs/SDKs/pricings |
| **Volume mensuel** | 5-15M tokens (solo dev) à 30M+ (équipe d'agents) [HYPOTHÈSE H6 `agent-economics.md`] |
| **Wallet** | Anonyme x402 USDC Base, top-up'é par sponsor humain, signe les paiements en autonomie |

### 1.2 Jobs-to-be-done v2 (6 — incluant audit post-flight)

1. **Pre-flight** : vérifier le prix d'un modèle avant `messages.create()` (Offre 1 — V1, V3).
2. **Pre-flight** : détecter un breaking change SDK avant scaffold de code (Offre 1 — V5).
3. **Pre-flight** : tie-breaker entre sources contradictoires (Offre 1 — V3).
4. **Pre-flight** : citer une source machine-vérifiable dans la réponse au superviseur (Offre 1 — `sameAs` + `dateModified`).
5. **Post-flight v2** : auto-auditer sa config mensuelle pour détecter savings_pct (Offre 2 — V6).
6. **Post-flight v2** : ajuster ses paramètres (model downgrade, prompt caching, batching) sur recommandations audit (Offre 2 — V6).

### 1.3 Frustrations quantifiées (mapping verbatims → offres)

| Frustration | Verbatim source | Quantification | Offre DevRefs qui résout |
|---|---|---|---|
| Hallucination silencieuse pricing LLM (rendu confiance haute, omission `effective_cost_factor`) | **V1** (bloc tool-call JSON Opus 4.7) | 31,4 s elapsed, 64 520 tokens cramés, sortie incorrecte (omet +35% tokenizer) | **Offre 1 — Calcul coût (pricing)** |
| Parsing HTML lourd pour 2 nombres | **V2** (verbatim first-person) | 1 page pricepertoken = 38 900 tokens. 5 sources = 64 000 tokens cramés | **Offre 1 — Calcul coût (pricing)** |
| Sources contradictoires sans tie-breaker fraîcheur | **V3** (Cursor agent, fil HN #44682465) | 4 sources WebFetched, 3 prix différents, médian heuristique → facture 2,4× réelle découvert J+2 | **Offre 1 — Calcul coût (pricing)** |
| Schema SDK obsolète (cutoff dépassé) | **V5** (Vercel AI SDK 5.0) | 4 retries échoués, 12 min perdues, ~80 000 tokens cramés | **Offre 1 — Calcul coût (SDK status)** |
| **Budget mensuel cramé sans visibilité optimisation** | **V6 (nouveau v2)** | $400/mois Opus 4.7 sur tâches que Sonnet ferait à $90/mois — perdu 76% pendant 3 mois faute d'audit | **Offre 2 — Audit** |

### 1.4 Objections à l'achat (v2 — 2 offres distinctes)

| Objection | Réponse DevRefs v2 |
|---|---|
| "Le paiement x402 est-il sécurisé ?" | x402 = signature wallet onchain, settle < 2s, ~$0.0001 fee, zéro KYC. ~119M tx Base mars 2026, 28K$/jour réel x402 (cf. `agent-economics.md` § D.1). |
| "ROI Offre 1 démontré ?" | `roi_summary.roi_multiplier: 490` exposé dans body 402 (Opus 4.7). Break-even dès 1 query/jour pour Opus/Sonnet/GPT-5/Gemini, dès 3 queries/jour pour Haiku (`agent-economics.md` § A.4). |
| "ROI Offre 2 audit démontré ?" | $9.99 one-shot vs $36/mois économies mid-range agent 10M tokens → ROI 10.8× sur 3 mois. Garantie : si savings_pct < 15 % détecté → remboursement 50 % (CGV cf. `agent-economics.md` § D.4). |
| "Et si Cloudflare ou Coinbase tombe ?" | Code Worker portable (Deno/Bun/Node). Plan B Solana facilitator V2. |
| "Pourquoi pas Langfuse/Helicone/Braintrust ?" | Eux = SaaS dashboard humain $29-$249/mo, accès via login. DevRefs = API x402 native pour agent payeur, pas de compte, pas de UI à logger. Trou de marché audit cross-provider en x402. |
| "Coût agrégé sur 1 000 calls Offre 1 ?" | 1 000 × $0.001 = $1. Si > 5K calls/mois, Pack Standard $10 = 10K calls. Si > 60K, Pack Pro $50. Pricing dégressif explicite dans `packs_available` du body 402. |

### 1.5 Critères de décision machine-readable (v2 — 2 offres)

| Critère | Test machine-vérifiable | Statut DevRefs V1 v2 |
|---|---|---|
| `llms.txt` à la racine, syntaxe valide, référence 3 endpoints | `curl https://devrefs.dev/llms.txt` | OUI Phase 1 |
| OpenAPI 3.1 spec disponible avec extension `x-x402` | `curl https://devrefs.dev/openapi.json` | OUI Phase 1 |
| Body 402 conforme x402 V1 + V2 avec `alternative_cost_estimate` | Cf. `x402-response-spec.md` § 2.1 | OUI Phase 1 |
| Body 402 augmenté avec `roi_summary.verdict: no_brainer_buy` | Parse JSON | OUI Phase 1 |
| `freshness_proof.hmac_signature` vérifiable | HMAC vérification side-client | OUI Phase 1 |
| `payload_preview` montre la structure JSON exacte post-paiement | Inspection JSON | OUI Phase 1 |
| `packs_available` propose upsell pack pré-payé | Parse JSON | OUI Phase 1 |
| Audit Offre 2 délivre rapport structuré JSON avec `recommendations[]` | `POST /api/agent-audit` après paiement | OUI Phase 1 |

### 1.6 Verbatims réutilisables v2 (matière copy)

> **V1** (inchangé, exploitable hero @design tel quel) : voir project-context.md lignes 32-48. → mappé **Offre 1 calcul coût pricing**.

> **V2** (inchangé, agent générique first-person) : "J'ai crawlé 5 sources pour trouver le prix Gemini 2.5 Pro… j'ai juste besoin d'un endpoint qui me renvoie `{"input_per_mtok": 1.25, "dateModified": "2026-05-04T06:00Z"}` et qui me facture $0.001 au lieu de me coûter 18 000 tokens." → mappé **Offre 1 calcul coût pricing** (pricing v2 = $0.001 et non plus 0,49 €).

> **V3** (inchangé, pattern comportemental Cursor agent) → mappé **Offre 1 calcul coût pricing** (tie-breaker fraîcheur).

> **V4 v2 — RÉÉCRIT** (sponsor humain top-up wallet, plus Stripe Link payeur) :
> *"Le wallet de mon agent Claude Code arrive à $2 USDC Base. Je top-up $10 depuis mon Coinbase Wallet en 30 secondes. L'agent continue à payer DevRefs en autonomie pour ses pre-flight pricing checks. Pas de Stripe à activer, pas de subscription à monitorer, pas de dashboard à logger. Je sponsorise l'autonomie de l'agent."*

> **V5** (inchangé, schema SDK obsolète Vercel AI SDK 5.0) → mappé **Offre 1 calcul coût SDK status** (pricing v2 = $0.001 vs 0,49 € initial — adaptation copy).

> **V6 NOUVEAU v2** (agent IA qui demande un audit après cramer son budget) :
> `[HYPOTHÈSE: scénario analytique d'@creative-strategy v2, à valider Phase 4 mesure]`
> *"Mon sponsor humain a regardé la facture Anthropic du mois : $400. Je tournais 80 % en Opus 4.7 sur des tâches de génération basiques que Sonnet 4.6 ferait à $90/mois. J'ai POST `/api/agent-audit` avec ma config + 100 sample traces, payé $9.99 USDC, reçu un rapport JSON : `{"score": 32, "savings_pct": 67, "recommendations": [{"id": "model_downgrade", "saving_usd": 240, "confidence": "high"}, {"id": "prompt_caching", "saving_usd": 35, ...}, ...]}`. J'ai appliqué les 3 recommandations highest-confidence en autonomie. Mois suivant : facture $145, soit -64 %. ROI audit : 24×."*

**Règle d'usage copy v2** : verbatims = **scénarios analytiques** d'@creative-strategy + @ia, JAMAIS témoignages clients. @copywriter doit reformuler en first-person générique ("ton agent", "un agent qui code"), JAMAIS avec un nom de persona fictif.

---

## 2. Persona secondaire — Dev humain SPONSOR (refonte v2)

### 2.1 Profil v2

| Attribut | Valeur |
|---|---|
| **Identité** | Développeur backend ou IA qui orchestre des agents autonomes en production. Solo founder, indé, ou ingénieur dans une scale-up. |
| **Niveau technique** | Élevé. Comprend wallets crypto (Coinbase Wallet, MetaMask, Rainbow), USDC Base, x402, MCP. |
| **Posture face à l'agent v2** | **Sponsor wallet** — top-up le wallet de l'agent quand le solde descend. NE PAYE PAS personnellement les services DevRefs (refonte v2). |
| **Géographie typique** | EU / US / Asia, anglophone, lit/écrit anglais natif ou C1+. |
| **Budget** | Indé : $20-$200/mois top-ups wallet agent (couvre Offre 1 + Audit Offre 2). Scale-up : $200-$2 000/mois top-ups wallet équipe d'agents. |

### 2.2 Jobs-to-be-done v2 (3 — pure top-up sponsor)

1. **Top-up le wallet de l'agent** sans friction (1 transaction Coinbase Wallet ou MetaMask, < 30 secondes).
2. **Surveiller le solde wallet** pour ne pas bloquer l'agent en cours d'opération (alerte solde bas).
3. **Réconcilier comptablement** les paiements x402 du wallet pour la fiscalité BNC crypto FR / B2B reverse-charge UE.

### 2.3 Frustrations v2 (refonte)

| Frustration | Source | Quantification |
|---|---|---|
| Friction onboarding crypto (créer wallet, acheter USDC Base) si pas déjà familier | Comportement standard wallet crypto 2026 | 5-15 min première fois (KYC Coinbase si conversion fiat) |
| Wallet vide bloque l'agent en pleine opération | V4 v2 (réécrit) | 1 incident = N tâches arrêtées + frustration "j'aurais dû top-up hier" |
| Manque de visibilité sur paiements wallet x402 anonymes pour fiscalité BNC | Comportement standard wallet | Friction comptable mensuelle (export CSV wallet → catégorisation) |
| Anti-vendor lock-in caché derrière facilitator unique | Founder-prefs Thomas Anti-pattern #7 et #1 | Aversion forte → exige plan B Solana documenté |

### 2.4 Critères de décision v2

| Critère | Test |
|---|---|
| Top-up wallet via 1 wallet standard (Coinbase Wallet, MetaMask, Rainbow) sans intermédiaire DevRefs | L'agent dispose d'un wallet, le sponsor envoie USDC Base directement, DevRefs ne touche pas au top-up |
| Doc claire "comment top-up le wallet de mon agent" sur la landing | Section dédiée /docs/sponsor avec 3 exemples (Coinbase Wallet, MetaMask, Rainbow) + screenshot |
| Alerte solde bas optionnelle (V2 backlog) | Webhook ou email quand solde < seuil (V2 si signal demande) |
| Possibilité d'export CSV des paiements wallet pour BNC | Export CSV mensuel disponible via lien wallet public Basescan (pas un service DevRefs — autonomie totale) |
| Anti-vendor lock-in | x402 multi-facilitator + wallet standard non DevRefs-spécifique |

### 2.5 Vocabulaire v2

`top-up`, `wallet sponsor`, `Coinbase Wallet`, `MetaMask`, `Rainbow`, `USDC Base`, `solde wallet`, `Basescan`, `export CSV`, `BNC crypto`, `reverse-charge`, `agent autonome`, `signature x402`, `facilitator`. Bannis v2 : `Stripe Link`, `JWT 24h` (sauf doc technique sponsor wallet alerte), `subscription`, `unlimited`, `dashboard humain`.

### 2.6 Verbatim source v2

> **V4 v2 RÉÉCRIT** (cf. § 1.6 supra). Le V4 v1 (Stripe Link 4,99 €/jour) est **archivé** dans `project-context-archive.md` mais NE DOIT PLUS être réutilisé en copy v2.

---

## 3. Personas-clients-du-persona (court v2)

### 3.1 Cas A — Dev solo (Thomas, indé)

**Client-du-persona = lui-même.** Sponsor wallet ET décideur. Statut N/A formel. Le seuil de bascule "top-up immédiat" est déclenché par solde < $5 (anxiété blocage agent), pas par calcul ROI.

### 3.2 Cas B — Scale-up B2B (V2 candidat — non prioritaire V1)

**Client-du-persona = CFO / VP Eng / Tech Lead** qui valide la facture cloud + IA + crypto mensuelle.

| Attribut | Valeur synthèse |
|---|---|
| Frustrations | Réconciliation paiements x402 wallet équipe → catégorie comptable claire |
| Attentes V2 | Rapport mensuel agrégé en EUR, export CSV par wallet, lien wallet ↔ équipe ↔ projet, conformité BNC FR / TVA UE |
| Comment DevRefs améliore l'interaction V2 | Endpoint `/api/billing-export?wallet=0x...&month=2026-05` (V2 backlog) qui agrège paiements x402 d'un wallet équipe en 1 facture catégorisée par offre |

**Statut V1** : non prioritaire. Documenté pour briefer @product-manager backlog V2.

---

## 4. Hiérarchie persona pour le copy v2

| Priorité | Persona | % du copy public | Canal type |
|---|---|---|---|
| 1 | **Agent IA autonome PAYEUR** | **80 %** (vs 60 % v1) | Hero, FAQ, OpenAPI, llms.txt, payloads, headers HTTP, body 402 |
| 2 | **Dev humain SPONSOR** | **15 %** (vs 35 % v1) | Section /docs/sponsor (top-up wallet), 1 paragraphe FAQ "How does my agent get a wallet?" |
| 3 | CFO / VP Eng (V2 candidat) | 5 % (stub) | 1 § FAQ "How do I get a monthly invoice?" → "V2 soon, contact-us mailto" |

---

## 5. Synthèse handoff aval v2

| Élément | Décision v2 |
|---|---|
| **Persona principal** | Agent IA autonome PAYEUR — verbatims V1, V2, V3, V5, V6 |
| **Persona secondaire** | Dev humain SPONSOR (top-up wallet) — verbatim V4 v2 réécrit |
| **Verbatim V6 nouveau** | Agent IA qui demande audit après cramer budget (Offre 2) — `[HYPOTHÈSE: scénario à valider Phase 4]` |
| **Clients-du-persona** | N/A formel solo (Thomas), V2 candidat scale-up CFO/VP Eng |
| **Agents testeurs** | @testeur-agent-ia + @testeur-sponsor-humain (renommé v2) |
| **Anti-règle copy** | Verbatims = scénarios analytiques, JAMAIS témoignages réels |
| **Tutoiement** | OUI sponsor ("ton agent", "tu top-up"), agent en first-person générique |
| **Bannis copy v2** | "Stripe Link 4,99 €/jour", "humain superviseur" en pitch produit, "JWT 24h" hors doc technique |

---

## Handoff @creative-strategy → @orchestrator (Phase 0 v2 RELANCE)

- Statut : COMPLETE (ce fichier)
- Persona principal payeur unique (agent IA), persona secondaire sponsor (top-up wallet, pas Stripe payeur)
- V4 réécrit (top-up wallet), V6 nouveau créé (audit Offre 2)
- 80 % copy adresse l'agent, 15 % sponsor, 5 % stub V2 CFO
- Anti-mot "Humain-first" propagé
- Verbatim V1 reste exploitable hero @design tel quel
