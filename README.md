# DevRefs

Pricing & SDK references for AI agents — paid via x402 (USDC Base) on Cloudflare Workers.

> Stack : HTML statique + Cloudflare Workers TypeScript + KV + Analytics Engine. Pas de Next.js, pas de Vercel. Free tier 0 €.
> Sources autoritatives : `docs/product/functional-specs.md`, `docs/qa/qa-strategy.md`, `project-context.md`.

---

## Setup local — < 30 min

### Prérequis

- Node ≥ 20
- pnpm 9 (`npm i -g pnpm`)
- Wrangler CLI (`npm i -g wrangler`)
- Compte Cloudflare (free tier suffit)
- Compte GitHub (pour le repo)

### 1. Clone + install

```bash
git clone <repo-url> devrefs && cd devrefs
pnpm install            # installe deps + active Husky via "prepare"
```

### 2. Login Cloudflare

```bash
wrangler login
```

### 3. Créer les 6 KV namespaces

```bash
wrangler kv:namespace create PRICES_KV
wrangler kv:namespace create SDK_KV
wrangler kv:namespace create PACK_KV
wrangler kv:namespace create AUDIT_METADATA_KV
wrangler kv:namespace create JWT_KV
wrangler kv:namespace create CRON_STATE_KV
```

Chaque commande retourne un `id = "..."`. Coller chaque id dans `wrangler.toml` à la place du placeholder `TODO_RUN: ...`. Idem pour `--preview` si tu utilises l'environnement preview.

Raccourci : `pnpm kv:create:all` (chaîne les 6 commandes).

### 4. Configurer les 7 secrets Cloudflare

```bash
wrangler secret put COINBASE_X402_FACILITATOR_KEY
wrangler secret put DEVREFS_TREASURY_WALLET
wrangler secret put HMAC_SECRET_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put INDEXNOW_API_KEY
wrangler secret put JWT_SECRET
```

Cf. `docs/REPLIT_ACTIONS.md` pour la procédure d'obtention de chaque secret.

### 5. Configurer les 2 secrets GitHub repo

GitHub repo → Settings → Secrets and variables → Actions → New repository secret :

- `CLOUDFLARE_API_TOKEN` — scopes : Workers Scripts:Edit + KV:Edit + Pages:Edit + Account Analytics:Read
- `CLOUDFLARE_ACCOUNT_ID` — visible dans l'URL du dashboard CF ou Worker Overview

### 6. Branch protection main

GitHub repo → Settings → Branches → Add rule on `main` :

- Require pull request before merging (1 review minimum)
- Require status checks to pass : `lint-test`, `e2e (chromium)`, `e2e (firefox)`, `e2e (webkit)`, `build`
- Require linear history
- Include administrators

### 7. Lancer dev local

```bash
pnpm dev          # Worker local sur http://127.0.0.1:8787
```

### 8. Lancer la suite de tests

```bash
pnpm test:unit              # Vitest unit
pnpm test:integration       # Vitest integration (Wrangler dev en background)
pnpm test:e2e               # Playwright (3 navigateurs × 3 viewports)
```

### 9. Agents testeurs custom

Voir `.claude/agents/testeur-agent-ia.md` (GP1-GP10) et `.claude/agents/testeur-sponsor-humain.md` (GC1-GC10).

---

## Déploiement

| Trigger | Job | Cible |
|---|---|---|
| Push branche `claude/**` | `deploy-preview` | `devrefs-api-preview.<account>.workers.dev` |
| Merge dans `main` | `deploy-prod` | `devrefs.dev` |

Le pipeline GitHub Actions exécute `lint-test` → `e2e` (G26 BLOQUANT) → `build` → `deploy`. Aucune étape ne peut être skippée.

---

## Architecture

- 1 Worker `devrefs-api` exposant 10 endpoints (cf. `docs/product/functional-specs.md` §2.1)
- 6 KV namespaces (cf. `wrangler.toml`)
- 5 cron triggers (cf. `wrangler.toml [triggers]`)
- 1 dataset Analytics Engine (`devrefs_events`)
- 0 base de données relationnelle (stateless KV-only)

## Limites free tier (cf. functional-specs §5.3)

| Ressource | Limite | Estimation V1 |
|---|---|---|
| CF Workers requests | 100 000/jour | ~500-2 000/jour |
| CF KV reads | 100 000/jour | ~2 000/jour |
| CF KV writes | 1 000/jour | ~65/jour |
| CF AE events | 100 000/jour | ~3 500/jour |
| GitHub Actions | 2 000 min/mois (privé) | ~300 min/mois |

Si SLO 99.5 % manqué à J30 → upgrade Workers Paid 5 $/mois.

---

## Documentation

- `docs/product/functional-specs.md` — contracts API, KV schemas, crons, secrets
- `docs/qa/qa-strategy.md` — gates G1-G32, process QA, seuils coverage
- `docs/legal/legal-audit.md` — conformité RGPD, CGU, INF-1 à INF-15
- `docs/REPLIT_ACTIONS.md` — actions manuelles post-livraison @infrastructure
- `CLAUDE.md` — conventions de l'équipe IA (7 commandements)
