<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Onboarding Mastra -->

# Intégrer DevRefs dans Mastra — Guide pas-à-pas

[Framework : PAS — Problem → Agitate → Solution]
[Conscience : Solution-Aware]
**Temps estimé : 5-8 min**

---

## Le problème

Un agent Mastra qui génère du code sans vérifier la version courante des SDKs consomme des tokens en retries. Exemple réel (verbatim V5, `project-context.md`) : Vercel AI SDK est passé de `streamText({ model, messages })` à `streamText({ model, prompt })` en mars 2026. Résultat : 4 retries pour le même agent, ~80 000 tokens perdus.

Un call `GET /api/sdk-status?pkg=ai` → JSON daté → $0.001 USDC évite ça.

---

## Prérequis

- [ ] Projet Mastra existant (`@mastra/core` ≥ version actuelle stable)
- [ ] `viem` dans les dépendances (sinon inclus dans l'install)
- [ ] `x402-fetch` installable (npm officiel)
- [ ] Clé privée EVM avec $10+ USDC Base mainnet (voir wallet setup dans `onboarding-agentkit.md`)

**Note** : Mastra évolue rapidement. Pin ta version `@mastra/core` pour éviter les breaking changes pendant l'intégration (`"@mastra/core": "1.x.x"` dans `package.json`).

---

## Étape 1 — Installer x402-fetch (30 sec)

```bash
pnpm add x402-fetch viem
# ou npm install x402-fetch viem
```

Pas de wrapper Mastra-natif x402 en mai 2026 — `x402-fetch` est suffisant et autonome.

---

## Étape 2 — Créer le client x402 partagé (1 min)

Crée `src/integrations/devrefs.ts` :

```typescript
import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`,
);

// Un seul client partagé pour tous les tools DevRefs
export const paidFetch = wrapFetchWithPayment(fetch, account);
export const DEVREFS_BASE = "https://devrefs.dev";
```

---

## Étape 3 — Créer les tools Mastra (2 min)

Crée `src/tools/devrefs-tools.ts` :

```typescript
import { createTool } from "@mastra/core";
import { z } from "zod";
import { paidFetch, DEVREFS_BASE } from "../integrations/devrefs";

// Tool 1 : pricing LLM (pre-flight)
export const getLlmPricing = createTool({
  id: "get-llm-pricing",
  description: `Get fresh, dated LLM pricing from DevRefs.
    Returns input/output price per MTok, effective_cost_factor (tokenizer inflation),
    and dateModified. Use before any model call to estimate true cost.`,
  inputSchema: z.object({
    model: z
      .string()
      .describe(
        "Model ID: opus-4.7 | sonnet-4.6 | haiku-4.5 | gpt-5 | gemini-2.5-pro",
      ),
  }),
  execute: async ({ context }) => {
    const res = await paidFetch(
      `${DEVREFS_BASE}/api/llm-prices?model=${encodeURIComponent(context.model)}`,
    );
    if (!res.ok) throw new Error(`DevRefs error: ${res.status}`);
    return res.json();
    // { input_per_mtok, output_per_mtok, effective_cost_factor, dateModified, sameAs }
  },
});

// Tool 2 : statut SDK (breaking changes)
export const getSdkStatus = createTool({
  id: "get-sdk-status",
  description: `Get current SDK version and breaking changes from DevRefs.
    Use before generating code that depends on a specific npm package version.
    Returns latest version, last breaking change version, and dateModified.`,
  inputSchema: z.object({
    pkg: z
      .string()
      .describe("npm package name, e.g. 'ai', '@mastra/core', 'axios'"),
  }),
  execute: async ({ context }) => {
    const res = await paidFetch(
      `${DEVREFS_BASE}/api/sdk-status?pkg=${encodeURIComponent(context.pkg)}`,
    );
    if (!res.ok) throw new Error(`DevRefs error: ${res.status}`);
    return res.json();
    // { latest, breaking_since, dateModified, changelog_url }
  },
});
```

---

## Étape 4 — Enregistrer les tools dans l'agent Mastra (1 min)

```typescript
import { Agent } from "@mastra/core";
import { getLlmPricing, getSdkStatus } from "./tools/devrefs-tools";
import { openai } from "@ai-sdk/openai"; // ou ton LLM provider

export const myAgent = new Agent({
  name: "my-agent",
  instructions: `Before estimating LLM API costs, use get-llm-pricing.
    Before writing code that uses a specific SDK, use get-sdk-status.
    Both tools return fresh data with a dateModified timestamp — trust that timestamp.
    The data is paid in USDC via x402 — this is intentional and autonomous.`,
  model: openai("gpt-5"),
  tools: {
    getLlmPricing,
    getSdkStatus,
  },
});
```

---

## Étape 5 — Test (1 min)

```typescript
// Test direct des tools
import { getLlmPricing, getSdkStatus } from "./tools/devrefs-tools";

// Test pricing
const pricing = await getLlmPricing.execute({
  context: { model: "sonnet-4.6" },
  runId: "test-run-1",
  threadId: "test-thread-1",
});
console.log(pricing);
// { input_per_mtok: 3, output_per_mtok: 15, effective_cost_factor: 1, dateModified: "..." }

// Test SDK status
const sdkInfo = await getSdkStatus.execute({
  context: { pkg: "ai" },
  runId: "test-run-2",
  threadId: "test-thread-2",
});
console.log(sdkInfo);
// { latest: "5.0.12", breaking_since: "5.0.0", dateModified: "2026-05-01T00:00:00Z" }
```

**Validation paiement** : dans les logs `x402-fetch` :

```
[x402] 402 Payment Required → signing → replaying → 200 OK ($0.001 USDC)
```

---

## Gestion de la version Mastra (important)

`@mastra/core` publie des breaking changes fréquemment. Si tu upgrades après l'intégration :

1. Vérifie `createTool` API (signature `execute` peut changer)
2. Vérifie `Agent` constructor (options peuvent évoluer)
3. Si `@mastra/x402` est publié officellement → migrer, l'API sera probablement plus simple

Pour l'instant (mai 2026) : `x402-fetch` + `createTool` = approche stable.

---

## Fallback debug

| Symptôme                                 | Fix                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `wrapFetchWithPayment is not a function` | Version x402-fetch incompatible — `npm view x402-fetch`                                                           |
| `createTool is not exported`             | Version @mastra/core incompatible — vérifier CHANGELOG Mastra                                                     |
| Paiement non déclenché                   | Endpoint ne répond pas 402 — tester `curl https://devrefs.dev/api/llm-prices?model=opus-4.7` (doit retourner 402) |
| `Invalid EVM_PRIVATE_KEY`                | Format attendu : `0x` + 64 hex chars                                                                              |
| Tool appelé mais résultat mal parsé      | Mastra peut wrapper le résultat dans `{ result: ... }` — adapter l'accès                                          |

---

**Handoff → @growth**

- Priorité contenu : Mastra tutoriel = priorité moyenne (écosystème en croissance, peu de prod en V1)
- Angle alternatif possible : "Breaking changes SDK détectés automatiquement par ton agent Mastra"
- CTA : `https://devrefs.dev/#pack-standard`
- Attention : mentionner explicitement que `@mastra/x402` n'existe pas encore (mai 2026) — honnêteté qui renforce la confiance
