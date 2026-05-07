<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Onboarding MCP-host génériques -->

# Intégrer DevRefs dans un MCP-host générique — Guide pas-à-pas

[Framework : PAS — Problem → Agitate → Solution]
[Conscience : Solution-Aware]
**Temps estimé : 10-15 min** (variable selon le host)

---

## Contexte

Ce guide couvre les MCP-hosts qui ne sont pas Claude Code ou Cursor mais qui implémentent le protocole MCP standard : LangGraph, AutoGen, CrewAI avec MCP plugin, ou tout client MCP custom.

Si ton agent utilise une librairie Python/TS sans support MCP natif → voir `onboarding-sdk-custom.md` (plus adapté).

---

## Prérequis

- [ ] Ton MCP-host supporte le protocole MCP standard (stdio ou HTTP)
- [ ] Node.js ≥ 20 + pnpm installés sur la machine qui hébergera le serveur MCP
- [ ] Clé privée EVM avec $10+ USDC Base mainnet (voir `onboarding-agentkit.md` pour le wallet setup)
- [ ] Savoir si ton host utilise **stdio** (communication par stdin/stdout) ou **HTTP** (serveur MCP écouté sur un port)

---

## Étape 1 — Installer le MCP server Coinbase x402 (2 min)

```bash
git clone https://github.com/coinbase/x402.git
cd x402/typescript/examples/clients/mcp
pnpm install

# Vérifier que le serveur démarre
EVM_PRIVATE_KEY=0xTEST_KEY RESOURCE_SERVER_URL=https://devrefs.dev pnpm dev
# Attendu : "MCP server listening on stdio" ou "MCP server listening on port 3000"
```

Note le **chemin absolu** du dossier mcp :

```bash
pwd
# ex : /home/user/x402/typescript/examples/clients/mcp
```

---

## Étape 2 — Identifier le mode de communication de ton host

### Mode stdio (le plus courant)

Le MCP-host démarre le serveur comme un sous-processus et communique via stdin/stdout. Commande à fournir au host :

```json
{
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

### Mode HTTP (serveurs MCP standalone)

Lancer le serveur manuellement (ou via un service systemd/Docker) :

```bash
export EVM_PRIVATE_KEY=0xTON_WALLET_PRIVE
export RESOURCE_SERVER_URL=https://devrefs.dev
export MCP_TRANSPORT=http  # si le serveur supporte HTTP transport
export MCP_PORT=3001

cd /CHEMIN/ABSOLU/x402/typescript/examples/clients/mcp
pnpm dev
# Serveur MCP disponible sur http://localhost:3001
```

Le host se connecte alors sur `http://localhost:3001`.

---

## Étape 3 — Configuration par host (3-5 min)

### LangGraph (Python)

```python
from langgraph.prebuilt import create_react_agent
from langchain_mcp_adapters.client import MultiServerMCPClient

# Client MCP vers le serveur DevRefs x402
mcp_client = MultiServerMCPClient({
    "devrefs-x402": {
        "command": "pnpm",
        "args": [
            "--dir",
            "/CHEMIN/ABSOLU/x402/typescript/examples/clients/mcp",
            "dev"
        ],
        "env": {
            "EVM_PRIVATE_KEY": os.environ["EVM_PRIVATE_KEY"],
            "RESOURCE_SERVER_URL": "https://devrefs.dev"
        },
        "transport": "stdio"
    }
})

# Récupérer les tools MCP comme tools LangGraph
async with mcp_client:
    tools = await mcp_client.get_tools()
    agent = create_react_agent(model, tools)
    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": "What is the current price of opus-4.7?"}]
    })
```

### AutoGen (Python)

```python
from autogen import ConversableAgent
from autogen.mcp import MCPToolkit

mcp_toolkit = MCPToolkit(
    command="pnpm",
    args=["--dir", "/CHEMIN/ABSOLU/x402/.../mcp", "dev"],
    env={
        "EVM_PRIVATE_KEY": os.environ["EVM_PRIVATE_KEY"],
        "RESOURCE_SERVER_URL": "https://devrefs.dev"
    }
)

agent = ConversableAgent(
    name="devrefs-agent",
    tools=mcp_toolkit.get_tools()
)
```

### Client MCP custom (TypeScript)

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "pnpm",
  args: ["--dir", "/CHEMIN/ABSOLU/x402/.../mcp", "dev"],
  env: {
    EVM_PRIVATE_KEY: process.env.EVM_PRIVATE_KEY!,
    RESOURCE_SERVER_URL: "https://devrefs.dev",
  },
});

const client = new Client({ name: "my-agent", version: "1.0.0" });
await client.connect(transport);

// Lister les tools disponibles
const { tools } = await client.listTools();
console.log(tools.map((t) => t.name));
// ["paid_request", ...] selon version du MCP server

// Appeler un tool
const result = await client.callTool({
  name: "paid_request",
  arguments: { url: "https://devrefs.dev/api/llm-prices?model=opus-4.7" },
});
console.log(result.content);
```

---

## Étape 4 — Tester la découverte des tools (1 min)

La commande MCP standard `list_tools` doit retourner les tools du serveur Coinbase x402 :

```bash
# Test manuel via echo JSON-RPC
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  EVM_PRIVATE_KEY=0xTON_WALLET_PRIVE RESOURCE_SERVER_URL=https://devrefs.dev \
  pnpm --dir /CHEMIN/ABSOLU/x402/.../mcp dev
```

Si la réponse contient `"tools": [...]` avec au moins un tool → configuration correcte.

---

## Étape 5 — Appel test DevRefs (1 min)

Via ton host, demande à l'agent :

```
Get the current pricing for sonnet-4.6 using the devrefs MCP tool.
```

Attendu dans les logs : `Payment: $0.001 USDC sent → 200 OK`.

JSON retourné :

```json
{
  "model": "sonnet-4.6",
  "input_per_mtok": 3,
  "output_per_mtok": 15,
  "effective_cost_factor": 1.0,
  "dateModified": "2026-05-07T06:00:00Z"
}
```

---

## Hétérogénéité des hosts — points d'attention

| Comportement variable                    | Impact                                                      | Mitigation                                              |
| ---------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| Certains hosts ne supportent que stdio   | Le serveur HTTP ne fonctionnera pas                         | Utiliser stdio mode (défaut du MCP server Coinbase)     |
| Découverte automatique des tools absente | L'agent n'appelle pas DevRefs spontanément                  | Référencer explicitement le tool dans le prompt système |
| Timeouts différents par host             | Un host avec timeout 5s peut couper avant la signature x402 | Augmenter le timeout HTTP client à 10s minimum          |
| Isolation env vars par host              | Les env vars ne sont pas transmises au sous-process         | Passer explicitement dans le champ `env` de la config   |

---

## Fallback debug

| Symptôme                    | Fix                                                                              |
| --------------------------- | -------------------------------------------------------------------------------- |
| `spawn pnpm ENOENT`         | pnpm non trouvé — utiliser le chemin absolu : `which pnpm`                       |
| Tools vides (`"tools": []`) | Le MCP server ne démarre pas correctement — lancer manuellement et lire l'erreur |
| `402` non résolu            | `EVM_PRIVATE_KEY` non transmis au sous-processus — vérifier le champ `env`       |
| Host timeout avant paiement | Augmenter le timeout client à 15s pour la 1ère signature                         |
| Permission refusée sur pnpm | `chmod +x $(which pnpm)` ou utiliser `npx tsx` comme alternative                 |

---

## Alternative si MCP échoue : wrapper HTTP direct

Si ton host MCP est trop restrictif, tu peux appeler DevRefs directement en HTTP avec `x402-axios` ou `x402-fetch` (cf. `onboarding-agentkit.md`) sans passer par le MCP bridge. La fonctionnalité est identique, seule la couche d'orchestration change.

---

**Handoff → @growth**

- Priorité contenu : MCP génériques = basse priorité V1 (audience avancée, volume faible)
- Format recommandé : pas de post Dev.to dédié V1, mais intégrer un paragraphe dans le post Claude Code
- CTA : `https://devrefs.dev/#pack-standard`
