// src/cron/jobs/cron-health-check.ts
// Cron 15min — watchdog : alerte si dernier run prices > 8h OU sdk > 30h.

import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";
import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { sendAdminAlert } from "@/cron/lib/mailchannels";

export interface CronHealthEnv {
  CRON_STATE_KV: KVNamespace;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
  ADMIN_ALERT_EMAIL?: string;
}

export interface CronHealthResult {
  ok: boolean;
  alerts: string[];
  last_runs: Record<string, string | null>;
}

const STALE_THRESHOLD_MS: Record<string, number> = {
  "prices-update": 8 * 3600 * 1000, // 8h
  "sdk-update": 30 * 3600 * 1000, // 30h
  "indexnow-push": 12 * 3600 * 1000,
  "pack-expiry-check": 30 * 3600 * 1000,
};

export async function runCronHealthCheck(
  env: CronHealthEnv,
  now: Date = new Date(),
): Promise<CronHealthResult> {
  const alerts: string[] = [];
  const lastRuns: Record<string, string | null> = {};
  const nowMs = now.getTime();

  const jobs = Object.keys(STALE_THRESHOLD_MS);
  for (const job of jobs) {
    const lastRunStr = await env.CRON_STATE_KV.get(KV_KEYS.cronLastRun(job));
    lastRuns[job] = lastRunStr;
    if (!lastRunStr) {
      alerts.push(`${job}: no last_run recorded`);
      continue;
    }
    const lastRunMs = new Date(lastRunStr).getTime();
    if (Number.isNaN(lastRunMs)) {
      alerts.push(`${job}: invalid timestamp ${lastRunStr}`);
      continue;
    }
    const elapsed = nowMs - lastRunMs;
    const threshold = STALE_THRESHOLD_MS[job];
    if (typeof threshold === "number" && elapsed > threshold) {
      const hours = Math.round(elapsed / 3600000);
      alerts.push(`${job}: stale ${hours}h (threshold ${Math.round(threshold / 3600000)}h)`);
    }
  }

  await env.CRON_STATE_KV.put(
    KV_KEYS.cronLastRun("cron-health-check"),
    now.toISOString(),
    { expirationTtl: KV_TTL.cronState },
  ).catch(() => {});

  if (alerts.length > 0) {
    emitAeEvent(env.DEVREFS_AE, "api_response_4xx_sent", {
      endpoint: "cron:cron-health-check",
      status_code: 503,
      error_code: "cron_stale",
      payload_size_bytes: alerts.length,
    });
    if (env.PUBLIC_ENV === "production") {
      await sendAdminAlert(
        env.ADMIN_ALERT_EMAIL,
        "cron-health-check : crons stale",
        `Stale crons detected:\n${alerts.join("\n")}\n\nLast runs:\n${JSON.stringify(lastRuns, null, 2)}`,
      ).catch(() => {});
    }
  }

  return {
    ok: alerts.length === 0,
    alerts,
    last_runs: lastRuns,
  };
}
