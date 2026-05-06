// src/cron/index.ts
// Scheduled handler Cloudflare Workers — dispatch les 5 crons selon le cron pattern matché.
// Source : wrangler.toml [triggers] crons.
//
// Patterns :
//   "0 */6 * * *"   → prices-update (toutes 6h pile)
//   "0 3 * * *"     → sdk-update (03h00 UTC)
//   "5 */6 * * *"   → indexnow-push (5min après prices-update)
//   "0 0 * * *"     → pack-expiry-check (00h00 UTC)
//   "*/15 * * * *"  → cron-health-check (toutes les 15 min)
//
// Note : indexnow-push est aussi déclenché en chaîne après prices-update OK
// (via append direct dans le scheduled handler du même tick si possible).

import { runPricesUpdate, type PricesUpdateEnv } from "@/cron/jobs/prices-update";
import { runSdkUpdate, type SdkUpdateEnv } from "@/cron/jobs/sdk-update";
import { runIndexNowPush, type IndexNowEnv } from "@/cron/jobs/indexnow-push";
import { runPackExpiryCheck, type PackExpiryEnv } from "@/cron/jobs/pack-expiry-check";
import { runCronHealthCheck, type CronHealthEnv } from "@/cron/jobs/cron-health-check";

export type CronEnv = PricesUpdateEnv & SdkUpdateEnv & IndexNowEnv & PackExpiryEnv & CronHealthEnv;

export async function dispatchCron(
  cronExpr: string,
  env: CronEnv,
  now: Date = new Date(),
): Promise<{ job: string; ok: boolean; details: unknown }> {
  switch (cronExpr) {
    case "0 */6 * * *": {
      const r = await runPricesUpdate(env, now);
      // Chaîne IndexNow uniquement si au moins 1 modèle a été updated (économie de quota IndexNow)
      if (r.models_updated > 0) {
        await runIndexNowPush(env).catch(() => {});
      }
      return { job: "prices-update", ok: r.ok, details: r };
    }
    case "0 3 * * *": {
      const r = await runSdkUpdate(env, now);
      if (r.packages_updated > 0) {
        await runIndexNowPush(env, [
          "https://devrefs.dev/sdk-status/",
          "https://devrefs.dev/llms.txt",
        ]).catch(() => {});
      }
      return { job: "sdk-update", ok: r.ok, details: r };
    }
    case "5 */6 * * *": {
      // Push standalone IndexNow (sécu si chaîne post-prices a échoué)
      const r = await runIndexNowPush(env);
      return { job: "indexnow-push", ok: r.ok, details: r };
    }
    case "0 0 * * *": {
      const r = await runPackExpiryCheck(env, now);
      return { job: "pack-expiry-check", ok: r.ok, details: r };
    }
    case "*/15 * * * *": {
      const r = await runCronHealthCheck(env, now);
      return { job: "cron-health-check", ok: r.ok, details: r };
    }
    default:
      return { job: `unknown:${cronExpr}`, ok: false, details: null };
  }
}
