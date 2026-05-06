# Actions manuelles Thomas — DevRefs Phase 4c+4d

> Ce fichier liste les actions qui NE peuvent PAS être faites par les agents (clés secrètes, design d'images binaires, validation DNS).
> Toute action listée ici DOIT être effectuée avant la mise en production.

## A. Cloudflare — Workers + KV

### A.1 Création des 6 namespaces KV (1 fois)

```bash
wrangler kv:namespace create PRICES_KV
wrangler kv:namespace create SDK_KV
wrangler kv:namespace create PACK_KV
wrangler kv:namespace create AUDIT_METADATA_KV
wrangler kv:namespace create JWT_KV
wrangler kv:namespace create CRON_STATE_KV
```

Reporter chaque ID retourné dans `wrangler.toml` aux emplacements `id = "TODO_RUN: ..."`.

### A.2 Secrets Workers (7) — `wrangler secret put NAME`

```bash
wrangler secret put COINBASE_X402_FACILITATOR_KEY
wrangler secret put DEVREFS_TREASURY_WALLET
wrangler secret put HMAC_SECRET_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put INDEXNOW_API_KEY
wrangler secret put JWT_SECRET
```

Optionnel mais recommandé pour les alertes cron :

```bash
wrangler secret put ADMIN_ALERT_EMAIL  # ex : alerts@devrefs.dev
```

## B. IndexNow — clé Bing

1. Génère ta clé sur https://www.bing.com/indexnow/getstarted (32 chars hex).
2. Renomme `public/INDEXNOW_KEY_PLACEHOLDER.txt` en `public/{your-key}.txt` (le contenu doit être uniquement la clé).
3. Configure le secret CF : `wrangler secret put INDEXNOW_API_KEY` (utilise la même valeur).
4. Vérifie post-déploiement : `curl https://devrefs.dev/{your-key}.txt` doit retourner la clé.

## C. Mailchannels — DKIM + SPF DNS

Mailchannels est gratuit pour Cloudflare Workers mais requiert DKIM + SPF configurés sur le domaine d'envoi.

### C.1 SPF — TXT record sur `devrefs.dev`

```
v=spf1 include:relay.mailchannels.net ~all
```

### C.2 DKIM — TXT record sur `mailchannels._domainkey.devrefs.dev`

Suis https://support.mailchannels.com/hc/en-us/articles/16918954360845 :

```bash
# Génère la paire DKIM (1 fois)
openssl genrsa -out dkim_private.pem 2048
openssl rsa -in dkim_private.pem -pubout -out dkim_public.pem
# Le TXT record = "v=DKIM1; k=rsa; p={base64 public key sans newlines}"
```

Puis configure le secret côté CF Workers :

```bash
wrangler secret put MAILCHANNELS_DKIM_PRIVATE_KEY
# Coller le contenu de dkim_private.pem (sans BEGIN/END headers)
```

### C.3 Domain Lockdown (anti-spoofing — recommandé)

Ajoute un TXT sur `_mailchannels.devrefs.dev` :

```
v=mc1 cfid=devrefs.workers.dev
```

(Remplace par le bon `cfid` de ton compte CF).

## D. Favicons — design final post-naming

Les 12 favicons actuels sont des placeholders fonctionnels (rectangles bleu #0052FF unis). Voir `public/favicons/README-thomas.md`.

1. Préparer logo source SVG (logo « D » ou design final naming-validé).
2. Aller sur https://realfavicongenerator.net
3. Upload du SVG → générer le set complet.
4. Remplacer tous les fichiers de `public/favicons/` (sauf `manifest.webmanifest`, `browserconfig.xml`, `README-thomas.md`).
5. Vérifier sur https://realfavicongenerator.net/favicon_checker post-deploy.

## E. OG image (1200×630)

`public/og/og-image.png` est un placeholder. Action @design : produire l'OG image finale 1200×630 (hero `Cost intelligence for AI agents.` + visual JSON snippet) à remplacer.

## F. Stripe — Payment Link top-up

1. Créer un Payment Link Stripe `$10 USDC top-up Pack Standard`.
2. Configurer success_url = `https://devrefs.dev/dashboard?token={JWT_FROM_WEBHOOK}`.
3. Configurer webhook → `https://devrefs.dev/api/sponsor/topup-confirm` (à implémenter Phase 4e).
4. Reporter le Payment Link URL dans le `<form action>` de `public/paywall/index.html` (actuellement pointe vers `/api/sponsor/topup-init` placeholder).

## G. Pre-deploy checks

```bash
# 1. Tests + typecheck + lint + build
pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build

# 2. Bundle sizes
du -b public/styles/main.css   # < 20 480
du -b public/scripts/tracking.js   # < 1024
du -b dist/worker.js   # < 1 MB

# 3. Verbatim checks
grep -c "Cost intelligence for AI agents." public/index.html
grep -c "L.221-28 13° du Code de la consommation" public/paywall/index.html

# 4. Anti-règles
grep -rl googletagmanager public/ ; grep -rli posthog public/ | grep -v privacy

# 5. 12 favicons présents
ls public/favicons/*.{png,ico,svg,webmanifest,xml} | wc -l   # = 12
```

## H. Deploy

```bash
# Preview
pnpm deploy:preview

# Production
pnpm deploy:prod
```

Cron triggers (5) sont activés automatiquement par Wrangler depuis `wrangler.toml [triggers].crons`.

## I. Sub-phases 4e + 4f (2026-05-06)

### I.1 Stripe Tax — Activer dans Dashboard

1. https://dashboard.stripe.com/tax
2. Activer Stripe Tax sur le compte
3. Reverse charge UE (B2B) : auto si TVA intracommunautaire renseignée
4. OSS UE (B2C) : auto selon `customer_address.country`
5. Aucun calcul TVA côté DevRefs (Stripe gère).

### I.2 Webhooks Stripe (Dashboard)

1. https://dashboard.stripe.com/webhooks → 'Add endpoint'
2. URL : `https://devrefs.dev/api/webhooks/stripe`
3. Events : `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`
4. Récupérer signing secret → `wrangler secret put STRIPE_WEBHOOK_SECRET`

### I.3 Webhooks Coinbase x402 (Facilitator)

1. Configurer URL webhook : `https://devrefs.dev/api/webhooks/coinbase`
2. Événements : `x402.settle.completed`, `x402.settle.failed`, `x402.pack.purchased`
3. Signature shared key → `COINBASE_X402_FACILITATOR_KEY` (déjà existant)

### I.4 Génération baselines screenshots Playwright (1 fois)

```bash
pnpm exec playwright install chromium
UPDATE_SCREENSHOTS=1 pnpm test:visual
git add tests/screenshots/baseline/
git commit -m 'chore: add visual regression baselines'
```

### I.5 Lancer les tests E2E + a11y + visual

```bash
pnpm exec playwright install --with-deps
pnpm test:e2e         # 21 tests US
pnpm test:a11y        # 4 pages, 0 serious/critical
pnpm test:visual      # diff vs baselines (seuil 100 px)
pnpm test:integration # 7 tests pivot v2
```

### I.6 Vérification finale 4e+4f

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:integration && pnpm build
du -b dist/worker.js  # < 1 MB (actuellement ~114 KB)
```
