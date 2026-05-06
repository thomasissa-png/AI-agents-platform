// src/api/routes/llms-txt.ts
// GET /llms.txt — manifeste public pour AI agents (cf. functional-specs F12).
// Cache CF edge 5 min, public. Aucun paiement requis.

const LLMS_TXT_CONTENT = `# DevRefs — Pricing & SDK references for AI agents

DevRefs is a pay-per-call HTTP API exposing fresh, cryptographically-signed pricing data for 12 LLM models and version status for ~50 npm AI SDK packages. Built x402-native on Cloudflare Workers (latency p95 < 200 ms, freshness < 6 h pricing / < 24 h SDK).

## Endpoints

- GET /api/llm-prices?model={slug}    Price $0.001 USDC. Returns { input_per_mtok, output_per_mtok, effective_cost_factor, date_modified, _signature }.
- GET /api/sdk-status?pkg={slug}      Price $0.001 USDC. Returns { latest, breaking_since, deprecated_versions, date_modified, _signature }.
- POST /api/agent-audit               Price $9.99 USDC. Returns { score, savings_pct, recommendations[], guarantee }. RGPD: input never persisted.

## Packs (90% discount vs pay-per-call)

- Discovery 5 USDC = 5,000 calls
- Standard 10 USDC = 10,000 calls (recommended)
- Pro 50 USDC = 60,000 calls (-17%)
- Pack Pro Audit 49 USDC = 6 audits (-18%)

## Payment

x402 native on Base (USDC). First request returns 402 + augmented body (alternative_cost_estimate, roi_summary, freshness_proof, payload_preview, packs_available). Sign payment payload with EVM_PRIVATE_KEY, retry with X-PAYMENT header.

Compatible SDKs: x402-axios, x402-fetch, MCP Coinbase, manual fetch.

## Verification

Every 200 response is HMAC-SHA256 signed (\`_signature\` field). Verify against canonical JSON of \`data\`. Public key proof on github.com/devrefs/transparency.

## Refund guarantee (audits only)

100% USDC refund if savings < 15% measured 30 days post-audit (4 cumulative conditions). See devrefs.dev/legal/cgu §4ter.

## Compliance

- RGPD: audit input (agent_config, sample_traces) never persisted server-side.
- USDC settlement: Base mainnet, irrevocable on-chain.

Source of truth: https://devrefs.dev/api/llm-prices, https://devrefs.dev/api/sdk-status

`;

export function handleLlmsTxt(): Response {
  return new Response(LLMS_TXT_CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
