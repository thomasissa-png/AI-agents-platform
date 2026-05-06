// src/cron/lib/scrapers/deepseek-pricing.ts
// Scrape pricing DeepSeek — deepseek-r2, deepseek-v3.

import type { ModelPrice } from "./anthropic-pricing";

const SOURCE_URL = "https://api-docs.deepseek.com/quick_start/pricing";
const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

const KNOWN_MODELS = [
  { slug: "deepseek-r2", name: "DeepSeek R2", input: 0.55, output: 2.19, ecf: 1.1 },
  { slug: "deepseek-v3", name: "DeepSeek V3", input: 0.27, output: 1.1, ecf: 1.05 },
];

export async function scrapeDeepSeek(): Promise<ModelPrice[]> {
  const now = new Date().toISOString();
  let html = "";
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) html = await res.text();
  } catch {
    // fallback
  }

  return KNOWN_MODELS.map((m) => {
    const inputMatch = html.match(new RegExp(`${m.name}[\\s\\S]{0,400}?\\$([0-9.]+)`, "i"));
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
      provider: "deepseek",
    };
  });
}
