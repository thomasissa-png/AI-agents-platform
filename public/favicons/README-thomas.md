# Favicons placeholders — TODO Thomas

Les fichiers PNG et ICO de ce dossier sont des **placeholders fonctionnels** générés par script (rectangles unis bleu #0052FF).

## Action requise (post-livraison @design)

1. Préparer logo source SVG (logo « D » blanc sur carré bleu #0052FF, ou design final naming-validé).
2. Aller sur https://realfavicongenerator.net
3. Upload du SVG + générer le set complet
4. Remplacer les fichiers de ce dossier :
   - `favicon.ico` (multi-size 16/32/48)
   - `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`
   - `apple-touch-icon.png` (180×180)
   - `android-chrome-192x192.png`, `android-chrome-512x512.png`
   - `maskable-icon.png` (512×512 — safe area centrale 80 %)
   - `mstile-150x150.png`
   - `safari-pinned-tab.svg` (mono-couleur — déjà placeholder)
5. Vérifier le rendu sur https://realfavicongenerator.net/favicon_checker

## Pourquoi des placeholders maintenant ?

Les `<link>` tags dans tous les HTML pointent déjà vers ces fichiers — sans placeholders fonctionnels, la gate G31 (favicons) échoue. Les placeholders permettent de tester la structure tout de suite, le branding final attend le naming définitif.
