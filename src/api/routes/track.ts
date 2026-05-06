// src/api/routes/track.ts
// POST /api/track — endpoint public (rate-limited 1/s/IP) pour tracking landing.
// Source : tracking-plan v2 + dev-decisions §"landing tracking client-side".

import { aeEvents, type AeEventName, type AnalyticsEngineDataset, uaBucket } from "@/api/lib/ae-events";

export interface TrackEnv {
  DEVREFS_AE?: AnalyticsEngineDataset;
}

const ALLOWED_EVENTS: ReadonlySet<AeEventName> = new Set<AeEventName>([
  "landing_page_view",
  "landing_scroll_depth",
  "landing_cta_clicked",
  "landing_cta_curl_copied",
  "landing_faq_expanded",
  "crawl_dataset_jsonld_parsed",
]);

interface TrackBody {
  event_name?: string;
  props?: {
    scroll_pct?: number;
    endpoint?: string;
    [k: string]: unknown;
  };
}

const recentByIp: Map<string, number> = new Map();
const RATE_WINDOW_MS = 1000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const last = recentByIp.get(ip) ?? 0;
  if (now - last < RATE_WINDOW_MS) return false;
  recentByIp.set(ip, now);
  if (recentByIp.size > 5000) {
    // GC — supprime les 1000 plus anciens
    const arr = Array.from(recentByIp.entries()).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < 1000; i++) recentByIp.delete(arr[i][0]);
  }
  return true;
}

export async function handleTrack(request: Request, env: TrackEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }
  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "anon";
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "1" },
    });
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }
  if (!body.event_name || !ALLOWED_EVENTS.has(body.event_name as AeEventName)) {
    return new Response(JSON.stringify({ error: "EVENT_NOT_ALLOWED", allowed: [...ALLOWED_EVENTS] }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ua = request.headers.get("User-Agent");
  aeEvents.write(env.DEVREFS_AE, body.event_name as AeEventName, {
    endpoint: "track",
    ua_bucket: uaBucket(ua),
    scroll_pct: typeof body.props?.scroll_pct === "number" ? body.props.scroll_pct : 0,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
