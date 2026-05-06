// src/cron/lib/scrapers/mistral-pricing.ts
// Scrape pricing Mistral — mistral-large-3, mistral-small-3.

import type { ModelPrice } from "./anthropic-pricing";

const SOURCE_URL = "https://mistral.ai/technology#pricing";
const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

const KNOWN_MODELS = [
  { slug: "mistral-large-3", name: "Mistral Large 3", input: 2, output: 6, ecf: 1.14 },
  { slug: "mistral-small-3", name: "Mistral Small 3", input: 0.2, output: 0.6, ecf: 1.06 },
];

export async function scrapeMistral(): Promise<ModelPrice[]> {
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
      provider: "mistral",
    };
  });
}
