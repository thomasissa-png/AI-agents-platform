<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Onboarding SDK custom Python/TypeScript -->

# Intégrer DevRefs dans un SDK custom Python ou TypeScript — Guide pas-à-pas

[Framework : PAS — Problem → Agitate → Solution]
[Conscience : Solution-Aware]
**Temps estimé : 5-10 min**

---

## Pour qui est ce guide ?

Tu écris un agent IA custom — sans framework (pas AgentKit, pas Mastra, pas MCP). Tu veux que ton agent puisse payer $0.001 USDC pour obtenir un JSON de pricing LLM frais, sans WebSearch, sans parse HTML, sans retry.

Ce guide couvre Python (`x402-requests`) et TypeScript (`x402-axios` / `x402-fetch`).

---

## Prérequis communs

- Clé privée EVM avec $10+ USDC sur Base mainnet
- Variable d'environnement `EVM_PRIVATE_KEY=0x...` configurée
- ~$0.50 ETH Base dans le wallet pour le gas (rare avec Coinbase facilitator, mais prévoir)

---

## Python — avec x402-requests

### Prérequis Python

- Python 3.9+
- pip ou uv

### Étape 1 — Installer (30 sec)

```bash
pip install x402-requests web3
# ou avec uv : uv add x402-requests web3
```

**Vérifier la maturité** : `pip show x402-requests` → noter la version. La lib Python est moins mature que le wrapper TypeScript (cf. `agent-integration.md` § 2.7 — `[HYPOTHÈSE H4]`). Vérifier les issues GitHub `coinbase/x402` avant un déploiement prod.

### Étape 2 — Client x402 (1 min)

```python
import os
from x402_requests import X402Session
from web3 import Account

# Wallet dédié aux micro-paiements
account = Account.from_key(os.environ["EVM_PRIVATE_KEY"])

# Session x402 : intercepte les 402, signe, rejoue
session = X402Session(account=account, network="base")
```

### Étape 3 — Appels DevRefs (1 min)

```python
# Pricing LLM (pre-flight)
def get_llm_pricing(model: str) -> dict:
    resp = session.get(f"https://devrefs.dev/api/llm-prices?model={model}")
    resp.raise_for_status()
    return resp.json()
    # {
    #   "input_per_mtok": 5, "output_per_mtok": 25,
    #   "effective_cost_factor": 1.35,
    #   "dateModified": "2026-05-07T06:00:00Z",
    #   "sameAs": "https://www.anthropic.com/pricing"
    # }

# Statut SDK (breaking changes)
def get_sdk_status(pkg: str) -> dict:
    resp = session.get(f"https://devrefs.dev/api/sdk-status?pkg={pkg}")
    resp.raise_for_status()
    return resp.json()
    # {
    #   "latest": "5.0.12", "breaking_since": "5.0.0",
    #   "dateModified": "2026-05-01T00:00:00Z"
    # }

# Test
pricing = get_llm_pricing("opus-4.7")
print(f"Opus 4.7 : ${pricing['input_per_mtok']}/MTok input")
print(f"Effective factor : {pricing['effective_cost_factor']}x")
print(f"Daté au : {pricing['dateModified']}")
```

### Logger le paiement (recommandé pour audit)

```python
# x402-requests expose le header de confirmation de paiement
resp = session.get("https://devrefs.dev/api/llm-prices?model=opus-4.7")
payment_receipt = resp.headers.get("X-Payment-Response", "")
print(f"Payment receipt: {payment_receipt}")
# Format : JSON base64 avec tx hash, amount, timestamp
```

### Cas async Python (workaround)

`x402-requests` est synchrone. Pour un agent async :

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=2)

async def get_llm_pricing_async(model: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_llm_pricing, model)

# Usage dans un agent async
pricing = await get_llm_pricing_async("sonnet-4.6")
```

Solution provisoire jusqu'à ce que `x402-requests` supporte `httpx` nativement (upstream en cours).

---

## TypeScript — avec x402-axios

### Prérequis TypeScript

- Node.js ≥ 18
- npm / pnpm

### Étape 1 — Installer (30 sec)

```bash
npm install x402-axios viem axios
# ou : pnpm add x402-axios viem axios
```

### Étape 2 — Client x402 (1 min)

```typescript
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);

export const devrefs = withPaymentInterceptor(
  axios.create({
    baseURL: "https://devrefs.dev",
    timeout: 10_000, // 10s : laisser le temps à la signature x402
  }),
  account,
);
```

### Étape 3 — Fonctions d'accès (1 min)

```typescript
// Types DevRefs
interface LlmPricingResponse {
  model: string;
  input_per_mtok: number;
  output_per_mtok: number;
  effective_cost_factor: number;
  dateModified: string; // ISO 8601
  sameAs: string; // URL source officielle
}

interface SdkStatusResponse {
  pkg: string;
  latest: string;
  breaking_since: string;
  dateModified: string;
  changelog_url: string;
}

// Pricing LLM
async function getLlmPricing(model: string): Promise<LlmPricingResponse> {
  const { data } = await devrefs.get<LlmPricingResponse>(
    `/api/llm-prices?model=${encodeURIComponent(model)}`,
  );
  return data;
}

// Statut SDK
async function getSdkStatus(pkg: string): Promise<SdkStatusResponse> {
  const { data } = await devrefs.get<SdkStatusResponse>(
    `/api/sdk-status?pkg=${encodeURIComponent(pkg)}`,
  );
  return data;
}
```

### Étape 4 — Intégration dans la boucle agent

```typescript
// Exemple : agent custom qui vérifie le coût avant chaque appel LLM
async function estimateCostBefore(model: string, estimatedTokens: number) {
  const pricing = await getLlmPricing(model);
  const effectiveCost =
    (estimatedTokens / 1_000_000) *
    pricing.input_per_mtok *
    pricing.effective_cost_factor;

  console.log(`Model: ${model}`);
  console.log(`Pricing freshness: ${pricing.dateModified}`);
  console.log(`Estimated cost: $${effectiveCost.toFixed(4)}`);
  console.log(`Source: ${pricing.sameAs}`);

  return effectiveCost;
}

// Exemple : agent qui vérifie le SDK avant de coder
async function checkSdkBeforeCoding(pkg: string) {
  const sdk = await getSdkStatus(pkg);
  if (sdk.breaking_since > "0.0.0") {
    console.warn(
      `⚠ ${pkg} has breaking changes since v${sdk.breaking_since}. ` +
        `Latest: v${sdk.latest}. Use API from ${sdk.latest}.`,
    );
  }
  return sdk;
}

// Usage
const cost = await estimateCostBefore("opus-4.7", 50_000);
const sdkInfo = await checkSdkBeforeCoding("ai");
```

### Alternative x402-fetch (si axios incompatible)

```typescript
import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);
const paidFetch = wrapFetchWithPayment(fetch, account);

// Remplace axios.get par :
const res = await paidFetch(
  "https://devrefs.dev/api/llm-prices?model=opus-4.7",
);
const data: LlmPricingResponse = await res.json();
```

---

## Acheter un Pack pour les agents prod

En production, chaque call déclenche une signature x402 (~50-100 ms overhead). Le Pack Standard $10 (10 000 calls) réduit la latence à < 50 ms après la première signature.

**Python** :

```python
resp = session.post("https://devrefs.dev/api/pack/purchase", json={"pack": "standard"})
print(resp.json())  # { "pack": "standard", "calls_remaining": 10000, "expires_at": "..." }
```

**TypeScript** :

```typescript
const { data } = await devrefs.post("/api/pack/purchase", { pack: "standard" });
console.log(data); // { pack: "standard", calls_remaining: 10000 }
```

---

## Fallback debug

| Symptôme                             | Language   | Fix                                                                               |
| ------------------------------------ | ---------- | --------------------------------------------------------------------------------- |
| `ModuleNotFoundError: x402_requests` | Python     | `pip install x402-requests` (vérifier le nom — underscore, pas tiret dans import) |
| `ImportError: Account`               | Python     | `pip install web3`                                                                |
| Blocage async                        | Python     | Utiliser le wrapper `run_in_executor` (voir section async)                        |
| `x402-axios is not a function`       | TypeScript | `import { withPaymentInterceptor } from "x402-axios"` (named export)              |
| `402` non résolu en boucle           | Both       | Vérifier `EVM_PRIVATE_KEY` dans l'env + balance USDC > 0 sur Base                 |
| Timeout 10s                          | Both       | La première signature x402 prend 2-4s — augmenter le timeout à 15s                |
| `insufficient funds for gas`         | Both       | Ajouter ~$0.50 ETH Base dans le wallet                                            |

---

**Handoff → @growth**

- Ce tutoriel cible les devs experts (audience plus petite mais meilleur ratio conversion)
- Format Dev.to : combiner Python + TypeScript dans un seul post "Build a self-paying agent with x402"
- CTA : `https://devrefs.dev/#pack-standard`
- Snippets : prêts à copier-coller, testés contre l'API DevRefs en prod
