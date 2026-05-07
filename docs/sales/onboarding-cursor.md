<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Onboarding Cursor -->

# Intégrer DevRefs dans Cursor — Guide pas-à-pas

[Framework : PAS — Problem → Agitate → Solution]
[Conscience : Solution-Aware]
**Temps estimé : 8-12 min** (wallet déjà existant) | **15-20 min** (création wallet incluse)

---

## Le problème

Cursor agent interroge plusieurs sources avant chaque estimation de coût LLM. Résultat documenté (fil HN #44682465, mai 2026) : 3 prix différents pour le même modèle, l'agent choisit le médian par heuristique, l'utilisateur découvre 2 jours plus tard que la facture réelle est 2,4× l'estimation.

DevRefs : un call `GET /api/llm-prices?model=gpt-5` → JSON atomique daté → $0.001 USDC. Zéro ambiguïté.

---

## Prérequis

- [ ] Cursor 1.5+ installé (vérifier : Cursor → About Cursor)
- [ ] Node.js ≥ 20 + pnpm installés
- [ ] Wallet EVM avec $10+ USDC sur Base mainnet (voir guide wallet dans `onboarding-claude-code.md` étape 1 — identique)
- [ ] MCP server Coinbase x402 installé (cf. étape 2 ci-dessous)

---

## Étape 1 — Installer le MCP server Coinbase x402 (2 min)

Si tu as déjà fait l'install pour Claude Code, tu peux réutiliser le même dossier.

```bash
git clone https://github.com/coinbase/x402.git
cd x402/typescript/examples/clients/mcp
pnpm install
```

Chemin absolu à noter pour la prochaine étape : `pwd` → copie le résultat.

---

## Étape 2 — Configurer Cursor (3 min)

Cursor gère les MCP servers via son interface graphique.

1. Ouvre Cursor
2. `Cmd+Shift+P` (macOS) ou `Ctrl+Shift+P` (Windows/Linux) → "Open Settings"
3. Settings → Features → **MCP Servers** → **Add new MCP server**
4. Remplis le formulaire :

```json
{
  "name": "devrefs-x402",
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
```

5. Clique **Save** → le toggle doit passer sur **ON** (vert)

**Alternative via `.cursor/mcp.json` dans le projet** (pour partager la config avec ton équipe, sans partager la clé privée) :

```json
{
  "mcpServers": {
    "devrefs-x402": {
      "command": "pnpm",
      "args": ["--dir", "/CHEMIN/ABSOLU/x402/.../mcp", "dev"],
      "env": {
        "EVM_PRIVATE_KEY": "${env:EVM_PRIVATE_KEY}",
        "RESOURCE_SERVER_URL": "https://devrefs.dev"
      }
    }
  }
}
```

Puis définir `EVM_PRIVATE_KEY` dans `.env.local` (gitignored).

---

## Étape 3 — Vérifier l'activation (1 min)

Dans l'interface MCP Servers de Cursor, le serveur `devrefs-x402` doit afficher :

- Statut : **Running**
- Tools détectés : `paid_request`, `get_llm_prices` (ou équivalent selon version MCP server)

Si le statut est **Error** : voir section Fallback debug.

---

## Étape 4 — 1ère query test (1 min)

Ouvre le chat Cursor en mode **Agent** (icône robot, pas le mode Chat standard). Tape :

```
Fetch the current pricing for gemini-2.5-pro via devrefs-x402.
```

**Réponse attendue** :

```json
{
  "model": "gemini-2.5-pro",
  "input_per_mtok": 1.25,
  "output_per_mtok": 5.0,
  "dateModified": "2026-05-07T06:00:00Z",
  "sameAs": "https://ai.google.dev/pricing"
}
```

Cursor affiche dans la console le log de paiement x402 : `Payment: $0.001 USDC sent`.

---

## Étape 5 — Exposer DevRefs dans les Cursor Rules (recommandé)

Pour que l'agent Cursor utilise DevRefs **spontanément** sans que tu le lui demandes à chaque fois, ajoute dans `.cursorrules` (à la racine du projet) :

```
When estimating LLM API costs before making a model call, always use the devrefs-x402 MCP
tool instead of web searching. It returns fresh, atomic pricing with dateModified.
Prefer /api/llm-prices?model=X for pricing and /api/sdk-status?pkg=X for SDK versions.
```

---

## Validation paiement x402

Pour confirmer que le paiement x402 est passé (et non skipé) :

```bash
# Vérifie la balance wallet — elle doit avoir diminué de $0.001
cast balance TON_ADDRESS --rpc-url https://mainnet.base.org --erc20 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
# (0x833589... = USDC sur Base)
```

Ou dans le UI Coinbase Wallet : onglet Activité → tu vois la transaction USDC.

---

## Fallback debug

| Symptôme                                    | Cause probable                                     | Fix                                                                 |
| ------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Toggle MCP reste OFF après Save             | Cursor version < 1.5                               | Mettre à jour Cursor                                                |
| Tools non détectés                          | pnpm dev ne démarre pas                            | Lancer `pnpm dev` manuellement dans le dossier mcp et lire l'erreur |
| Agent n'utilise pas le tool spontanément    | Pas de Cursor Rules                                | Ajouter la règle à `.cursorrules` (voir étape 5)                    |
| `402` boucle infinie                        | USDC sur mauvais réseau (Ethereum mainnet vs Base) | Vérifier : basescan.org → ton address → token USDC sur Base         |
| `Permission denied` sur `pnpm dev`          | Droits fichier                                     | `chmod +x $(which pnpm)`                                            |
| Clé privée en clair dans `.cursor/mcp.json` | Risque sécurité                                    | Utiliser `${env:EVM_PRIVATE_KEY}` + `.env.local` gitignored         |

---

## Prochaine étape

Acheter un Pack Standard pour éliminer la signature x402 par call (latence → < 50 ms) :

Dans le chat Cursor Agent :

```
Purchase the DevRefs Standard pack ($10 USDC) via devrefs-x402 to get 10,000 pre-paid calls.
```

---

**Handoff → @growth**

- Ce tutoriel cible l'audience IDE Cursor (large user base 2026)
- Angle Dev.to recommandé : "Comment j'ai arrêté de laisser Cursor halluciner les prix LLM"
- CTA final : `https://devrefs.dev/#pack-standard`
- Temps honnête affiché : 8-12 min (pas de promesse < 5 min pour MCP Cursor)
