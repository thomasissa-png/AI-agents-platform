// src/cron/jobs/prices-update.ts
// Cron 6h — scrape pricing 12 modèles → PRICES_KV.
// Source : functional-specs §4.1.
// Idempotent : 2 runs successifs sur même tick produisent même KV state.
// Fallback gracieux : si scrape fail (HTML vide) → KNOWN_MODELS valeurs hardcodées.

import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";
import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { scrapeAnthropic, type ModelPrice } from "@/cron/lib/scrapers/anthropic-pricing";
import { scrapeOpenAI } from "@/cron/lib/scrapers/openai-pricing";
import { scrapeGoogle } from "@/cron/lib/scrapers/google-pricing";
import { scrapeMistral } from "@/cron/lib/scrapers/mistral-pricing";
import { scrapeDeepSeek } from "@/cron/lib/scrapers/deepseek-pricing";
import { sendAdminAlert } from "@/cron/lib/mailchannels";

export interface PricesUpdateEnv {
  PRICES_KV: KVNamespace;
  CRON_STATE_KV: KVNamespace;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
  ADMIN_ALERT_EMAIL?: string;
}

export interface PricesUpdateResult {
  ok: boolean;
  models_total: number;
  models_updated: number;
  fails: string[];
  duration_ms: number;
}

export async function runPricesUpdate(
  env: PricesUpdateEnv,
  _now: Date = new Date(),
): Promise<PricesUpdateResult> {
  const t0 = Date.now();
  const fails: string[] = [];

  const settled = await Promise.allSettled([
    scrapeAnthropic(),
    scrapeOpenAI(),
    scrapeGoogle(),
    scrapeMistral(),
    scrapeDeepSeek(),
  ]);

  const allPrices: ModelPrice[] = settled.flatMap((res, idx) => {
    if (res.status === "fulfilled") return res.value;
    fails.push(`provider_${idx}: ${String(res.reason).slice(0, 100)}`);
    return [];
  });

  let updated = 0;
  for (const p of allPrices) {
    try {
      const key = KV_KEYS.price(p.model_slug);
      await env.PRICES_KV.put(key, JSON.stringify(p), {
        expirationTtl: KV_TTL.pricesSafety,
      });
      updated++;
    } catch (e) {
      fails.push(`${p.model_slug}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  await env.CRON_STATE_KV.put(
    KV_KEYS.cronLastRun("prices-update"),
    new Date().toISOString(),
    { expirationTtl: KV_TTL.cronState },
  ).catch(() => {});

  const duration = Date.now() - t0;
  if (fails.length > 2 && env.PUBLIC_ENV === "production") {
    await sendAdminAlert(
      env.ADMIN_ALERT_EMAIL,
      "prices-update : >2 fails",
      `Cron prices-update — ${fails.length} fails sur ${allPrices.length} modèles.\n\nFails:\n${fails.join("\n")}\n\nDuration: ${duration}ms`,
    ).catch(() => {});
  }

  emitAeEvent(env.DEVREFS_AE, "api_response_200_sent", {
    endpoint: "cron:prices-update",
    status_code: fails.length > 2 ? 207 : 200,
    latency_ms: duration,
    payload_size_bytes: allPrices.length,
    freshness_hours: 0,
  });

  return {
    ok: fails.length <= 2,
    models_total: allPrices.length,
    models_updated: updated,
    fails,
    duration_ms: duration,
  };
}
