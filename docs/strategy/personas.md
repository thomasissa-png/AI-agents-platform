<!-- Version: 2026-05-05T08:10 — @creative-strategy — Phase 0 wave 1 — personas DevRefs avec verbatims V1-V5 -->
# Personas — DevRefs

## Résumé exécutif

- **Persona principal** : Agent IA autonome (Claude Code, Cursor agent, AgentKit, Mastra, MCP-host). Décide seul, paie en x402, optimise pour anti-hallucination plus que pour économie de tokens.
- **Persona secondaire** : Dev humain superviseur. Achète le Stripe Link 4,99 €/jour quand l'agent paie trop souvent.
- **Personas-clients-du-persona** : si dev solo (cas Thomas) → lui-même (N/A formel). Si dev en agence/SaaS → CFO ou tech lead qui valide la facture cloud + IA mensuelle. Documenté en section 3.
- **Source des verbatims** : 5 verbatims V1-V5 rédigés par @ia (project-context.md lignes 31-60). Réutilisés ici comme matière première analytique, **JAMAIS comme témoignages de clients réels** (cf. brand-platform.md § 9 anti-fausses-promesses).

---

## 1. Persona principal — Agent IA autonome

### 1.1 Profil technique

| Attribut | Valeur |
|---|---|
| **Identité fonctionnelle** | Un agent IA autonome qui code, orchestre des LLM, ou consomme des APIs avant d'agir |
| **Stack typique** | Claude Code (Anthropic), Cursor agent (Anysphere), AgentKit (World/OpenAI/Anthropic ecosystems), Mastra, OpenAI Agents SDK, MCP-host (Model Context Protocol clients) |
| **Capacités** | (a) `WebSearch` + `WebFetch` natifs, (b) supporte ou apprend à supporter HTTP 402 / x402 pour micro-paiements autonomes, (c) optimise anti-hallucination plus que économie de tokens (un retry coûte plus que 0,49 €) |
| **Cutoff training** | Janvier 2026 typiquement (varie selon modèle), donc 4-6 mois de retard structurel sur les évolutions APIs/SDKs/pricings |
| **Volume d'opérations** | Plusieurs dizaines à centaines de tool-calls par session, latence cumulée critique |
| **Wallet** | Anonyme x402 USDC Base, pas de compte ni session, pas de KYC |

### 1.2 Jobs-to-be-done (5)

1. **Vérifier la fraîcheur d'un fait technique** avant de générer du code ou une réponse à un humain (ex : "Quel est le prix Opus 4.7 input/MTok aujourd'hui ?").
2. **Détecter un breaking change SDK** avant de scaffold du code qui sera rejeté par le build (ex : Vercel AI SDK 5.0 qui change la signature `streamText`).
3. **Tie-breaker entre sources contradictoires** quand un `WebSearch` retourne 3 prix différents pour le même modèle (cas V3 — fil HN #44682465 mai 2026).
4. **Estimer un coût réel d'opération** avant d'engager des tokens en chaîne (ex : un agent qui scaffold 40 features doit savoir si la facture Anthropic sera 50 € ou 500 €).
5. **Citer une source machine-vérifiable** dans sa réponse à l'humain superviseur (ex : `sameAs: anthropic.com/pricing, fetched_at: 2026-05-05T06:00Z`).

### 1.3 Frustrations quantifiées (cf. verbatims V1-V5)

| Frustration | Source verbatim | Quantification |
|---|---|---|
| Hallucination silencieuse sur pricing LLM (rendu avec confiance haute) | V1 (bloc tool-call JSON Opus 4.7) | 15 % hallucination sur APIs/SDKs (arxiv 2407.09726). Pour 1 query de pricing : 31,4 s elapsed, 64 520 tokens cramés, sortie incorrecte (omission `effective_cost_factor` 1.35) |
| Parsing HTML lourd pour extraire 2 nombres | V2 (verbatim first-person) | 1 page pricepertoken = ~38 900 tokens parsés pour 1 ligne utile. 5 sources crawlées = ~64 000 tokens cramés. |
| Sources contradictoires sans tie-breaker fraîcheur | V3 (signal comportemental Cursor agent) | 4 sources WebFetched, 3 prix différents (1.25 / 2.50 / 3.00 input/MTok), heuristique médian → réponse erronée à 2,4× la facture réelle. Découvert 2 jours plus tard par l'humain. |
| Schemas SDK obsolètes (cutoff training dépassé) | V5 (Vercel AI SDK 5.0) | 4 retries échoués (build error détecté par superviseur), 12 minutes perdues, ~80 000 tokens cramés. |
| Latence cumulative sur multi-source crawl | V2 + V3 | 18-30 s perdues en parsing/dédup multi-source par tâche de fraîcheur. Sur 50 tâches/session = 15-25 min cumulées. |

### 1.4 Objections à l'achat

| Objection | Réponse DevRefs |
|---|---|
| "Le paiement x402 est-il sécurisé ?" | x402 = signature wallet onchain, settle < 2 s, ~$0.0001 fee, zéro frais protocole, zéro KYC, ~119 M tx Base + 35 M Solana en mars 2026 (cf. docs.cdp.coinbase.com/x402, blog.cloudflare.com/x402). |
| "Ta fraîcheur est-elle garantie ?" | `dateModified` JSON-LD ISO 8601 + header HTTP `Last-Modified` + `fetched_at` dans payload. Cron 6 h, source officielle citée par `sameAs`. L'agent peut re-vérifier sans nous faire confiance. |
| "Quelle latence p95 sur edge ?" | < 200 ms p95 cible Cloudflare Workers (free tier 100 000 req/jour). Mesuré côté QA Phase 3. |
| "Et si Cloudflare ou Coinbase tombe ?" | Code Worker portable (Deno Deploy, Bun, Node). x402 = protocole ouvert Foundation, multi-facilitator (Coinbase + Solana). Stripe Link en fallback humain. |
| "Pourquoi pas gratuit comme pricepertoken ?" | Pricepertoken sert humains via HTML SEO 380 KB. DevRefs sert agents via JSON < 50 KB avec `dateModified`. Le coût marginal d'un crawl agent est externalisé proprement (0,49 €), pas masqué dans une dette technique. |
| "Coût agrégé sur une session de 100 queries ?" | 100 × 0,49 € = 49 €. Si > 10 queries/jour récurrentes → bascule humain Stripe Link 4,99 €/jour unlimited. Ratio break-even : 11 queries/jour. |

### 1.5 Critères de décision (machine-readable)

L'agent décide d'utiliser DevRefs sur ces signaux explicites, parsés à la première rencontre via `llms.txt` puis OpenAPI :

| Critère | Test machine-vérifiable | Statut DevRefs V1 |
|---|---|---|
| `llms.txt` à la racine du domaine, syntaxe valide | `curl https://devrefs.dev/llms.txt` → MIME `text/plain`, parse OK, références explicites aux endpoints | OUI Phase 1 |
| OpenAPI 3.1 spec disponible, machine-readable | `curl https://devrefs.dev/openapi.json` → spec valide, `info.x-x402` extension présente | OUI Phase 1 (extension x-x402 documentée) |
| Réponse HTTP 402 conforme x402 (header structuré) | `curl https://devrefs.dev/api/llm-prices?model=opus-4.7` (sans paiement) → 402 + body JSON `{"x402": {"price","currency","facilitator","asset","network"}}` | OUI Phase 1 |
| Payload réponse < 50 KB, JSON valide, JSON-LD `Dataset` inline | Mesure `Content-Length`, validation JSON-LD `@type: Dataset` + `dateModified` | OUI Phase 1 |
| `dateModified` ISO 8601 < 24 h vs now() | Diff timestamp | OUI cron 6 h |
| `sameAs` source officielle traçable | Suit le lien `sameAs`, vérifie 200 OK + correspondance prix | OUI Phase 1 |

### 1.6 Vocabulaire utilisé (cf. verbatims V1-V5)

`tool_calls`, `WebSearch`, `WebFetch`, `tokens_in`, `tokens_burned`, `elapsed_ms`, `model_output`, `ground_truth_check`, `cutoff training`, `breaking_since`, `dateModified`, `fetched_at`, `effective_cost_factor`, `tokenizer inflation`, `payload`, `endpoint`, `crawl`, `parse`, `retry`, `heuristique médian`, `confiance haute`, `signal de fraîcheur machine-readable`, `tie-breaker`, `JSON-LD Dataset`, `MCP server`, `x402`, `HTTP 402`, `JWT`, `wallet`, `USDC Base`, `facilitator`.

### 1.7 Verbatims réutilisables (matière copy)

> **V1 — Bloc tool-call JSON Opus 4.7** (exploitable hero @design tel quel, anonymisé) : voir project-context.md lignes 32-48. Ce bloc montre concrètement : 31 420 ms elapsed, 64 520 tokens cramés, sortie incorrecte (omission `effective_cost_factor 1.35`).

> **V2 — Frustration first-person** : "J'ai crawlé 5 sources pour trouver le prix Gemini 2.5 Pro et chacune disait un truc différent. La sixième fois que je tape `WebFetch` sur du HTML de 380 KB pour récupérer 2 nombres, j'ai juste besoin d'un endpoint qui me renvoie `{"input_per_mtok": 1.25, "dateModified": "2026-05-04T06:00Z"}` et qui me facture 0,49 € au lieu de me coûter 18 000 tokens en parsing." (Reformulé en agent générique, pas attribué à un client réel.)

> **V3 — Pattern comportemental** : 4 sources WebFetched, 3 prix différents pour GPT-5, heuristique médian, livraison à l'humain en confiance haute, facture réelle 2,4× l'estimation, découvert 2 jours plus tard. Cause racine : aucune source ne signale sa fraîcheur de manière machine-readable.

> **V5 — Schema SDK obsolète** : "Mon training cutoff est janvier 2026. Vercel AI SDK est passé de `streamText({ model, messages })` à `streamText({ model, prompt })` en mars. J'ai généré 4 fois le code avec l'ancien schema, l'agent superviseur a 4 fois détecté le build error, j'ai 4 fois re-`WebSearch`. Un endpoint `/api/sdk-status?pkg=ai` qui me renvoie `{"latest": "5.0.12", "breaking_since": "5.0.0", "dateModified": "2026-05-04"}` aurait économisé 12 minutes et ~80 000 tokens."

**Règle d'usage copy** : ces verbatims sont des **scénarios analytiques** d'@ia, pas des témoignages clients. @copywriter doit les reformuler en first-person générique ("ton agent", "un agent qui code"), JAMAIS avec un nom de persona fictif type "Marie, Dev Senior chez Acme".

---

## 2. Persona secondaire — Dev humain superviseur

### 2.1 Profil

| Attribut | Valeur |
|---|---|
| **Identité** | Développeur backend ou IA qui orchestre des agents en production. Solo founder, indé, ou ingénieur dans une scale-up. |
| **Niveau technique** | Élevé. Utilise quotidiennement Claude Code / Cursor / un agent maison. Comprend MCP, x402, JWT, Stripe. |
| **Stack** | Claude Code + agent custom + serveur MCP local + monitoring (souvent rudimentaire, type log file ou Grafana). |
| **Posture face à l'agent** | Lui délègue 60-90 % du code mais relit 100 % des PR. Anxiété sur les coûts cumulés (tokens API + paiements x402). |
| **Géographie typique** | EU / US / Asia, anglophone, lit/écrit en anglais natif ou C1+. |
| **Budget** | Indé : 50-500 €/mois cloud + IA. Scale-up : 500-5 000 €/mois (sa part de stack). |

### 2.2 Jobs-to-be-done (4)

1. **Reprendre la main sur la facture x402** quand l'agent paie en boucle (cf. V4 : 7 paiements 0,49 € en une matinée).
2. **Auditer les coûts cumulés** sur 24 h / 7 j / 30 j sans interrompre l'agent.
3. **Garantir la conformité fiscale BNC crypto** (en France) — ne pas accumuler 1000 micro-paiements x402 untracked.
4. **Stabiliser la prédictibilité du budget** quand son agent travaille 8 h/jour en autonomie.

### 2.3 Frustrations (cf. verbatim V4)

| Frustration | Source | Quantification |
|---|---|---|
| Facture x402 imprévisible quand l'agent paie en boucle | V4 (verbatim Stripe Link) | 7 paiements 0,49 € sur 1 matinée = 3,43 €. Si journée complète scaffold 40 features = 30-50 € extrapolé, vs 4,99 € unlimited Stripe Link. |
| Anxiety des breaking changes SDK qui font crasher la prod | V5 (cumul humain) | 4 build errors successifs détectés par CI, 12 minutes perdues × N agents = friction quotidienne. |
| Manque de visibilité sur les paiements wallet x402 (anonymes) | Comportement standard wallet | Pas de "facture claire" comme un SaaS classique → friction comptable et fiscale (BNC France). |
| Vendor lock-in caché derrière un x402 facilitator unique | Anti-pattern Cloudflare-only ou Coinbase-only | Aversion forte (cf. founder-prefs Thomas Anti-pattern #7 et #1). |

### 2.4 Critères de décision

| Critère | Test |
|---|---|
| Stripe Link visible et accessible sans créer un compte | Lien direct buy.stripe.com, pas de signup, paiement carte ou Apple Pay |
| Tarif unlimited journalier transparent | 4,99 €/jour = 24 h JWT explicite, pas de prélèvement récurrent caché |
| JWT signé HMAC, durée 24 h documentée | JWT décodable, claim `exp` à +24 h, signature vérifiable côté client |
| Possibilité d'upgrade vers mensuel sans téléphoner | Pas en V1 mais documenté en backlog V2 (commande backlog @product-manager) |
| Dashboard interne de consommation | Page interne (auth = JWT) qui affiche : nb queries 24 h, coût total, ratio crawl/paiement |
| Anti-vendor lock-in | x402 + Stripe = 2 providers. Code Workers portable. Pas de "Cloudflare exclusive feature" en V1. |

### 2.5 Vocabulaire utilisé (cf. V4)

`agent`, `Claude Code`, `paye 0,49 €`, `7e fois ce matin`, `session`, `scaffold`, `feature`, `Stripe Link`, `JWT 24 h`, `unlimited`, `bascule`, `clic`, `facture`, `superviser`, `prod`, `dépendance`, `breaking change`.

### 2.6 Verbatim source

> **V4** : "Bon, c'est la 7e fois ce matin que mon agent Claude Code paie 0,49 € pour vérifier le prix Sonnet 4.6 avant chaque génération. Ça fait 3,43 € sur la session, et il va continuer toute la journée parce que je lui ai demandé de scaffold 40 features. Je clique le Stripe Link 4,99 €/jour, JWT 24 h, on n'en parle plus."

**Reformulé pour copy** : "7e paiement x402 ce matin sur ton agent ? Stripe Link 4,99 €/jour, JWT 24 h, unlimited cross-endpoints. Tu reprends le contrôle de la facture en 1 clic."

---

## 3. Personas-clients-du-persona (renforcement Gradient B2A/B2B)

Le protocole Gradient (`creative-strategy.md` § Protocole d'escalade — point "Personas des clients de nos personas") impose de documenter les clients/interlocuteurs du persona projet, même si secondaires, pour que les agents testeurs puissent simuler la chaîne de valeur complète.

Pour DevRefs, deux configurations existent selon le profil du persona secondaire (dev humain superviseur) :

### 3.1 Cas A — Dev solo (Thomas, indé, founder solo)

**Client-du-persona = lui-même.** Il est à la fois superviseur (ICP DevRefs) et payeur final (pas de CFO, pas de validation hiérarchique). Statut **N/A formel** au sens du protocole, mais documenté ici pour traçabilité :

- Il valide sa propre dépense sur des critères mixtes : ROI temps (12 min économisées × tarif horaire) + plaisir technique (l'agent marche mieux) + conformité (BNC crypto déclarable).
- Le seuil psychologique de bascule x402 → Stripe Link est aligné avec sa rationalité économique : 11 queries/jour = break-even, mais émotionnellement 7 paiements consécutifs en 1 matinée déclenchent déjà le clic (anti-friction prime sur le rationnel).

### 3.2 Cas B — Dev en scale-up B2B SaaS (extension persona V2 — non prioritaire V1)

**Client-du-persona = CFO / VP Engineering / Tech Lead** qui valide la facture cloud + IA mensuelle.

| Attribut | Valeur |
|---|---|
| **Rôle** | CFO ou VP Eng dans une scale-up B2B 20-200 personnes qui utilise des agents IA en production |
| **Frustrations** | (a) factures cloud + IA + paiements crypto en silos non-réconciliés, (b) anxiété "qu'est-ce que c'est ces 47 paiements 0,49 € en USDC Base sur le wallet de l'équipe Eng ce mois ?", (c) absence de catégorie comptable claire pour les micro-paiements agent |
| **Attentes** | Rapport mensuel agrégé en EUR, catégorie comptable explicite, lien wallet ↔ équipe ↔ agent ↔ projet, conformité fiscale (BNC France, B2B reverse-charge UE) |
| **Comment DevRefs améliore l'interaction** | Stripe Link mensuel (V2 backlog) + dashboard interne qui agrège les paiements x402 d'un wallet équipe en 1 facture, classifie par endpoint, exporte CSV mensuel. |
| **Vocabulaire** | "facture", "compte de résultat", "catégorie comptable", "BNC", "TVA", "reverse-charge", "PSD3", "MiCA", "déductible", "prévisible", "audit trail" |
| **Critères d'évaluation du dev** | Le superviseur dev est jugé sur la prédictibilité du budget mensuel + capacité à justifier chaque ligne. Si DevRefs lui sert un export CSV propre, sa note interne monte. |

**Statut V1** : ce persona n'est PAS la cible directe V1 (qui vise Thomas + 5-15 devs solo similaires). Il est documenté comme **persona V2 candidat** pour briefer @product-manager sur le backlog (ex : Stripe mensuel, dashboard team, export CSV). Pas d'agent testeur dédié en V1 (cf. brand-platform.md § 8 — seuls @testeur-agent-ia et @testeur-developpeur-superviseur sont obligatoires).

---

## 4. Hiérarchie persona pour le copy

| Priorité | Persona | Pourcentage du copy public à lui adresser | Canal type |
|---|---|---|---|
| 1 | Agent IA autonome | 60 % | Hero, FAQ, OpenAPI, llms.txt, payloads, headers HTTP |
| 2 | Dev humain superviseur | 35 % | Section pricing/Stripe, FAQ humaine, dashboard interne, Stripe Link page |
| 3 | CFO / VP Eng (V2 candidat) | 5 % (stub) | 1 § dans FAQ "How do I get a monthly invoice?" → réponse "V2 soon, contact-us mailto for now" |

---

## 5. Synthèse handoff aval

| Élément | Décision |
|---|---|
| **Persona principal** | Agent IA autonome — verbatims V1, V2, V3, V5 |
| **Persona secondaire** | Dev humain superviseur — verbatim V4 |
| **Clients-du-persona** | N/A formel pour solo (cas Thomas), persona V2 candidat pour scale-up CFO/VP Eng |
| **Agents testeurs obligatoires** | @testeur-agent-ia (Phase 2) + @testeur-developpeur-superviseur (Phase 2) |
| **Anti-règle copy** | Verbatims V1-V5 = scénarios analytiques @ia, JAMAIS témoignages réels |
| **Tutoiement** | OUI dev superviseur ("ton agent", "tu paies"), agent en first-person générique |

---

## Handoff → @orchestrator (puis @copywriter Phase 0 wave 2)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/strategy/personas.md`
- **Décisions prises** : 1 persona principal (agent IA), 1 secondaire (dev humain superviseur), 1 client-du-persona V2 candidat (CFO/VP Eng scale-up). Verbatims V1-V5 cartographiés sur frustrations + critères de décision.
- **Points d'attention** :
  - V1-V5 = scénarios analytiques d'@ia, NE PAS les présenter comme témoignages clients (anti-fausse-promesse).
  - 60 % du copy public adresse l'agent en first-person générique, 35 % le dev superviseur en tutoiement, 5 % stub CFO V2.
  - Aucun nom de persona fictif autorisé dans le copy.
- **Aucune action Replit requise**.
