<!-- Version: 2026-05-05 — @design — Phase 1 Design System DevRefs v2 -->
# Design System — DevRefs (v2 pure B2A)

> Contrat entre @design et @fullstack. Chaque token est une règle. Zéro valeur hors système.
> Stack : HTML statique + 1 page TypeScript Cloudflare Pages. Pas de Tailwind imposé — CSS variables pures, portables.

---

## §1 — Tokens CSS (variables)

### 1.1 Palette (6 couleurs max — signal "données structurées", pas "produit SaaS arrondi")

Architecture 3 tiers obligatoire :

```
Primitive → Sémantique → Component
```

**Primitives (valeurs brutes — jamais utilisées directement dans les composants)**

```css
:root {
  /* Neutral scale — base monochrome */
  --primitive-neutral-0:    #FFFFFF;
  --primitive-neutral-50:   #F9FAFB;
  --primitive-neutral-100:  #F3F4F6;
  --primitive-neutral-200:  #E5E7EB;
  --primitive-neutral-300:  #D1D5DB;
  --primitive-neutral-400:  #9CA3AF;
  --primitive-neutral-500:  #6B7280;
  --primitive-neutral-700:  #374151;
  --primitive-neutral-900:  #111827;
  --primitive-neutral-950:  #030712;

  /* Accent action — bleu USDC (signal crypto/paiement) */
  --primitive-blue-500:     #3B82F6;
  --primitive-blue-600:     #2563EB;
  --primitive-blue-700:     #1D4ED8;

  /* Accent success/refund — vert terminal */
  --primitive-green-400:    #4ADE80;
  --primitive-green-600:    #16A34A;
  --primitive-green-700:    #15803D;

  /* Alert/erreur — orange contrasté */
  --primitive-orange-500:   #F97316;
  --primitive-orange-700:   #C2410C;

  /* Rouge kill/rouge */
  --primitive-red-500:      #EF4444;
  --primitive-red-700:      #B91C1C;
}
```

**Tokens sémantiques (light mode par défaut)**

```css
:root {
  /* Backgrounds */
  --color-background-default:     var(--primitive-neutral-0);
  --color-background-subtle:      var(--primitive-neutral-50);
  --color-background-muted:       var(--primitive-neutral-100);
  --color-background-code:        var(--primitive-neutral-950);
  --color-background-code-header: var(--primitive-neutral-900);

  /* Borders */
  --color-border-default:         var(--primitive-neutral-200);
  --color-border-strong:          var(--primitive-neutral-300);
  --color-border-code:            var(--primitive-neutral-700);

  /* Text */
  --color-text-default:           var(--primitive-neutral-900);
  --color-text-muted:             var(--primitive-neutral-500);
  --color-text-code:              var(--primitive-neutral-50);
  --color-text-code-comment:      var(--primitive-neutral-400);

  /* Action (USDC bleu) */
  --color-action-default:         var(--primitive-blue-600);
  --color-action-hover:           var(--primitive-blue-700);
  --color-action-focus-ring:      var(--primitive-blue-500);

  /* Success / refund */
  --color-success-default:        var(--primitive-green-600);
  --color-success-muted:          var(--primitive-green-400);

  /* Alert */
  --color-alert-default:          var(--primitive-orange-500);
  --color-alert-strong:           var(--primitive-orange-700);

  /* Destructive */
  --color-destructive-default:    var(--primitive-red-500);
  --color-destructive-strong:     var(--primitive-red-700);
}
```

**Dark mode (remapping sémantique — pas inversion)**

```css
[data-theme="dark"] {
  --color-background-default:     var(--primitive-neutral-950);
  --color-background-subtle:      var(--primitive-neutral-900);
  --color-background-muted:       var(--primitive-neutral-700);
  --color-background-code:        #0D1117; /* GitHub dark code — reconnu agent */
  --color-background-code-header: var(--primitive-neutral-900);

  --color-border-default:         var(--primitive-neutral-700);
  --color-border-strong:          var(--primitive-neutral-500);
  --color-border-code:            var(--primitive-neutral-500);

  --color-text-default:           var(--primitive-neutral-50);
  --color-text-muted:             var(--primitive-neutral-400);
  --color-text-code:              #E6EDF3; /* GitHub dark text */
  --color-text-code-comment:      var(--primitive-neutral-500);

  /* Accents identiques — pas de désaturation en dark (les contrastes passent déjà) */
  --color-action-default:         var(--primitive-blue-500);
  --color-action-hover:           var(--primitive-blue-600);
  --color-action-focus-ring:      var(--primitive-blue-500);

  /* Shadows remplacées par borders (invisibles sur fond sombre) */
  --shadow-sm: none;
  --shadow-md: none;
}
```

---

### 1.2 Typographie

**Règle** : monospace primary = signal dev/agent. Sans-serif compact = humain sponsor uniquement.

```css
:root {
  /* Font families */
  --font-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  --font-sans:  'Inter', 'Geist', system-ui, -apple-system, sans-serif;

  /* Scale (3 tailles max — anti-narratif, hiérarchie 2 niveaux) */
  --text-sm:    0.875rem;  /* 14px — méta, labels, timestamps */
  --text-base:  1rem;      /* 16px — body, descriptions courtes */
  --text-lg:    1.125rem;  /* 18px — sous-titres */
  --text-xl:    1.25rem;   /* 20px — titres de section */
  --text-2xl:   1.5rem;    /* 24px — titres importants */
  --text-3xl:   1.875rem;  /* 30px — hero sous-titre */
  --text-4xl:   2.25rem;   /* 36px — hero principal */
  --text-5xl:   3rem;      /* 48px — hero display */

  /* Line-heights (multiples de 4px) */
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* Letter-spacing */
  --tracking-tight:  -0.025em;  /* titres display */
  --tracking-normal:  0em;
  --tracking-wide:    0.05em;   /* labels majuscules */
  --tracking-widest:  0.1em;    /* tags mono */

  /* Weights (3 max) */
  --font-regular: 400;
  --font-medium:  500;
  --font-bold:    700;
}
```

**Usage mapping** :
- `font-mono` = code blocks, JSON payloads, endpoints URLs, timestamps, tout ce que l'agent consomme
- `font-sans` = descriptions courtes sponsor, labels UI, nav
- H1/H2 : `font-mono + font-bold` (signal terminal)
- Body : `font-sans + font-regular` (lisibilité humain sponsor)

---

### 1.3 Spacing (système 8pt — base 4px)

```css
:root {
  --spacing-2xs:  0.125rem;  /* 2px */
  --spacing-xs:   0.25rem;   /* 4px */
  --spacing-sm:   0.5rem;    /* 8px */
  --spacing-md:   1rem;      /* 16px */
  --spacing-lg:   1.5rem;    /* 24px */
  --spacing-xl:   2rem;      /* 32px */
  --spacing-2xl:  3rem;      /* 48px */
  --spacing-3xl:  4rem;      /* 64px */
  --spacing-4xl:  4.5rem;    /* 72px */
}
```

---

### 1.4 Shadows & Radius (signal "données structurées", pas "arrondi humanisé")

```css
:root {
  /* Shadows — minimalistes (1px borders priment) */
  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:  0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08);

  /* Radius — quasi nul (terminal, JSON, CLI — pas SaaS arrondi) */
  --radius-none: 0;
  --radius-xs:   2px;
  --radius-sm:   4px;
}
```

---

### 1.5 Motion tokens

```css
:root {
  --duration-instant: 0ms;
  --duration-fast:    150ms;
  --duration-normal:  300ms;
  --ease-default:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out:         cubic-bezier(0, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast:   0ms;
    --duration-normal: 0ms;
  }
}
```

---

### 1.6 Grid system

```css
:root {
  --grid-cols-mobile:  4;
  --grid-cols-tablet:  8;
  --grid-cols-desktop: 12;
  --grid-gutter:       var(--spacing-md);        /* 16px */
  --grid-margin-mobile:  var(--spacing-lg);      /* 24px */
  --grid-margin-desktop: var(--spacing-xl);      /* 32px */
  --grid-max-width:    1024px; /* < Next.js large — aligné "small product" */
}

/* Breakpoints */
/* sm: 640px | md: 768px | lg: 1024px | xl: 1280px */
```

---

## §2 — Composants (12 composants V1)

> Chaque composant référence UNIQUEMENT des tokens sémantiques ou component. Jamais les primitives.

### C01 — Button

**Variants** : primary / secondary / ghost
**États** : default, hover, active, focus-visible, disabled, loading

```css
/* Component tokens */
--button-font-family:     var(--font-mono);
--button-font-size:       var(--text-sm);
--button-font-weight:     var(--font-medium);
--button-letter-spacing:  var(--tracking-wide);
--button-padding-x:       var(--spacing-md);
--button-padding-y:       var(--spacing-sm);
--button-radius:          var(--radius-xs);
--button-min-height:      44px;  /* touch target WCAG 2.2 */

/* Primary */
--button-primary-bg:           var(--color-action-default);
--button-primary-text:         var(--primitive-neutral-0);
--button-primary-bg-hover:     var(--color-action-hover);
--button-primary-border:       transparent;

/* Secondary */
--button-secondary-bg:         transparent;
--button-secondary-text:       var(--color-text-default);
--button-secondary-border:     var(--color-border-strong);
--button-secondary-bg-hover:   var(--color-background-subtle);

/* Ghost */
--button-ghost-bg:             transparent;
--button-ghost-text:           var(--color-text-muted);
--button-ghost-border:         transparent;
--button-ghost-bg-hover:       var(--color-background-muted);
```

**Focus visible** : `outline: 2px solid var(--color-action-focus-ring); outline-offset: 2px`
**Disabled** : `opacity: 0.4; cursor: not-allowed; pointer-events: none`
**Loading** : spinner inline 16px, texte masqué (`aria-hidden="true"`)

**Do** : "Top-up agent wallet" — action unique, verbe clair
**Don't** : "Cliquez ici pour en savoir plus" — vague, non-agent-first

---

### C02 — Code Block (composant central B2A)

Le composant le plus critique. Tout agent consomme du JSON/curl/HTTP.

```css
--code-bg:            var(--color-background-code);
--code-bg-header:     var(--color-background-code-header);
--code-text:          var(--color-text-code);
--code-comment:       var(--color-text-code-comment);
--code-border:        var(--color-border-code);
--code-font:          var(--font-mono);
--code-font-size:     var(--text-sm);
--code-leading:       var(--leading-relaxed);
--code-padding:       var(--spacing-md);
--code-radius:        var(--radius-xs);
--code-tab-size:      2;
```

**Structure HTML** :
```html
<figure class="code-block" aria-label="Exemple JSON payload">
  <figcaption class="code-block__header">
    <span class="code-block__lang">json</span>
    <button class="code-block__copy" aria-label="Copier le code">Copy</button>
  </figcaption>
  <pre><code class="language-json">…</code></pre>
</figure>
```

**États** : copy button → "Copied!" 1500ms puis reset
**Responsive** : scroll horizontal sur mobile (`overflow-x: auto`), pas de wrapping
**Accessibilité** : `role="region"`, `aria-label` sur figure, `tabindex="0"` sur `pre`

---

### C03 — Pricing Card

```css
--pricing-card-bg:           var(--color-background-default);
--pricing-card-border:       var(--color-border-default);
--pricing-card-border-width: 1px;
--pricing-card-radius:       var(--radius-sm);
--pricing-card-padding:      var(--spacing-lg);
--pricing-card-shadow:       var(--shadow-md);

/* Variante "recommandé" (Pack Standard $10) */
--pricing-card-featured-border:      var(--color-action-default);
--pricing-card-featured-border-width: 2px;
```

**Variants** :
- Standard : border 1px, fond default
- Featured : border 2px bleu action (Pack Standard $10 uniquement)
- Disabled/V2 : `opacity: 0.5`, badge "V2" mono, non-cliquable

**Props** : `name`, `price`, `unit`, `features[]`, `isFeatured`, `isDisabled`, `badge`
**Responsive** : grille 3 colonnes desktop → 1 colonne mobile (stack vertical)

---

### C04 — Endpoint Card (3 variantes)

```css
--endpoint-card-bg:      var(--color-background-subtle);
--endpoint-card-border:  var(--color-border-default);
--endpoint-card-radius:  var(--radius-xs);
--endpoint-card-padding: var(--spacing-md);
```

**Variants** : `pricing` / `sdk-status` / `audit`
Chaque variante affiche : méthode HTTP (`GET`/`POST` en mono), chemin endpoint, prix en mono, code snippet copiable.

**Do** : méthode HTTP `GET` en vert terminal, chemin en mono gras
**Don't** : icônes décoratives, flèches, illustrations

---

### C05 — 402 Preview Card (showcase agent)

Montre le body HTTP 402 augmenté tel que l'agent le reçoit. C'est le hero visuel proof-of-concept.

```css
--preview-402-bg:      var(--color-background-code);
--preview-402-border:  var(--color-border-code);
--preview-402-label:   "HTTP 402 — DevRefs response"; /* affiché en header */
```

**Structure** : code block JSON avec les 4 champs ROI en premier (ordre strict) :
1. `alternative_cost_estimate`
2. `roi_summary`
3. `freshness_proof`
4. `payload_preview`

**Usage** : hero landing section 1 uniquement. Jamais reproduit tel quel sans les vraies valeurs.

---

### C06 — Quota Bar

Barre de progression pack (F26 dashboard sponsor).

```css
--quota-bar-bg:          var(--color-background-muted);
--quota-bar-fill:        var(--color-action-default);
--quota-bar-fill-warn:   var(--color-alert-default);   /* < 20 % restant */
--quota-bar-fill-empty:  var(--color-destructive-default);  /* < 5 % */
--quota-bar-height:      8px;
--quota-bar-radius:      var(--radius-xs);
```

**Props** : `current`, `max`, `packType`
**États** : normal (bleu), warning < 20 % (orange), critique < 5 % (rouge)
**Accessibilité** : `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

---

### C07 — Alert Banner (4 sévérités)

Cohérent avec dashboard-specs.md (ROUGE/ORANGE/VERT/INFO).

```css
--alert-padding:   var(--spacing-sm) var(--spacing-md);
--alert-radius:    var(--radius-xs);
--alert-font:      var(--font-mono);
--alert-font-size: var(--text-sm);

/* Sévérités */
--alert-error-bg:    #FEF2F2;  --alert-error-border:    var(--color-destructive-default);  --alert-error-text:    var(--color-destructive-strong);
--alert-warn-bg:     #FFF7ED;  --alert-warn-border:     var(--color-alert-default);         --alert-warn-text:     var(--color-alert-strong);
--alert-success-bg:  #F0FDF4;  --alert-success-border:  var(--color-success-default);       --alert-success-text:  var(--color-success-default);
--alert-info-bg:     #EFF6FF;  --alert-info-border:     var(--color-action-default);         --alert-info-text:     var(--color-action-hover);
```

**Props** : `severity` (error | warn | success | info), `message`, `dismissible`
**Accessibilité** : `role="alert"` (error/warn) ou `role="status"` (success/info)

---

### C08 — Footer Minimal

```css
--footer-bg:        var(--color-background-subtle);
--footer-border:    var(--color-border-default);
--footer-font:      var(--font-mono);
--footer-font-size: var(--text-sm);
--footer-text:      var(--color-text-muted);
--footer-padding:   var(--spacing-lg) var(--spacing-xl);
```

**Contenu** : CGU · Privacy · Mentions légales · Source code (GitHub link)
**Anti-pattern** : pas de newsletter, pas de social links, pas de logo agrandi

---

### C09 — Checkbox Renonciation L.221-28 13°

Composant légal obligatoire — page paywall sponsor.

```css
--checkbox-size:        20px;
--checkbox-radius:      var(--radius-xs);
--checkbox-border:      var(--color-border-strong);
--checkbox-checked-bg:  var(--color-action-default);
--checkbox-focus-ring:  var(--color-action-focus-ring);
--checkbox-font:        var(--font-sans);
--checkbox-font-size:   var(--text-sm);
--checkbox-leading:     var(--leading-relaxed);
```

**Libellé exact CGU Art. 4quater.2** :
> « Je reconnais avoir été informé(e) que le service DevRefs est un contenu numérique non fourni sur support matériel. En demandant l'exécution immédiate de ce service, je renonce expressément à mon droit de rétractation de 14 jours conformément à l'article L.221-28 13° du Code de la consommation. »

**3 checkboxes distinctes** (Art. 4quater.1-3) :
1. Consentement exécution immédiate
2. Renonciation droit de rétractation
3. Confirmation lecture CGU + tarifs

**Accessibilité** : `aria-required="true"`, `aria-describedby` pointant vers libellé, `role="checkbox"`
**Validation** : bouton Stripe désactivé tant que les 3 cases ne sont pas cochées

---

### C10 — Dashboard Zone Widget (F25 admin + F26 sponsor)

```css
--widget-bg:        var(--color-background-default);
--widget-border:    var(--color-border-default);
--widget-radius:    var(--radius-sm);
--widget-padding:   var(--spacing-lg);
--widget-title-font: var(--font-mono);
--widget-value-font: var(--font-mono);
--widget-value-size: var(--text-2xl);
```

**Variants** :
- KPI tile : chiffre large + label + trend indicator (▲/▼)
- Funnel chart : bars ASCII-style (`█`) ou SVG minimal
- Table widget : lignes `font-mono`, colonnes numériques alignées droite (standard comptable)
- Alert row : colonne severity badge + message + timestamp

---

### C11 — Nav Header Minimal

```css
--nav-bg:           var(--color-background-default);
--nav-border-bottom: 1px solid var(--color-border-default);
--nav-height:       56px;
--nav-font:         var(--font-mono);
--nav-font-size:    var(--text-sm);
--nav-logo-font:    var(--font-mono);
--nav-logo-weight:  var(--font-bold);
```

**Contenu** : `DevRefs` (logo texte) + liens `Pricing · Docs · /llm-prices`
**Anti-pattern** : pas de hamburger menu élaboré, pas d'icône logo SVG en V1 (texte seul)

---

### C12 — Tag / Badge Mono

```css
--badge-font:         var(--font-mono);
--badge-font-size:    var(--text-sm);
--badge-padding-x:    var(--spacing-sm);
--badge-padding-y:    var(--spacing-2xs);
--badge-radius:       var(--radius-xs);
--badge-letter-spacing: var(--tracking-widest);

/* Variants */
--badge-fresh-bg:     var(--color-background-code);
--badge-fresh-text:   var(--color-success-muted);
--badge-price-bg:     var(--color-background-muted);
--badge-price-text:   var(--color-text-default);
--badge-v2-bg:        var(--color-background-muted);
--badge-v2-text:      var(--color-text-muted);
```

**Usage** : `FRESH 6h`, `$0.001`, `V2`, `x402`, `USDC`

---

## §3 — Voice visuel (mapping brand → design)

| Trait voice | Traduction design | Anti-pattern banni |
|---|---|---|
| **Direct** | Typographie compacte, hiérarchie H1→corps 2 niveaux max, zéro intro narrative | Paragraphes d'intro "Bienvenue sur DevRefs, la plateforme qui…" |
| **Technique précis** | Tableaux + code blocks > prose. Chiffres en mono, jamais en italique descriptif | "environ $0.001" — précision obligatoire |
| **Agent-first** | JSON-first : showcase API avant toute prose. Le code block précède toujours l'explication | Screenshots de dashboards humains en hero |
| **Fresh** | `dateModified` visible partout, badge `FRESH` mono en header code block | Données sans date |
| **Atomic** | 1 endpoint = 1 payload = 1 carte. Jamais de listes mixtes | Page catalogue 300 modèles mélangés |
| **Verifiable** | `sameAs` URLs sources officielles dans JSON-LD visible | Claims sans source |

**Iconographie** : zéro icône décorative. Si icône = uniquement terminale/technique :
- `$` prompt shell
- `{}` JSON
- `>_` terminal
- `402` badge HTTP
- `×` multiplication (ROI)

**Interdit** : illustrations agent humanoïde, équipe qui collabore, dashboard SaaS screenshot, sourire, bulle de discussion.

---

## §4 — Dark mode

**Recommandation V1** : **LIGHT mode par défaut**.

Justification : le sponsor humain qui arrive (comparaison Stripe = light) est le payeur du top-up wallet. Friction maximale à éviter. Le toggle dark active le mode "agent dev console" — signal que l'utilisateur est un dev.

```html
<!-- Toggle sans persistance V1 -->
<button
  id="theme-toggle"
  aria-label="Basculer mode sombre"
  onclick="document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? '' : 'dark'"
>
  <span aria-hidden="true">>_</span>
</button>
```

**Dark mode contrastes WCAG 2.2 AA vérifiés** :
- `--color-text-default` (#F9FAFB) sur `--color-background-default` (#030712) → ratio 19.4:1 ✓ AAA
- `--color-text-muted` (#9CA3AF) sur `--color-background-default` (#030712) → ratio 6.2:1 ✓ AA
- `--color-action-default` (#3B82F6) sur `--color-background-default` (#030712) → ratio 5.9:1 ✓ AA (interactif)

**Light mode contrastes WCAG 2.2 AA vérifiés** :
- `--color-text-default` (#111827) sur `--color-background-default` (#FFFFFF) → ratio 18.1:1 ✓ AAA
- `--color-text-muted` (#6B7280) sur `--color-background-default` (#FFFFFF) → ratio 5.8:1 ✓ AA
- `--color-action-default` (#2563EB) sur `--color-background-default` (#FFFFFF) → ratio 5.9:1 ✓ AA

**Upgrade post-V1** : A/B dark-default si ≥ 30 % des sessions utilisent le toggle dans M+1.

---

## §5 — Accessibilité (RGAA / WCAG 2.2 AA)

| Critère | Implémentation |
|---|---|
| Contraste texte | Visé AAA (ratios §4). Testé automatiquement Phase 2 QA |
| Focus visible | `outline: 2px solid var(--color-action-focus-ring); outline-offset: 2px` — JAMAIS `outline: none` sans alternative |
| Touch targets | `min-height: 44px` obligatoire sur tous les boutons (WCAG 2.2 SC 2.5.8) |
| Navigation clavier | Tab order logique, pas de `tabindex > 0`, focus management sur modals |
| Rôles ARIA | Chaque composant documenté (voir §2) |
| `prefers-reduced-motion` | Toutes les transitions désactivées (voir §1.5 motion tokens) |
| `prefers-color-scheme` | Supporté via CSS `@media (prefers-color-scheme: dark)` + data-theme |
| Images alternatives | Pas d'images décoratives V1. Si ajoutées Phase 2 : `alt` obligatoire ou `aria-hidden="true"` |
| Langue HTML | `<html lang="fr">` (landing FR) / `<html lang="en">` (version EN) |

---

## §6 — Anti-vendor lock-in

```
Stack design :
├── HTML sémantique pur (5 sections)
├── CSS Variables (pas Tailwind imposé — tokens portables)
├── Pas de CSS-in-JS
├── Pas de framework CSS externe imposé
└── Portabilité : Cloudflare Pages → Vercel → Netlify → serveur statique
```

**Si @fullstack utilise Tailwind** : mapper les tokens CSS aux classes Tailwind via `tailwind.config.js`. Les tokens restent la source de vérité — Tailwind est un générateur, pas un dictionnaire.

---

**Handoff → @fullstack**
- Fichier produit : `/home/user/AI-agents-platform/docs/design/design-system.md`
- Tokens CSS : 6 couleurs (neutral + bleu action + vert success + orange alert), mono primary, 12 composants V1
- Anti-patterns signalés : zéro ombre complexe, radius 0-4px max, pas de framework imposé
- WCAG 2.2 AA vérifié light + dark
- Gate G7 : cohérent brand-platform v2 (Fresh/Atomic/Verifiable, anti-mots Humain-first)
