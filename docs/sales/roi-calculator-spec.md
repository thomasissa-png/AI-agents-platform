<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — ROI Calculator Embeddable -->

# ROI Calculator Embeddable — DevRefs

[Framework : FAB — Feature → Advantage → Benefit]
[Conscience : Solution-Aware — l'agent ou le dev connaît x402, cherche à justifier l'achat]

## Résumé exécutif

Widget JavaScript embeddable (< 8 KB gzippé, zéro dépendance) qui calcule en temps réel l'économie réalisée par un agent IA en remplaçant son parsing HTML multi-source par un appel DevRefs. Calcul 100 % client-side. Zéro PII envoyé serveur. CTA final redirige vers le pack le plus adapté.

---

## 1. Specs techniques

### 1.1 Contraintes non négociables

- **Calcul client-side strict** : zéro fetch réseau pendant le calcul. L'utilisateur ajuste les sliders → résultat instantané (< 16 ms).
- **Zéro PII** : pas de `localStorage`, pas de cookie, pas d'event de tracking avec les valeurs des inputs (CF Analytics reçoit uniquement `roi_calculator_viewed` et `roi_calculator_cta_clicked` — aucune valeur numérique).
- **Poids total widget** : < 8 KB gzippé JS + CSS inline. Pas de framework. Vanilla TS compilé.
- **Embeddable** : un `<script>` tag + un `<div id="devrefs-roi-calc">` suffisent. Compatible iframes.
- **Responsive** : fonctionne de 320 px (mobile) à 1440 px (desktop). Pas de breakpoints complexes — flexbox simple.
- **Accessibilité** : labels ARIA sur chaque input, `role="region"` sur le widget, `aria-live="polite"` sur la zone résultats.

### 1.2 Fichiers à produire

| Fichier                        | Description                                  | Taille cible  |
| ------------------------------ | -------------------------------------------- | ------------- |
| `public/roi-calculator.ts`     | Logic de calcul + DOM manipulation           | < 5 KB        |
| `public/roi-calculator.css`    | Styles inline dans le JS (CSS-in-JS minimal) | < 1 KB        |
| `public/roi-calculator.min.js` | Bundle compilé, prêt à distribuer            | < 8 KB gzippé |

**CDN** : hébergé sur `https://devrefs.dev/roi-calculator.min.js` via Cloudflare Pages.

**Embed snippet** (à communiquer aux blogueurs/intégrateurs) :

```html
<div id="devrefs-roi-calc"></div>
<script src="https://devrefs.dev/roi-calculator.min.js" defer></script>
```

---

## 2. Inputs

### 2.1 Modèle de l'agent (dropdown)

6 options reprises depuis `agent-economics.md` § A.2 :

| Valeur           | Label affiché           | Coût input/MTok effectif     | Token alt cost (67K tokens) |
| ---------------- | ----------------------- | ---------------------------- | --------------------------- |
| `opus-4.7`       | Claude Opus 4.7         | $6.75/MTok (×1.35 tokenizer) | $0.452                      |
| `sonnet-4.6`     | Claude Sonnet 4.6       | $3.00/MTok                   | $0.201                      |
| `haiku-4.5`      | Claude Haiku 4.5        | $1.00/MTok                   | $0.067                      |
| `gpt-5`          | GPT-5 [HYPOTHÈSE H5]    | $2.50/MTok                   | $0.168                      |
| `gemini-2.5-pro` | Gemini 2.5 Pro          | $1.25/MTok                   | $0.084                      |
| `custom`         | Autre (saisie manuelle) | champ numérique $/MTok       | calculé                     |

**Source** : `docs/ia/agent-economics.md` § A.2. Mention "[HYPOTHÈSE H5]" visible dans tooltip GPT-5 uniquement.

### 2.2 Volume queries/jour (slider)

- **Label** : "Combien de fois ton agent cherche un prix LLM ou un statut SDK par jour ?"
- **Plage** : 1 à 500 (log scale recommandée pour meilleure UX)
- **Valeur par défaut** : 10
- **Tooltip** : "Inclus toutes les estimations pre-flight (avant un appel LLM) et les vérifications SDK."

### 2.3 Taux de fraîcheur requis (radio 3 options)

- **Label** : "Quelle fraîcheur tes données de pricing doivent-elles avoir ?"
- **Options** :
  - `low` — "Mises à jour quotidiennes (cas : billing reconciliation)" → multiplicateur token x1.0
  - `medium` — "Mises à jour toutes les 6h (cas : agent actif en prod)" → multiplicateur x1.2 (coût plus élevé du parsing car l'agent re-parse plus souvent)
  - `high` — "Temps réel (cas : pipeline haute fréquence, > 100 calls/h)" → multiplicateur x2.0
- **Valeur par défaut** : `medium`

---

## 3. Formule de calcul (client-side)

```
// Coût alternatif par query (parsing HTML multi-source sans DevRefs)
alt_cost_per_query = (67_000 / 1_000_000) * effective_cost_per_mtok * freshness_multiplier
// Coût mensuel alternatif
alt_cost_monthly = alt_cost_per_query * queries_per_day * 30
// Coût DevRefs Pack Standard $10 / 10 000 calls
devrefs_cost_per_call = 0.001  // $0.001 USDC
devrefs_cost_monthly = min(devrefs_cost_per_call * queries_per_day * 30, pack_recommended_price)
// Économie tokens/jour
token_savings_per_day = 67_000 * queries_per_day  // tokens économisés
// Économie $/mois
monthly_savings = alt_cost_monthly - devrefs_cost_monthly
// ROI multiplier
roi_multiplier = alt_cost_monthly / devrefs_cost_monthly
// Pack recommandé
queries_per_month = queries_per_day * 30
if queries_per_month <= 5_000: recommended_pack = "Discovery $5"
elif queries_per_month <= 10_000: recommended_pack = "Standard $10"
else: recommended_pack = "Pro $50"
```

**Constante validée** : 67 000 tokens = mesure réelle agent Claude Code (verbatim V1 `project-context.md` — WebSearch × 1 + WebFetch × 3 = 64 520 tokens input + 500 tokens output, arrondi 67 000). Non inventé.

---

## 4. Outputs affichés

### 4.1 Zone résultats (mise à jour en temps réel)

```
┌─────────────────────────────────────────────────────────────┐
│  Sans DevRefs          Avec DevRefs         Tu économises   │
│  $XX.XX/mois           $X.XX/mois           $XX.XX/mois     │
│                                                             │
│  ROI : XXXx                                                 │
│  Tokens économisés : X.X M tokens/mois                      │
│                                                             │
│  → Pack recommandé : [Standard $10]  [Acheter maintenant]  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Règles d'affichage

- **ROI < 10×** (cas Haiku < 3 queries/jour) : afficher "DevRefs devient rentable dès 3 queries/jour avec ce modèle." Pas de CTA d'achat.
- **ROI entre 10× et 99×** : afficher "ROI **XXx** — rentable dès le 1er mois."
- **ROI ≥ 100×** : afficher "ROI **XXXx** — no-brainer."
- **Modèle = custom, coût = 0** : afficher "Saisis un coût par MTok pour calculer."

### 4.3 CTA dynamique

| Pack recommandé | CTA label                          | URL                                   |
| --------------- | ---------------------------------- | ------------------------------------- |
| Discovery $5    | "Acheter Pack Discovery — $5 USDC" | `https://devrefs.dev/#pack-discovery` |
| Standard $10    | "Acheter Pack Standard — $10 USDC" | `https://devrefs.dev/#pack-standard`  |
| Pro $50         | "Acheter Pack Pro — $50 USDC"      | `https://devrefs.dev/#pack-pro`       |

---

## 5. Copy widget

[Framework : FAB]
[Conscience : Solution-Aware]

**Titre** : `Combien ton agent brûle-t-il en cherchant un prix LLM ?`

**Sous-titre** : `Ajuste les paramètres. Le calcul est local — rien n'est envoyé.`

**Mention légale inline** (sous les résultats, 10 px) :
`Calcul basé sur 67 000 tokens consommés par estimation multi-source (mesure réelle, juin 2026). Pricing DevRefs : $0.001/call Pack Standard $10. Sources : docs/ia/agent-economics.md.`

**CTA négatif** (si ROI < 10×) :
`Ton profil ne justifie pas DevRefs Offre 1 pour ce volume. Regarde l'Audit post-flight ($9.99) si ton agent fait > 5M tokens/mois.`

---

## 6. Intégration embed externe (blogs, dashboards partenaires)

Le widget est conçu pour être intégré sur :

- Posts Dev.to (via `<script>` autorisé sur la plateforme)
- Pages GitHub Pages / Docusaurus
- Dashboards agent customs

**Paramètres d'initialisation optionnels** (attributs `data-*`) :

```html
<div
  id="devrefs-roi-calc"
  data-default-model="sonnet-4.6"
  data-default-queries="50"
  data-default-freshness="medium"
  data-theme="dark"
></div>
```

**Thèmes** : `light` (défaut), `dark` (fond #0d1117 — compatible GitHub README dark mode).

---

## 7. Events CF Analytics (zéro PII)

```
roi_calculator_viewed       // widget visible dans viewport
roi_calculator_interacted   // premier changement d'input
roi_calculator_cta_clicked  // clic sur CTA achat
  → payload : { pack: "standard" }  // jamais les valeurs numériques
```

---

## 8. Objections traitées

[Objections traitées : "est-ce que le calcul est réel ?" → mention source 67K tokens verbatim ; "mes données sont envoyées ?" → mention calcul local dans sous-titre + pas de fetch réseau ; "est-ce que DevRefs vaut vraiment ça ?" → CTA négatif si ROI < 10× (honnêteté qui renforce la confiance)]

---

**Handoff → @fullstack**

- Fichiers à créer : `public/roi-calculator.ts`, `public/roi-calculator.css`, bundle `public/roi-calculator.min.js`
- Constantes ROI validées dans `agent-economics.md` § A.2 — ne pas modifier sans re-valider avec @ia
- CDN path : `https://devrefs.dev/roi-calculator.min.js` via Pages static assets
- Events CF Analytics : 3 events à enregistrer dans le tracking-plan (colonne effort = S)
- Zéro PII : interdire tout `localStorage` ou cookie dans ce fichier
