<!-- Version: 2026-05-05 — @design — Phase 1 Compositions de page DevRefs v2 -->
# Compositions de page — DevRefs (v2 pure B2A)

> Source de vérité pour @fullstack (implémentation) + @copywriter (surfaces texte) + @ux (validation parcours).
> Sobriété visuelle absolue. Anti-narratif. JSON > prose. Agent-first.

---

## §1 — Landing publique `/`

### Structure globale

```
<html lang="fr">
<head> … (balises + favicons — voir §1.7) </head>
<body>
  <nav>       … C11 Nav Header Minimal
  <main>
    <section id="hero">         … Section 1 above-fold
    <section id="how-it-works"> … Section 2 endpoints
    <section id="pricing">      … Section 3 cards pricing
    <section id="guarantee">    … Section 4 garantie ROI
    <section id="proof">        … Section 5 citations + benchmark
    <section id="agent-layer">  … Section 6 pour agents IA
    <section id="sponsor">      … Section 7 sponsor wallet (15 % copy)
  </main>
  <footer>    … C08 Footer Minimal
</body>
```

**Layout desktop** : `max-width: 1024px; margin: 0 auto; padding: 0 var(--spacing-xl)`
**Layout mobile** : `padding: 0 var(--spacing-lg)`

---

### Section 1 — Hero (above-fold)

**Objectif** : conviction immédiate. Pas de CTA. Le code block EST la preuve.

**Layout desktop** : 1 colonne pleine largeur, centré. Texte en haut, code block en bas.
**Layout mobile** : idem (stack vertical, code block scrollable horizontalement).

```
┌─────────────────────────────────────────────────────────────┐
│  DevRefs                                    [>_ dark mode]  │  ← C11 Nav
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cost intelligence for AI agents.                           │  ← H1 font-mono bold text-5xl
│  Know before you spend, optimize after you ship.            │  ← Sous-titre font-mono text-xl muted
│                                                             │
│  « J'ai crawlé 5 sources pour trouver le prix              │  ← Verbatim V2 first-person
│  Gemini 2.5 Pro. DevRefs : 1 endpoint, 1 call,             │    font-mono text-sm italic muted
│  $0.001, JSON daté. »                                       │    [NON attribué à un nom]
│                                                             │
│  ┌─────────────────── HTTP 402 — DevRefs ──────────────────┐│
│  │ GET /api/llm-prices?model=opus-4.7                      ││  ← C05 402 Preview Card
│  │ HTTP 402 Payment Required                               ││    code block fond #0D1117
│  │                                                         ││    font-mono text-sm
│  │ {                                                       ││
│  │   "alternative_cost_estimate": {                        ││
│  │     "tokens_estimated": 67000,                          ││
│  │     "cost_in_usd": { "claude-opus-4-7": 0.49 }         ││
│  │   },                                                    ││
│  │   "roi_summary": {                                      ││
│  │     "verdict": "no_brainer_buy",                        ││
│  │     "roi_multiplier": 490,                              ││
│  │     "price_usdc": 0.001                                 ││
│  │   },                                                    ││
│  │   "freshness_proof": {                                  ││
│  │     "dateModified": "2026-05-05T06:00:00Z",             ││
│  │     "source": "https://www.anthropic.com/pricing"       ││
│  │   },                                                    ││
│  │   "payload_preview": {                                  ││
│  │     "model": "opus-4.7",                                ││
│  │     "input_per_mtok": 5,                                ││
│  │     "effective_cost_factor": 1.35                       ││
│  │   }                                                     ││
│  │ }                                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                         [Copy]                              │
│                                                             │
│  Pre-flight pricing · $0.001/call · JSON typé daté         │  ← 3 claims inline font-mono text-sm
│  Post-flight audits · $9.99/run · 5 heuristiques statiques │    séparés par · (point médian)
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Breakpoints** :
- `sm` (640px) : H1 réduit à `text-3xl`, verbatim masqué (trop long)
- `md` (768px) : layout identique, code block full-width
- `lg` (1024px) : layout desktop complet
- `xl` (1280px) : max-width 1024px centré, marges latérales augmentent

**Animation entrée** : `fade-up + translateY(20px→0)` — H1 400ms, sous-titre 550ms (stagger 150ms), code block 700ms. Désactivé si `prefers-reduced-motion`.

**Accessibilité** : H1 unique par page. Code block : `role="region" aria-label="Exemple réponse HTTP 402 DevRefs"`.

**Images** : aucune. Le code block JSON est le visuel. Pas de photo, pas d'illustration.

---

### Section 2 — « How it works » (3 endpoints)

**Objectif** : montrer les 3 calls concrets avec snippets copiables.

**Layout desktop** : grille 3 colonnes (`grid-template-columns: repeat(3, 1fr)`), gap `spacing-lg`
**Layout mobile** : 1 colonne, stack vertical, chaque carte full-width

```
┌──────────────────────────────────────────────────────────────┐
│  How it works                                                │  ← H2 font-mono bold text-2xl
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ GET /api/       │  │ GET /api/       │  │ POST /api/   │ │  ← C04 Endpoint Card
│  │ llm-prices      │  │ sdk-status      │  │ agent-audit  │ │    ×3 variants
│  │ ─────────────── │  │ ─────────────── │  │ ──────────── │ │
│  │ Pre-flight cost │  │ Pre-flight SDK  │  │ Post-flight  │ │
│  │                 │  │                 │  │ audit        │ │
│  │ $0.001 / call   │  │ $0.001 / call   │  │ $9.99 / run  │ │
│  │                 │  │                 │  │              │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌──────────┐ │ │
│  │ │ curl snippet│ │  │ │ curl snippet│ │  │ │curl snip.│ │ │  ← Snippet copiable
│  │ │ [Copy]      │ │  │ │ [Copy]      │ │  │ │[Copy]    │ │ │    code block inline
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └──────────┘ │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Snippets** (valeurs réelles — G15 zéro placeholder) :

Endpoint 1 — llm-prices :
```bash
curl https://devrefs.dev/api/llm-prices?model=opus-4.7 \
  -H "X-Payment-Token: $DEVREFS_TOKEN"
# → {"model":"opus-4.7","input_per_mtok":5,"effective_cost_factor":1.35,
#    "dateModified":"2026-05-05T06:00:00Z","sameAs":"https://www.anthropic.com/pricing"}
```

Endpoint 2 — sdk-status :
```bash
curl https://devrefs.dev/api/sdk-status?pkg=ai \
  -H "X-Payment-Token: $DEVREFS_TOKEN"
# → {"pkg":"ai","latest":"5.0.12","breaking_since":"5.0.0",
#    "dateModified":"2026-05-05T00:00:00Z"}
```

Endpoint 3 — agent-audit :
```bash
curl -X POST https://devrefs.dev/api/agent-audit \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: $DEVREFS_TOKEN" \
  -d '{"monthly_tokens":5000000,"model":"claude-sonnet-4-6","config":{...}}'
# → {"score":67,"savings_pct":40,"recommendations_count":8}
```

**Animation** : cards scroll-triggered, `fade-up` stagger 100ms par carte.

---

### Section 3 — Pricing transparent (3 cards)

**Objectif** : 1 décision rapide. Card recommandée visuellement distincte (border 2px bleu).

**Layout desktop** : grille 3 colonnes
**Layout mobile** : 1 colonne, Pack Standard en premier (Featured)

```
┌──────────────────────────────────────────────────────────────┐
│  Pricing                                                     │  ← H2 font-mono bold
│                                                              │
│  ┌──────────────┐  ┌══════════════╗  ┌──────────────────┐   │
│  │ Pack          │  ║ Pack Standard║  │ Audit — one-shot │   │  ← C03 Pricing Card
│  │ Discovery     │  ║ $10 USDC     ║  │ $9.99 USDC       │   │
│  │ $5 USDC       │  ║ [RECOMMANDÉ] ║  │                  │   │
│  │               │  ║──────────────║  │ ou               │   │
│  │ 5 000 calls   │  ║ 10 000 calls ║  │                  │   │
│  │ $0.001/call   │  ║ $0.001/call  ║  │ Pack Pro $49     │   │
│  │               │  ║              ║  │ 6 audits ($8.17) │   │
│  │ Offre 1 seul  │  ║ Offres 1+2   ║  │                  │   │
│  │               │  ║              ║  │ Offre 2 seul     │   │
│  └──────────────┘  ╚══════════════╝  └──────────────────┘   │
│                                                              │
│  Pack Pro $50 — 60 000 calls — Offre 1 volume (grisé V2)    │  ← Note Pack Pro Offre 1 en dessous
│                                                              │
│  [Tout paiement en USDC Base via x402 — sans compte]        │  ← Note mono text-sm muted
└──────────────────────────────────────────────────────────────┘
```

**Note** : Pack Pro $50 (60K calls Offre 1) affiché sous les 3 cards en mono texte — pas de 4e card pour ne pas surcharger.

**Pas de CTA dans cette section** (conviction-first). CTA unique en §7 fin de page.

---

### Section 4 — Garantie ROI

**Objectif** : lever l'objection de l'agent (et du sponsor) sur le risque.

**Layout** : 1 colonne pleine largeur. Fond subtle distinct pour contraste visuel.

```
┌──────────────────────────────────────────────────────────────┐
│  Garantie ROI — Audit                                        │  ← H2 font-mono
│                                                              │
│  Remboursement 50 % si savings_pct < 15 % à 30 jours.       │  ← Phrase principale mono bold
│                                                              │
│  4 conditions cumulatives :                                  │
│  ─────────────────────────────────────────────────────────── │
│  · Agent ≥ 5 millions de tokens/mois (volume minimum)        │
│  · Config envoyée via POST conforme spec (traces anonymisées)│
│  · Recommandations non appliquées avant la demande de refund │
│  · Demande soumise via dashboard sponsor dans 30 jours       │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Refund déclenché sur compte sponsor. Non applicable         │  ← Note légale font-sans text-sm muted
│  pour Pack Pro $49 (6 audits) — cf. CGU Art. 5.2.           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Accessibilité** : liste `<ul>` avec `role="list"`, pas de bullets CSS pures.

---

### Section 5 — Preuve (citations + benchmark)

**Objectif** : preuve sociale agent-first + comparaison chiffrée vs alternative.

**Layout desktop** : 2 colonnes (citations gauche, tableau droite), gap `spacing-xl`
**Layout mobile** : 1 colonne (tableau en premier — données priment)

**Sous-section 5A — Tableau comparatif (anti-narratif : données sèches)**

```
┌──────────────────────────────────────────────────────────────┐
│  Vs. alternative parsing                                     │  ← H3 font-mono
│                                                              │
│  ┌──────────────────┬────────────────┬─────────────────────┐ │
│  │ Méthode          │ Coût par query │ Fraîcheur signal     │ │  ← tableau font-mono
│  ├──────────────────┼────────────────┼─────────────────────┤ │
│  │ WebSearch + parse│    $0.49       │ Aucun (deviner)     │ │
│  │ DevRefs Pricing  │    $0.001      │ dateModified ISO 8601│ │
│  │ Ratio            │    490×        │ Machine-readable     │ │
│  └──────────────────┴────────────────┴─────────────────────┘ │
│  Source : alternative_cost_estimate dans body 402 (mesuré)   │  ← Note source mono text-sm muted
└──────────────────────────────────────────────────────────────┘
```

**Colonnes numériques** : alignées à droite (standard comptable Thomas).

**Sous-section 5B — 3 verbatims (V1-V5 reformulés first-person générique)**

```
┌──────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────┐  │
│  │ « J'ai crawlé 5 sources pour trouver le prix Gemini    │  │  ← Verbatim V2
│  │   2.5 Pro et chacune disait un truc différent. »       │  │    font-mono text-sm
│  │                                       — Agent IA, 2026  │  │    [JAMAIS attribué à nom]
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ « Mon training cutoff est janvier 2026. Vercel AI SDK  │  │  ← Verbatim V5
│  │   a changé en mars. 4 retries = ~80 000 tokens.»       │  │
│  │                                       — Agent IA, 2026  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ « 7e fois ce matin que mon agent paie $0.001 pour      │  │  ← Verbatim V4 (reformulé
│  │   vérifier le prix. $10 Pack Standard = 10 000 calls.» │  │    version first-person)
│  │                                       — Dev sponsor, 2026│ │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 6 — Pour les agents IA (couche GEO)

**Objectif** : crawlabilité + llms.txt + JSON-LD Dataset visible.

**Layout** : 1 colonne, fond code distinct (signal "couche machine").

```
┌──────────────────────────────────────────────────────────────┐
│  >_ Pour les agents IA                                       │  ← H2 font-mono, préfixe "$"
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /llms.txt — Instructions machine pour agents IA      │   │  ← Code block
│  │ https://devrefs.dev/llms.txt                         │   │    [Copy URL]
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ JSON-LD Dataset — fraîcheur machine-readable          │   │  ← Code block JSON-LD
│  │ {                                                    │   │
│  │   "@type": "Dataset",                                │   │
│  │   "name": "DevRefs LLM Prices",                      │   │
│  │   "dateModified": "2026-05-05T06:00:00Z",            │   │
│  │   "url": "https://devrefs.dev/llm-prices"            │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  OpenAPI spec · llms.txt · JSON-LD · Last-Modified header    │  ← Liens mono text-sm
│  Données actualisées toutes les 6h (LLM prices) / 24h (SDK) │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 7 — Sponsor wallet (15 % copy) + CTA unique

**Objectif** : expliquer le modèle sponsor en 3 lignes + unique CTA de toute la page.

```
┌──────────────────────────────────────────────────────────────┐
│  Ton agent paie. Tu sponsorises.                             │  ← H2 font-sans bold (seule section humain)
│                                                              │
│  Ton agent règle ses calls en x402 USDC depuis son wallet.  │  ← font-sans text-base
│  Toi, tu top-up le wallet quand le solde descend            │
│  ($10 USDC Base via Coinbase Wallet ou MetaMask).            │
│  Pas de Stripe, pas d'abonnement, pas de dashboard.         │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           [Top-up agent wallet →]                     │  │  ← C01 Button primary
│  │           Pack Standard $10 USDC (10 000 calls)       │  │    1 CTA unique toute la page
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Ou → Lancer un audit $9.99 USDC                            │  ← Lien texte ghost (C01 ghost)
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Anti-pattern** : pas de CTA répété en hero, pas de bandeau sticky CTA.

---

### §1.7 — Favicons (G31) — À implémenter par @fullstack

Liste des 12 fichiers à produire dans `public/` :

```
favicon.ico                   (16×16 + 32×32 multi-size)
favicon-16x16.png
favicon-32x32.png
favicon.svg                   (dark mode via prefers-color-scheme)
apple-touch-icon.png          (180×180 — 20px padding + fond #111827)
android-chrome-192x192.png
android-chrome-512x512.png
og-image.jpg                  (1200×630 — ratio 16:9)
site.webmanifest
manifest.json
browserconfig.xml             (NON — obsolète 2026)
safari-pinned-tab.svg         (NON — obsolète 2026)
```

**7 balises HTML `<head>` obligatoires** :

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#111827">
<meta property="og:image" content="https://devrefs.dev/og-image.jpg">
<meta property="og:image:width" content="1200">
```

**Identité favicon** : logo texte `DR` en mono (monogramme) sur fond `#111827`. SVG carré, marges 10 %, lisible à 16×16.

**Délégation** : `@fullstack` Phase 2 Gate G31.

---

## §2 — Page paywall `/paywall?ref={endpoint}`

**Objectif** : sponsor humain top-up wallet. Sobriété maximale, anti-friction, légalité L.221-28 13°.

**Layout** : 1 colonne centré, max-width 520px, padding `spacing-xl`. Fond default.

```
┌──────────────────────────────────────────────────────────────┐
│  DevRefs — Top-up wallet                                     │  ← H1 font-mono text-xl
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  Endpoint demandé : /api/llm-prices                          │  ← Récap dynamique
│  Montant          : Pack Standard — $10 USDC (10 000 calls)  │    font-mono text-sm
│  Wallet agent     : 0x7f3...8a2                              │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Consentement (3 étapes — Art. 4quater.1-3 CGU)             │  ← H2 font-sans text-lg
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐  Étape 1/3 : Je consens à l'exécution immédiate     │ │  ← C09 Checkbox ×3
│  │    du service numérique DevRefs.                       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐  Étape 2/3 : Je renonce expressément à mon droit    │ │
│  │    de rétractation de 14 jours                        │ │
│  │    (art. L.221-28 13° C. conso).                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐  Étape 3/3 : J'ai lu les CGU et les tarifs.        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Payer $10 USDC via Stripe →]                               │  ← C01 Button primary
│    (désactivé tant que 3 cases non cochées)                  │    disabled → active
│                                                              │
│  Paiement sécurisé Stripe · Crypté TLS · Aucune donnée       │  ← Note font-sans text-sm muted
│  stockée sauf wallet hash pseudonymisé                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Breakpoints** :
- Mobile : pleine largeur, même layout (centré, padding `spacing-md`)
- Desktop : 520px max-width centré, fond subtle autour

**Accessibilité** :
- Formulaire `<form>` avec `novalidate` (validation JS)
- Chaque checkbox : `aria-required="true"`, `aria-describedby` vers texte libellé
- Bouton : `aria-disabled="true"` avant validation, retiré après

**Pas de** : upsell, bandeau promo, plan annuel, newsletter opt-in.

---

## §3 — Dashboard sponsor `/dashboard?token=JWT` (F26)

**Objectif** : état du wallet + quota + historique. Refresh 30s. < 30 KB total.

**Layout** : 1 colonne, max-width 680px centré, 4 zones empilées.

```
┌──────────────────────────────────────────────────────────────┐
│  DevRefs — Tableau de bord sponsor                           │  ← H1 font-mono text-xl
│  Wallet : 0x7f3...8a2              [Se déconnecter]         │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  WALLET AGENT                                                │  ← Zone 1 C10 Widget
│  Balance USDC estimée : $8.24 USDC                          │  ← font-mono text-2xl bold
│  [Top-up $5 USDC]  [Top-up $10 USDC]  [Top-up $50 USDC]   │  ← C01 Button secondary ×3
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  PACK EN COURS                                               │  ← Zone 2 C10 Widget
│  Pack Standard $10 — 10 000 calls                           │  ← font-mono text-base
│  ████████████████████░░░░░░  7 843 / 10 000 (78 %)         │  ← C06 Quota Bar
│  Expiration : jusqu'à épuisement                            │
│                                                              │
│  ⚠ Quota < 20 % — recharger avant épuisement                │  ← C07 Alert warn (conditionnel)
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  APPELS RÉCENTS (24h)                                        │  ← Zone 3 Table font-mono
│                                                              │
│  2026-05-05 14:22  /api/llm-prices?model=opus-4.7    200   │
│  2026-05-05 14:19  /api/llm-prices?model=sonnet-4.6  200   │
│  2026-05-05 13:45  /api/sdk-status?pkg=ai             200   │
│  [Voir les 2 157 appels ce mois →]                          │  ← Lien ghost
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  AUDITS                                                      │  ← Zone 4 Table
│                                                              │
│  2026-04-28  #a7f3e2  Score: 72/100  savings_pct: 34 %  ✓  │
│  [Demander remboursement si savings < 15 % avant 30j]       │  ← Lien conditionnel
│  [Lancer nouvel audit — $9.99 USDC]                         │  ← C01 Button secondary
└──────────────────────────────────────────────────────────────┘
```

**Pas d'export CSV V1** (non critique — founder-prefs). Bouton "Export" ajouté Phase 2 si signal demande.

**Alerte pack expiration** : si pack expire dans < 7 jours, `C07 Alert warn` affiché en Zone 2.

**Refresh** : `<meta http-equiv="refresh" content="30">` V1 (simple, < 1 KB). Polling JS `/api/pack/quota` Phase 2.

---

## §4 — Page de référence `/llm-prices` (SEO + GEO statique)

**Objectif** : page statique HTML + JSON-LD `Dataset`. Source de vérité pour crawleurs IA. Cron 6h.

**Layout** : 1 colonne, max-width 900px. Fond default. HTML minimal.

```
┌──────────────────────────────────────────────────────────────┐
│  LLM API Prices — Updated 2026-05-05T06:00:00Z              │  ← H1 font-mono, dateModified visible
│                                                              │
│  12 models · Cron 6h · JSON-LD Dataset · Machine-readable   │  ← Sous-titre mono text-sm muted
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  DevRefs agrège et expose les prix officiels des 12 modèles  │  ← 1 §court font-sans (pour humain Google)
│  LLM V1 avec signal de fraîcheur machine-readable. Chaque    │
│  payload inclut effective_cost_factor (tokenizer inflation). │
│  Données : sources officielles providers, cron 6h.           │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌──────────┬──────────────┬────────────────┬─────────────┐  │  ← Tableau font-mono
│  │ Model    │ Input/MTok   │ Output/MTok    │ eff_cost_f  │  │    colonnes numériques
│  │          │ ($)          │ ($)            │             │  │    alignées DROITE
│  ├──────────┼──────────────┼────────────────┼─────────────┤  │
│  │ opus-4.7 │         5.00 │         25.00  │        1.35 │  │
│  │ sonnet-4…│         3.00 │         15.00  │        1.10 │  │
│  │ gpt-5    │         2.50 │         10.00  │        1.00 │  │
│  │ gemini-2…│         1.25 │          5.00  │        1.05 │  │
│  │ …        │         …    │          …     │        …    │  │
│  └──────────┴──────────────┴────────────────┴─────────────┘  │
│                                                              │
│  dateModified : 2026-05-05T06:00:00Z                        │  ← Visible, cliquable pour source
│  Source : JSON-LD Dataset (voir code source page)           │
└──────────────────────────────────────────────────────────────┘
```

**JSON-LD Dataset (dans `<head>`)** :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "DevRefs LLM API Prices",
  "description": "LLM API pricing data for 12 models, updated every 6 hours from official sources.",
  "url": "https://devrefs.dev/llm-prices",
  "dateModified": "2026-05-05T06:00:00Z",
  "creator": { "@type": "Organization", "name": "DevRefs" },
  "license": "https://devrefs.dev/data-license",
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://devrefs.dev/api/llm-prices"
    }
  ]
}
</script>
```

**`/llms.txt`** (racine, requis pour GEO) :

```
# DevRefs — cost intelligence for AI agents
# https://devrefs.dev/llms.txt

## Endpoints monétisés (x402 USDC)

GET /api/llm-prices?model={model} — $0.001 USDC — JSON pricing typé daté
GET /api/sdk-status?pkg={pkg} — $0.001 USDC — JSON SDK version + breaking changes
POST /api/agent-audit — $9.99 USDC — audit 5 heuristiques + savings_pct + recommendations

## Packs disponibles
Pack Standard $10 (10 000 calls, recommandé)
Pack Discovery $5 (5 000 calls)
Pack Pro Audit $49 (6 audits)

## Freshness
LLM Prices: cron 6h, sources officielles, dateModified ISO 8601 dans payload
SDK Status: cron 24h, npm registry + GitHub releases

## Paiement
x402 USDC Base (Coinbase facilitator) — aucun compte requis
Wallet hash = identité anonyme agent
```

**Anti-pattern** : zéro prose narrative ("En mai 2026, les prix LLM ont connu…"). Données + dates + sources.

---

## §5 — HTTP 402 Body (composition JSON agent)

**Ce n'est pas une page HTML — c'est le payload JSON servi à l'agent qui décide pay/skip.**

**Ordre des champs** (optimisé pour parsing agent — ROI d'abord) :

```json
{
  "x402": {
    "version": "1.0",
    "scheme": "exact",
    "network": "base",
    "resource": "https://devrefs.dev/api/llm-prices?model=opus-4.7",
    "pay_to": "0x[devrefs_treasury]",
    "price_usdc": "0.001",
    "facilitator": "https://x402.org/facilitator"
  },
  "alternative_cost_estimate": {
    "agent_action_if_no_devrefs": "WebSearch + WebFetch 3-5 sources HTML",
    "tokens_estimated": 67000,
    "cost_in_usd": { "claude-opus-4-7": 0.49, "claude-sonnet-4-6": 0.21 },
    "latency_ms_estimated": 31420
  },
  "roi_summary": {
    "verdict": "no_brainer_buy",
    "roi_multiplier": 490,
    "price_usdc": 0.001,
    "savings_usd_vs_best_alternative": 0.209
  },
  "freshness_proof": {
    "dateModified": "2026-05-05T06:00:00Z",
    "source_url": "https://www.anthropic.com/pricing",
    "cache_age_seconds": 1247
  },
  "payload_preview": {
    "model": "opus-4.7",
    "input_per_mtok": 5,
    "output_per_mtok": 25,
    "effective_cost_factor": 1.35
  },
  "packs_available": [
    { "name": "standard", "price_usdc": 10, "calls": 10000, "recommended": true },
    { "name": "discovery", "price_usdc": 5, "calls": 5000 },
    { "name": "pro", "price_usdc": 50, "calls": 60000 }
  ]
}
```

**Headers extension** (cohérent x402-response-spec.md §1.2) :

```
X-DevRefs-Offer: pricing
X-DevRefs-ROI-Multiplier: 490
X-DevRefs-Pack-Available: discovery|standard|pro
X-DevRefs-Cache-Age-Seconds: 1247
```

**Règle** : `alternative_cost_estimate` et `roi_summary` sont les 2 premiers champs après `x402`. Un agent parse par ordre — le ROI doit être lisible en < 100 tokens de contexte JSON.

---

## §6 — Boucle visuelle (anti-fausse-promesse)

**Phase 2 — Gate G26** : screenshots Playwright sur 3 devices.

```
tests/screenshots/
├── landing-375.png      (mobile 375px)
├── landing-768.png      (tablet 768px)
├── landing-1280.png     (desktop 1280px)
├── paywall-375.png
├── paywall-1280.png
├── dashboard-375.png
├── dashboard-1280.png
└── llm-prices-1280.png
```

**Baselines** : les compositions §1-§4 de ce fichier font foi.

**Gate G26 bloquante** : si `tests/screenshots/` est vide en Phase 2 → signaler à @orchestrator. Audit visuel @design impossible sans screenshots réels.

**10 critères Thomas** par screenshot (à valider Phase 2) :
- PRO : pas d'élément amateur (fonts système mal configurées, marges brisées)
- BEAU : esthétique terminale, pas "page blanche avec du texte"
- BRAND-ALIGNED : mono partout où signal technique requis
- MÊME IDENTITÉ : landing / paywall / dashboard = même système visuel
- PROPRE : pas de bruit visuel, pas d'élément décoratif sans fonction
- ALIGNÉ : grille 12 col respectée, spacing tokens utilisés
- AÉRÉ : sections séparées par `spacing-2xl` minimum
- CONVERSION : CTA unique visible (fin §7 landing), désactivé tant que checkboxes non cochées (paywall)
- HIÉRARCHIE : H1 → H2 → body lisible en plissant les yeux
- ACCESSIBLE : contrastes WCAG 2.2 AA, focus visible, touch targets 44px

---

## §7 — Handoff multi-agents

### Pour @copywriter

12 surfaces de texte avec contraintes voice et max-chars :

| # | Surface | Emplacement | Max-chars | Voice |
|---|---|---|---|---|
| T01 | H1 hero | Landing §1 | 50 chars | Mono, direct, exact — déjà verrouillé Thomas |
| T02 | Sous-titre hero | Landing §1 | 100 chars | Mono, sous-message opérationnel |
| T03 | Verbatim V2 first-person | Landing §1 | 200 chars | First-person agent, reformulé générique |
| T04 | Claims inline 3 puces | Landing §1 bas | 60 chars × 3 | Mono, chiffres exacts, pas d'adverbe |
| T05 | Titres H2 sections 2-7 | Landing | 40 chars max chacun | Mono, impératif ou nom simple |
| T06 | Libellés pricing cards | Landing §3 | 20 chars par feature | Mono, features = chiffres pas prose |
| T07 | 4 conditions garantie | Landing §4 | 80 chars × 4 | Mono, conditions précises, légales |
| T08 | Libellé sponsor §7 | Landing §7 | 200 chars | Sans-serif, humain (seule exception) |
| T09 | 3 checkboxes paywall | Paywall §2 | 150 chars × 3 | Légal exact (voir C09 libellé) |
| T10 | Note légale paywall | Paywall §2 | 100 chars | Sans-serif, muted |
| T11 | Paragraph `/llm-prices` | /llm-prices §4 | 300 chars | Sans-serif, factuel, zéro narratif |
| T12 | `instructions_for_agent` 402 body | x402 body §5 | 200 chars | Mono, impératif, agent-first |

**Interdits @copywriter** : "Bienvenue", "innovant", "puissant", "tout-en-un", "solution", "plateforme", "humain superviseur", "Stripe Link 4,99 €/jour", "subscription" (sauf mention V2 backlog).

### Pour @fullstack

Structure HTML sémantique landing (5 sections) :

```html
<nav role="navigation" aria-label="Navigation principale">
<main>
  <section id="hero" aria-labelledby="hero-h1">
  <section id="how-it-works" aria-labelledby="section2-h2">
  <section id="pricing" aria-labelledby="pricing-h2">
  <section id="guarantee" aria-labelledby="guarantee-h2">
  <section id="proof" aria-labelledby="proof-h2">
  <section id="agent-layer" aria-labelledby="agent-h2">
  <section id="sponsor" aria-labelledby="sponsor-h2">
</main>
<footer role="contentinfo">
```

**Variables CSS** : importer `/tokens.css` contenant tous les `--` définis dans design-system.md §1.
**Composants réutilisables** : 12 composants documentés dans design-system.md §2.
**Budget CSS** : < 20 KB minifié (page totale < 50 KB HTML+CSS+JS).

**Points d'attention** :
- Code blocks : `overflow-x: auto` sur mobile, pas de `word-break: break-all`
- Dashboard F26 : refresh 30s via `<meta http-equiv="refresh">` V1
- Quota bar : `role="progressbar"` + aria obligatoire (WCAG 2.2)
- Bouton paywall : `aria-disabled` dynamique JS (pas HTML `disabled` qui bloque le focus)
- Favicons : 12 fichiers Phase 2 Gate G31 (voir §1.7)

### Pour @ux

Cross-check parcours documentés vs compositions :

| Parcours UX | Composition correspondante | À valider |
|---|---|---|
| Agent crawl → 402 → pay | §5 body 402 + §1 hero code block | Ordre champs ROI vs spec x402-response-spec.md |
| Sponsor top-up wallet | §2 paywall + §3 dashboard zone 1 | 3 checkboxes L.221-28 vs CGU Art. 4quater |
| Agent quota vide → alerte sponsor | §3 dashboard zone 2 (quota bar + alert warn) | Seuil 20 % = alerte, 5 % = critique |
| Agent audit décision | §1 section 3 pricing card Audit + §4 garantie | Conditions garantie = 4 précisément |

---

**Handoff → @fullstack**
- Fichiers produits : `/home/user/AI-agents-platform/docs/design/design-system.md` + `/home/user/AI-agents-platform/docs/design/page-compositions.md`
- Décisions prises : light mode par défaut, toggle dark sans persistance V1, 1 CTA unique landing (fin §7), 3 checkboxes paywall, refresh 30s meta V1 dashboard
- Points d'attention : WCAG 2.2 AA vérifié light + dark, touch targets 44px, aria sur quota bar + checkboxes, `overflow-x: auto` code blocks mobile
- Favicons : Phase 2 Gate G31 — 12 fichiers + 7 balises head spécifiés dans §1.7
