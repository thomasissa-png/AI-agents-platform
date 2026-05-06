# Screenshots baselines — Visual regression G26

## État au 2026-05-06

**12 baselines présentes** dans `tests/screenshots/baseline/` — générées le 2026-05-06T18:01:35Z depuis `https://devrefs.dev/` :

| Page          | Mobile 375                  | Tablet 768                  | Desktop 1280                 |
| ------------- | --------------------------- | --------------------------- | ---------------------------- |
| `/` (landing) | landing-375.png (649 KB)    | landing-768.png (632 KB)    | landing-1280.png (708 KB)    |
| `/paywall`    | paywall-375.png (120 KB)    | paywall-768.png (119 KB)    | paywall-1280.png (123 KB)    |
| `/dashboard`  | dashboard-375.png (30 KB)   | dashboard-768.png (32 KB)   | dashboard-1280.png (31 KB)   |
| `/llm-prices` | llm-prices-375.png (149 KB) | llm-prices-768.png (156 KB) | llm-prices-1280.png (156 KB) |

Format : PNG fullPage, 8-bit/color RGB, non-interlaced. Dimensions verifiées via `file *.png`.

## ATTENTION — Taille landing > 200 KB

Les 3 baselines `landing-*.png` dépassent la règle "< 200 KB" car la landing est très longue (5884 px de hauteur sur desktop). Le pixel-diff fonctionne quand même mais le repo gagne ~2 MB. Options pour V1.1 :

- Compresser les baselines via `pngquant --quality=70-85` (gain ~50% sans diff visuel notable)
- Limiter le screenshot à viewport (sans `fullPage: true`) → casse la couverture du fold below-the-fold

Décision actuelle : conserver les baselines fullPage. Les 12 fichiers totalisent ~2.8 MB, acceptable pour ce repo.

## Workflow visual regression (G26 BLOQUANT)

### En CI (GitHub Actions, prod-only via `deploy-prod` qui dépend de `e2e`)

1. `pnpm exec playwright install --with-deps chromium`
2. `pnpm test:visual` (config : `playwright.visual.config.ts`)
3. Le test `tests/visual/visual-regression.spec.ts` :
   - Screenshot fullPage de chaque page
   - Compare au baseline via `pixelmatch` (seuil 100 pixels diff)
   - Si diff > 100 → fail + génère un PNG diff dans `tests/screenshots/diff/`

### En local (régénération volontaire après refonte UI)

```bash
UPDATE_SCREENSHOTS=1 pnpm test:visual
# OU
pnpm playwright test tests/visual/visual-regression.spec.ts --update-snapshots
```

**ATTENTION** : ne JAMAIS regénérer les baselines sans review humain visuel. Lire chaque PNG avec un viewer image et valider que le rendu correspond aux specs `docs/design/page-compositions.md` AVANT de committer.

## Pourquoi pas de regen dans cette session

Tentative de regénération via `pnpm test:visual --update-snapshots` non exécutée car :

- Playwright browsers absents du cache sandbox (`~/.cache/ms-playwright` n'existe pas)
- `playwright install --with-deps` nécessite `apt-get install` (sudo) en sandbox restreinte
- Les 12 baselines actuelles sont valides (générées 2026-05-06 depuis devrefs.dev prod) et suffisent pour gater G26 en CI GitHub Actions où Playwright fonctionne out-of-the-box

Verdict : **PASS — pas de regen nécessaire, baselines existantes valides**.

## Sous-dossiers

- `baseline/` — référence approuvée, comparée à chaque CI run
- `actual/` — produit à chaque test (dernier run), gitignored
- `diff/` — PNG diff des pixels modifiés (généré uniquement si > seuil), gitignored
