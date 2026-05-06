// src/cron/jobs/sdk-update.ts
// Cron 24h — scrape ~50 packages npm → SDK_KV.
// Rate-limit npm : await sleep 1000ms entre fetchs (1 req/sec).

import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";
import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { fetchNpmLatest, sleep, type NpmInfo } from "@/cron/lib/scrapers/npm-registry";
import { sendAdminAlert } from "@/cron/lib/mailchannels";
import { SUPPORTED_SDK_PACKAGES } from "@/api/types/pricing";

export interface SdkUpdateEnv {
  SDK_KV: KVNamespace;
  CRON_STATE_KV: KVNamespace;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
  ADMIN_ALERT_EMAIL?: string;
}

export interface SdkUpdateResult {
  ok: boolean;
  packages_total: number;
  packages_updated: number;
  packages_fallback: number;
  fails: string[];
  duration_ms: number;
}

const NPM_RATE_LIMIT_MS = 1000;

export async function runSdkUpdate(
  env: SdkUpdateEnv,
  _now: Date = new Date(),
  packageList: readonly string[] = SUPPORTED_SDK_PACKAGES,
): Promise<SdkUpdateResult> {
  const t0 = Date.now();
  const fails: string[] = [];
  let updated = 0;
  let fallback = 0;

  for (const pkg of packageList) {
    try {
      const fetched: NpmInfo | null = await fetchNpmLatest(pkg);
      const key = KV_KEYS.sdk(pkg);
      if (fetched === null) {
        // Conserve ancien KV plutôt qu'écraser avec null
        const existing = await env.SDK_KV.get(key);
        if (existing) {
          fallback++;
        } else {
          fails.push(`${pkg}: no data + no existing KV`);
        }
        await sleep(NPM_RATE_LIMIT_MS);
        continue;
      }
      // Construire SdkKvValue compatible avec le payload sdk-status existant
      const sdkValue = {
        pkg: fetched.name,
        latest: fetched.latest,
        breaking_since: extractMajorBoundary(fetched.latest),
        deprecated_versions: [] as string[],
        date_modified: fetched.date_modified,
        fetched_at: fetched.fetched_at,
        same_as: fetched.same_as,
        schema_version: fetched.schema_version,
      };
      await env.SDK_KV.put(key, JSON.stringify(sdkValue), {
        expirationTtl: KV_TTL.sdkSafety,
      });
      updated++;
    } catch (e) {
      fails.push(`${pkg}: ${e instanceof Error ? e.message : "unknown"}`);
    }
    await sleep(NPM_RATE_LIMIT_MS);
  }

  await env.CRON_STATE_KV.put(
    KV_KEYS.cronLastRun("sdk-update"),
    new Date().toISOString(),
    { expirationTtl: KV_TTL.cronState },
  ).catch(() => {});

  const duration = Date.now() - t0;
  if (fails.length > 5 && env.PUBLIC_ENV === "production") {
    await sendAdminAlert(
      env.ADMIN_ALERT_EMAIL,
      "sdk-update : >5 fails",
      `Cron sdk-update — ${fails.length} fails sur ${packageList.length} packages.\n\nFails (10 first):\n${fails.slice(0, 10).join("\n")}\n\nDuration: ${duration}ms`,
    ).catch(() => {});
  }

  emitAeEvent(env.DEVREFS_AE, "api_response_200_sent", {
    endpoint: "cron:sdk-update",
    status_code: fails.length > 5 ? 207 : 200,
    latency_ms: duration,
    payload_size_bytes: packageList.length,
  });

  return {
    ok: fails.length <= 5,
    packages_total: packageList.length,
    packages_updated: updated,
    packages_fallback: fallback,
    fails,
    duration_ms: duration,
  };
}

function extractMajorBoundary(version: string): string | null {
  const m = version.match(/^(\d+)\./);
  if (!m) return null;
  return `${m[1]}.0.0`;
}
