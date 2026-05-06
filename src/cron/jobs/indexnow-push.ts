// src/cron/jobs/indexnow-push.ts
// Push IndexNow Bing après prices-update + sdk-update.
// Source : functional-specs §4.3.
// Spec IndexNow : https://www.indexnow.org/documentation

import { emitAeEvent, type AnalyticsEngineDataset } from "@/api/lib/ae-events";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowEnv {
  INDEXNOW_API_KEY?: string;
  INDEXNOW_HOST?: string;
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

export interface IndexNowResult {
  ok: boolean;
  status: number;
  urls_pushed: number;
  error?: string;
}

const DEFAULT_URLS = [
  "https://devrefs.dev/llm-prices/",
  "https://devrefs.dev/sdk-status/",
  "https://devrefs.dev/llms.txt",
  "https://devrefs.dev/openapi.json",
  "https://devrefs.dev/",
];

export async function runIndexNowPush(
  env: IndexNowEnv,
  urls: readonly string[] = DEFAULT_URLS,
): Promise<IndexNowResult> {
  if (!env.INDEXNOW_API_KEY) {
    return { ok: false, status: 0, urls_pushed: 0, error: "missing_api_key" };
  }
  const host = env.INDEXNOW_HOST ?? "devrefs.dev";

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)",
      },
      body: JSON.stringify({
        host,
        key: env.INDEXNOW_API_KEY,
        keyLocation: `https://${host}/${env.INDEXNOW_API_KEY}.txt`,
        urlList: [...urls],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    emitAeEvent(env.DEVREFS_AE, "api_response_200_sent", {
      endpoint: "cron:indexnow-push",
      status_code: res.status,
      payload_size_bytes: urls.length,
    });

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      urls_pushed: urls.length,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      urls_pushed: 0,
      error: e instanceof Error ? e.message : "network_error",
    };
  }
}
