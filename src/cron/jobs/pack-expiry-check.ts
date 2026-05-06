// src/cron/jobs/pack-expiry-check.ts
// Cron 24h — scan PACK_KV → email J-7 sponsor + flag pack expirés.
// V1 : kv.list({prefix: 'pack:'}) acceptable < 1000 packs.

import { KV_KEYS, KV_TTL } from "@/api/lib/kv-keys";
import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";
import { sendMail } from "@/cron/lib/mailchannels";

export interface PackExpiryEnv {
  PACK_KV: KVNamespace;
  CRON_STATE_KV: KVNamespace;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

export interface PackExpiryResult {
  ok: boolean;
  packs_scanned: number;
  packs_expiring_j7: number;
  packs_expired: number;
  emails_sent: number;
  duration_ms: number;
}

const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

export async function runPackExpiryCheck(
  env: PackExpiryEnv,
  now: Date = new Date(),
): Promise<PackExpiryResult> {
  const t0 = Date.now();
  const nowMs = now.getTime();

  let cursor: string | undefined;
  let scanned = 0;
  let expiringJ7 = 0;
  let expired = 0;
  let emailsSent = 0;

  // Itération bornée pour rester sous CPU 50ms — V1 < 1000 packs OK
  let iterations = 0;
  const MAX_ITER = 20;

  do {
    const list = await env.PACK_KV.list({ prefix: "pack:", cursor, limit: 100 });
    cursor = list.list_complete ? undefined : list.cursor;

    // Filtrage : on ne traite que les keys *:expires_at
    const expiresKeys = list.keys.filter((k) => k.name.endsWith(":expires_at"));

    for (const k of expiresKeys) {
      scanned++;
      const expiresAtStr = await env.PACK_KV.get(k.name);
      if (!expiresAtStr) continue;
      const expiresAt = new Date(expiresAtStr).getTime();
      if (Number.isNaN(expiresAt)) continue;

      const walletHash = k.name.replace(/^pack:/, "").replace(/:expires_at$/, "");
      const deltaMs = expiresAt - nowMs;

      if (deltaMs < 0) {
        // Expired — flag KV avec status=expired (clé séparée)
        expired++;
        await env.PACK_KV.put(
          `pack:${walletHash}:status`,
          "expired",
          { expirationTtl: KV_TTL.pack },
        ).catch(() => {});
        emitAeEvent(env.DEVREFS_AE, "pack_quota_exhausted", {
          endpoint: "cron:pack-expiry-check",
          wallet_hash: walletHash,
          status_code: 410,
        });
      } else if (deltaMs < SEVEN_DAYS_MS) {
        expiringJ7++;
        // Tentative envoi email si email sponsor renseigné (clé optionnelle)
        const sponsorEmail = await env.PACK_KV.get(`pack:${walletHash}:sponsor_email`);
        const remaining = await env.PACK_KV.get(KV_KEYS.packRemaining(walletHash));
        if (sponsorEmail && env.PUBLIC_ENV === "production") {
          const days = Math.ceil(deltaMs / (24 * 3600 * 1000));
          const ok = await sendMail({
            to: sponsorEmail,
            subject: `DevRefs — Pack expires in ${days} days — ${remaining ?? "?"} calls unused`,
            textBody: `Your agent's pack expires in ${days} days. ${remaining ?? "0"} calls remain unused.\n\nUnused calls are forfeited at expiry (12-month validity per CGV Art. 4bis).\n\nIf your agent still needs pricing data: https://devrefs.dev/paywall\n\n— DevRefs`,
          });
          if (ok) emailsSent++;
        }
      }
    }

    iterations++;
  } while (cursor && iterations < MAX_ITER);

  await env.CRON_STATE_KV.put(
    KV_KEYS.cronLastRun("pack-expiry-check"),
    now.toISOString(),
    { expirationTtl: KV_TTL.cronState },
  ).catch(() => {});

  const duration = Date.now() - t0;
  emitAeEvent(env.DEVREFS_AE, "api_response_200_sent", {
    endpoint: "cron:pack-expiry-check",
    status_code: 200,
    latency_ms: duration,
    payload_size_bytes: scanned,
  });

  return {
    ok: true,
    packs_scanned: scanned,
    packs_expiring_j7: expiringJ7,
    packs_expired: expired,
    emails_sent: emailsSent,
    duration_ms: duration,
  };
}
