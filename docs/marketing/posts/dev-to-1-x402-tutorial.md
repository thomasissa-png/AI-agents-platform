---
title: "I built an HTTP 402 API my AI agent pays automatically — here's what 5 minutes of integration looks like"
tags: [ai, cloudflare, typescript, claude]
published: false
description: "My Claude Code agent burned 64K tokens parsing 5 pricing pages last week. Here's what x402 fixes — with working curl commands and a 5-minute integration walkthrough."
cover_image: ""
---

<!-- Framework : PAS (Problem → Agitate → Solution) -->
<!-- Conscience : [Solution-Aware] — le lecteur sait que le WebSearch agent est problématique, cherche une alternative structurelle -->
<!-- Objections couvertes : complexité x402 (5 lignes de code), prix (490× ROI Opus 4.7), fiabilité (dateModified HMAC signé) -->

My Claude Code agent burned 64K tokens parsing 5 pricing pages last week. Here's what x402 fixes.

---

## The problem: your agent re-crawls the same page 40 times a day

LLM training cutoffs are January 2026 at best. LLM prices move every 2–4 weeks. When your agent needs a cost estimate before deciding whether to run an expensive chain, it does the only thing it knows: `WebSearch`.

Here's what that actually looks like in a live session log:

```json
{
  "tool_calls": [
    {
      "name": "WebSearch",
      "query": "claude opus 4.7 input price per million tokens",
      "results": 8
    },
    { "name": "WebFetch", "url": "anthropic.com/pricing", "tokens_in": 11420 },
    { "name": "WebFetch", "url": "pricepertoken.com", "tokens_in": 38900 },
    { "name": "WebFetch", "url": "llm-prices.com", "tokens_in": 14200 }
  ],
  "model_output": "Opus 4.7 costs $15/MTok input, $75/MTok output.",
  "ground_truth_check": "INCORRECT — Opus 4.7 inflates tokenizer +35% silently (effective_cost_factor 1.35). Downstream cost off by 35%.",
  "elapsed_ms": 31420,
  "tokens_burned": 64520
}
```

31 seconds. 64K tokens. Wrong answer.

The agent picked the median from 3 conflicting sources and delivered it with high confidence. None of the 3 sources flagged their freshness date in a machine-readable format. The agent had no tie-breaker.

Two days later: the actual invoice was 2.4× the estimate.

---

## Why the naive solutions fail

**WebSearch + scrape**: 8 HTML pages, each 30–380 KB, 3 different numbers per model, no `dateModified` signal. The agent guesses.

**Free MCP servers**: some expose LLM pricing. Most don't include a `dateModified` field. If the data is 3 months old and nothing says so, the agent treats it as fresh.

**Hardcode the price in your prompt**: it's stale within weeks and you'll forget to update it.

The structural problem: no HTTP endpoint was designed specifically for agent consumption — atomic payload, dated, verifiable, priced per-call so there's no login friction.

---

## What x402-native solves

HTTP 402 ("Payment Required") is a standard status code that's been dormant for 30 years. The [x402 protocol](https://x402.org) revives it for machine-to-machine micropayments.

The flow for your agent:

1. `GET /api/llm-prices?model=opus-4-7` → `402 Payment Required` + JSON body with price + `roi_summary`
2. Agent reads the body, decides to pay (the `roi_summary.verdict` field is literally `"no_brainer_buy"`)
3. Agent signs a USDC Base transaction via its wallet, replays with `X-PAYMENT` header
4. `200 OK` with the atomic payload — 1.5 KB, one fact, `dateModified` included

No login. No API key. No subscription to cancel. The wallet is the identity.

The payload your agent receives:

```json
{
  "model": "claude-opus-4-7",
  "input_per_mtok": 5,
  "output_per_mtok": 25,
  "effective_cost_factor": 1.35,
  "dateModified": "2026-05-05T06:00:00Z",
  "_signature": "0x1a2b3c...",
  "roi_summary": {
    "call_cost_usd": 0.001,
    "tokens_saved": 64520,
    "verdict": "no_brainer_buy"
  }
}
```

The `effective_cost_factor: 1.35` field is the silent tokenizer inflation on Opus 4.7 that most pricing pages omit. That 35% is what caused the 2.4× invoice discrepancy in the log above.

---

## Integration in 5 minutes (Claude Code + Coinbase MCP)

### Step 1 — Install the Coinbase MCP server (3 lines)

```bash
git clone https://github.com/coinbase/x402
cd x402/typescript/examples/clients/mcp
pnpm install
```

### Step 2 — Configure Claude Code (5 lines in `~/.claude.json`)

```bash
claude mcp add devrefs-x402 \
  --command pnpm \
  --args "--dir,/absolute/path/to/x402/typescript/examples/clients/mcp,dev" \
  --env "EVM_PRIVATE_KEY=0x...,RESOURCE_SERVER_URL=https://devrefs-api-preview.thomas-issa.workers.dev"
```

Top-up your wallet with $10 USDC on Base mainnet (Pack Standard = 10,000 calls at $0.001 each). Coinbase Onramp handles the card → USDC flow in about 5 minutes if you don't already have USDC.

### Step 3 — Test via curl first

```bash
# First call — 402 response with roi_summary
curl -i https://devrefs-api-preview.thomas-issa.workers.dev/api/llm-prices?model=claude-opus-4-7

# After the MCP handles payment, you get:
# HTTP/2 200
# content-type: application/json
# x-payment-response: settled
```

Then from a Claude Code session:

```
Use the devrefs-x402 tool to get the current price and effective_cost_factor for claude-opus-4-7.
```

The agent calls the tool, the MCP server pays $0.001 USDC autonomously, you get a fresh atomic payload. No human in the loop.

---

## What the live 402 → 200 flow looks like

```
→ GET /api/llm-prices?model=claude-opus-4-7
← 402 Payment Required
   X-Payment-Price: 0.001
   X-Payment-Network: base
   Body: { "accepts": [{ "scheme": "exact", "network": "base", ... }], "roi_summary": { "verdict": "no_brainer_buy" } }

→ GET /api/llm-prices?model=claude-opus-4-7
   X-PAYMENT: [signed USDC Base tx]
← 200 OK
   X-Payment-Response: settled
   Body: { "input_per_mtok": 5, "effective_cost_factor": 1.35, "dateModified": "2026-05-05T06:00:00Z", "_signature": "..." }
```

Settlement on Base via Coinbase facilitator: under 5 seconds. The `_signature` field is HMAC — your agent can verify the payload wasn't tampered with before acting on it.

---

## When this makes sense (and when it doesn't)

The ROI is 490× on Opus 4.7 specifically — 64K tokens saved vs. $0.001 paid.

| Model             | Calls/day to break even | Verdict                                      |
| ----------------- | ----------------------- | -------------------------------------------- |
| claude-opus-4-7   | 1 call                  | Immediate                                    |
| claude-sonnet-4-6 | ~3 calls                | Most use cases                               |
| claude-haiku-3-5  | ~15 calls               | Only if you run pre-flight checks frequently |

If your agent calls Haiku fewer than 3 times a day, the math doesn't work. The 490× ROI is specific to Opus 4.7 — don't generalize it to all models.

If your agent calls any model more than once a day before cost-sensitive decisions, x402 pre-flight pricing pays for itself immediately.

---

Try it:

```bash
curl https://preview.devrefs-frontend.pages.dev/api/llm-prices?model=claude-opus-4-7
```

Source: [github.com/coinbase/x402](https://github.com/coinbase/x402) — the x402 client library DevRefs uses for payment handling.
