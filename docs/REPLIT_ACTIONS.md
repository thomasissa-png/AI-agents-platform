# REPLIT_ACTIONS — DevRefs Phase 2

> CLAUDE.md règle 11 — Liste exhaustive des actions manuelles à effectuer par Thomas après livraison @infrastructure.
> Note : DevRefs n'utilise PAS Replit. Le nom `REPLIT_ACTIONS.md` est juste la convention héritée du framework Gradient Agents — c'est le fichier standard pour lister les actions manuelles non automatisables.

Contexte : tous les fichiers de config (wrangler.toml, ci.yml, package.json, husky, gitignore, README) ont été produits par @infrastructure. Les actions ci-dessous sont à effectuer **avant le 1er deploy preview** (sauf mention contraire).

---

## 1. Cloudflare — compte + ressources

### 1.1 Login + account

- [ ] Compte CF créé (free tier) sur `dash.cloudflare.com`
- [ ] `wrangler login` exécuté en local — token stocké dans `~/.wrangler/config/default.toml`
- [ ] Récupérer `CLOUDFLARE_ACCOUNT_ID` (URL dashboard ou Worker Overview)

### 1.2 Créer les 6 KV namespaces

```bash
pnpm kv:create:all
# OU manuellement :
wrangler kv:namespace create PRICES_KV
wrangler kv:namespace create SDK_KV
wrangler kv:namespace create PACK_KV
wrangler kv:namespace create AUDIT_METADATA_KV
wrangler kv:namespace create JWT_KV
wrangler kv:namespace create CRON_STATE_KV
```

- [ ] 6 IDs collés dans `wrangler.toml` (remplacer `TODO_RUN: ...` par l'id réel)
- [ ] Optionnel : créer 6 namespaces `--preview` pour env preview isolé

### 1.3 Configurer les 7 secrets Worker

```bash
wrangler secret put COINBASE_X402_FACILITATOR_KEY    # Coinbase facilitator API key (cf. §4)
wrangler secret put DEVREFS_TREASURY_WALLET          # adresse wallet Base USDC (cf. §4)
wrangler secret put HMAC_SECRET_KEY                  # générer : openssl rand -hex 32
wrangler secret put STRIPE_SECRET_KEY                # Stripe live secret (cf. §3)
wrangler secret put STRIPE_WEBHOOK_SECRET            # Stripe webhook signing secret (cf. §3)
wrangler secret put INDEXNOW_API_KEY                 # générer : openssl rand -hex 16 (cf. §5)
wrangler secret put JWT_SECRET                       # générer : openssl rand -hex 32
```

- [ ] 7 secrets configurés
- [ ] Idem pour `--env preview` si env preview activé
- [ ] Vérifier : `wrangler secret list` → 7 entrées

### 1.4 Activer Analytics Engine dataset

- [ ] Dashboard CF → Workers & Pages → Analytics Engine → activer le dataset `devrefs_events` (auto-créé au 1er event si pas activé manuellement)

### 1.5 Activer Cron Triggers

- [ ] Cron triggers déclarés dans `wrangler.toml [triggers]` — actifs automatiquement après `wrangler deploy --env production`
- [ ] Vérifier dashboard CF → Worker → Triggers → 5 crons actifs

### 1.6 Domaine custom + route

- [ ] Domaine `devrefs.dev` ajouté à CF (DNS NS pointant vers CF)
- [ ] Zone `devrefs.dev` active (status "Active" dans dashboard)
- [ ] Route `devrefs.dev/api/*` configurée → worker `devrefs-api` (auto via wrangler deploy si zone CF)

### 1.7 Workers Paid (conditionnel)

- [ ] À activer **uniquement si** SLO 99.5 % manqué à J30 ou si quota free tier dépassé. Coût : 5 $/mois.

---

## 2. GitHub — repo + secrets + protection

### 2.1 Secrets repo

GitHub repo → Settings → Secrets and variables → Actions :

- [ ] `CLOUDFLARE_API_TOKEN` — créer sur dash.cloudflare.com → My Profile → API Tokens → Create Token. Scopes : Workers Scripts:Edit + KV:Edit + Pages:Edit + Account Analytics:Read. Account resources : Include All accounts. Zone resources : devrefs.dev.
- [ ] `CLOUDFLARE_ACCOUNT_ID` — copié depuis dashboard CF

### 2.2 Branch protection

GitHub repo → Settings → Branches → Add rule on `main` :

- [ ] Require pull request before merging (1 review minimum)
- [ ] Require status checks : `lint-test`, `e2e (chromium)`, `e2e (firefox)`, `e2e (webkit)`, `build`
- [ ] Require branches to be up to date before merging
- [ ] Require linear history
- [ ] Include administrators
- [ ] Restrict who can push to matching branches : owner uniquement

### 2.3 GitHub Actions free tier

- [ ] Vérifier free tier privé : 2 000 min/mois (Settings → Billing). Estimation V1 : ~300 min/mois.

---

## 3. Stripe — top-up sponsor (auxiliaire)

- [ ] Compte Stripe créé en mode live (après immatriculation auto-entreprise — bloquant cf. legal-audit P0)
- [ ] **Stripe Tax activé** (Dashboard → More → Tax → Enable) — gestion auto TVA reverse charge B2B UE + OSS B2C UE (legal-audit P0 §4)
- [ ] Payment Link créé pour top-up sponsor wallet (montant variable ou paliers 10 $ / 50 $ / 100 $)
- [ ] Webhook endpoint configuré : `https://devrefs.dev/api/webhooks/stripe`, events : `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Récupérer `STRIPE_SECRET_KEY` (sk_live_...) + `STRIPE_WEBHOOK_SECRET` (whsec_...) → `wrangler secret put`
- [ ] Test mode : utiliser `sk_test_...` + Payment Link sandbox pour tests intégration QA Phase 3

---

## 4. Coinbase — x402 facilitator + treasury wallet

### 4.1 API key facilitator

- [ ] Compte Coinbase Developer Platform créé sur `cloud.coinbase.com`
- [ ] x402 facilitator API key générée (sandbox d'abord, puis production)
- [ ] Stocker dans secret `COINBASE_X402_FACILITATOR_KEY`
- [ ] Tester en sandbox avec USDC Base Sepolia avant prod

### 4.2 Treasury wallet (réception USDC)

- [ ] Wallet self-custody créé sur Base mainnet (recommandé : Coinbase Wallet ou Rainbow)
- [ ] Adresse publique stockée dans secret `DEVREFS_TREASURY_WALLET`
- [ ] Sauvegarder seed phrase **hors ligne** (jamais en numérique, jamais committé)
- [ ] Vérifier que l'adresse est valide format EIP-55 (checksum case-mixed)

### 4.3 DPA (HYPOTHÈSE H1 legal-audit P0)

- [ ] **AVANT 1ère transaction** : email à `dpo@coinbase.com` confirmant DPA x402 facilitator + RGPD compliance
- [ ] Si pas de DPA acceptable sous 14j → fallback Stripe-only ou self-host facilitator (cf. legal-audit risque R1)

---

## 5. IndexNow — Bing crawler push

- [ ] Générer une clé API : `openssl rand -hex 16`
- [ ] Stocker dans secret `INDEXNOW_API_KEY`
- [ ] Créer fichier `{key}.txt` à la racine de Cloudflare Pages contenant uniquement la clé en plain text (vérification de propriété)
- [ ] Tester push : `curl -X POST "https://www.bing.com/indexnow?url=https://devrefs.dev/llms.txt&key=<KEY>"`

---

## 6. Mailchannels — emails transactionnels

- [ ] **Aucune action requise** — Mailchannels est gratuit pour CF Workers (intégration native via `https://api.mailchannels.net/tx/v1/send`)
- [ ] Configurer DKIM + SPF + DMARC sur `devrefs.dev` (DNS records cf. https://support.mailchannels.com/hc/en-us/articles/4565898358413)
- [ ] Tester : envoi d'un email test depuis Worker en local

---

## 7. Immatriculation + comptabilité (P0 legal-audit)

- [ ] Auto-entreprise BNC immatriculée (Guichet unique INPI) — délai 7-14 jours
- [ ] Expert-comptable consulté : traitement BNC stablecoin USDC + packs pré-payés (cours du jour, PUMP, settlement blockchain, note de crédit refund)
- [ ] Avocat conso consulté : (a) garantie ROI 50 % refund qualification, (b) renonciation L.221-28 13° checkbox landing

---

## 8. Monitoring + alerting (post-deploy)

- [ ] Cloudflare Health Checks activés sur 3 endpoints critiques (`/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit`) — SLO 99.5 %
- [ ] Mailchannels alertes configurées : downtime, cron failed, refund déclenché, pack expiring -7j (cf. INF-15)
- [ ] Dashboard CF Analytics Engine ouvert pour monitoring quotidien J+0 à J+30

---

## Récap : actions bloquantes avant 1er deploy preview

1. Cloudflare login + 6 KV créés + 7 secrets configurés
2. GitHub : 2 secrets repo + branch protection main
3. Coinbase : facilitator key sandbox + treasury wallet
4. (P0 legal-audit) Auto-entreprise immatriculée — bloquant 1ère transaction commerciale, pas le 1er deploy preview

## Récap : actions bloquantes avant 1er deploy production

Tout ce qui précède + :

5. Domaine `devrefs.dev` actif sur CF
6. Stripe Tax activé + Payment Link live
7. Coinbase facilitator key production + DPA confirmé (H1)
8. IndexNow key + fichier de vérification
9. DKIM/SPF/DMARC configurés
