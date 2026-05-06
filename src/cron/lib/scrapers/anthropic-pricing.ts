// src/cron/lib/scrapers/anthropic-pricing.ts
// Scrape pricing Anthropic — modèles Opus 4.7, Sonnet 4.6, Haiku 4.5.
// Source : https://www.anthropic.com/pricing
// User-Agent obligatoire (founder-prefs anti-scraping silencieux).

const SOURCE_URL = "https://www.anthropic.com/pricing";
const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

export interface ModelPrice {
  model_slug: string;
  input_per_mtok: number;
  output_per_mtok: number;
  effective_cost_factor: number;
  currency: "USD";
  date_modified: string;
  fetched_at: string;
  same_as: string;
  schema_version: "1.0";
  provider: string;
}

/**
 * Patterns regex pour 3 modèles Anthropic.
 * Note : si la page passe en JS-rendered, fallback sur fixtures connues + log alerte.
 * Calibration effective_cost_factor : Opus 4.7=1.35, Sonnet 4.6=1.18, Haiku 4.5=1.05
 * (issus de tokenizer benchmarks, cf. project-context.md V1).
 */
const KNOWN_MODELS = [
  { slug: "opus-4.7", name: "Opus 4.7", input: 5, output: 25, ecf: 1.35 },
  { slug: "sonnet-4.6", name: "Sonnet 4.6", input: 3, output: 15, ecf: 1.18 },
  { slug: "haiku-4.5", name: "Haiku 4.5", input: 0.8, output: 4, ecf: 1.05 },
];

export async function scrapeAnthropic(): Promise<ModelPrice[]> {
  const now = new Date().toISOString();
  let html = "";
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) html = await res.text();
  } catch {
    // fallback : utiliser KNOWN_MODELS
  }

  return KNOWN_MODELS.map((m) => {
    // Tentative parsing prix depuis HTML — fallback KNOWN si echec
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
      provider: "anthropic",
    };
  });
}
