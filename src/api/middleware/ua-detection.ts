// src/api/middleware/ua-detection.ts
// Émet crawl_* events selon UA bucket pour endpoints "crawl-friendly" (llms.txt, openapi, llm-prices, sdk-status).
// Source : tracking-plan v2 + dev-decisions §"crawl events".

import { aeEvents, type AnalyticsEngineDataset, uaBucket } from "@/api/lib/ae-events";

export type CrawlAsset = "llms_txt" | "openapi" | "sitemap" | "dataset_jsonld";

const CRAWLER_BUCKETS = new Set([
  "claude_bot",
  "gpt_bot",
  "gemini_bot",
  "perplexity_bot",
  "cursor_agent",
]);

export function emitCrawlEvent(
  ds: AnalyticsEngineDataset | undefined,
  asset: CrawlAsset,
  ua: string | null,
): void {
  if (!ds) return;
  const bucket = uaBucket(ua);
  if (!CRAWLER_BUCKETS.has(bucket)) return; // skip humains/SDKs
  switch (asset) {
    case "llms_txt":
      aeEvents.write(ds, "crawl_llms_txt_fetched", { endpoint: "llms.txt", ua_bucket: bucket });
      break;
    case "openapi":
      aeEvents.write(ds, "crawl_openapi_fetched", { endpoint: "openapi.json", ua_bucket: bucket });
      break;
    case "sitemap":
      aeEvents.write(ds, "crawl_sitemap_fetched", { endpoint: "sitemap.xml", ua_bucket: bucket });
      break;
    case "dataset_jsonld":
      aeEvents.write(ds, "crawl_dataset_jsonld_parsed", {
        endpoint: "dataset_jsonld",
        ua_bucket: bucket,
      });
      break;
  }
}
