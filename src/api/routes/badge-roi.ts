// src/api/routes/badge-roi.ts
// GET /badge/roi?savings_bucket=low|mid|high&audit_id=X
// Source : docs/growth/earned-media-strategy.md boucle virale 3 + viral-loops.md.
//
// Privacy by design strict :
//  - Pas de PII dans l'URL (savings exact interdit, on accepte un bucket discret)
//  - Pas de tracking pixel JS (SVG statique avec lien <a> simple)
//  - Pas de cookie tiers (rendu serveur, headers Cache-Control public 1h)
//  - Event AE émis serveur-side uniquement (pas de fingerprint navigateur)

import { emitAeEvent, uaBucket, type AnalyticsEngineDataset } from "@/api/lib/ae-events";

export interface BadgeRoiEnv {
  DEVREFS_AE?: AnalyticsEngineDataset;
  PUBLIC_ENV?: string;
}

type SavingsBucket = "low" | "mid" | "high";

const BUCKETS: Record<SavingsBucket, { label: string; color: string }> = {
  low: { label: "$50+/mo", color: "#3B82F6" }, // blue-500
  mid: { label: "$200+/mo", color: "#10B981" }, // emerald-500
  high: { label: "$1k+/mo", color: "#F59E0B" }, // amber-500
};

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

function renderSvg(bucket: SavingsBucket, auditIdShort: string, deepLink: string): string {
  const { label, color } = BUCKETS[bucket];
  const safeLabel = escapeXml(label);
  const safeLink = escapeXml(deepLink);
  const safeAuditShort = escapeXml(auditIdShort);
  // SVG 240x60 — minimal, accessible, statique
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60" role="img" aria-label="DevRefs audit badge — saved ${safeLabel}">
  <title>DevRefs audit ${safeAuditShort} — saved ${safeLabel}</title>
  <a href="${safeLink}" target="_blank" rel="noopener">
    <rect width="240" height="60" rx="6" fill="#0B0F19"/>
    <rect x="0" y="0" width="6" height="60" fill="${color}"/>
    <text x="18" y="22" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" fill="#9CA3AF" font-weight="500">DevRefs audit</text>
    <text x="18" y="40" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="14" fill="#FFFFFF" font-weight="700">Saved ${safeLabel}</text>
    <text x="18" y="54" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="9" fill="#6B7280">devrefs.dev/audit/${safeAuditShort}</text>
  </a>
</svg>`;
}

export async function handleBadgeRoi(request: Request, env: BadgeRoiEnv): Promise<Response> {
  const url = new URL(request.url);
  const ua = uaBucket(request.headers.get("user-agent"));

  if (request.method !== "GET") {
    return new Response("method_not_allowed", { status: 405, headers: { Allow: "GET" } });
  }

  // Privacy : on n'accepte pas savings=$X exact. Si l'embedder envoie un montant, on le bucket-ise
  let bucket: SavingsBucket = "low";
  const rawBucket = url.searchParams.get("savings_bucket");
  const rawSavings = url.searchParams.get("savings");

  if (rawBucket === "low" || rawBucket === "mid" || rawBucket === "high") {
    bucket = rawBucket;
  } else if (rawSavings) {
    const parsed = parseFloat(rawSavings.replace(/[^\d.]/g, ""));
    if (!Number.isNaN(parsed)) {
      bucket = parsed >= 1000 ? "high" : parsed >= 200 ? "mid" : "low";
    }
  }

  // audit_id : on garde uniquement le prefix court (8 chars) — pas de full UUID dans l'URL
  const rawAuditId = url.searchParams.get("audit_id") ?? "";
  const auditIdShort = /^aud_[a-zA-Z0-9-]{4,}$/.test(rawAuditId) ? rawAuditId.slice(0, 12) : "demo";

  // Si redirect demandé (?redirect=1), on émet l'event clic et on redirige vers la landing
  if (url.searchParams.get("redirect") === "1") {
    emitAeEvent(env.DEVREFS_AE, "badge_roi_clicked", {
      endpoint: "badge-roi",
      ua_bucket: ua,
      savings_bucket: bucket,
      audit_id: auditIdShort,
    });
    const landing = `https://devrefs.dev/audit/${auditIdShort}?ref=badge`;
    return new Response(null, { status: 302, headers: { Location: landing, "Cache-Control": "no-store" } });
  }

  // Render SVG — lien <a> pointe vers /badge/roi?...&redirect=1 pour tracking via 302
  const tracker = new URL(url.toString());
  tracker.searchParams.set("redirect", "1");
  const deepLink = tracker.toString();
  const svg = renderSvg(bucket, auditIdShort, deepLink);

  emitAeEvent(env.DEVREFS_AE, "badge_roi_rendered", {
    endpoint: "badge-roi",
    ua_bucket: ua,
    savings_bucket: bucket,
    audit_id: auditIdShort,
  });

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
