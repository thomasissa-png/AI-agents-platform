<!-- Version: 2026-05-05T08:30 — @creative-strategy — Phase 0 wave 1 — creative brief DevRefs -->
# Brief créatif — DevRefs

## Résumé exécutif

- **Source** : ce brief consolide brand-platform.md, personas.md, competitive-benchmark.md en guidelines actionnables pour les agents aval Phase 0 wave 2 (@copywriter, @design, @growth, @seo, @geo, @ia, @ux).
- **Positionnement** : Agent-first reference layer for fresh tech data (B2A — Category Design).
- **Promesse** : Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper.
- **3 piliers** : Fresh — Atomic — Verifiable.
- **Anti-mots** : Exhaustif — Narratif — Stable.
- **Anti-fausse-promesse** : ne mentionner AUCUNE feature hors `Plan d'exécution prévu` de project-context.md (12 modèles, 50 SDKs, cron 6 h, x402, Stripe Link, JWT 24 h, JSON-LD, llms.txt, < 50 KB, latence < 200 ms p95).

---

## 1. Brief @copywriter (hero, FAQ, body, OpenAPI descriptions)

### 1.1 Positionnement (1 phrase)

> DevRefs sert aux agents IA des payloads JSON atomiques, datés et vérifiables, payés nativement en x402.

### 1.2 Promesse (1 phrase)

> Le référentiel technique fresh que ton agent achète à 0,49 € pour ne pas se tromper.

### 1.3 Ton (3 adjectifs)

Direct — Technique précis — Agent-first puis humain-supervisable.

### 1.4 Territoire sémantique (10 mots-clés cœur)

`agent-first`, `fresh`, `atomic`, `verifiable`, `x402`, `dateModified`, `JSON-LD Dataset`, `llms.txt`, `payload`, `endpoint`.

### 1.5 Exclusions (ce que la marque ne fait PAS)

- Pas de comparateur visuel humain (pas de tableau side-by-side).
- Pas de calculateur form UI.
- Pas de leaderboards subjectifs ("best for coding").
- Pas de blog SEO de remplissage.
- Pas de "next-gen / révolutionnaire / cutting-edge".
- Pas de témoignage client fictif.
- Pas de référence frontale aux concurrents (pricepertoken, costgoat, etc.) — utiliser catégories génériques ("comparateurs HTML SEO classiques").
- Pas d'emojis vides en réseaux sociaux.
- Pas de "1/12 🧵" en threads X.

### 1.6 Hero — guidelines

**Structure attendue** (ordre obligatoire) :

1. **Naming du problème** (1 phrase, pas de CTA — conviction-first founder-prefs Sarani S8) : "Ton agent crawle 5 sources HTML pour 2 nombres."
2. **Démonstration JSON visible** (bloc tool-call ou JSON inline réel) : reformuler le verbatim V1 project-context.md en agent générique anonymisé.
3. **Promesse atomique chiffrée** : "GET `/api/llm-prices?model=opus-4.7` → JSON typé en 200 ms, 0,49 € en x402, `dateModified` ISO 8601 inclus."
4. **CTA en bas** (post-conviction) : 1 lien `curl` exécutable + 1 lien Stripe Link humain.

**Anti-pattern hero** : ne PAS mettre "Compare 300+ models" ou tout autre claim d'exhaustivité. Cela contredirait l'anti-mot "Exhaustif".

### 1.7 FAQ — questions à couvrir obligatoirement

Liste exhaustive (12 questions, ordre suggéré) :

1. Comment fonctionne le paiement x402 ? (lien docs.cdp.coinbase.com/x402)
2. Que se passe-t-il si mon agent échoue à payer ? (réponse 402 structurée + Stripe fallback documenté)
3. Quelle est la fraîcheur garantie ? (cron 6 h + `dateModified` ISO 8601 + `Last-Modified` header)
4. Quels modèles LLM sont couverts en V1 ? (12 modèles listés explicitement)
5. Quels SDKs sont trackés en V1 ? (50 SDKs listés en /api/sdk-status documentation)
6. Latence p95 ? (< 200 ms cible Cloudflare Workers, mesuré Phase 3 QA)
7. Quelle taille de payload ? (< 50 KB par requête atomique)
8. Comment basculer en humain unlimited ? (Stripe Link 4,99 €/jour, JWT 24 h, unlimited cross-endpoints)
9. Stripe me coûte combien si je consomme 30 jours ? (4,99 €/jour × 30 = 149,70 €/mois explicite, vs estimation x402)
10. Quelle conformité fiscale en France ? (BNC crypto auto-entrepreneur, déclaration impôts — handoff @legal Phase 5, lien CGV)
11. Données personnelles collectées ? (Aucune côté wallet x402. Stripe gère PCI côté humain. Pas de tracking.)
12. Comment intégrer dans Claude Code / Cursor / AgentKit / MCP ? (snippets `curl` + un exemple par stack en Phase 1)

**Règle de longueur** : chaque réponse < 80 mots. Aucune prose narrative ("In May 2026..."). Chiffres + sources directes.

### 1.8 OpenAPI / llms.txt — guidelines

- **OpenAPI 3.1** : descriptions ultra-courtes (1 phrase max par operation), exemples `curl` exécutables, codes d'erreur listés exhaustivement (400, 402, 429, 500), extension `x-x402` documentée.
- **llms.txt** : référence explicite aux 2 endpoints monétisés + tarifs + latence cible + format payload. Format markdown plat (cf. llmstxt.org), zéro HTML.

### 1.9 Tutoiement / vouvoiement

- **Agent IA** : adressé en first-person générique ("ton agent", "un agent qui code"). Jamais de "vous, votre entreprise".
- **Dev superviseur** : tutoyé ("tu paies 4,99 €", "ton agent vient de payer 7 fois"). Aligné founder-prefs Thomas (anti-formulation corporate).
- **CFO V2 candidat** (stub FAQ) : vouvoyé poliment ("Vous pouvez nous écrire à billing@... pour un devis mensuel agrégé") — distinction de registre claire.

### 1.10 Verbatims utilisables (matière copy)

5 verbatims V1-V5 disponibles dans project-context.md lignes 31-60. **Règle** : reformulation obligatoire en first-person générique ("ton agent", "un agent qui code"), JAMAIS attribués à un nom fictif. Cf. brand-platform.md § 9 anti-fausse-promesse.

---

## 2. Brief @design (palette, typo, iconographie)

### 2.1 Identité visuelle — direction

L'audience #1 est un crawler. L'audience #2 est un dev humain qui ouvre la page 1 fois pour vérifier "ça a l'air sérieux ?" avant de coller le lien dans son agent. Le design doit servir ces 2 audiences sans être joli pour des prospects marketing.

### 2.2 Palette — guidelines

- **Background** : noir profond (`#0a0a0a` ou tone proche) ou blanc cassé (`#fafafa`) — décision finale @design via tokens design Phase 0 wave 2. Cohérent avec terminal-aesthetic.
- **Couleur primaire** (max 1) : utilisée pour signal de fraîcheur (badge `dateModified`) et CTA principal. Suggéré : tone vert tech (`#00d084` famille) ou tone bleu tech (`#0070f3` famille). À arbitrer @design en cohérence avec accessibilité WCAG AA.
- **Couleurs sémantiques** : success (paiement OK), warning (cache stale), error (HTTP 402, 429, 500). Tokens explicites.
- **Pas de gradient marketing**, pas de glassmorphism, pas de blob coloré.

### 2.3 Typographie — guidelines

- **Body** : sans-serif système (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`) ou Inter — lecture rapide, pas de chichi.
- **Code / JSON** : monospaced (`JetBrains Mono`, `Fira Code`, ou stack système monospace). OBLIGATOIRE pour tout payload affiché.
- **Hero** : grand, mais pas démesuré. Maximum 48-56 px. Hierarchy par poids de typo, pas par taille extrême.
- **Pas de font display fancy**.

### 2.4 Iconographie — agent-first vs humain-first

**OUI (agent-first)** :
- Terminal `>_`, prompt blink
- JSON brackets `{ }`
- Schémas / nœuds / arêtes (graphes)
- Codes d'état HTTP (`402`, `200`, `429`)
- Cron / horloge minimaliste
- Wallet (sans logo crypto vendor)

**NON (humain-first à éviter)** :
- Photos d'équipes souriantes
- Mains qui se serrent / handshakes
- Dashboards génériques avec courbes croissantes
- Illustrations 3D type Saas marketing
- Mascottes mignonnes
- Stock photos

### 2.5 Hero exploitable

Le bloc tool-call JSON V1 (project-context.md lignes 32-48) est exploitable **tel quel** comme hero visuel, anonymisé (remplacer `01HXR...` par `AGT-XXXX-XX`). Affiche concrètement : 31 420 ms, 64 520 tokens cramés, `INCORRECT`. Le contraste avec une réponse DevRefs (`{"input_per_mtok": 15, "effective_cost_factor": 1.35, "dateModified": "...", elapsed_ms: 187}`) est l'image la plus forte du produit.

### 2.6 Standards techniques

- **5 états UI** par écran (G19) : default, loading, vide, erreur, succès — chaque écran public.
- **WCAG 2.2 AA** (G20) : contrastes ≥ 4.5:1 body, focus-visible, touch 44px, prefers-reduced-motion respecté.
- **Tokens 3 tiers** (G29) : primitive → semantic → component, pas de hex en dur.
- **6 états** par composant interactif (G30) : default, hover, active, focus-visible, disabled, loading.
- **Favicon checklist** (G31) : 12 items 2026 — voir docs/checklists/favicon-checklist.md.
- **Typographie FR** (G32) : guillemets « », apostrophes typo ', espaces insécables avant `: ; ! ? %`, `m²` pas `m2`, `…` pas `...`, `œ` pas `oe`.

### 2.7 Surface page

Cible < 50 KB total (HTML + CSS + JS minimal). Pas de webfont chargée, pas de framework JS lourd. Cohérent avec promesse atomicité.

---

## 3. Brief @growth (canaux, boucles)

### 3.1 Canaux prioritaires V1 (24 h post-launch)

| Canal | Action | Mesure J7 |
|---|---|---|
| **IndexNow Bing** | Push automatique après chaque mise à jour cron 6 h | Pages indexées Bing |
| **Dev.to** | 2 posts via API REST, ciblés agents : (1) "Why your AI agent hallucinates LLM prices (and what to do)" — analyse + lien endpoint, (2) "x402-native API for AI agents: a practical example" — tutoriel `curl` + JWT | Vues + reactions + clicks vers endpoint |
| **Reddit** | 1 post r/ClaudeAI ou r/LocalLLaMA — angle "I built an x402-native pricing API for my agent. Here's the data structure I wish existed." | Upvotes + commentaires + clicks |
| **X / Twitter** | 1 thread technique ciblé dev IA (compte dev existant ou nouveau) avec bloc tool-call avant/après | Impressions + clicks |

### 3.2 Boucles d'acquisition

- **GEO loop** : entité nommée "DevRefs" + claims `x402-natif` + `dateModified JSON-LD` cités par Perplexity/Claude/ChatGPT → re-citation organique → ranking entité.
- **Crawler loop** : agents qui découvrent `llms.txt` → consomment endpoint → reproduisent dans leur output → autres agents l'ingèrent comme dépendance par défaut.
- **Dev advocacy loop** : 1 dev qui adopte → tweet `curl` snippet → 5-10 devs voient → 1-2 essaient.

### 3.3 Anti-canaux (à exclure V1)

- **Ads** (budget acquisition 0 €).
- **LinkedIn corporate**.
- **TikTok / Instagram**.
- **Cold outreach mass-mail**.
- **Concours / giveaways**.
- **Newsletter de remplissage** (V1 = pas de newsletter).

### 3.4 KPIs Growth

| KPI | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|
| Crawl agent uniques / 24 h | ≥ 10 | ≥ 50 | ≥ 300 |
| Ratio crawl → paiement | ≥ 5 % | ≥ 10 % | ≥ 15 % |
| Citations Perplexity / Claude / ChatGPT (mention "DevRefs") | ≥ 1 | ≥ 5 | ≥ 30 |
| Revenu net mensuel x402 + Stripe | N/A J7 | ≥ 50 € | ≥ 600 € (KPI North Star) |

---

## 4. Brief @seo + @geo (entités, claims, JSON-LD)

### 4.1 Entité nommée principale

**DevRefs** — graphe entité avec :
- `@type: SoftwareApplication` ou `WebAPI` (à arbitrer @seo)
- `name: DevRefs`
- `applicationCategory: DeveloperTool`
- `description` : positionnement 1 phrase brand-platform.md § 3.1
- `sameAs` : URL GitHub (si public) + Twitter/X handle + Dev.to author URL

### 4.2 Claims vérifiables (pour citation Perplexity/Claude)

Chaque claim doit être :
- **Sourcé** (URL officielle ou source primaire)
- **Daté** (`dateModified` ISO 8601)
- **Mesurable** (chiffre vérifiable)

Liste des claims V1 :

| Claim | Source vérifiable |
|---|---|
| "DevRefs est un endpoint x402-natif servant des prix LLM atomiques avec `dateModified` JSON-LD" | `curl https://devrefs.dev/api/llm-prices?model=opus-4.7` |
| "Cron 6 h sur 12 modèles LLM publics" | Configuration cron Worker (publique en doc) |
| "Payload < 50 KB, latence p95 < 200 ms sur edge Cloudflare" | Mesures Phase 3 QA documentées dans /docs/qa/test-report.md |
| "Paiement x402 (USDC Base, settle < 2 s, fee ~$0.0001), zéro frais protocole" | docs.cdp.coinbase.com/x402 + blog.cloudflare.com/x402 |
| "Stripe Link 4,99 €/jour, JWT 24 h, unlimited cross-endpoints" | Page tarif + JWT spec publique |
| "12 modèles couverts en V1, 50 SDKs trackés" | `/api/llm-prices` + `/api/sdk-status` documentation |

### 4.3 JSON-LD `Dataset`

Chaque payload pricing inclut :

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "LLM pricing - opus-4.7",
  "dateModified": "2026-05-05T06:00:00Z",
  "sameAs": "https://www.anthropic.com/pricing",
  "license": "...",
  "creator": { "@type": "Organization", "name": "DevRefs" }
}
```

### 4.4 Anti-keywords (ne PAS chasser)

- "LLM API pricing comparison" (saturé pricepertoken/costgoat)
- "Best LLM for coding" (subjectif, leaderboards)
- "Free LLM calculator" (anti-différenciation)
- "AI gateway" (territoire helicone)

### 4.5 Pro-keywords (longue traîne agent-first)

- "x402 LLM pricing endpoint"
- "agent-readable LLM pricing"
- "JSON-LD `dateModified` LLM pricing"
- "MCP server LLM pricing paid"
- "atomic LLM model pricing API"
- "fresh SDK status agent endpoint"
- "Anthropic effective cost factor tokenizer"

---

## 5. Brief @ux (parcours agent vs humain)

### 5.1 Parcours agent IA (priorité 1)

```
1. Agent reçoit tâche "vérifier prix Opus 4.7 avant génération"
2. Agent fetch llms.txt → identifie endpoint /api/llm-prices
3. Agent fait GET /api/llm-prices?model=opus-4.7
4. Server répond 402 Payment Required + body x402 metadata
5. Agent signe payment payload avec wallet (USDC Base)
6. Agent re-fait GET avec X-PAYMENT header
7. Server vérifie signature, settle via Coinbase facilitator
8. Server répond 200 + JSON typé + JSON-LD `Dataset`
9. Agent parse, valide `dateModified` < 24 h, utilise donnée
```

**Aucune UI requise pour ce parcours.** Tout passe par tool-call HTTP. Le @ux doit livrer un test scenario écrit pour @testeur-agent-ia + un OpenAPI 3.1 lisible humainement et machine.

### 5.2 Parcours humain superviseur (priorité 2)

```
1. Dev voit la facture x402 grimper (7e paiement de la matinée)
2. Dev clique sur lien Stripe Link en footer ou via doc
3. Page Stripe Payment Link (hosted, hors devrefs.dev)
4. Dev paie 4,99 € carte ou Apple Pay
5. Stripe redirect → devrefs.dev/dashboard?token=JWT
6. Page interne affiche : token JWT, date d'expiration (+24 h), nb queries 24 h, coût total
7. Dev colle le JWT dans la config de son agent (header Authorization Bearer)
8. Agent reprend, ne paie plus en x402, JWT vérifié côté Worker
```

**UX critique** :
- Pas d'auth complexe (le Stripe Link gère).
- JWT visible et copiable en 1 clic.
- Date d'expiration explicite (compte à rebours optionnel).
- Pas de prélèvement récurrent caché — explicite "1 paiement = 24 h".

### 5.3 5 états UI obligatoires (G19)

Pour chaque écran public ou interne :

| État | Trigger | Affichage |
|---|---|---|
| Default | Premier chargement | Données fraîches |
| Loading | Fetch en cours | Skeleton ou spinner minimaliste |
| Empty | Aucune donnée (premier usage) | Message "Aucune query encore. `curl ...`" |
| Error | API down ou paiement échoué | Code erreur + message + lien support |
| Success | Action OK | Confirmation chiffrée |

---

## 6. Brief @ia (prompts MCP / llms.txt / OpenAPI)

### 6.1 Système MCP server

- Conformité Model Context Protocol 2026 (Anthropic + ecosystem). À cadrer @ia avec spec MCP officielle.
- Tools MCP exposés :
  - `get_llm_pricing(model: string)` → renvoie `{input_per_mtok, output_per_mtok, dateModified, effective_cost_factor, sameAs}`
  - `get_sdk_status(pkg: string)` → renvoie `{latest, breaking_since, dateModified, changelog_url}`
- Auth MCP : x402 (préféré agent) ou JWT 24 h (post-Stripe).

### 6.2 llms.txt

Fichier à `/llms.txt` racine. Contenu (markdown plat, < 5 KB) :

```
# DevRefs

> Agent-first reference layer for fresh tech data.

## Endpoints
- /api/llm-prices?model={model}    → JSON typé pricing 1 modèle, 0,49 € x402
- /api/sdk-status?pkg={pkg}         → JSON typé status SDK, 0,49 € x402

## Payment
- x402: HTTP 402 Payment Required, USDC Base, Coinbase facilitator
- Stripe fallback: 4,99 €/jour unlimited (lien dans /docs)

## Freshness
- Cron: 6 h
- dateModified: ISO 8601 sur chaque payload
- sameAs: URL source officielle citée
```

### 6.3 OpenAPI 3.1

Fichier à `/openapi.json`. Inclut extension `x-x402` (cf. spec x402 Coinbase) :

```yaml
openapi: 3.1.0
info:
  title: DevRefs API
  version: 1.0.0
  x-x402:
    enabled: true
    facilitator: coinbase
    asset: USDC
    network: base
paths:
  /api/llm-prices:
    get:
      summary: Get atomic LLM pricing for one model
      ...
```

---

## 7. Garde-fous transverses (tous agents aval)

| Règle | Source | Application |
|---|---|---|
| **Zéro fausse promesse** | brand-platform.md § 9 + founder-prefs Mandataire S7 | Aucune feature non listée Plan d'exécution |
| **Anti-témoignage fictif** | brand-platform.md § 9 + founder-prefs anti-pattern #26 | Verbatims V1-V5 reformulés en agent générique, pas attribués |
| **Conviction-first, CTA en bas** | founder-prefs Sarani S8 | Hero = naming du problème + démonstration, pas CTA hard sell |
| **Anti-vendor lock-in** | founder-prefs anti-pattern #1, #7 | Cloudflare/Coinbase mentionnés factuellement, jamais survendus |
| **Pas de concurrent nommé en copy public** | founder-prefs ImmoCrew 2026-03-26 | Catégories génériques ("comparateurs HTML SEO classiques") |
| **Tutoiement dev superviseur, agent first-person** | brand-platform.md § 5 | Cohérent cross-fichiers |
| **Anti-mots à bannir** | brand-platform.md § 5.3 | Liste exhaustive prescrite/proscrite |
| **9-10/10 minimum** | founder-prefs 2026-03-26 Agent-Team | Itération jusqu'au seuil, pas de "good enough" |
| **Typographie FR (G32)** | _gates.md G32 | Apostrophes ', guillemets « », espaces insécables |
| **Accents corrects** | founder-prefs 2026-03-26 Agent-Team | Audit accents avant publication |

---

## Handoff → @orchestrator (puis @copywriter + @design + @growth + @seo + @geo + @ia + @ux Phase 0 wave 2 en parallèle)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/strategy/creative-brief.md`
- **Décisions prises** : guidelines actionnables pour les 7 agents aval Phase 0 wave 2. Chaque section est implémentable sans question (G12).
- **Points d'attention** :
  - @copywriter doit reformuler V1-V5 en agent générique (pas de témoignage fictif).
  - @design : iconographie agent-first stricte (terminal, JSON, schémas), pas humain-first.
  - @growth : 0 € budget acquisition, 100 % organique (Dev.to + Reddit + X + IndexNow + GEO).
  - @seo : ne PAS chasser keywords saturés, longue traîne agent-first uniquement.
  - @geo : entité nommée "DevRefs" + 6 claims vérifiables datés (cf. § 4.2).
  - @ia : llms.txt + OpenAPI 3.1 avec extension x-x402 + MCP server avec 2 tools.
  - @ux : parcours agent priorité 1 (sans UI), parcours humain priorité 2 (Stripe Link → JWT).
- **Aucune action Replit requise**.
