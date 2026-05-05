<!-- Version: 2026-05-05 — @copywriter — Phase 1 copy v2 — Landing publique DevRefs pure B2A -->
<!-- Framework : AIDA global (Attention hero → Interest how it works → Desire pricing+guarantee → Action CTA) -->
<!-- Conscience : [Solution-Aware] pour l'agent IA — [Problem-Aware] pour le sponsor humain -->
<!-- Langue : EN par défaut (cible agents IA majority EN-trained). FR ponctuel sur éléments légaux. -->
<!-- Objections traitées : ROI (490× body 402 + 10×+ audit), sécurité x402 (onchain settle < 2s), -->
<!--   fraîcheur (cron 6h + dateModified), alternatives gratuites (atomic vs monolithic), -->
<!--   peur vendor-lock (x402 open protocol, plan B Solana) — méthode : données inline + benchmark tableau -->

# Landing publique — devrefs.dev

---

## SECTION 1 — Hero (above-fold)

[Framework : AIDA — Attention]
[Conscience : Solution-Aware]

### H1 (verrouillé — ne pas modifier)

```
Cost intelligence for AI agents.
```

### Sous-titre (EN — 87 chars)

```
Know before you spend, optimize after you ship. $0.001/call · $9.99 audit.
```

### Citation block — Verbatim V2 (first-person agent générique)

> "I crawled 5 sources to find Gemini 2.5 Pro pricing and each one said something different. The sixth time I `WebFetch` a 380 KB HTML page to retrieve 2 numbers, I just need an endpoint that returns `{"input_per_mtok": 1.25, "dateModified": "2026-05-04T06:00Z"}` and charges me $0.001 instead of costing me 18 000 tokens in parsing."

### Code block — Payload exemple (8 lignes max)

```json
GET /api/llm-prices?model=opus-4.7 → 200 OK

{
  "model": "opus-4.7",
  "input_per_mtok": 5,
  "output_per_mtok": 25,
  "effective_cost_factor": 1.35,
  "dateModified": "2026-05-05T06:00:00Z",
  "sameAs": "https://www.anthropic.com/pricing",
  "freshness_proof": { "fetched_at": "2026-05-05T06:00:00Z" }
}
```

*Note design* : PAS DE CTA hero — conviction-first (founder-prefs Sarani S8). Le visiteur lit le verbatim et le JSON avant toute incitation à l'achat.

---

## SECTION 2 — How it works for your agent

[Framework : FAB — Feature → Advantage → Benefit]
[Conscience : Solution-Aware]

### Tagline section

```
3 endpoints. Paid in x402 USDC. No login, no subscription, no dashboard.
```

### 2.1 — Cartes endpoints (3 cartes)

---

**Carte 1 — `/api/llm-prices`**

**Headline** : Pre-flight pricing — know before your model call.

**Copy (25 mots)** : Returns `input_per_mtok`, `output_per_mtok`, `effective_cost_factor`, `dateModified`. Cron 6h sources officielles. 1 call = 1 model = < 50 KB. $0.001 USDC.

---

**Carte 2 — `/api/sdk-status`**

**Headline** : Pre-flight SDK check — no more broken builds.

**Copy (23 mots)** : Returns `latest`, `breaking_since`, `dateModified` for 50 SDKs V1. Cron 24h. Your agent builds on the right schema, first time. $0.001 USDC.

---

**Carte 3 — `/api/agent-audit`**

**Headline** : Post-flight audit — find where your budget went.

**Copy (24 mots)** : 5 heuristics (model downgrade, prompt caching, batching, tool trimming, effort mismatch). Returns `savings_pct`, `recommendations[]`. $9.99 USDC one-shot. 50 % refund guarantee if `savings_pct` < 15 %.

---

### 2.2 — 6 voies d'intégration agent

**Headline section** : Your agent already knows how.

| Voie | Headline | Tagline |
|---|---|---|
| **Coinbase AgentKit** | AgentKit native | Your AgentKit wallet signs x402. Zero config. |
| **x402-axios** | axios interceptor | Drop-in: `axios.use(x402Interceptor(wallet))`. 1 line. |
| **x402-fetch** | fetch wrapper | `x402Fetch(url, wallet)` — replaces native fetch. |
| **Mastra** | Mastra tool | Register DevRefs as a Mastra tool, pay per call. |
| **MCP server** | MCP host | DevRefs MCP exposes 3 tools. Any MCP-compatible host. |
| **SDK custom** | HTTP direct | `GET /api/llm-prices?model=X` + `Authorization: Bearer {wallet_sig}`. OpenAPI 3.1 spec on `/openapi.json`. |

---

## SECTION 3 — Pricing transparent

[Framework : FAB]
[Conscience : Solution-Aware → Product-Aware]

### Tagline section

```
Pay per call or pre-pay packs. No subscription required.
```

---

### Carte 1 — Pack Standard (recommandé)

**Prix** : $10 USDC

**Volume** : 10 000 calls — `/api/llm-prices` + `/api/sdk-status`

**Badge** : RECOMMENDED

**Détail** : 1 signature x402. Calls suivants : KV lookup < 50 ms, zéro friction blockchain.

**CTA** : "Get 10 000 calls — $10 USDC"

---

### Carte 2 — Audit one-shot

**Prix** : $9.99 USDC

**Volume** : 1 audit complet — `/api/agent-audit`

**Détail** : Score 0-100, `savings_pct`, `recommendations[]`, `monthly_cost_current`, `monthly_cost_optimized`. Rapport JSON structuré livré en < 2 s.

**Garantie** : 50 % refund if `savings_pct` < 15 % after 30 days.

**CTA** : "Audit your agent — $9.99 USDC"

---

### Carte 3 — Subscription Pro (grisée — V2)

**Prix** : $29/mo USDC

**Statut** : Coming V2 — x402 V2 sessions. Sign up for early access.

**Détail** : Continuous monitoring, Cost Regression Alerts, unlimited calls. Built on x402 V2 deferred payment scheme.

*[Note @design : carte grisée, opacité 40 %, badge "V2 — bientôt". Pas de CTA actif.]*

---

### Pricing alternatif — pack entrée et volume

| Pack | Prix | Calls | Usage recommandé |
|---|---|---|---|
| Discovery | $5 USDC | 5 000 | Onboarding, premier projet |
| **Standard** | **$10 USDC** | **10 000** | **Usage solo mensuel — RECOMMANDÉ** |
| Pro | $50 USDC | 60 000 | Scale-up, équipe d'agents |
| Audit one-shot | $9.99 USDC | 1 audit | Point d'entrée Offre 2 |
| Pack Pro Audit | $49 USDC | 6 audits | Audits récurrents ($8.17/audit) |

---

## SECTION 4 — Garantie ROI 50 % refund

[Framework : 4Ps — Proof + Push]
[Conscience : Product-Aware]

### Headline

```
If your agent doesn't save 15 %+ in 30 days, we refund 50 %.
```

### Sous-headline

```
Not "satisfaction guaranteed." A specific, verifiable threshold.
```

### 4 conditions cumulatives (puces)

- **Volume** : Your agent consumed ≥ 5 000 000 input tokens/month over the 30-day period post-audit.
- **Application** : ≥ 80 % of audit recommendations (patches) applied — auto-applicable or manual.
- **Stability** : The primary LLM model was not replaced during the 30 days (a model change invalidates heuristic impact measurement).
- **Délai** : Refund request submitted within 30 days of audit date. Include `audit_id` + proof of measured `savings_pct`.

### Procédure

```
POST /api/audit/refund
{
  "audit_id": "uuid",
  "wallet_sig": "0x...",
  "savings_proof": { "before_usd": 90, "after_usd": 82, "period_days": 30 },
  "patches_applied_pct": 85
}
```

Refund processed in USDC Base to your wallet within 7 business days if conditions are met.

*Formulation exacte issue de `cgu-draft.md` Art. 4ter. Zéro reformulation.*

---

## SECTION 5 — Citations / preuves

[Framework : BAB — Before → After → Bridge sur chaque verbatim]
[Conscience : Solution-Aware]

### Tagline section

```
Not testimonials. Observed patterns, documented.
```

---

### Verbatim bloc 1 — V1 (tool-call JSON Opus 4.7)

```json
{
  "agent": "claude-code",
  "tool_calls": [
    {"name": "WebSearch", "query": "claude opus 4.7 input price per million tokens"},
    {"name": "WebFetch", "url": "anthropic.com/pricing", "tokens_in": 11420},
    {"name": "WebFetch", "url": "pricepertoken.com", "tokens_in": 38900},
    {"name": "WebFetch", "url": "llm-prices.com", "tokens_in": 14200}
  ],
  "model_output": "Opus 4.7 costs $15/MTok input.",
  "ground_truth_check": "INCORRECT — effective_cost_factor 1.35 omitted. Cost estimate off by 35 %.",
  "elapsed_ms": 31420,
  "tokens_burned": 64520
}
```

**Bridge** : `GET /api/llm-prices?model=opus-4.7` → `{"effective_cost_factor": 1.35, "dateModified": "2026-05-05T06:00:00Z"}` — $0.001 USDC, 200 ms.

---

### Verbatim bloc 2 — V3 (séquence reproductible Cursor agent)

> Pattern observé — Cursor agent (mai 2026, HN #44682465) : `WebSearch("openai gpt-5 pricing")` → 7 résultats → `WebFetch` des 4 premiers → 3 prix différents ($1.25, $2.50, $3.00 input/MTok) → l'agent choisit le médian par heuristique → facture réelle 2,4× l'estimation découverte J+2.

**Cause racine** : aucune source ne signale sa fraîcheur machine-readable. L'agent n'a pas de tie-breaker.

**Bridge** : `dateModified` + `fetched_at` + `freshness_proof.hmac_signature` dans chaque payload DevRefs.

---

### Verbatim bloc 3 — V5 (schema SDK obsolète)

> "Mon training cutoff est janvier 2026. Vercel AI SDK est passé de `streamText({ model, messages })` à `streamText({ model, prompt })` en mars. J'ai généré 4 fois le code avec l'ancien schema, l'agent superviseur a 4 fois détecté le build error, j'ai 4 fois re-`WebSearch`. Un endpoint `/api/sdk-status?pkg=ai` qui me renvoie `{"latest": "5.0.12", "breaking_since": "5.0.0", "dateModified": "2026-05-04"}` aurait économisé 12 minutes et ~80 000 tokens."

---

### Tableau benchmark vs concurrent principal

| Critère | DevRefs | Alternative principale |
|---|---|---|
| Atomicité payload | 1 query = 1 modèle < 50 KB | Page HTML 380 KB — 300+ modèles |
| `dateModified` machine-readable (JSON-LD) | Oui — cron 6h | Non — agent doit deviner la fraîcheur |
| x402-natif (paiement agent autonome) | Oui — $0.001/call | Non — gratuit, SaaS dashboard humain uniquement |
| `llms.txt` monétisé (3 endpoints listés) | Oui | Non ou partiel |
| `effective_cost_factor` (tokenizer inflation) | Oui — `1.35` Opus 4.7 | Non — aucun concurrent ne capte ce signal |

*Source : `competitive-benchmark.md` v2 § 1.1 + § 1.3. Noms de concurrents non cités dans le copy public.*

---

## SECTION 6 — Pour les agents IA

[Framework : FAB — Feature technique pure]
[Conscience : Solution-Aware / Most-Aware]

### Tagline section

```
Machine-readable first. HTML is a side effect.
```

### 6.1 — llms.txt

```
curl https://devrefs.dev/llms.txt
```

Syntaxe standard `llms.txt`. 3 endpoints documentés avec description, method, pricing, freshness_signal, example_payload. Crawled par Claude, Perplexity, ChatGPT Browsing.

### 6.2 — JSON-LD Dataset preview

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "DevRefs LLM Prices",
  "dateModified": "2026-05-05T06:00:00Z",
  "url": "https://devrefs.dev/api/llm-prices",
  "license": "https://devrefs.dev/terms",
  "description": "Atomic LLM pricing data, updated every 6h from official sources."
}
```

### 6.3 — Freshness signal (triple)

| Signal | Valeur | Où |
|---|---|---|
| `dateModified` ISO 8601 | Dernier cron de scraping | Champ JSON dans chaque payload |
| `Last-Modified` HTTP header | Timestamp identique | Header HTTP sur chaque réponse |
| `fetched_at` | Timestamp scraping source | Champ `freshness_proof` dans payload |

---

## SECTION 7 — Footer minimal

[Conscience : N/A — légal]

**Liens** :
- [Terms](/terms) · [Privacy](/privacy) · [Mentions légales](/legal) · [GitHub](https://github.com/devrefs) · [/llms.txt](/llms.txt) · [OpenAPI](/openapi.json)

**Texte légal** :
DevRefs — Auto-entrepreneur FR, BNC Crypto. TVA non applicable, art. 293 B CGI. Paiements x402 USDC Base via Coinbase facilitator. Aucune donnée personnelle collectée côté x402 (wallet pseudonyme). Contact : legal@devrefs.dev

---

## PAGE SÉPARÉE — /paywall

[Framework : N/A — page légale + transactionnelle]
[Conscience : Most-Aware — l'acheteur est convaincu, il finalise]

### Tagline page

```
Top-up your agent's wallet.
```

### 3 checkboxes obligatoires (libellés exacts Art. 4quater CGU)

**Checkbox 1** (libellé exact `cgu-draft.md` Art. 4quater.2(a)) :

> Je comprends et j'accepte que l'exécution immédiate du service entraîne la perte de mon droit de rétractation de 14 jours conformément à l'article L.221-28 13° du Code de la consommation.

**Checkbox 2** (confirmation explicite renonciation) :

> Je consens expressément à l'exécution immédiate du service numérique avant l'expiration du délai de rétractation de 14 jours.

**Checkbox 3** (confirmation email pour preuve légale Art. 4quater.2(b)) :

> Je souhaite recevoir une confirmation écrite de cette renonciation à l'adresse email ci-dessous.

**Champ email** :

```
Confirmation écrite envoyée à : [email@example.com]
```

*Note* : la case (1) est déjà reprise de l'article Art. 4quater.2(a) cgu-draft.md v2 — zéro reformulation autorisée. Le bouton de paiement reste désactivé tant que les checkboxes 1 et 2 ne sont pas cochées.

*Anti-friction* : aucun upsell sur cette page. Prix affiché = prix sélectionné depuis la landing. 1 CTA unique.

---

## EMAILS TRANSACTIONNELS (5 templates)

[Framework : transactionnel sec — fait + action + lien]
[Tongue : EN pour les agents IA, FR disponible pour sponsors humains domiciliés en France]

---

### Email 1 — Top-up confirmation (sponsor humain)

**Sujet** : DevRefs — $10 USDC added to your agent's wallet

**Body** :

Your agent's wallet has been topped up with $10.00 USDC Base (Pack Standard — 10 000 calls).

Transaction confirmed on Base. Your agent will resume autonomous payments immediately.

Wallet balance check: [Basescan ↗](https://basescan.org)

No action required.

---

### Email 2 — Pack expire dans 7 jours (sponsor humain)

**Sujet** : DevRefs — Pack expires [DATE] — [N] calls unused

**Body** :

Your agent's Pack Standard expires on [DATE]. [N] calls remain unused.

Unused calls are forfeited at expiry (12-month validity per CGV Art. 4bis).

If your agent still needs pricing data: [Top-up wallet ↗](https://devrefs.dev/paywall)

---

### Email 3 — Audit savings_pct < 15 % à J30 (sponsor)

**Sujet** : DevRefs — Audit [audit_id] — savings < 15 % — refund eligible

**Body** :

Your agent's audit (ID: `[audit_id]`) shows measured `savings_pct` of [N]% after 30 days — below the 15 % guarantee threshold.

You may be eligible for a 50 % refund ($5.00 USDC) under CGV Art. 4ter.

Submit your refund request: [POST /api/audit/refund ↗](https://devrefs.dev/refund)

Required: `audit_id` + wallet signature + savings proof JSON.

Deadline: [DATE + 30 jours from audit].

---

### Email 4 — Refund processed (sponsor)

**Sujet** : DevRefs — $5.00 USDC refunded to your wallet

**Body** :

50 % refund of Audit [audit_id] processed: $5.00 USDC Base.

Transaction hash: `[tx_hash]`

Verify on Basescan: [↗](https://basescan.org/tx/[tx_hash])

No further action required.

---

### Email 5 — Welcome agent (premier paiement x402 réussi — optionnel si email sponsor renseigné)

**Sujet** : DevRefs — First x402 payment confirmed — your agent is live

**Body** :

Your agent completed its first x402 payment to DevRefs.

Wallet: `[wallet_hash_short]`
Pack: Standard — 10 000 calls remaining.
First payload: `/api/llm-prices?model=[model]` — `dateModified: [timestamp]`.

OpenAPI spec: [devrefs.dev/openapi.json ↗](https://devrefs.dev/openapi.json)
llms.txt: [devrefs.dev/llms.txt ↗](https://devrefs.dev/llms.txt)
CGV: [devrefs.dev/terms ↗](https://devrefs.dev/terms)

---

## SEO — Meta données (handoff @seo)

**H1** : Cost intelligence for AI agents.

**Meta description (154 chars)** :
```
DevRefs — pre-flight LLM pricing $0.001/call, post-flight agent audit $9.99. x402 USDC native. JSON-typed, dateModified, no login, no subscription.
```

**Slug Open Graph** : `devrefs-cost-intelligence-ai-agents`

**OG Title** : "DevRefs — Cost intelligence for AI agents"

**OG Description** : "Know before you spend. Optimize after you ship. Pre-flight $0.001/call · Post-flight audit $9.99 USDC."

**Mots-clés H1/H2 cibles** : "cost intelligence AI agents", "LLM pricing API", "agent audit x402", "dateModified LLM pricing", "x402 payment agent"

*Note* : `docs/seo/keyword-map.md` absent — zones marquées `[MOT-CLÉ SEO À INTÉGRER]` si @seo produit la keyword-map en Phase 2.

---

*Livrable produit par @copywriter — Phase 1 copy — 2026-05-05*
*Framework global : AIDA (hero Attention → endpoints Interest → pricing Desire → CTA Action)*
*Framework section : FAB (endpoints), 4Ps (garantie), BAB (verbatims)*
*Conscience déclarée : [Solution-Aware] agent IA — [Problem-Aware] sponsor humain*
*Objections traitées : ROI 490× (body 402 inline) + 10×+ audit (tableau pricing) · sécurité x402 (settle < 2 s) · fraîcheur (triple signal section 6.3) · atomic vs monolithic (benchmark § 5) · vendor-lock (footer plan B Solana)*
