// src/cron/lib/scrapers/openai-pricing.ts
// Scrape pricing OpenAI — gpt-5, gpt-4o, gpt-4o-mini.
// Source : https://openai.com/pricing

import type { ModelPrice } from "./anthropic-pricing";

const SOURCE_URL = "https://openai.com/api/pricing";
const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

const KNOWN_MODELS = [
  { slug: "gpt-5", name: "GPT-5", input: 2.5, output: 10, ecf: 1.22 },
  { slug: "gpt-4o", name: "GPT-4o", input: 2.5, output: 10, ecf: 1.15 },
  { slug: "gpt-4o-mini", name: "GPT-4o mini", input: 0.15, output: 0.6, ecf: 1.08 },
];

export async function scrapeOpenAI(): Promise<ModelPrice[]> {
  const now = new Date().toISOString();
  let html = "";
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) html = await res.text();
  } catch {
    // fallback KNOWN_MODELS
  }

  return KNOWN_MODELS.map((m) => {
    const inputMatch = html.match(new RegExp(`${m.name}[\\s\\S]{0,400}?\\$([0-9.]+)\\s*/\\s*(?:M|million)`, "i"));
    const input_per_mtok = inputMatch ? parseFloat(inputMatch[1]) : m.input;
    return {
      model_slug: m.slug,
      input_per_mtok,
      output_per_mtok: m.output,
      effective_cost_factor: m.ecf,
      currency: "USD" as const,
      date_modified: now,
      fetched_at: now,
      same_as: SOURCE_URL,
      schema_version: "1.0" as const,
      provider: "openai",
    };
  });
}
