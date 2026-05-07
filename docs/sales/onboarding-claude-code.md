<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Onboarding Claude Code -->

# Intégrer DevRefs dans Claude Code — Guide pas-à-pas

[Framework : PAS — Problem → Agitate → Solution]
[Conscience : Solution-Aware]
**Temps estimé : 6-10 min** (wallet déjà existant) | **15-20 min** (création wallet incluse)

---

## Le problème

Ton agent Claude Code interroge Anthropic Pricing, pricepertoken.com et llm-prices.com avant chaque estimation de coût LLM. Résultat : 67 000 tokens consommés par estimation, 30+ secondes d'attente, et trois sources qui affichent trois prix différents.

DevRefs règle ça en un appel : `GET /api/llm-prices?model=opus-4.7` → JSON daté → $0.001 USDC.

---

## Prérequis

- [ ] Node.js ≥ 20 installé (`node --version`)
- [ ] pnpm installé (`npm install -g pnpm` si absent)
- [ ] Wallet EVM avec $10+ USDC sur Base mainnet (voir étape 1)
- [ ] Claude Code CLI installé et fonctionnel (`claude --version`)

---

## Étape 1 — Créer et top-up ton wallet (5 min si déjà wallet : skip)

Un agent autonome a besoin d'un wallet dédié aux micro-paiements x402. Ne jamais utiliser ton wallet principal.

**Option A — Coinbase Wallet (recommandée pour test local)** :

1. Installe l'extension Coinbase Wallet (Chrome/Brave)
2. Crée un wallet → sauvegarde la seed phrase hors ligne
3. Note la clé privée : Paramètres → Clé privée (format `0x...`)
4. Top-up $10 USDC Base via Coinbase Onramp (CB → Base direct, ~2 min)

**Option B — Génère une clé programmatiquement** (pour agents server-side) :

```bash
node -e "const {privateKeyToAccount} = require('viem/accounts'); \
  const key = '0x' + require('crypto').randomBytes(32).toString('hex'); \
  console.log('PRIVATE_KEY:', key); \
  console.log('ADDRESS:', privateKeyToAccount(key).address);"
```

Puis top-up l'adresse générée via Coinbase Onramp ou bridge depuis un autre wallet.

**Avertissement** : prévoir ~$0.50 ETH Base pour le gas en cas de settlement on-chain (rare avec Coinbase facilitator, mais possible).

---

## Étape 2 — Installer le MCP server Coinbase x402 (2 min)

```bash
# Clone le repo (ou fork si tu veux pincer une version)
git clone https://github.com/coinbase/x402.git
cd x402/typescript/examples/clients/mcp
pnpm install
```

Vérifie que l'install s'est bien passée :

```bash
ls node_modules | grep -E "x402|viem"
# Doit afficher : x402, viem
```

---

## Étape 3 — Configurer Claude Code (2 min)

**Via commande CLI (méthode rapide)** :

```bash
claude mcp add devrefs-x402 \
  --command pnpm \
  --args "--dir,/CHEMIN/ABSOLU/x402/typescript/examples/clients/mcp,dev" \
  --env "EVM_PRIVATE_KEY=0xTON_WALLET_PRIVE,RESOURCE_SERVER_URL=https://devrefs.dev"
```

Remplace `/CHEMIN/ABSOLU/x402/...` par le chemin exact sur ta machine et `0xTON_WALLET_PRIVE` par ta clé privée.

**Fallback : édition manuelle de `~/.claude.json`** (si la commande CLI échoue avec des args longs) :

```json
{
  "mcpServers": {
    "devrefs-x402": {
      "command": "pnpm",
      "args": [
        "--dir",
        "/CHEMIN/ABSOLU/x402/typescript/examples/clients/mcp",
        "dev"
      ],
      "env": {
        "EVM_PRIVATE_KEY": "0xTON_WALLET_PRIVE",
        "RESOURCE_SERVER_URL": "https://devrefs.dev"
      }
    }
  }
}
```

---

## Étape 4 — Vérifier la configuration (1 min)

```bash
claude mcp list
# Attendu :
# devrefs-x402 — pnpm (running)
```

Si le statut est `stopped` : relancer avec `claude mcp restart devrefs-x402`.

---

## Étape 5 — 1ère query test + validation paiement x402 (1 min)

Lance une session Claude Code et demande :

```
Use devrefs-x402 to get the current pricing for claude opus-4.7.
```

**Réponse attendue de l'agent** :

```json
{
  "model": "opus-4.7",
  "input_per_mtok": 5,
  "output_per_mtok": 25,
  "effective_cost_factor": 1.35,
  "dateModified": "2026-05-07T06:00:00Z",
  "sameAs": "https://www.anthropic.com/pricing"
}
```

**Validation paiement** : dans la console MCP, tu dois voir :

```
[devrefs-x402] Payment sent: $0.001 USDC on Base
[devrefs-x402] Request completed: 200 OK
```

Si tu vois `402 Payment Required` sans résolution → voir section Fallback debug.

---

## Point d'attention — Permissions MCP

Claude Code affiche une popup de permission au premier tool-call :

```
Allow devrefs-x402 to call get_llm_prices? [Yes / No / Always]
```

- En mode dev local : sélectionne **Always** pour ne plus être interrompu
- En mode agentic (agent lancé sans humain devant) : ajoute `--dangerously-skip-permissions` au lancement de session (ne pas utiliser en prod avec un wallet chargé)

---

## Fallback debug

| Symptôme                                        | Cause probable                         | Fix                                                                   |
| ----------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| `402 Payment Required` (boucle sans résolution) | Wallet vide ou USDC sur mauvais réseau | Vérifier balance sur `basescan.org/address/TON_ADDRESS`               |
| `Cannot find module 'x402'`                     | pnpm install incomplet                 | `cd .../mcp && pnpm install --frozen-lockfile`                        |
| `claude mcp list` vide                          | Chemin absolu incorrect                | Vérifier le chemin avec `ls /CHEMIN/ABSOLU/x402/.../mcp/package.json` |
| Timeout MCP                                     | pnpm dev ne démarre pas                | `pnpm dev` manuellement dans le dossier mcp, chercher l'erreur        |
| `EVM_PRIVATE_KEY invalid`                       | Format incorrect                       | Doit commencer par `0x` suivi de 64 hex chars                         |
| Clé privée exposée dans les logs                | Réglage logging trop verbeux           | Supprimer `DEBUG=*` de l'env                                          |

---

## Prochaine étape recommandée

Ton agent Claude Code peut maintenant appeler DevRefs avant chaque estimation de coût. Étape suivante : acheter un **Pack Standard $10** (10 000 calls) pour éliminer la signature x402 par call et passer sous 50 ms de latence.

```
Use devrefs-x402 to purchase the Standard pack ($10 USDC, 10,000 calls).
```

---

**Handoff → @growth**

- Ce tutoriel est prioritaire pour Dev.to (audience directe Claude Code users)
- Format Dev.to cible : 800-1000 mots, code blocks, temps de lecture 4 min
- CTA en fin d'article : lien direct `https://devrefs.dev/#pack-standard`
- Ne pas promettre "2 minutes" — temps honnête 6-10 min (règle @ia section 6)
