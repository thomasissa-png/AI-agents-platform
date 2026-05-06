// src/cron/lib/scrapers/google-pricing.ts
// Scrape pricing Google — gemini-2.5-pro, gemini-2.0-flash.

import type { ModelPrice } from "./anthropic-pricing";

const SOURCE_URL = "https://ai.google.dev/pricing";
const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

const KNOWN_MODELS = [
  { slug: "gemini-2.5-pro", name: "Gemini 2.5 Pro", input: 1.25, output: 5, ecf: 1.12 },
  { slug: "gemini-2.0-flash", name: "Gemini 2.0 Flash", input: 0.075, output: 0.3, ecf: 1.04 },
];

export async function scrapeGoogle(): Promise<ModelPrice[]> {
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
      provider: "google",
    };
  });
}
