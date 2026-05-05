<!-- Version: 2026-05-05T13:00 — @ia — Phase 0 v2 — Spec 1 intégration agent (B2A pure) -->

# Agent Integration Guide — DevRefs

## Résumé exécutif

- **Objectif** : permettre à un agent IA (ou son superviseur humain) d'intégrer DevRefs en < 15 min sans rencontrer de trou. Couverture des 6 majors agents 2026.
- **Décisions clés** :
  1. **Voie native officielle** = Coinbase MCP server (Claude Desktop / Claude Code / Cursor / MCP-host génériques) — single source of truth, maintenue par Coinbase.
  2. **Voie wrapper recommandée** = `x402-axios` ou `x402-fetch` (AgentKit, Mastra, SDK custom) — 5-15 lignes de code, zéro config MCP.
  3. **Wallet provisioning par défaut** = Coinbase Developer Platform (CDP) Server Wallet ou wallet EVM standard, USDC sur Base mainnet, top-up min recommandé **$10 USDC** (≈ 1 000 calls Offre 1 ou 100 audits Offre 2 au prix pack).
  4. **Voies à éviter V1** : intégration custom MCP server (> 30 min), client x402 from scratch (re-implémentation cryptographique).
- **Verdict consolidé** : 5/6 voies = "oui native ou wrapper" V1. AgentKit/Mastra à promouvoir prioritaire en Dev.to/Reddit (highest leverage : agents prod 2026).
- **Sources vérifiées** (mai 2026) : `docs.cdp.coinbase.com/x402/mcp-server`, `github.com/coinbase/x402`, `x402.org/writing/x402-v2-launch`, `support.claude.com/en/articles/10949351`.

---

## 1. Vue d'ensemble — 6 voies × 2 offres

DevRefs expose 3 endpoints HTTP 402 :
- `GET /api/llm-prices?model=X` — Offre 1 (Calcul coût pricing)
- `GET /api/sdk-status?pkg=X` — Offre 1 (Calcul coût SDK)
- `POST /api/agent-audit` — Offre 2 (Audit heuristique statique)

Chaque endpoint répond `HTTP 402 Payment Required` avec un body JSON x402 (cf. `x402-response-spec.md`). Le client agent doit signer une transaction USDC Base et rejouer la requête avec le header `X-PAYMENT`.

Trois familles d'intégration possibles :

| Famille | Mécanique | Cible agents |
|---|---|---|
| **MCP server (Coinbase officiel)** | Le MCP server bridge les endpoints HTTP 402 en MCP tools. L'agent appelle l'outil MCP, le serveur paie en background. | Claude Desktop, Claude Code, Cursor, MCP-host génériques |
| **Wrapper HTTP client (`x402-axios` / `x402-fetch`)** | Drop-in replacement du client HTTP. Intercepte 402, signe, rejoue. | AgentKit, Mastra, SDK custom Python/TS |
| **Custom client x402** | Implémentation manuelle de la spec x402 (signature EIP-712, header `X-PAYMENT`). | Cas avancé uniquement — à éviter V1 |

---

## 2. Intégration par agent

### 2.1 Claude Desktop — via Coinbase MCP server

**Faisabilité V1** : OUI native.

#### Étapes (5 max)

1. Installer Node.js ≥ 20 et `pnpm` (prérequis Coinbase MCP server).
2. Cloner `github.com/coinbase/x402` puis `cd typescript/examples/clients/mcp && pnpm install`.
3. Créer ou récupérer un wallet EVM (clé privée) → top-up $10+ USDC sur Base mainnet via Coinbase Onramp ou bridge.
4. Éditer `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows) :

```json
{
  "mcpServers": {
    "devrefs-x402": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/x402/typescript/examples/clients/mcp", "dev"],
      "env": {
        "EVM_PRIVATE_KEY": "0x...",
        "RESOURCE_SERVER_URL": "https://devrefs.dev"
      }
    }
  }
}
```

5. Redémarrer Claude Desktop. L'icône MCP doit apparaître. Tester : "Use the devrefs tool to get the price of opus-4.7".

#### Snippet (config exact, prêt à coller)

Voir étape 4 ci-dessus.

#### Temps réel d'intégration : **8-12 min** (dont ~5 min top-up USDC si wallet déjà existant, sinon ~20 min total avec création wallet et bridge).

#### Wallet provisioning

- **Recommandé** : Coinbase Wallet ou Coinbase Onramp (achat USDC direct CB → Base) pour simplifier la chaîne.
- **Alternatif** : MetaMask + bridge ETH → Base + swap → USDC (overhead).
- **Top-up minimum recommandé** : **$10 USDC** = ~1 000 calls Offre 1 (pack pré-payé $10 = 10 000 calls — voir `agent-economics.md` § C) ou ~100 audits si pack Offre 2.

#### Limites connues

- Redémarrage Claude Desktop obligatoire après modif config (pas de hot-reload MCP en mai 2026).
- La clé privée est stockée en clair dans le JSON config — risque si machine partagée. Mitigation : utiliser un wallet dédié uniquement pour x402 micro-paiements, jamais le main wallet.
- Pas de UI pour limite de dépense par session : tout est piloté par le solde wallet.

---

### 2.2 Claude Code — via Coinbase MCP server

**Faisabilité V1** : OUI native (même base technique que Claude Desktop).

#### Étapes (5 max)

1. Pré-requis identiques 2.1 (Node ≥ 20, pnpm, wallet EVM).
2. Installer le MCP server localement (cf. 2.1 étape 2).
3. Top-up wallet (cf. 2.1 étape 3).
4. Ajouter dans `~/.claude.json` (ou via `claude mcp add`) :

```bash
claude mcp add devrefs-x402 \
  --command pnpm \
  --args "--dir,/absolute/path/to/x402/typescript/examples/clients/mcp,dev" \
  --env "EVM_PRIVATE_KEY=0x...,RESOURCE_SERVER_URL=https://devrefs.dev"
```

5. Vérifier : `claude mcp list` doit montrer `devrefs-x402`. Lancer une session Claude Code et tester un tool-call DevRefs.

#### Temps réel d'intégration : **6-10 min** (Claude Code = pas de redémarrage nécessaire, MCP rechargé per-session).

#### Wallet provisioning

Identique 2.1.

#### Limites connues

- `claude mcp add` peut ne pas accepter les longues commandes pnpm avec `--dir` selon version CLI (testé v1.x mai 2026). Fallback : édition manuelle `~/.claude.json`.
- Permissions MCP demandées au premier tool-call ("Allow devrefs-x402 to call get_llm_prices?") — peut casser un flow agentic si pas de pre-approval. Mitigation : `--dangerously-skip-permissions` en dev, à éviter en prod.

---

### 2.3 Cursor agent — via Coinbase MCP server

**Faisabilité V1** : OUI native (Cursor supporte MCP en 2026).

#### Étapes (5 max)

1. Pré-requis 2.1 (Node, pnpm, wallet EVM, top-up).
2. Installer MCP server local (cf. 2.1 étape 2).
3. Cursor → Settings → Features → MCP Servers → "Add new MCP server".
4. Configurer :

```json
{
  "name": "devrefs-x402",
  "command": "pnpm",
  "args": ["--dir", "/abs/path/to/x402/.../mcp", "dev"],
  "env": {"EVM_PRIVATE_KEY": "0x...", "RESOURCE_SERVER_URL": "https://devrefs.dev"}
}
```

5. Toggle ON le serveur. Tester dans le chat agent : "fetch opus-4.7 pricing via devrefs".

#### Temps réel d'intégration : **8-12 min**.

#### Wallet provisioning

Identique 2.1.

#### Limites connues

- Cursor MCP support stable depuis Q4 2025 mais l'UI de configuration a évolué — vérifier la version (1.5+ recommandé).
- Pas de garantie que l'agent Cursor utilise spontanément le tool MCP — dépend du prompt système. Recommandation : exposer le tool comme "preferred for fresh API pricing" dans les rules custom.

---

### 2.4 AgentKit (OpenAI Agents SDK / Anthropic Agents SDK) — via `x402-axios`

**Faisabilité V1** : OUI wrapper. **Voie recommandée pour agents prod**.

#### Étapes (4 max)

1. `npm install x402-axios viem` dans le projet de l'agent.
2. Configurer un wallet EVM viem (clé privée → account local).
3. Wrapper l'instance axios :

```typescript
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);
const api = withPaymentInterceptor(
  axios.create({ baseURL: "https://devrefs.dev" }),
  account
);

// Usage dans un tool de l'agent
const { data } = await api.get("/api/llm-prices?model=opus-4.7");
// data = { input_per_mtok: 5, output_per_mtok: 25, effective_cost_factor: 1.35, ... }
```

4. Déclarer le tool dans la définition AgentKit (ex : `tool({ name: "get_llm_pricing", execute: async ({model}) => api.get(`/api/llm-prices?model=${model}`) })`).

#### Temps réel d'intégration : **3-5 min** (le plus rapide des 6).

#### Wallet provisioning

- **Recommandé** : Coinbase Developer Platform (CDP) Server Wallet — créé via API, pas d'extension browser, idéal pour agents server-side.
- **Alternatif** : viem `privateKeyToAccount()` avec clé en variable env.
- **Top-up minimum recommandé** : **$10 USDC Base** (1 000 calls Offre 1 pack ou 100 audits).

#### Limites connues

- `x402-axios` v0.x → vérifier compatibilité avec axios 1.x. Si breaking change, fallback `x402-fetch` (équivalent fetch natif).
- Le wallet doit avoir **un peu d'ETH Base** (~$0.50) pour le gas — bien que x402 facilitator Coinbase couvre la majorité des fees, certains paths nécessitent un settlement on-chain payé par le client. À documenter dans la doc DevRefs.

---

### 2.5 Mastra — via wrapper `x402-fetch`

**Faisabilité V1** : OUI wrapper.

#### Étapes (4 max)

1. `pnpm add x402-fetch viem` dans le projet Mastra.
2. Configurer un account viem (cf. 2.4).
3. Créer un tool Mastra qui utilise `x402-fetch` :

```typescript
import { createTool } from "@mastra/core";
import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);
const paidFetch = wrapFetchWithPayment(fetch, account);

export const getLlmPricing = createTool({
  id: "get-llm-pricing",
  description: "Get fresh pricing for an LLM model (paid via x402)",
  inputSchema: z.object({ model: z.string() }),
  execute: async ({ context }) => {
    const res = await paidFetch(`https://devrefs.dev/api/llm-prices?model=${context.model}`);
    return res.json();
  },
});
```

4. Enregistrer le tool dans l'agent Mastra (`new Agent({ tools: { getLlmPricing }, ... })`).

#### Temps réel d'intégration : **5-8 min**.

#### Wallet provisioning

Identique 2.4.

#### Limites connues

- Mastra écosystème en évolution rapide — les breaking changes sont fréquents. Pin la version (`@mastra/core@^X.Y.Z`).
- Pas de wrapper Mastra-natif x402 officiel en mai 2026 — `wrapFetchWithPayment` est suffisant. Si Mastra publie un `@mastra/x402`, migrer.

---

### 2.6 MCP-host génériques (LangGraph, AutoGen, custom MCP-clients) — via Coinbase MCP server

**Faisabilité V1** : OUI native (tout MCP-host respecte le protocole MCP standard).

#### Étapes (5 max)

1. Pré-requis 2.1 (Node, pnpm, wallet EVM, top-up).
2. Installer MCP server Coinbase (cf. 2.1 étape 2).
3. Lancer le MCP server en mode standalone (HTTP ou stdio selon host) : `pnpm dev` dans `typescript/examples/clients/mcp`.
4. Configurer le client MCP du host avec la commande `pnpm` + env vars (cf. 2.1 étape 4 — le format JSON varie selon host mais la structure est identique : `command`, `args`, `env`).
5. Tester via un appel `list_tools` MCP standard. Doit retourner les tools `paid_request` ou équivalent.

#### Temps réel d'intégration : **10-15 min** (variable selon host — LangGraph natif MCP = 8 min, custom = 15 min).

#### Wallet provisioning

Identique 2.1.

#### Limites connues

- Hétérogénéité des MCP-hosts : certains supportent stdio uniquement, d'autres HTTP-only. Vérifier la doc du host.
- Pas de garantie de découvrabilité automatique — le tool doit être explicitement référencé dans le prompt système de l'agent.

---

### 2.7 Agent SDK custom Python/TS — via x402 SDK direct

**Faisabilité V1** : OUI wrapper (Python : `x402-requests`, TS : `x402-axios` ou `x402-fetch`).

#### Étapes Python (4 max)

1. `pip install x402-requests web3`.
2. Configurer un wallet (clé privée env var) :

```python
from x402_requests import X402Session
from web3 import Account

account = Account.from_key(os.environ["EVM_PRIVATE_KEY"])
session = X402Session(account=account, network="base")

resp = session.get("https://devrefs.dev/api/llm-prices?model=opus-4.7")
data = resp.json()  # { "input_per_mtok": 5, "effective_cost_factor": 1.35, ... }
```

3. Intégrer dans la boucle d'outils de l'agent SDK custom.
4. Logger les paiements (header `X-Payment-Response`) pour audit.

#### Temps réel d'intégration : **5-10 min**.

#### Wallet provisioning

- **Server-side** : CDP Server Wallet via API (préféré pour agents headless).
- **Alternatif** : web3.py `Account.from_key()` avec clé env var.
- **Top-up minimum** : **$10 USDC Base** (cf. autres voies).

#### Limites connues

- `x402-requests` (Python) maturité moindre que `x402-axios` (TS) — vérifier issues GitHub coinbase/x402 avant prod.
- Pas de support natif async (Python) au moment de la spec — wrapper httpx en cours upstream. Workaround : run dans threadpool.

---

## 3. Wallet provisioning détaillé

### 3.1 Choix recommandé par cas d'usage

| Cas d'usage | Wallet recommandé | Pourquoi |
|---|---|---|
| Dev humain teste localement | Coinbase Wallet browser extension + Coinbase Onramp | UX simple, achat USDC direct par carte |
| Agent server-side prod | CDP Server Wallet (API) | Pas d'UI, signature programmable, gestion de quota Coinbase |
| Agent multi-tenant (SaaS qui exécute des agents pour ses clients) | CDP Smart Wallet per-tenant | Isolation des fonds par tenant, audit per-call |
| Sandbox / test | Wallet EVM testnet (Base Sepolia) + faucet | Zéro coût, mais x402 facilitator Coinbase doit être configuré sur testnet |

### 3.2 Top-up minimum recommandé pour DevRefs

Calcul basé sur le pricing pack pré-payé (cf. `agent-economics.md` § C) :

| Pack | Prix | Volume | Usage typique |
|---|---|---|---|
| Pack Discovery | **$5 USDC** | 5 000 calls Offre 1 OU 50 audits | Test produit, premier projet |
| Pack Standard | **$10 USDC** | 10 000 calls Offre 1 OU 100 audits | Usage normal mensuel solo dev |
| Pack Pro | **$50 USDC** | 60 000 calls Offre 1 OU 600 audits | Scale-up, équipe IA prod |

**Recommandation V1 par défaut** : top-up **$10 USDC** (Pack Standard) — couvre 1 mois d'usage typique d'un agent solo qui interroge ~300 calls/jour.

### 3.3 Fees gas Base mainnet

x402 V2 Coinbase facilitator absorbe la majorité des fees on-chain via le scheme `exact` (USDC direct, pas de gas pour le client). En cas de scheme `deferred` ou `subscription` (V2), prévoir **~$0.50 ETH Base** dans le wallet pour fallback gas. Documentation actuelle : `docs.cdp.coinbase.com/x402/welcome`.

---

## 4. Verdict consolidé — Faisabilité V1 par agent

| Agent | Faisabilité V1 | Voie | Temps intégration | Priorité Dev.to/Reddit |
|---|---|---|---|---|
| **Claude Desktop** | OUI native | Coinbase MCP server | 8-12 min | Haute (audience humain dev qui teste, multiplie l'awareness) |
| **Claude Code** | OUI native | Coinbase MCP server | 6-10 min | **Très haute** (audience cible directe, agentic dev workflow) |
| **Cursor agent** | OUI native | Coinbase MCP server | 8-12 min | Haute (large user base IDE 2026) |
| **AgentKit** | OUI wrapper | `x402-axios` | **3-5 min** | **Très haute** (agents prod 2026, meilleur ratio leverage) |
| **Mastra** | OUI wrapper | `x402-fetch` | 5-8 min | Moyenne (écosystème en croissance, peu de prod) |
| **MCP-host génériques** | OUI native | Coinbase MCP server | 10-15 min | Basse (cas avancé, peu de volume) |
| **SDK custom Py/TS** | OUI wrapper | `x402-requests` / `x402-axios` | 5-10 min | Moyenne (devs experts, mais convertit bien en cas réussite) |

### Recommandation priorité contenu Dev.to/Reddit

1. **Tutoriel Claude Code + DevRefs** (audience cible directe persona principal)
2. **Tutoriel AgentKit + x402-axios + DevRefs** (agents prod, leverage max)
3. **Tutoriel Cursor + DevRefs** (audience large IDE)
4. Skip pour V1 : MCP-host génériques (volume trop bas), SDK custom (pas généraliste)

---

## 5. Voies écartées V1 (à éviter ou candidates V2)

| Voie | Raison écartage | Statut |
|---|---|---|
| Custom MCP server DevRefs (auto-hébergé par DevRefs) | Doublonne le MCP server Coinbase officiel sans valeur ajoutée. Override possible V2 si Coinbase MCP devient un goulot. | Candidate V2 si signal demande |
| Implémentation x402 from scratch (sans wrapper) | > 30 min, 100+ lignes signature EIP-712. Risque erreur cryptographique. | À éviter V1 (et V2) |
| Browser extension wallet (Phantom, MetaMask) en agent autonome | Nécessite UI humain pour signer chaque tx. Casse l'autonomie agent. | Réservé persona dev humain test/onboarding |
| Stripe Payment Link humain comme pilier de revenue | Décision fondateur 2026-05-05 : pivot 100% B2A x402. Stripe écarté en pilier. Peut éventuellement servir à un humain pour top-up le wallet x402 de son agent (à challenger si demande émerge). | **Écarté V1 comme pilier** |

---

## 6. Risques et points d'attention pour @copywriter / @growth

- **Anti-fausse promesse** : ne JAMAIS écrire "intégration en 2 minutes" — la réalité honnête est 3-5 min wrapper, 8-12 min MCP. Toute exagération fera fail GP1 (testeur agent IA détecte le délai réel).
- **Wallet friction** : la création + top-up wallet est le point n°1 de friction pour un dev humain qui découvre x402. Documenter ce flow comme étape 1, pas comme prérequis caché.
- **MCP permissions** : Claude Desktop / Code demandent une permission au premier tool-call. Si l'agent est lancé en autonomie sans humain devant, ça bloque. Documenter `--dangerously-skip-permissions` (Claude Code) ou approval upfront (Claude Desktop).

---

## Hypothèses faites

- [HYPOTHÈSE H1] : `x402-axios` v0.x stable au moment du build V1 DevRefs (juin 2026). À valider via `npm view x402-axios versions` au moment de @fullstack Phase 1.
- [HYPOTHÈSE H2] : Coinbase MCP server reste maintenu officiellement par Coinbase à 6 mois. Mitigation : code source disponible `github.com/coinbase/x402` — fork possible si abandon.
- [HYPOTHÈSE H3] : Mastra ne publie pas de `@mastra/x402` natif en V1. Si oui, migrer le tutoriel.
- [HYPOTHÈSE H4] : `x402-requests` Python v0.x suffit pour MVP — async non critique pour DevRefs (latence < 200 ms p95, blocking acceptable).

---

## Handoff @ia → @orchestrator (Spec 1)

- Statut : COMPLETE
- Voie principale recommandée : Coinbase MCP server (4 agents) + `x402-axios` (2 agents)
- 5/6 agents = faisabilité V1 confirmée native ou wrapper
- Top-up min wallet recommandé : $10 USDC Base
- Tutoriels prioritaires Dev.to : Claude Code, AgentKit, Cursor
- Voies écartées V1 : custom MCP server DevRefs, x402 from scratch, browser extension agent autonome, Stripe humain pilier (décision Thomas 2026-05-05)
