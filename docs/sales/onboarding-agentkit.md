<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Onboarding AgentKit -->

# Intégrer DevRefs dans AgentKit — Guide pas-à-pas

[Framework : PAS — Problem → Agitate → Solution]
[Conscience : Solution-Aware]
**Temps estimé : 3-5 min** — voie la plus rapide des 6

---

## Pourquoi AgentKit + DevRefs ?

Ton agent AgentKit consomme des tokens chaque fois qu'il cherche le prix d'un modèle LLM ou la version d'un SDK avant d'agir. Avec `x402-axios`, un drop-in de 5 lignes remplace le WebSearch coûteux par un call JSON daté à $0.001 USDC — signé et payé automatiquement.

Voie recommandée prioritaire (cf. `agent-integration.md` § 4 — meilleur ratio leverage) : **x402-axios** sans MCP, zéro config JSON, 3-5 min.

---

## Prérequis

- [ ] Projet Node.js / TypeScript existant avec AgentKit
- [ ] `axios` déjà dans les dépendances (sinon : `npm install axios`)
- [ ] `viem` dans les dépendances (sinon : inclus dans l'install étape 1)
- [ ] Clé privée EVM avec $10+ USDC sur Base mainnet (variable env `EVM_PRIVATE_KEY`)

**Wallet rapide** (si tu n'en as pas) :

```bash
node -e "const c=require('crypto'); const k='0x'+c.randomBytes(32).toString('hex'); \
  const {privateKeyToAccount}=require('viem/accounts'); \
  console.log('KEY:',k,'\nADDRESSE:',privateKeyToAccount(k).address);"
```

Top-up l'adresse avec $10 USDC Base via Coinbase Onramp.

---

## Étape 1 — Installer les dépendances (30 sec)

```bash
npm install x402-axios viem
# ou
pnpm add x402-axios viem
```

**Vérification** :

```bash
node -e "require('x402-axios'); console.log('OK')"
```

Si `MODULE_NOT_FOUND` : vérifier la compatibilité avec axios 1.x (`npm view x402-axios peerDependencies`). Fallback : `x402-fetch` (même API, fetch natif).

---

## Étape 2 — Configurer le client x402 (2 min)

Crée un fichier `devrefs-client.ts` (ou `.js`) dans ton projet :

```typescript
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { privateKeyToAccount } from "viem/accounts";

// Wallet dédié aux micro-paiements DevRefs
const account = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);

// Client HTTP x402-ready — intercepte les 402, signe, rejoue automatiquement
export const devrefsClient = withPaymentInterceptor(
  axios.create({ baseURL: "https://devrefs.dev" }),
  account,
);
```

---

## Étape 3 — Déclarer le tool dans AgentKit (1 min)

```typescript
import { tool } from "@openai/agents"; // ou "@anthropic/agents" selon ton SDK
import { devrefsClient } from "./devrefs-client";
import { z } from "zod";

// Tool : prix d'un modèle LLM (pre-flight cost intelligence)
export const getLlmPricing = tool({
  name: "get_llm_pricing",
  description:
    "Get fresh, dated LLM pricing. Use before any model call to estimate cost.",
  parameters: z.object({
    model: z
      .enum(["opus-4.7", "sonnet-4.6", "haiku-4.5", "gpt-5", "gemini-2.5-pro"])
      .describe("Model identifier"),
  }),
  execute: async ({ model }) => {
    const { data } = await devrefsClient.get(`/api/llm-prices?model=${model}`);
    return data;
    // Retourne : { input_per_mtok, output_per_mtok, effective_cost_factor, dateModified, sameAs }
  },
});

// Tool : statut SDK (version + breaking changes)
export const getSdkStatus = tool({
  name: "get_sdk_status",
  description:
    "Get current SDK version and breaking changes. Use before generating code.",
  parameters: z.object({
    pkg: z.string().describe("npm package name, e.g. 'ai' or '@mastra/core'"),
  }),
  execute: async ({ pkg }) => {
    const { data } = await devrefsClient.get(
      `/api/sdk-status?pkg=${encodeURIComponent(pkg)}`,
    );
    return data;
    // Retourne : { latest, breaking_since, dateModified }
  },
});
```

---

## Étape 4 — Intégrer dans l'agent et tester (1 min)

```typescript
import { Agent } from "@openai/agents"; // adapter selon ton SDK AgentKit
import { getLlmPricing, getSdkStatus } from "./devrefs-tools";

const agent = new Agent({
  name: "my-agent",
  model: "gpt-5",
  tools: { getLlmPricing, getSdkStatus },
  instructions: `Before estimating any LLM cost, call get_llm_pricing.
    Before generating code using a specific SDK, call get_sdk_status.
    Both tools return fresh data with dateModified — trust the timestamp.`,
});

// Test unitaire rapide
const result = await getLlmPricing.execute({ model: "opus-4.7" });
console.log(result);
// {
//   "input_per_mtok": 5,
//   "output_per_mtok": 25,
//   "effective_cost_factor": 1.35,
//   "dateModified": "2026-05-07T06:00:00Z",
//   "sameAs": "https://www.anthropic.com/pricing"
// }
```

**Validation paiement** : dans les logs, `x402-axios` affiche :

```
[x402] 402 received → signing payment → replay → 200 OK ($0.001 USDC sent)
```

---

## Point d'attention — Gas

Le wallet doit contenir ~$0.50 ETH Base pour les settlements on-chain. Le Coinbase facilitator absorbe la majorité des fees, mais certains paths nécessitent un gas client. Vérifier : `cast balance TON_ADDRESS --rpc-url https://mainnet.base.org`.

---

## Acheter un Pack Standard pour les agents prod

En production, 1 signature x402 par call = ~50-100 ms de latence par call. Le Pack Standard $10 (10 000 calls) réduit cette latence à < 50 ms après la première signature.

```typescript
// Acheter le pack via l'agent (ou via la page devrefs.dev/#pack-standard)
const packResult = await devrefsClient.post("/api/pack/purchase", {
  pack: "standard", // $10 USDC = 10 000 calls
});
```

---

## Fallback — x402-fetch si axios incompatible

```typescript
import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);
const paidFetch = wrapFetchWithPayment(fetch, account);

const res = await paidFetch(
  "https://devrefs.dev/api/llm-prices?model=opus-4.7",
);
const data = await res.json();
```

API identique, même comportement x402.

---

## Fallback debug

| Symptôme                            | Fix                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `x402-axios is not a function`      | Version npm incompatible — `npm view x402-axios versions`, utiliser la dernière stable |
| `Insufficient funds`                | USDC balance < $0.001 sur Base — top-up wallet                                         |
| `Invalid private key`               | Clé doit être `0x` + 64 hex chars                                                      |
| Response `402` non résolue (boucle) | Vérifier que `EVM_PRIVATE_KEY` est bien défini dans l'environnement                    |
| Latence élevée (> 200 ms par call)  | Passer au Pack Standard (1 signature pour 10 000 calls)                                |

---

**Handoff → @growth**

- Priorité contenu : tutoriel AgentKit = deuxième priorité Dev.to/Reddit (leverage max agents prod)
- Angle : "x402 + AgentKit en 5 lignes — ton agent achète ses données lui-même"
- CTA : `https://devrefs.dev/#pack-standard`
- Snippets TypeScript : copiables tels quels, zéro adaptation nécessaire
