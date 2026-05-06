# Favicons + OG image — actions Thomas

## V1 livré (phase 5b @design — 2026-05-06)

Fichiers design final produits :

- `logo.svg` — logo source design final (D geometrique + data-flow bar, #0052FF)
- `safari-pinned-tab.svg` — mis à jour avec le logo final mono-color #0052FF
- `manifest.webmanifest` — mis à jour (theme_color #0052FF, background_color #FFFFFF)
- `public/og/og-image.svg` — OG image 1200×630 design final (SVG source)
- `public/og/og-image.png` — placeholder minimal existant (a remplacer apres conversion)

Les 9 PNG (`favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`,
`apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`,
`maskable-icon.png`, `mstile-150x150.png`, `favicon.ico`) restent des placeholders
unis #0052FF. A remplacer via realfavicongenerator.net (~5 min).

---

## Actions Thomas requises (~10 min total)

### Etape 1 — Regenerer les favicons PNG (5 min)

1. Aller sur https://realfavicongenerator.net
2. Uploader `public/favicons/logo.svg`
3. Configuration recommandee :
   - **iOS / Safari** : background color `#0052FF`, ne pas ajouter d'effet
   - **Android Chrome** : theme color `#0052FF`, mode `standalone`
   - **Windows Metro** : tile color `#0052FF`
   - **Maskable** : laisser la safe zone a 80% (le logo est centre dans le viewBox)
4. Telecharger le ZIP genere
5. Extraire et remplacer dans `public/favicons/` les 9 fichiers :
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `favicon-48x48.png`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`
   - `maskable-icon.png`
   - `mstile-150x150.png`
6. Verifier le rendu sur https://realfavicongenerator.net/favicon_checker

### Etape 2 — Convertir l'OG image SVG → PNG (3 min)

1. Aller sur https://cloudconvert.com/svg-to-png
2. Uploader `public/og/og-image.svg`
3. Regler la taille de sortie : **largeur 1200px, hauteur 630px**
4. Convertir et telecharger
5. Remplacer `public/og/og-image.png` par le fichier telecharge
6. Verifier que le poids est < 8 MB (devrait etre ~200-400 KB)

### Etape 3 — Re-deployer

```bash
pnpm deploy:preview
```

Puis verifier sur https://opengraph.xyz que l'OG image s'affiche correctement.

---

## Design du logo SVG

Le `logo.svg` represente un **D geometrique + barre horizontale (data-flow)** :

- Lettre D construite en path SVG pur (pas de texte — stable a toutes tailles)
- Barre horizontale au centre du D = signal "data pipeline / API endpoint"
- Monochrome #0052FF sur fond transparent
- viewBox 32×32, poids < 500 bytes

Concept : a 16×16 px, le D reste lisible. La barre horizontale est fine (2px)
mais visible a 32×32 et au-dessus. A 16×16 elle peut disparaitre — acceptable,
le D seul identifie la marque.

---

## Validation post-remplacement

- [ ] Favicon visible dans l'onglet navigateur (logo D, pas un carre uni bleu)
- [ ] Apple touch icon : fond bleu #0052FF + D blanc
- [ ] OG image : fond dark slate + titre blanc monospace + accent vert #00FF88
- [ ] manifest.webmanifest : theme_color = `#0052FF`
- [ ] Gate G31 PASS sur https://realfavicongenerator.net/favicon_checker
