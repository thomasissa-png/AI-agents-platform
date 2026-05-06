// src/api/middleware/quality-instrumentation.ts
// Wrap les handlers pour émettre quality_payload_size_measured + quality_latency_measured.
// Source : tracking-plan v2 + dev-decisions §"Quality instrumentation".

import { aeEvents, type AnalyticsEngineDataset, uaBucket } from "@/api/lib/ae-events";

export interface QualityEnv {
  DEVREFS_AE?: AnalyticsEngineDataset;
}

export type Handler<E> = (request: Request, env: E) => Promise<Response>;

export function withQualityInstrumentation<E extends QualityEnv>(
  endpoint: string,
  handler: Handler<E>,
): Handler<E> {
  return async (request, env) => {
    const t0 = Date.now();
    const res = await handler(request, env);
    const latencyMs = Date.now() - t0;
    const ua = request.headers.get("User-Agent");
    const bucket = uaBucket(ua);
    let payloadSize = 0;
    const cl = res.headers.get("Content-Length");
    if (cl) payloadSize = parseInt(cl, 10) || 0;

    aeEvents.write(env.DEVREFS_AE, "quality_latency_measured", {
      endpoint,
      ua_bucket: bucket,
      latency_ms: latencyMs,
      status_code: res.status,
    });
    if (payloadSize > 0) {
      aeEvents.write(env.DEVREFS_AE, "quality_payload_size_measured", {
        endpoint,
        ua_bucket: bucket,
        payload_size_bytes: payloadSize,
      });
    }
    return res;
  };
}

/**
 * Émet quality_freshness_measured — appelé depuis les handlers qui ont une notion `dateModified`.
 */
export function emitFreshness(
  ds: AnalyticsEngineDataset | undefined,
  endpoint: string,
  dateModifiedIso: string | undefined,
): void {
  if (!ds || !dateModifiedIso) return;
  const ageMs = Date.now() - new Date(dateModifiedIso).getTime();
  const hours = Math.max(0, Math.round(ageMs / 3600000));
  aeEvents.write(ds, "quality_freshness_measured", {
    endpoint,
    freshness_hours: hours,
  });
}

/**
 * Émet quality_watermark_verified (1 = ok, 0 = invalid).
 */
export function emitWatermark(
  ds: AnalyticsEngineDataset | undefined,
  endpoint: string,
  ok: boolean,
): void {
  aeEvents.write(ds, "quality_watermark_verified", {
    endpoint,
    watermark_valid: ok ? 1 : 0,
  });
}
