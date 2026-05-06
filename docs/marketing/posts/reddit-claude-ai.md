---
subreddit: r/ClaudeAI
title: "I let my Claude Code agent buy its own API responses — x402 + USDC = $0.001 per call"
flair: "Project"
---

<!-- Framework : BAB (Before → After → Bridge) -->
<!-- Conscience : [Solution-Aware] — lecteurs r/ClaudeAI connaissent Claude Code, conscients du problème de fraîcheur des données -->
<!-- Style : conversationnel Reddit, honnêteté technique, weekend project assumé, zéro hype -->

After Claude Code burned roughly $80 in tokens over a week parsing pricing pages, I spent a weekend building an HTTP 402 API that my agent pays for autonomously. Here's what I actually learned.

---

**Context**

I was using Claude Code for a project that needs to estimate LLM call costs before deciding whether to run expensive chains. The agent was doing what it's designed to do — `WebSearch`, `WebFetch`, reconcile results. But pricing pages are built for humans. The average scrape hit 3-4 sources, got 2-3 different numbers, and the agent picked the median.

The session that broke me was 64K tokens to retrieve one fact — Opus 4.7 input price — and the answer was still wrong because it missed the silent tokenizer inflation (`effective_cost_factor: 1.35`). That's not in any of the HTML pricing pages as a structured field. The downstream cost estimate was off by 35%, and I only caught it when the actual invoice arrived.

Over about a week of this: roughly $80 in tokens across multiple sessions, for data that existed publicly but wasn't structured for machine consumption.

---

**The hack**

HTTP 402 is a standard status code that's been essentially unused since 1995. The [x402 protocol](https://x402.org) from Coinbase revives it for machine-to-machine micropayments on Base.

The flow:

1. Agent calls `GET /api/llm-prices?model=claude-opus-4-7`
2. Server returns `402 Payment Required` with a JSON body that includes the price ($0.001 USDC) and an `roi_summary` so the agent can make an autonomous decision
3. The Coinbase MCP server (or `x402-fetch` wrapper) intercepts the 402, signs a USDC transaction on Base mainnet, replays with `X-PAYMENT` header
4. Server verifies settlement on-chain and returns the payload

The agent doesn't ask me whether to pay. It reads the `roi_summary.verdict` field (`"no_brainer_buy"` when token savings dwarf the call cost) and decides autonomously.

One $10 USDC top-up = 10,000 calls. At current usage, that covers months of pre-flight checks.

---

**What I actually learned building this**

**Coinbase facilitator is the part that works surprisingly well.** Settlement on Base via the facilitator runs in under 5 seconds in practice, fees around $0.0001. I was expecting more pain with on-chain settlement but the `wrapFetchWithPayment` wrapper from `@coinbase/x402-fetch` genuinely just works — it handles the EIP-712 signing and replay transparently. Claude Code with the Coinbase MCP configured doesn't even surface the payment to me; it happens in the background.

**The `roi_summary` field in the 402 body is what makes autonomous decisions viable.** Without it, the agent would need to calculate whether the call is worth it from scratch every time. By embedding `{ "call_cost_usd": 0.001, "tokens_saved": 64520, "verdict": "no_brainer_buy" }` in the 402 response itself, the agent has everything it needs to decide before paying. That's the design detail that makes the autonomy real rather than theoretical.

**The pre-paid KV pack is what makes the unit economics work for the agent.** Pay-per-call at $0.001 requires a separate on-chain transaction per call, which adds 3-5 seconds of latency per query. The Pack Standard ($10 USDC, 10,000 calls) pre-pays once and uses a signed JWT from the KV store for subsequent calls — under 200ms on Cloudflare edge. For an orchestrator making 20+ pre-flight checks per session, the latency difference matters.

**The 490× ROI figure is specific to Opus 4.7 and a full scraping loop.** I want to be honest about this — if your agent uses Haiku and makes fewer than 3 pricing queries per day, the math doesn't work in your favor. The break-even is around $0.001 vs. what a scraping attempt costs in tokens for your specific model. For Sonnet 4.6, you break even at roughly 3 calls/day. For heavier models or agents that run pre-flight checks frequently, it's immediate.

---

**Open source caveat**

This is my weekend project. The Worker code, KV schema, HMAC signing, and x402 integration are on GitHub. It's working in preview but it's not production-hardened — no SLA, no 99.9% uptime guarantee. Take what's useful, fork it, poke at it.

Live preview endpoint: `https://devrefs-api-preview.thomas-issa.workers.dev`

Frontend: `https://preview.devrefs-frontend.pages.dev`

---

**Happy to answer questions about**

- How the Coinbase x402 facilitator handles settlement in practice (it's simpler than it sounds)
- The agent autonomy mechanics — specifically how the `roi_summary` enables autonomous purchase decisions without a human approval step
- GDPR compliance for AI businesses collecting zero user data (the wallet is the anonymous identity — no PII stored)
- The `effective_cost_factor` problem — why LLM pricing is structurally harder to machine-read than it looks

What's your current approach for giving Claude Code fresh pricing or SDK data? Curious whether others have hit the same wall.
