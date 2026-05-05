<!-- Version: 2026-05-05T08:00 — @creative-strategy — Phase 0 wave 1 — fondation positionnement DevRefs -->
# Plateforme de marque — DevRefs

## Résumé exécutif

- **Objectif** : poser la fondation stratégique de DevRefs (naming, positionnement, messages, voice & tone, brand architecture) sur laquelle toute la chaîne d'agents aval s'appuie.
- **Décisions clés** :
  1. **Naming retenu** : `DevRefs` (working name confirmé). Domaine cible `devrefs.dev` (TLD .dev privilégié vs .io, plus aligné persona dev/agent).
  2. **Catégorie** : "Agent-first reference layer for fresh tech data" — création de catégorie B2A (Business-to-Agent), espace concurrentiel libre vs pricepertoken/costgoat/devtk (tous HTML SEO humain-first).
  3. **Promesse** : "Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper."
  4. **Frameworks utilisés** : Category Design (création B2A) + Blue Ocean ERRC (différenciation radicale vs HTML SEO) + Perceptual Mapping (axes fraîcheur signalée × atomicité payload).
- **Dépendances aval** : @copywriter (hero/FAQ/body), @design (palette, iconographie agent-first), @growth (canaux Dev.to/Reddit/X), @seo + @geo (entités nommées, JSON-LD), @ux (parcours agent vs humain), @ia (prompts MCP/llms.txt).

---

## 1. Naming

### Décision : `DevRefs` (working name confirmé)

Le naming `DevRefs` est validé sans pivot. Aucune des alternatives candidates (FreshRefs, AgentDevRefs, RefStream, AgentSource) n'apporte un delta de bénéfice supérieur au coût de pivot, et plusieurs présentent des défauts disqualifiants.

### Critères de décision (5 critères pondérés)

| Critère | DevRefs | FreshRefs | AgentDevRefs | RefStream | AgentSource |
|---|---|---|---|---|---|
| **Cohérence persona agent IA** (parsing, mémorabilité tool-call) | OK — 2 morphèmes courts, lisibles dans un `WebFetch("devrefs.dev/api/llm-prices")` | Moyen — "Fresh" est un attribut, pas une catégorie. Un agent recherche "refs", pas "fresh" | Lourd — 12 chars, trop verbeux pour un nom d'API | Ambigu — "Stream" sous-entend SSE/WebSocket alors que produit = REST atomique | Confus — collision avec "OpenAI Agents SDK" et "AgentKit" |
| **SEO/GEO** (entité nommée stable, citation Perplexity/Claude) | OK — entité unique, pas de collision majeure WebSearch (mai 2026) | Risque — "fresh" est un mot très commun, dilue la citation | OK mais long | Risque — "stream" ramène à streaming media | Risque — collision Anthropic/OpenAI Agents |
| **Domaine .dev / .io disponible** | `devrefs.dev` ciblé (TLD aligné — Google Registry, HSTS forcé, signal dev fort) | `freshrefs.dev` plausible mais "fresh" déjà très saturé | `agentdevrefs.dev` libre mais URL longue dans les payloads | `refstream.io` souvent occupé (vérification finale au registrar) | `agentsource.io` souvent pris (espace SaaS dense) |
| **Anti-confusion** (produits existants) | Aucune collision majeure repérée WebSearch mai 2026 | "FreshRefs" ressemble à un nom de fruits/épicerie | OK | Collision potentielle avec produits streaming données | Collision Anthropic/OpenAI/AgentKit |
| **Brand architecture future** (extension >2 endpoints) | Préfixe `Dev-` extensible : `DevRefs Pricing`, `DevRefs SDK`, `DevRefs Schemas`, `DevRefs Specs` — la racine est neutre, le suffixe segmente | "Fresh" devient redondant si on ajoute "Pricing" (Fresh Pricing ?) | Trop spécifique "agent" — bloque si extension B2B humain | "Stream" enferme dans 1 modalité technique | "Source" fait double emploi avec "Refs" si extension |

### Rationale (synthèse)

`DevRefs` gagne sur 4 des 5 critères et n'a aucun défaut bloquant. La sémantique "Dev + Refs" porte deux signaux simultanés :
- **Dev** = pour développeurs et agents qui codent (cible ICP correcte, pas grand public)
- **Refs** = "references" au sens académique/technique (faits sourcés, citables, comme une bibliographie machine-readable)

Le nom est court (8 caractères), prononçable en français comme en anglais, et lisible dans un tool-call JSON sans casser le parsing. Pour un agent qui appelle `WebFetch("https://devrefs.dev/api/llm-prices?model=opus-4.7")`, le pattern URL est immédiatement déchiffrable.

### Domaine recommandé : `devrefs.dev`

- **TLD `.dev` privilégié vs `.io`** : (a) HSTS forcé par Google Registry → signal de sécurité automatique pour un agent qui paie en x402, (b) connotation dev native (vs `.io` plus généraliste startup), (c) tarif identique à `.io` (~10-15 €/an), (d) 10 117 noms `.dev` à 1 mot encore disponibles en 2026 selon oneword.domains.
- **Vérification finale à la commande** : registrar Cloudflare ou Porkbun (cohérent avec stack Cloudflare Pages/Workers, pas de vendor lock-in supplémentaire).
- **Alternative de repli si `devrefs.dev` indisponible au registrar** : `devrefs.io` (acceptable, perte signal HSTS auto). NE PAS prendre `getdevrefs.dev` ou `usedevrefs.dev` (préfixes diluent l'entité nommée).

### Brand architecture si extension future

```
DevRefs (racine de marque)
├── DevRefs Pricing     → /api/llm-prices
├── DevRefs SDK         → /api/sdk-status
├── DevRefs Schemas     → /api/openapi-status   (V2 candidate)
└── DevRefs Specs       → /api/spec-diff        (V3 candidate)
```

Règle d'extension : `DevRefs [Domain]` en humain, `/api/[kebab-domain]` en URL. Préfixe `Dev` jamais détaché de `Refs` dans le branding visible.

---

## 2. Frameworks stratégiques utilisés

### 2.1 Category Design (primaire) — création B2A

DevRefs ne s'inscrit pas dans une catégorie existante. Les concurrents (pricepertoken, costgoat, devtk, llm-prices, helicone) opèrent tous dans la catégorie "LLM pricing comparison for humans" — une catégorie SEO mature, dense, à faible marge.

**Catégorie définie par DevRefs** : `Agent-first reference layer for fresh tech data`.
- **Le problème nommé** : un agent IA en 2026 hallucine à 15 % sur les APIs/SDKs car aucune source ne signale sa fraîcheur de manière machine-readable, et les sources existantes sont des pages HTML de 200-380 KB conçues pour des yeux humains.
- **POV unique** : la fraîcheur est une feature, pas un effet de bord. L'atomicité (1 query = 1 fait) est non-négociable. Le paiement x402 micro est le format natif du B2A.
- **Pourquoi Category Design** : créer la catégorie est plus rentable que se battre sur une catégorie saturée. Le prochain agent IA cherchant "fresh LLM pricing for agents" doit trouver DevRefs comme entité distincte, pas comme alternative #6 à pricepertoken (cf. recherche "B2A: business-to-agent" — Medium @inesvallot fév. 2026, Kantar B2A retail disruption 2026).

### 2.2 Blue Ocean ERRC (secondaire) — différenciation radicale

Grille ERRC vs concurrents historiques (pricepertoken, costgoat, helicone) :

| Levier | Application DevRefs |
|---|---|
| **Éliminer** | Prose narrative, paragraphes "In May 2026, Anthropic announced…", screenshots décoratifs, leaderboards subjectifs, comparateurs UI multi-modèles, blog SEO hors-sujet |
| **Réduire** | Surface HTML (objectif < 50 KB par page), nombre de modèles servis dans 1 réponse (1 query = 1 modèle), branding visuel (le crawler est l'audience #1) |
| **Augmenter** | Densité d'info structurée (JSON-LD `Dataset`, OpenAPI inline), fréquence de fraîcheur (cron 6 h vs daily/weekly concurrents), explicit `dateModified` sur chaque payload, `effective_cost_factor` pour signaler les inflations de tokenizer |
| **Créer** | Endpoint x402-natif (concurrents = 100 % gratuit ou 100 % SaaS humain), `llms.txt` explicite référençant les endpoints monétisés, header HTTP `Last-Modified` aligné JSON-LD, JWT 24 h Stripe Link en fallback humain |

### 2.3 Perceptual Mapping (validation)

Carte 2 axes — **x = fraîcheur signalée machine-readable** (low → high), **y = atomicité payload** (low → high) :

```
                      Atomicité haute
                            ▲
                            │
                  DevRefs ● │  (cible : x402 + JSON-LD + < 50 KB)
                            │
   llm-prices.com ●         │
                            │
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▶ Fraîcheur signalée
                            │                        machine-readable
   pricepertoken ●          │  costgoat ●
                            │
   helicone ●  devtk ●      │
                            │
                      Atomicité basse
```

**Quadrant cible (haut-droite)** : aucun acteur. Confirme l'espace libre identifié par Category Design.

---

## 3. Positionnement

### 3.1 Territoire de marque

**`The agent-first reference layer for fresh tech data.`**

DevRefs occupe le territoire de la donnée technique fraîche, atomique et vérifiable, servie nativement à des agents IA via x402. Pas un calculateur de prix, pas un comparateur, pas un dashboard d'observabilité — un référentiel machine-readable que les agents consultent comme dépendance par défaut avant d'agir.

### 3.2 Promesse de marque (< 20 mots)

> **Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper.**

(19 mots — adresse le persona principal "ton agent", chiffre le prix, ancre la valeur "ne pas se tromper" qui couvre les 3 mots définissants Fresh + Atomic + Verifiable).

### 3.3 Preuves (Reasons To Believe)

| RTB | Source vérifiable |
|---|---|
| 12 modèles LLM couverts dès V1 | Endpoint `/api/llm-prices` cron 6 h, source officielle (Anthropic, OpenAI, Google, Mistral, DeepSeek pricing pages) — Phase 1 plan d'exécution |
| 50 SDKs trackés dès V1 | Endpoint `/api/sdk-status`, npm registry + GitHub releases publiques + parser CHANGELOG — Phase 1 |
| Cron 6 h sur les sources | Cloudflare Worker cron, configuré dans le code source (vérifiable) — Phase 1 |
| Payload < 50 KB | Mesurable curl + ContentLength header — Phase 3 QA |
| `dateModified` JSON-LD machine-readable | JSON-LD `Dataset` + `dateModified` ISO 8601 dans chaque payload — Phase 1 |
| `llms.txt` explicite référençant endpoints monétisés | Fichier `llms.txt` à la racine, vérifiable par `curl https://devrefs.dev/llms.txt` — Phase 1 |
| Paiement x402 natif (Coinbase facilitator USDC Base) | x402 middleware Cloudflare Workers, settle < 2 s, ~$0.0001 fee (cf. docs.cdp.coinbase.com/x402) — Phase 1 |
| Fallback humain Stripe Link 4,99 €/jour | Stripe Payment Link + JWT 24 h signé HMAC — Phase 1 |

**Anti-fausse-promesse** : aucune preuve listée n'est extérieure au "Plan d'exécution prévu" de project-context.md. Si une feature ne sort pas en V1, la preuve associée est retirée du copy avant publication.

### 3.4 Ton de marque (3 traits constants)

| Trait | Définition opérationnelle |
|---|---|
| **Direct** | Phrases courtes, sujet-verbe-complément. Aucun adverbe modal ("vraiment", "absolument"). Aucun adjectif marketing creux ("révolutionnaire", "innovant"). |
| **Technique précis** | Chiffres datés et sourcés, jamais d'arrondis flous. Schemas et types nommés. Vocabulaire d'API et de protocole, pas de pitch produit. |
| **Agent-first puis humain-supervisable** | Le copy parle à l'agent en premier (parsing-friendly, structure data) et au superviseur humain en second (CTA Stripe Link clair, log lisible). Jamais de condescendance pour l'un ni l'autre. |

(3 traits suffisent — voir section 4 Voice & Tone pour Do/Don't détaillés).

---

## 4. Hiérarchie de messages

### 4.1 Message principal (tagline)

> **Fresh. Atomic. Verifiable. Tech refs your agent can trust.**

Variante FR (si site bilingue plus tard) : **Des refs techniques fraîches, atomiques, vérifiables. Pour ton agent.**

### 4.2 Messages de soutien (3 piliers Fresh / Atomic / Verifiable)

#### Pilier 1 — **Fresh**

| Élément | Contenu |
|---|---|
| **Claim** | "Cron 6 h sur sources officielles. `dateModified` ISO 8601 dans chaque payload." |
| **RTB** | Cloudflare Worker cron + scrape Anthropic/OpenAI/Google/Mistral/DeepSeek pricing pages + npm registry + GitHub releases. JSON-LD `Dataset.dateModified` + header HTTP `Last-Modified` alignés. |
| **Exemple agent** | `{"model": "opus-4.7", "input_per_mtok": 15, "effective_cost_factor": 1.35, "dateModified": "2026-05-05T06:00:00Z"}` |

#### Pilier 2 — **Atomic**

| Élément | Contenu |
|---|---|
| **Claim** | "Une query = un fait. Payload < 50 KB. Zéro narration." |
| **RTB** | `/api/llm-prices?model=opus-4.7` renvoie un seul objet JSON typé, pas une liste de 300 modèles. Aucun HTML décoratif. Aucun paragraphe SEO. |
| **Exemple agent** | Comparaison vs pricepertoken : 38 900 tokens parsés pour extraire 1 ligne (cf. V1 project-context.md) → DevRefs : ~300 tokens parsés, payload structuré, ground truth en 1 hop. |

#### Pilier 3 — **Verifiable**

| Élément | Contenu |
|---|---|
| **Claim** | "JSON-LD `Dataset` avec `dateModified`, `sameAs` source officielle, watermark traçable." |
| **RTB** | Chaque payload référence l'URL source officielle (`sameAs`) + timestamp ISO 8601 + `fetched_at` du cron. Un agent peut re-vérifier la chaîne sans nous faire confiance. |
| **Exemple agent** | `"sameAs": "https://www.anthropic.com/pricing", "fetched_at": "2026-05-05T06:00:00Z"`. |

### 4.3 Messages par persona

#### Persona principal — Agent IA autonome

> "Ton agent crawle 5 sources HTML de 380 KB pour 2 nombres. Stop. `GET /api/llm-prices?model=opus-4.7` → 0,49 € en x402 → JSON typé daté en 200 ms. Tu paies seulement quand tu as besoin, ton agent décide seul, ton train de prod ne s'arrête pas."

#### Persona secondaire — Dev humain superviseur

> "Ton agent vient de payer 7× 0,49 € ce matin pour vérifier le même prix Sonnet avant chaque génération. Stripe Link 4,99 €/jour, JWT 24 h, unlimited cross-endpoints. Tu reprends le contrôle de la facture en 1 clic, ton agent garde son autonomie."

### 4.4 Messages par étape funnel

| Étape | Message | Cible | Canal type |
|---|---|---|---|
| **Awareness (problème)** | "Ton agent hallucine à 15 % sur les pricings LLM. Cause racine : aucune source ne signale sa fraîcheur en machine-readable." | Agent crawler + dev humain qui découvre le coût caché | Article Dev.to, post Reddit r/ClaudeAI, citation Perplexity |
| **Consideration (solution)** | "Un endpoint atomique x402-natif avec `dateModified` JSON-LD ferait économiser 12 minutes et ~80 000 tokens par session sur les vérifications de fraîcheur." | Agent qui évalue les options, dev qui benchmarke le coût | Page comparative `/vs-pricepertoken`, post X/Twitter agent dev |
| **Decision (produit)** | "DevRefs : 0,49 € par query x402, ou 4,99 €/jour Stripe Link unlimited. 12 modèles + 50 SDKs en V1. `curl devrefs.dev/api/llm-prices?model=opus-4.7`." | Agent prêt à payer, dev qui clique CTA | Hero landing, FAQ, doc API |

### 4.5 Elevator pitch (30 secondes)

> "DevRefs est un référentiel technique fresh pour les agents IA qui codent. Au lieu de crawler 5 sites de 380 KB pour vérifier le prix d'un modèle ou la version d'un SDK, ton agent fait un GET sur `devrefs.dev/api/llm-prices`, paie 0,49 € en x402 USDC, reçoit un JSON atomique avec `dateModified` JSON-LD en 200 ms. Ton agent ne se trompe plus, ton train de prod ne ralentit pas, et toi superviseur tu peux basculer sur un Stripe Link 4,99 €/jour quand l'agent paie trop souvent. C'est la première brique d'une couche de référence agent-first qui s'élargira aux schemas OpenAPI et aux specs en 2026."

### 4.6 Boilerplate

#### Court (Twitter/X bio, 160 chars)
> DevRefs — fresh, atomic, verifiable tech refs for AI agents. JSON x402-native. dateModified JSON-LD. Built for agents, supervised by humans.

#### Moyen (presse, partenaires, 60 mots)
> DevRefs est la couche de référence agent-first pour les données techniques fraîches. Elle sert aux agents IA des payloads JSON atomiques (< 50 KB) avec `dateModified` machine-readable, payés nativement en x402 (USDC Base) à 0,49 € la query ou 4,99 €/jour pour les superviseurs humains via Stripe Link. V1 : 12 modèles LLM + 50 SDKs trackés en cron 6 h.

#### Long (Dev.to about, 120 mots)
> DevRefs est un référentiel technique pensé pour des agents IA, pas pour des humains avec un navigateur. Quand un agent autonome (Claude Code, Cursor, AgentKit, MCP host) doit vérifier le prix d'un LLM ou la version d'un SDK avant d'agir, il ne devrait pas crawler 5 pages HTML de 380 KB pour extraire 2 nombres. Il devrait faire un `GET /api/llm-prices?model=opus-4.7`, recevoir un JSON typé avec `dateModified` JSON-LD en 200 ms, et payer 0,49 € en x402 (HTTP 402 + USDC Base) — sans compte, sans session, sans humain dans la boucle. Pour les développeurs qui supervisent ces agents, un Stripe Payment Link 4,99 €/jour offre un fallback unlimited cross-endpoints. V1 : 12 modèles LLM + 50 SDKs, cron 6 h, payload < 50 KB.

---

## 5. Voice & Tone

### 5.1 Voice (constante — 3 traits)

#### Trait 1 — Direct

| Do | Don't |
|---|---|
| "Ton agent paie 0,49 € en x402, reçoit le JSON en 200 ms." | "Notre solution révolutionnaire transforme la façon dont vos agents accèdent aux données…" |
| "Cron 6 h. `dateModified` ISO 8601 dans chaque payload." | "Nous mettons à jour fréquemment notre base de données pour vous offrir une fraîcheur optimale." |
| Phrase active. Sujet-verbe-complément. | Voix passive longue. Verbes auxiliaires multiples. |

#### Trait 2 — Technique précis

| Do | Don't |
|---|---|
| "Opus 4.7 inflate son tokenizer de +35 % silencieusement." | "Opus 4.7 a quelques particularités de tokenisation à prendre en compte." |
| Cite la source : "(cf. arxiv 2407.09726)" | Affirme sans source : "Les agents hallucinent souvent." |
| Donne le nombre exact : "p95 < 200 ms sur edge Cloudflare." | Donne une fourchette floue : "Réponses rapides." |

#### Trait 3 — Agent-first puis humain-supervisable

| Do | Don't |
|---|---|
| Premier paragraphe = ce qu'un agent voit (URL, payload, prix). Deuxième paragraphe = ce qu'un superviseur humain fait (Stripe Link). | Premier paragraphe = "imaginez que votre équipe…", agent mentionné en bas de page. |
| Inclure des exemples `curl` exécutables tels quels. | Capture d'écran d'un dashboard à la place du JSON. |
| Tutoyer le dev superviseur ("ton agent", "tu paies"). | "Vous, votre entreprise, vos collaborateurs" (ton corporate). |

### 5.2 Tone (variable selon contexte)

| Contexte | Tone | Exemple |
|---|---|---|
| **Erreur HTTP 402 (paiement requis)** | Factuel, structuré, machine-readable | `{"error": 402, "message": "Payment required", "x402": {...}, "stripe_fallback": "https://buy.stripe.com/..."}` |
| **Succès paiement x402** | Concis, confirmation chiffrée | `{"status": "paid", "tx": "0xabc...", "fee_eur": 0.49, "data": {...}}` |
| **Onboarding humain (page Stripe Link)** | Rassurant, transparent, pas de FOMO | "Tu paies 4,99 € pour 24 h. Pas de prélèvement récurrent. JWT signé HMAC, expire dans 24 h." |
| **Onboarding agent (llms.txt + OpenAPI)** | Schéma pur, zéro prose | YAML/JSON spec, exemples `curl`, codes d'erreur listés. |
| **Communication post-incident** | Honnête, factuel, sans excuse théâtrale | "Cron a échoué 06:00 → 12:00 UTC sur Anthropic source (rate-limit 429). Données précédentes servies (`fetched_at` 24 h). Fix : retry exponentiel + 2e source en fallback. Déployé 14:30 UTC." |
| **Réseaux sociaux (Dev.to, Reddit, X)** | Technique brut, pas de "thread emoji" | Code snippets, payloads JSON, chiffres. Pas de "1/12 🧵" ni d'emojis vides. |

### 5.3 Vocabulaire prescrit / proscrit

#### Prescrits (à utiliser)

`agent`, `crawl`, `payload`, `endpoint`, `dateModified`, `fetched_at`, `cron`, `x402`, `JSON-LD`, `llms.txt`, `MCP`, `tool-call`, `ground truth`, `fresh`, `atomic`, `verifiable`, `cutoff training`, `tokenizer`, `effective cost`, `breaking change`, `schema`, `parser`, `header HTTP`, `USDC Base`, `JWT`, `cron 6 h`, `superviseur humain`.

#### Proscrits (à bannir)

`révolutionnaire`, `innovant`, `solution`, `next-gen`, `cutting-edge`, `seamless`, `effortless`, `magique`, `intuitif`, `puissant`, `simple` (sauf en sens technique : "schéma simple"), `unique` (sauf en sens technique : "ID unique"), `unlock`, `unleash`, `empower`, `boost`, `accelerate`, `streamline`, `transform`, `journey`, `experience` (sauf "Agent Experience / AX"), `exclusif`, `premium`. Tout adjectif aspirationnel non-mesurable.

#### Cas frontière

`autonome` : OK pour décrire l'agent ("agent autonome"), proscrit en pitch produit ("paiement autonome révolutionnaire" → bannir).

### 5.4 Exemples avant/après

#### Exemple 1 — Hero

| Avant (générique) | Après (DevRefs) |
|---|---|
| "DevRefs : la solution incontournable pour offrir à vos agents IA des données techniques fiables et à jour, dans un format optimisé pour l'IA." | "Ton agent crawle 5 sources HTML pour 2 nombres. `GET /api/llm-prices?model=opus-4.7` → JSON typé en 200 ms, 0,49 € en x402. `dateModified` ISO 8601 inclus." |

#### Exemple 2 — Pricing block

| Avant (SaaS classique) | Après (DevRefs) |
|---|---|
| "Plans flexibles adaptés à vos besoins. Démarrez gratuitement et scalez quand vous le souhaitez." | "0,49 € la query, payée en x402 (USDC Base, settle < 2 s, fee ~$0.0001). Ou 4,99 €/jour Stripe Link, JWT 24 h, unlimited cross-endpoints." |

#### Exemple 3 — Erreur

| Avant (théâtral) | Après (DevRefs) |
|---|---|
| "Oups, quelque chose s'est mal passé. Veuillez réessayer plus tard ou contacter notre équipe." | `{"error": 402, "code": "PAYMENT_REQUIRED", "x402": {"price": "0.49", "currency": "EUR", "facilitator": "coinbase", "asset": "USDC", "network": "base"}, "fallback": "https://buy.stripe.com/..."}` |

---

## 6. Brand Architecture

### 6.1 V1 — Monolithique

Une seule marque, deux endpoints, une landing publique. Pas de sous-marques, pas de produits dérivés.

```
DevRefs (marque unique)
├── /api/llm-prices       (endpoint 1 — pricing 12 modèles)
└── /api/sdk-status       (endpoint 2 — 50 SDKs trackés)
```

### 6.2 Règles d'extension (V2+)

Si bundle élargi (>2 endpoints), conserver l'architecture monolithique avec namespacing par domaine :

```
/api/[domain]              → endpoint racine
/api/[domain]/[ressource]  → endpoint typé (si pertinent)
```

Domaines candidats V2/V3 (déjà identifiés, non implémentés en V1) :
- `/api/openapi-status` — diff schemas OpenAPI populaires
- `/api/spec-diff` — diff specs RFC/W3C
- `/api/model-cards` — fiches techniques modèles (capabilities, context window, vision, tool-use)

**Règle de naming d'endpoint** : kebab-case, nom-de-ressource (jamais verbe), pluriel quand collection. Cohérent avec REST + JSON Schema.

### 6.3 Anti vendor lock-in (préférence fondateur)

Cloudflare Workers/Pages choisis pour le runtime mais NE PAS survendre Cloudflare comme différenciateur dans le copy. Le code Workers est portable (Deno Deploy, Bun, Node) si besoin. x402 est un protocole ouvert (Coinbase + Cloudflare Foundation septembre 2025), pas une dépendance captive. Stripe est en fallback humain, pas en dépendance unique.

---

## 7. Triggers de réévaluation stratégique

Réévaluer le positionnement DevRefs si UN des seuils suivants est atteint :

| Trigger | Seuil | Action |
|---|---|---|
| Nouveau concurrent dominant | Anthropic / OpenAI / Google lance un endpoint pricing-of-models gratuit avec `dateModified` natif et adoption ≥ 5 mentions/jour Perplexity | Rééval pivot — soit super-niche (specs RFC), soit complément (extension catalog), soit pivot vers agents-orchestrators |
| Conversion landing < 2 % | < 2 % visiteurs uniques → premier crawl payant après 3 mois | Rééval messaging hero + clarté tarif. Pas un pivot positionnement. |
| NPS humain superviseur < 30 | Sur 30 répondants Stripe payants minimum | Rééval funnel humain (Stripe Link, JWT durée, dashboard internal) sans toucher au persona agent. |
| Pivot modèle économique | Si volume x402 < 10 % du revenue à M+3 → modèle "0,49 €/query x402" est mort | Rééval : option A bascule full-Stripe (perte différenciation B2A), option B niche super-spécifique (specs OpenAPI uniquement) |
| Kill-switch x402 protocole | Si x402 Foundation se fragmente ou Coinbase retire le facilitator | Rééval : Solana facilitator (cf. solana.com/x402), ou bascule full-Stripe avec API key |
| Saturation entité nommée | Citation Perplexity DevRefs < 1/mois après 6 mois | Rééval naming (cf. section 1) — possibilité d'ajouter un descripteur ("DevRefs Pricing", "DevRefs API") pour augmenter la spécificité de l'entité |

---

## 8. Agents spécialisés recommandés pour ce projet

Le persona principal de DevRefs est non-humain (agent IA autonome). Le standard de validation Gradient impose de tester les livrables avec des agents qui simulent réellement le persona projet ET le persona client-du-persona. Pour DevRefs, cela donne deux agents custom **obligatoires** à créer via @agent-factory **avant Phase 3 (QA + Reviewer)**.

| Agent proposé | Type | Rôle | Justification | Priorité |
|---|---|---|---|---|
| `@testeur-agent-ia` | Testeur persona principal | Incarne un agent IA réaliste (Claude Code / Cursor / AgentKit / Mastra / MCP-host) qui crawle `llms.txt`, détecte HTTP 402, exécute le paiement x402, parse le payload JSON, valide `dateModified`, mesure tokens consommés et latence. Calibre la VALEUR perçue (pas juste la conformité technique). | Persona principal = agent IA. Sans agent testeur incarnant un agent, on valide en théorie. Le standard Gradient (cf. founder-prefs 2026-03-28 Mandataire S7) exige calibration sur la VALEUR : un testeur qui valide le code mais pas la valeur perçue est inutile. | Haute (bloquant Phase 3) |
| `@testeur-developpeur-superviseur` | Testeur persona secondaire | Incarne le dev humain qui voit la facture x402 grimper sur 7+ paiements ce matin et bascule sur Stripe Link 4,99 €/jour (cf. verbatim V4 project-context.md). Calibre la frustration concrète, le ROI temps, l'anxiété budget cloud + IA. Vérifie le funnel humain end-to-end (landing → CTA → Stripe → JWT → unlimited). | Persona secondaire = dev humain. Sans agent testeur incarnant ce dev, on ne valide pas le moment-bascule où l'humain reprend la main. C'est le moment de conversion humain le plus critique du funnel — ne pas le tester serait un angle mort. | Haute (bloquant Phase 3) |

### Specs complémentaires pour @agent-factory

#### `@testeur-agent-ia`

- **Inputs** : URL endpoint à tester, configuration wallet x402 testnet, profil persona principal de personas.md (verbatims V1, V2, V3, V5).
- **Outputs** : rapport gates GP1-GP10 (PASS/FAIL avec évidence), mesures objectives (tokens consommés, latence p95, taille payload, présence `dateModified`, validité JSON-LD), 3 scénarios d'usage simulés (premier crawl, retry-after-error, second crawl 24 h plus tard avec cache check).
- **Critère de succès** : (a) capable de détecter une fausse promesse (ex : copy promet "12 modèles" mais payload n'en contient que 8) → FAIL avec citation exacte, (b) capable de noter "la valeur perçue" pas juste la conformité (ex : payload conforme JSON-Schema mais > 50 KB → FAIL même si techniquement valide).

#### `@testeur-developpeur-superviseur`

- **Inputs** : URL landing publique, lien Stripe Payment Link, profil persona secondaire de personas.md (verbatim V4 + frustrations + critères de décision).
- **Outputs** : rapport gates GC1-GC10, parcours simulé "matinée Thomas avec 7 paiements x402 consécutifs → bascule Stripe Link → vérification JWT 24 h → vérification dashboard interne", verdict sur le moment-bascule (clarté du déclencheur, simplicité du switch, transparence prix).
- **Critère de succès** : (a) capable de signaler "j'ai eu envie de fermer la page" sur la landing si le hero n'est pas convaincant en 5 secondes pour un dev qui a 12 onglets ouverts, (b) capable de simuler un "non" sur le Stripe Link et expliquer pourquoi (anti-vendor lock-in, défiance crypto, manque de garantie de remboursement).

→ **Handoff @agent-factory** : ces 2 agents doivent être créés en Phase 2 (après @copywriter et @design produisent leurs livrables, avant Phase 3 QA), sur la base des specs ci-dessus + de personas.md + de creative-brief.md.

---

## 9. Anti-fausses-promesses (renforcement utilisateur)

Cette section est un garde-fou explicite pour @copywriter et tous les agents aval qui touchent au copy public.

| Règle | Application |
|---|---|
| **Aucune feature non listée dans `Plan d'exécution prévu`** | Le copy ne mentionne JAMAIS : analytics dashboard externe, multi-langue, support API key (autre que JWT post-Stripe), modèles custom, fine-tuning, observabilité, leaderboards subjectifs, comparateur visuel UI, blog éditorial. |
| **Verbatims V1-V5 = scénarios analytiques d'@ia** | Les 5 verbatims project-context.md ne sont PAS des témoignages clients. Aucun copy ne doit les présenter comme tel. Ils servent de matière première pour le copy hero/FAQ, mais reformulés en first-person générique ("ton agent", "un agent qui code"), pas avec un nom de persona fictif. |
| **Conviction-first** | Les CTAs sont en fin de parcours, pas en hero (cf. founder-prefs 2026-03-28 Sarani S8). Hero = naming du problème. Body = preuves. CTA = en bas. |
| **Anti-vendor lock-in** | Ne JAMAIS survendre Cloudflare ou Coinbase comme différenciateur. x402 est un protocole ouvert (Foundation), Cloudflare est un choix d'infra parmi d'autres. Le copy peut mentionner "x402-natif" mais pas "Cloudflare-powered". |
| **Anti-témoignage fictif** | Aucune fausse citation, aucun nom de persona fictif présenté comme client. Si copy a besoin d'une citation, utiliser un verbatim agent en first-person sans attribution nominative. |
| **Zéro promesse temporelle non tenue** | "Cron 6 h" est mesurable. "Mises à jour temps-réel" est faux et interdit. "Données toujours à jour" est flou et interdit (utiliser "fraîcheur signalée par `dateModified` ISO 8601"). |

---

## 10. Synthèse exécutive (pour handoff aval)

| Élément | Décision |
|---|---|
| **Naming** | DevRefs (confirmé) |
| **Domaine** | devrefs.dev (.dev privilégié vs .io) |
| **Catégorie** | Agent-first reference layer for fresh tech data (B2A — Category Design) |
| **Tagline EN** | Fresh. Atomic. Verifiable. Tech refs your agent can trust. |
| **Promesse FR** | Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper. |
| **3 piliers** | Fresh — Atomic — Verifiable |
| **Anti-mots** | Exhaustif — Narratif — Stable (cf. project-context.md) |
| **Persona principal** | Agent IA autonome (Claude Code, Cursor, AgentKit, Mastra, MCP-host) |
| **Persona secondaire** | Dev humain superviseur (verbatim V4) |
| **Frameworks** | Category Design (primaire) + Blue Ocean ERRC (secondaire) + Perceptual Mapping (validation) |
| **Voice traits** | Direct — Technique précis — Agent-first puis humain-supervisable |
| **Brand architecture** | Monolithique V1, namespacing par domaine si extension V2+ |
| **Agents testeurs obligatoires** | @testeur-agent-ia + @testeur-developpeur-superviseur (Phase 2, avant Phase 3) |

---

## Handoff → @orchestrator (puis @copywriter + @design + @growth + @seo + @geo en parallèle Phase 0 wave 2)

- **Fichiers produits** :
  - `/home/user/AI-agents-platform/docs/strategy/brand-platform.md` (ce fichier)
  - `/home/user/AI-agents-platform/docs/strategy/personas.md`
  - `/home/user/AI-agents-platform/docs/strategy/competitive-benchmark.md`
  - `/home/user/AI-agents-platform/docs/strategy/creative-brief.md`
- **Décisions prises** : naming `DevRefs` confirmé, domaine `devrefs.dev` recommandé, catégorie B2A Category Design, 3 piliers Fresh/Atomic/Verifiable, voice 3 traits, 2 agents testeurs obligatoires Phase 2.
- **Points d'attention pour la suite** :
  - Le copy public ne doit JAMAIS mentionner une feature hors `Plan d'exécution prévu` de project-context.md (zéro fausse promesse).
  - Les CTAs en fin de parcours, pas en hero (conviction-first).
  - Tutoyer le dev superviseur, parler à l'agent en first-person générique (pas de nom fictif).
  - Anti-vendor lock-in : ne pas survendre Cloudflare/Coinbase.
  - @design : iconographie agent-first (terminal, JSON, schémas) plutôt qu'humain-first (équipes souriantes, dashboards). Hero exploitable = bloc tool-call JSON V1 project-context.md.
  - @copywriter : reformuler les verbatims V1-V5 en first-person générique sans attribution nominative.
- **Aucune action Replit requise** (livrables docs uniquement).

---

**Auto-évaluation gates BLOQUANT** :
- G5 (persona identique project-context.md) : PASS — agent IA autonome (Claude Code/Cursor/AgentKit/Mastra/MCP-host) cité textuellement
- G7 (0 contradiction livrables amont) : PASS — Fresh/Atomic/Verifiable, mots négatifs, V1-V5, 12 modèles + 50 SDKs alignés project-context.md
- G12 (implémentable sans question) : PASS — chaque section a un livrable concret pour @copywriter/@design/@growth
- G15 (0 placeholder résiduel) : PASS — Grep effectué (cf. handoff agent)
- G17 (pas copiable concurrent) : PASS — verbatims V1-V5, x402-natif, devrefs.dev, persona agent IA spécifiques DevRefs
