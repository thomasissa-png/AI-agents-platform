// src/cron/lib/scrapers/npm-registry.ts
// Fetch npm latest version + last publish date depuis registry.npmjs.org.
// Rate-limit applicatif : 1 req/sec (await sleep 1000ms entre fetchs côté caller).

const REGISTRY = "https://registry.npmjs.org";
const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

export interface NpmInfo {
  name: string;
  latest: string;
  date_modified: string;
  same_as: string;
  fetched_at: string;
  schema_version: "1.0";
}

export async function fetchNpmLatest(pkgName: string): Promise<NpmInfo | null> {
  const url = `${REGISTRY}/${encodeURIComponent(pkgName)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      "dist-tags"?: { latest?: string };
      time?: Record<string, string>;
    };
    const latest = data["dist-tags"]?.latest;
    if (!latest) return null;
    const dateModified = data.time?.[latest] ?? new Date().toISOString();
    return {
      name: pkgName,
      latest,
      date_modified: dateModified,
      same_as: `https://www.npmjs.com/package/${pkgName}`,
      fetched_at: new Date().toISOString(),
      schema_version: "1.0",
    };
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
