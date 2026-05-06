# SEO Audit — DevRefs

<!-- @seo — Phase 3 visibilité — 2026-05-06 -->
<!-- Stack : HTML statique sur Cloudflare Pages + Workers. Pas de Next.js. -->

---

## §1 — Audit technique (5 axes)

### 1.1 Meta tags

| Page           | Axe                  | Statut  | Constat                                                                                                                                                                                                          |
| -------------- | -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `/` (landing)  | title                | PASS    | "DevRefs — Cost intelligence for AI agents" — 47 chars, keyword exact en position 2                                                                                                                              |
| `/` (landing)  | description          | PARTIAL | 155 chars OK. Contient le prix ($0.001) et x402 — pertinent. Manque le mot-clé "LLM pricing" explicitement.                                                                                                      |
| `/` (landing)  | canonical            | PASS    | `<link rel="canonical" href="https://devrefs.dev/">` présent, absolu, cohérent avec sitemap                                                                                                                      |
| `/` (landing)  | og:image             | PARTIAL | `og:image` pointe sur `https://devrefs.dev/og/og-image.png` — URL correcte mais image non vérifiable en preview (domaine non live). Dimensions 1200x630 à confirmer.                                             |
| `/` (landing)  | og:description       | FAIL    | `og:description` = "Know before you spend. Optimize after you ship. Pre-flight $0.001/call · Post-flight audit $9.99 USDC." — trop court, ne contient pas "LLM pricing" ni "AI agent"                            |
| `/` (landing)  | twitter:description  | FAIL    | Identique og:description, 60 chars — trop court pour Twitter card summary_large_image (recommandé : 150-200 chars)                                                                                               |
| `/` (landing)  | robots meta          | PASS    | `index,follow` correct                                                                                                                                                                                           |
| `/` (landing)  | lang                 | PASS    | `lang="en"` correct (audience EN-first)                                                                                                                                                                          |
| `/llm-prices/` | title                | PASS    | "LLM Pricing 2026 — Updated every 6 hours from official sources                                                                                                                                                  | DevRefs" — excellent, keyword exact "LLM Pricing 2026" en position 1 |
| `/llm-prices/` | description          | FAIL    | COPIE de la meta description de la landing — texte identique. Cannibalisation : même description sur 2 URLs distinctes = signal de duplicate meta pour Google et Bing. Doit être unique et spécifique à la page. |
| `/llm-prices/` | og:description       | FAIL    | Absent — balise `og:description` manquante sur /llm-prices/                                                                                                                                                      |
| `/llm-prices/` | twitter:description  | FAIL    | Absent — balise `twitter:description` manquante sur /llm-prices/                                                                                                                                                 |
| `/llm-prices/` | favicon complet      | FAIL    | Seulement `favicon.ico` + `manifest.webmanifest` — manque `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`, `safari-pinned-tab.svg`                                                              |
| `/paywall/`    | robots               | PASS    | `noindex,follow` correct — page exclue de l'index                                                                                                                                                                |
| `/paywall/`    | canonical            | FAIL    | Canonical absent sur /paywall/ — Bing bloque les pages sans canonical explicite même en noindex                                                                                                                  |
| `/dashboard/`  | robots               | PASS    | `noindex,nofollow` correct — page exclue et liens non suivis                                                                                                                                                     |
| `/dashboard/`  | canonical            | FAIL    | Canonical absent sur /dashboard/                                                                                                                                                                                 |
| Toutes pages   | Organization JSON-LD | FAIL    | Aucun schema `Organization` sur la landing (requis pour Knowledge Panel Google). Présent seulement en `creator` imbriqué dans le Dataset /llm-prices/                                                            |
| `/` (landing)  | JSON-LD              | FAIL    | Aucun JSON-LD sur la landing. Pas de schema Organization, WebSite, ni SoftwareApplication                                                                                                                        |

**Score méta tags : 7 PASS / 4 PARTIAL / 8 FAIL**

---

### 1.2 Sitemap

| Critère                                         | Statut  | Constat                                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Présence                                        | PASS    | `public/sitemap.xml` présent, déclaré dans robots.txt                                                                                                                                                                                                                                  |
| Format XML                                      | PASS    | namespace sitemaps.org/schemas/sitemap/0.9 correct                                                                                                                                                                                                                                     |
| URLs indexables uniquement                      | PASS    | `/paywall/` et `/dashboard/` (noindex) absents du sitemap                                                                                                                                                                                                                              |
| lastmod cohérent                                | PARTIAL | Toutes les URLs ont `2026-05-06` — date du build. Pour `/legal/*`, `/about/*` le contenu ne change pas quotidiennement. Bing pénalise les lastmod qui se régénèrent sans modification réelle. Les pages statiques doivent avoir une date stable (date de dernière modification réelle) |
| priority calibré                                | PARTIAL | `/llms.txt` à 0.7 et `/openapi.json` à 0.7 sont discutables — ce ne sont pas des pages HTML indexables au sens classique. Google et Bing ignorent généralement la priority mais l'inclusion de ces URLs dans le sitemap peut diluer le crawl budget                                    |
| changefreq cohérent                             | PARTIAL | `/llm-prices/` à `hourly` est ambitieux mais justifié par le cron 6h. `/` à `weekly` est cohérent. Les pages légales à `monthly` sont correctes                                                                                                                                        |
| URL domaine live                                | FAIL    | Toutes les URLs utilisent `https://devrefs.dev/` — domaine non encore acheté. Le sitemap pointe vers un domaine qui ne résout pas. En preview, le domaine actif est `preview.devrefs-frontend.pages.dev`. Bing rejettera le sitemap si le domaine ne résout pas                        |
| `/about/data-sources/` et `/about/data-schema/` | PARTIAL | Ces pages n'ont pas de lien visible dans la nav principale de la landing — pages orphelines potentielles                                                                                                                                                                               |

**Score sitemap : 3 PASS / 4 PARTIAL / 1 FAIL**

---

### 1.3 Robots.txt

| Critère                        | Statut | Constat                                                                                                                                                                                        |
| ------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Allow `/llm-prices/`           | PASS   | Correctement autorisé pour tous les bots                                                                                                                                                       |
| Allow `/llms.txt`              | PASS   | Correctement autorisé — les AI crawlers (GPTBot, ClaudeBot) doivent pouvoir lire ce fichier                                                                                                    |
| Disallow `/api/`               | PASS   | Correct — évite que les crawlers consomment du budget de crawl sur les endpoints JSON                                                                                                          |
| Disallow `/dashboard/`         | PASS   | Correct                                                                                                                                                                                        |
| Disallow `/paywall/`           | PASS   | Correct                                                                                                                                                                                        |
| Directives par bot spécifiques | FAIL   | Aucune directive spécifique pour Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot. Les AI crawlers ne sont PAS bloqués (correct) mais aucune directive `Allow` explicite pour eux non plus |
| Bingbot et canonical           | FAIL   | Pas de section `User-agent: Bingbot` — recommandé pour clarifier les règles Bing-spécifiques (Bing est plus strict sur les directives implicites)                                              |
| Sitemap URL                    | FAIL   | `Sitemap: https://devrefs.dev/sitemap.xml` — domaine non live. Doit pointer vers le domaine actif en preview ou être mis à jour post-achat domaine                                             |
| IndexNow                       | FAIL   | Aucune clé IndexNow déclarée. Le fichier `INDEXNOW_KEY_PLACEHOLDER.txt` existe dans `/public/` mais n'est pas configuré. IndexNow est critique pour Bing (crawl moins fréquent que Google)     |

**Score robots.txt : 5 PASS / 0 PARTIAL / 4 FAIL**

---

### 1.4 Schema.org JSON-LD

| Page           | Schema               | Statut  | Constat                                                                                                                                                                                                       |
| -------------- | -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/llm-prices/` | Dataset              | PASS    | Structure valide : name, description, url, dateModified, creator, license, isAccessibleForFree, distribution, sameAs. Les 5 `sameAs` vers les pages officielles sont excellents pour les citations Perplexity |
| `/llm-prices/` | Dataset.distribution | PASS    | `DataDownload` avec `encodingFormat: application/json` et `contentUrl` correct                                                                                                                                |
| `/llm-prices/` | dateModified         | PARTIAL | Hardcodé en `2026-05-05T06:00:00Z` — ne reflète pas la dernière mise à jour réelle du cron. Doit être dynamique (injecté par le Worker ou mis à jour par le cron)                                             |
| `/` (landing)  | Organization         | FAIL    | Absent. Requis pour le Knowledge Panel Google. Doit inclure : name, url, logo (ImageObject 512x512), sameAs (GitHub, ProductHunt, HuggingFace)                                                                |
| `/` (landing)  | WebSite              | FAIL    | Absent. Permet le sitelinks searchbox dans Google SERP                                                                                                                                                        |
| `/` (landing)  | SoftwareApplication  | FAIL    | Absent. Pertinent pour une API B2A — permettrait un rich result "app" dans les SERP                                                                                                                           |
| `/llm-prices/` | BreadcrumbList       | FAIL    | Absent. La page est à 1 niveau de profondeur — breadcrumb simple `Home > LLM Prices` manquant                                                                                                                 |
| Toutes pages   | FAQPage              | FAIL    | La landing a des objections traitées (ROI, sécurité x402, fraîcheur) qui pourraient être encodées en FAQPage pour les "People Also Ask" Google                                                                |

**Score JSON-LD : 3 PASS / 1 PARTIAL / 4 FAIL**

---

### 1.5 Performance (estimations sur HTML statique Cloudflare Pages)

| Critère                  | Statut  | Constat                                                                                                                                                             |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Taille landing HTML      | PASS    | 16.6 KB non compressé — bien en dessous des 50 KB. Compressé gzip : ~5-6 KB estimé                                                                                  |
| Taille /llm-prices/ HTML | PASS    | ~8 KB estimé (table 12 modèles + JSON-LD)                                                                                                                           |
| CSS externe              | PARTIAL | `/styles/main.css` — taille inconnue. Si > 30 KB non compressé, risque de render-blocking LCP                                                                       |
| Font-display             | FAIL    | Aucune déclaration `font-display: swap` visible dans le HTML. Si les polices sont chargées via CSS `@font-face`, le LCP peut être impacté. À vérifier dans main.css |
| Images                   | PASS    | Pas d'images dans le contenu principal (code-first). Seul l'og:image est référencé mais non affiché dans la page                                                    |
| JS render-blocking       | PASS    | `tracking.js` chargé en `defer` — correct. Pas de JS critique en head                                                                                               |
| Cloudflare CDN           | PASS    | Pages.dev = CDN global Cloudflare avec HTTP/2, compression automatique, edge caching. LCP < 1.5s estimé sur desktop                                                 |
| CLS                      | PASS    | Pas d'images sans dimensions, pas de web fonts dynamiques apparentes, layout statique — CLS probablement < 0.05                                                     |
| INP                      | PASS    | Pages quasi-statiques avec minimal JS — INP < 100ms estimé                                                                                                          |
| Core Web Vitals global   | PASS    | Sur Cloudflare Pages statiques, les CWV sont structurellement excellents. Le seul risque est le CSS render-blocking                                                 |

**Score performance : 7 PASS / 1 PARTIAL / 2 FAIL**

---

## §2 — Mots-clés cibles (10 keywords)

| #   | Keyword                                    | Volume estimé | Difficulté | URL cible              | Intent                   | Notes                                                                             |
| --- | ------------------------------------------ | ------------- | ---------- | ---------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| 1   | `llm pricing api`                          | Med           | Med        | `/llm-prices/`         | Commercial investigation | Keyword principal machine-readable — agents + devs                                |
| 2   | `x402 pricing`                             | Low           | Easy       | `/`                    | Commercial investigation | Niche ultra-ciblée, DevRefs = référence potentielle                               |
| 3   | `claude opus 4.7 pricing api`              | Low           | Easy       | `/llm-prices/`         | Transactionnel           | Exact-match Bing fort — mettre dans H2 ou description                             |
| 4   | `ai sdk breaking changes endpoint`         | Low           | Easy       | `/about/data-sources/` | Informationnel           | Verbatim V5 persona — longue traîne haute valeur                                  |
| 5   | `compare llm pricing 2026`                 | Med           | Med        | `/llm-prices/`         | Commercial investigation | "2026" = filtre fraîcheur fort pour Google                                        |
| 6   | `ai agent cost optimizer`                  | Med           | Med        | `/`                    | Commercial investigation | Persona dev humain sponsor                                                        |
| 7   | `llm cost calculator api`                  | Med           | Hard       | `/llm-prices/`         | Transactionnel           | Concurrents établis (pricepertoken.com). Angle machine-readable pour différencier |
| 8   | `anthropic openai pricing comparison 2026` | Med           | Hard       | `/llm-prices/`         | Commercial investigation | Forte intent — cibler via table comparative                                       |
| 9   | `opus 4.7 effective cost factor`           | Low           | Easy       | `/llm-prices/`         | Informationnel           | Concept propriétaire DevRefs — 0 concurrence. Longue traîne parfaite              |
| 10  | `ai sdk 5.0 breaking changes streamtext`   | Low           | Easy       | `/about/data-schema/`  | Informationnel           | Verbatim V5 persona — featured snippet possible                                   |

**Avertissement volumes** : les volumes "Low/Med/High" sont des estimations qualitatives basées sur la niche B2A ultra-spécialisée (2026). Les outils SEMrush/Ahrefs ne retournent pas de volume fiable sur des queries aussi techniques. La stratégie longue traîne + concepts propriétaires compense : faible volume = faible concurrence = top 3 accessible.

---

## §3 — Optimisations à appliquer (par fichier)

```
1. [public/llm-prices/index.html — ligne 7] FAIL
   Action : remplacer la meta description dupliquée par une version unique :
   <meta name="description" content="LLM pricing table updated every 6 hours from official sources (Anthropic, OpenAI, Google, Mistral, DeepSeek). Atomic JSON API for AI agents — $0.001/call. Includes effective_cost_factor." />
   Priorité : CRITIQUE — duplicate meta = signal négatif Google + Bing

2. [public/llm-prices/index.html — après ligne 19] FAIL
   Action : ajouter og:description et twitter:description manquantes :
   <meta property="og:description" content="LLM pricing updated every 6h from official sources. Atomic JSON for AI agents. 12 models tracked including Claude Opus 4.7, GPT-5, Gemini 2.5 Pro." />
   <meta name="twitter:description" content="LLM pricing updated every 6h from official sources. 12 models tracked. Atomic JSON for AI agents — $0.001/call, no login." />
   Priorité : HAUTE

3. [public/llm-prices/index.html — lignes 11-13] FAIL (favicons incomplets)
   Action : ajouter les balises favicons manquantes (identiques à celles de index.html) :
   <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
   <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
   <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
   <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#0052ff" />
   <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
   Priorité : MOYENNE

4. [public/index.html — dans <head>, après ligne 30] FAIL
   Action : ajouter JSON-LD Organization + WebSite sur la landing :
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "DevRefs",
     "url": "https://devrefs.dev",
     "logo": {
       "@type": "ImageObject",
       "url": "https://devrefs.dev/og/og-image.png",
       "width": "1200",
       "height": "630"
     },
     "description": "Cost intelligence for AI agents. Atomic LLM pricing API, SDK status, and agent audit.",
     "sameAs": [
       "https://github.com/devrefs",
       "https://www.producthunt.com/products/devrefs"
     ]
   }
   </script>
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "WebSite",
     "name": "DevRefs",
     "url": "https://devrefs.dev"
   }
   </script>
   Priorité : HAUTE (Knowledge Panel + Bing entity recognition)

5. [public/llm-prices/index.html — dans le bloc JSON-LD ligne 21] PARTIAL
   Action : rendre le dateModified dynamique. Deux options :
   - Option A (Workers) : le Worker injecte la valeur depuis KV au moment du rendu de la page
   - Option B (cron) : le cron 6h met à jour le champ dans le fichier HTML via API Cloudflare Pages
   La date hardcodée `2026-05-05T06:00:00Z` deviendra fausse dès la prochaine mise à jour.
   Priorité : HAUTE — Perplexity et Google utilisent dateModified pour scorer la fraîcheur des données

6. [public/llm-prices/index.html — après le JSON-LD Dataset ligne 43] FAIL
   Action : ajouter JSON-LD BreadcrumbList :
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [
       { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://devrefs.dev/" },
       { "@type": "ListItem", "position": 2, "name": "LLM Prices", "item": "https://devrefs.dev/llm-prices/" }
     ]
   }
   </script>
   Priorité : MOYENNE

7. [public/paywall/index.html — dans <head>] FAIL
   Action : ajouter canonical explicite même en noindex (requis pour Bing) :
   <link rel="canonical" href="https://devrefs.dev/paywall/" />
   Priorité : MOYENNE (Bing uniquement — Google tolère l'absence en noindex)

8. [public/dashboard/index.html — dans <head>] FAIL
   Action : ajouter canonical explicite même en noindex :
   <link rel="canonical" href="https://devrefs.dev/dashboard/" />
   Priorité : MOYENNE

9. [public/robots.txt — complet] FAIL
   Action : ajouter directives spécifiques aux AI crawlers et IndexNow. Remplacer le contenu par :
   User-agent: *
   Allow: /
   Allow: /llms.txt
   Allow: /openapi.json
   Allow: /about/
   Allow: /legal/
   Allow: /llm-prices/
   Disallow: /api/
   Disallow: /admin/
   Disallow: /dashboard/
   Disallow: /paywall/

   User-agent: GPTBot
   Allow: /llms.txt
   Allow: /llm-prices/
   Allow: /openapi.json

   User-agent: ClaudeBot
   Allow: /llms.txt
   Allow: /llm-prices/
   Allow: /openapi.json

   User-agent: PerplexityBot
   Allow: /llms.txt
   Allow: /llm-prices/
   Allow: /openapi.json

   Sitemap: https://devrefs.dev/sitemap.xml
   Priorité : HAUTE (signal de confiance pour tous les crawlers)

10. [public/sitemap.xml — lastmod pages statiques] PARTIAL
    Action : figer les dates des pages qui ne changent pas. Remplacer les lastmod de /legal/* et /about/*
    par leur vraie date de création (2026-05-05) et ne les mettre à jour que si le contenu change.
    Retirer /llms.txt et /openapi.json du sitemap — ce ne sont pas des pages HTML,
    leur inclusion dilue le crawl budget et peut déconcerter Bing.
    Priorité : MOYENNE (Bing strict sur lastmod instables)

11. [public/index.html — meta og:description ligne 24] FAIL
    Action : enrichir og:description pour inclure "LLM pricing" et "AI agent" :
    <meta property="og:description" content="Atomic LLM pricing API for AI agents. Updated every 6h from official sources. Pre-flight check $0.001/call — post-flight audit $9.99 USDC. No login, no subscription." />
    Priorité : HAUTE (partage social + Bing social signals)
```

---

## §4 — Stratégie GEO (référencement LLM crawlers)

### 4.1 Audit llms.txt actuel

Le fichier `public/llms.txt` est servi depuis le Worker sur `/llms.txt`. L'URL est déclarée dans robots.txt et dans le sitemap. C'est un bon signal. La structure exacte n'est pas lisible ici (fichier servi par le Worker, non statique), mais les points à valider sont :

**Points forts à confirmer :**

- Le fichier doit commencer par `# DevRefs` avec une description en première ligne
- Chaque endpoint doit être documenté avec son format de réponse, son prix et ses headers attendus
- Le champ `dateModified` de la réponse API doit être mentionné explicitement — c'est le signal de fraîcheur que Perplexity et Claude utilisent pour décider s'ils citent une source

**Recommandations d'amélioration llms.txt :**

```
1. Ajouter un bloc "Machine-readable data" en tête de fichier avec :
   - Format de réponse JSON exact (champs, types)
   - Exemple de payload complet pour /api/llm-prices
   - Indication que dateModified est ISO 8601 UTC

2. Ajouter des métadonnées structurées en header commenté :
   # Version: 1.0
   # Updated: 2026-05-06T00:00:00Z
   # Contact: api@devrefs.dev
   # Freshness: 6h (cron from official sources)

3. Documenter les 3 endpoints séparément avec leur signature complète :
   ## /api/llm-prices
   ## /api/sdk-status
   ## /api/agent-audit

4. Ajouter un lien vers /openapi.json en fin de fichier — les agents qui veulent
   une spec complète ont une sortie de secours

5. Mentionner explicitement que le contenu est accessible sous x402
   (les agents qui connaissent x402 peuvent auto-payer — les autres voient la friction)
```

### 4.2 JSON-LD Dataset — Structure optimale pour citations Perplexity

Le Dataset sur `/llm-prices/` est bien construit. Améliorations pour maximiser les citations :

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "DevRefs LLM Prices",
  "alternateName": "LLM Pricing 2026",
  "description": "Atomic LLM pricing data for 12 leading models, updated every 6h from official sources (Anthropic, OpenAI, Google, Mistral, DeepSeek). Includes input_per_mtok, output_per_mtok, effective_cost_factor, dateModified.",
  "url": "https://devrefs.dev/llm-prices/",
  "dateModified": "{{CRON_INJECTED}}",
  "datePublished": "2026-05-05T00:00:00Z",
  "version": "1.0",
  "creator": {
    "@type": "Organization",
    "name": "DevRefs",
    "url": "https://devrefs.dev",
    "logo": "https://devrefs.dev/og/og-image.png"
  },
  "license": "https://devrefs.dev/legal/cgv/",
  "isAccessibleForFree": false,
  "usageInfo": "https://devrefs.dev/legal/cgv/",
  "keywords": [
    "LLM pricing",
    "AI cost",
    "Claude pricing",
    "GPT pricing",
    "Gemini pricing",
    "x402"
  ],
  "measurementTechnique": "Automated cron from official provider pages every 6 hours",
  "variableMeasured": [
    "input_per_mtok",
    "output_per_mtok",
    "effective_cost_factor"
  ],
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://devrefs.dev/api/llm-prices"
    }
  ],
  "sameAs": [
    "https://www.anthropic.com/pricing",
    "https://openai.com/pricing",
    "https://ai.google.dev/pricing",
    "https://mistral.ai/pricing",
    "https://www.deepseek.com/pricing"
  ]
}
```

Champs ajoutés par rapport à l'existant : `alternateName`, `datePublished`, `version`, `usageInfo`, `keywords`, `measurementTechnique`, `variableMeasured`. Ces champs augmentent la probabilité de citation dans les réponses Perplexity qui valorisent les datasets avec metadata complètes.

### 4.3 Backlinks IA-friendly — 5 sources de soumission

| #   | Source                                                  | Valeur SEO                      | Valeur GEO                                                                          | Lien soumission                                                                                              | Notes                                                                                                                                                                                      |
| --- | ------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **HuggingFace Hub** — Model Cards                       | Haute (.huggingface.co DA fort) | Haute (Perplexity crawle HuggingFace en priorité)                                   | https://huggingface.co/new-model (créer une dataset card pour DevRefs LLM Prices)                            | Créer un dataset card `devrefs/llm-prices` qui pointe vers l'API. C'est la source la plus citée par les LLMs sur les sujets pricing                                                        |
| 2   | **Awesome Lists GitHub** — awesome-llm / awesome-agents | Haute (GitHub DA maximal)       | Haute (GitHub = source d'entraînement LLMs)                                         | https://github.com/tensorchord/Awesome-LLMOps (ouvrir une PR) + https://github.com/e2b-dev/awesome-ai-agents | PR type : "Add DevRefs — atomic LLM pricing API for AI agents (x402 native)"                                                                                                               |
| 3   | **ProductHunt AI**                                      | Moyenne                         | Haute (ProductHunt apparaît souvent dans les réponses Perplexity sur les outils IA) | https://www.producthunt.com/posts/new                                                                        | Launch à planifier au moment de l'achat du domaine devrefs.dev pour maximiser l'upvote window                                                                                              |
| 4   | **IndieHackers** — produit + articles                   | Moyenne                         | Moyenne                                                                             | https://www.indiehackers.com/product (créer la page produit DevRefs)                                         | Publier un article technique "How I built an atomic LLM pricing API for AI agents" — backlink naturel + citation potentielle sur les requêtes "llm pricing tool"                           |
| 5   | **Dev.to** — article technique                          | Moyenne (DA fort)               | Haute (dev.to est massivement crawlé par les LLMs pour le contenu technique)        | https://dev.to/new                                                                                           | Article : "Why AI agents hallucinate on LLM pricing (and how to fix it with a $0.001 API call)" — inclure le tableau des 12 modèles avec effective_cost_factor. Backlink vers /llm-prices/ |

---

## §5 — Calendrier de monitoring

### 5.1 IndexNow — statut et action

**Statut actuel** : `INDEXNOW_KEY_PLACEHOLDER.txt` présent dans `/public/` mais non configuré. Le cron n'envoie pas de notifications Bing.

**Action requise (handoff @fullstack)** :

1. Générer une vraie clé IndexNow (GUID aléatoire) via https://www.bing.com/indexnow
2. Renommer `INDEXNOW_KEY_PLACEHOLDER.txt` en `{clé}.txt` dans `/public/`
3. Le cron 6h (Worker) doit appeler `POST https://api.indexnow.org/indexnow` après chaque mise à jour des prix :
   ```json
   {
     "host": "devrefs.dev",
     "key": "{clé}",
     "urlList": ["https://devrefs.dev/llm-prices/"]
   }
   ```
4. Soumettre le sitemap dans Bing Webmaster Tools après achat du domaine

**Priorité** : HAUTE. Bing crawle moins fréquemment que Google — sans IndexNow, les mises à jour de prix ne sont pas reflétées dans les SERP Bing pendant plusieurs jours.

### 5.2 Citations LLM — monitoring manuel V1

Fréquence recommandée : 2×/mois

**Queries de test à exécuter dans Perplexity, Claude.ai, ChatGPT :**

```
1. "What is the current price of Claude Opus 4.7 per million tokens?"
   → Vérifier si DevRefs ou devrefs.dev est cité

2. "Compare LLM pricing 2026 for top models"
   → Vérifier la position de DevRefs dans les sources listées

3. "What is effective_cost_factor in LLM pricing?"
   → Concept propriétaire DevRefs — doit remonter si le contenu est bien indexé

4. "Best API to get LLM pricing for AI agents"
   → Query de conversion directe — monitoring mensuel
```

**Signaux positifs** : mention de `devrefs.dev` dans les sources, citation du terme `effective_cost_factor`, référence à la fraîcheur 6h.

### 5.3 Google Search Console — configuration post-domaine

Actions à réaliser dès l'achat de `devrefs.dev` :

1. Ajouter la propriété `devrefs.dev` dans GSC (vérification via DNS TXT ou fichier HTML)
2. Soumettre `https://devrefs.dev/sitemap.xml`
3. Activer les rapports Core Web Vitals (données réelles CrUX)
4. Configurer les alertes Coverage (pages indexées / exclues)
5. Soumettre manuellement `/llm-prices/` via "URL Inspection" pour accélérer l'indexation initiale
6. Configurer Bing Webmaster Tools en parallèle (même processus, sitemap séparé si nécessaire)

---

## §6 — Handoff retour @orchestrator

### Actions MAINTENANT (Thomas + autopilot — domaine non nécessaire)

| #   | Action                                                                         | Fichier                                | Effort | Priorité    |
| --- | ------------------------------------------------------------------------------ | -------------------------------------- | ------ | ----------- |
| 1   | Corriger meta description /llm-prices/ (dupliquée)                             | `public/llm-prices/index.html` ligne 7 | 5 min  | CRITIQUE    |
| 2   | Ajouter og:description + twitter:description sur /llm-prices/                  | `public/llm-prices/index.html`         | 5 min  | HAUTE       |
| 3   | Ajouter JSON-LD Organization + WebSite sur la landing                          | `public/index.html`                    | 15 min | HAUTE       |
| 4   | Enrichir og:description landing avec keywords LLM                              | `public/index.html` ligne 24           | 5 min  | HAUTE       |
| 5   | Ajouter favicons complets sur /llm-prices/                                     | `public/llm-prices/index.html`         | 5 min  | MOYENNE     |
| 6   | Ajouter canonical sur /paywall/ et /dashboard/                                 | 2 fichiers HTML                        | 5 min  | MOYENNE     |
| 7   | Mettre à jour robots.txt avec directives AI crawlers                           | `public/robots.txt`                    | 10 min | HAUTE       |
| 8   | Retirer /llms.txt et /openapi.json du sitemap, fixer lastmod statiques         | `public/sitemap.xml`                   | 10 min | MOYENNE     |
| 9   | Configurer IndexNow (générer clé + intégrer dans le cron Worker)               | Worker + `public/{clé}.txt`            | 30 min | HAUTE       |
| 10  | Enrichir JSON-LD Dataset avec keywords, measurementTechnique, variableMeasured | `public/llm-prices/index.html`         | 15 min | HAUTE       |
| 11  | Créer dataset card HuggingFace `devrefs/llm-prices`                            | huggingface.co                         | 20 min | HAUTE (GEO) |
| 12  | Ouvrir PR sur Awesome Lists GitHub (awesome-llm-ops, awesome-ai-agents)        | GitHub externe                         | 15 min | HAUTE (GEO) |

### Actions après achat domaine devrefs.dev

| #   | Action                                                            | Notes                                                              |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Mettre à jour robots.txt Sitemap URL                              | `Sitemap: https://devrefs.dev/sitemap.xml` (déjà écrit, sera live) |
| 2   | Configurer GSC + Bing Webmaster Tools                             | Vérification DNS TXT — 15 min                                      |
| 3   | Soumettre sitemap dans GSC et Bing                                | Accélère l'indexation initiale                                     |
| 4   | Soumettre IndexNow pour /llm-prices/ et / au premier crawl        | Signal immédiat à Bing                                             |
| 5   | Lancer sur ProductHunt                                            | Timing optimal : jeudi matin US (8h PST)                           |
| 6   | Publier article Dev.to "Why AI agents hallucinate on LLM pricing" | Backlink DR fort, crawlé par LLMs                                  |

### Actions post-launch (Phase 4)

| #   | Action                                                                           | Notes                                                                                      |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Monitoring GSC hebdomadaire                                                      | Impressions / clics / position moyenne keywords cibles                                     |
| 2   | Monitoring citations LLM 2×/mois                                                 | Perplexity, Claude.ai, ChatGPT — queries de test §5.2                                      |
| 3   | Mise à jour dateModified JSON-LD dynamique                                       | Handoff @fullstack — injecter depuis KV dans le HTML au rendu                              |
| 4   | Ajouter pages /about/data-sources/ et /about/data-schema/ dans la nav principale | Pages orphelines actuellement — corriger le maillage interne                               |
| 5   | Article IndieHackers "How I built..."                                            | Backlink + crédibilité fondateur + signal E-E-A-T (Experience)                             |
| 6   | Envisager FAQPage JSON-LD sur la landing                                         | "What is effective_cost_factor?", "How often is pricing updated?" — featured snippet + PAA |

---

<!-- Fichier produit par @seo — Phase 3 visibilité — 2026-05-06 -->
