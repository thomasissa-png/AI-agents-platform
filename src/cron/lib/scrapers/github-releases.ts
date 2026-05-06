// src/cron/lib/scrapers/github-releases.ts
// Fetch GitHub latest release pour détecter breaking changes (heuristique sémantique).
// Auth : public unauth = 60 req/h ; avec token (env.GITHUB_TOKEN optionnel) = 5 000 req/h.

const USER_AGENT = "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)";

export interface GithubRelease {
  org: string;
  repo: string;
  tag_name: string;
  body: string;
  published_at: string;
  url: string;
  is_breaking: boolean;
}

export async function fetchLatestRelease(
  org: string,
  repo: string,
  token?: string,
): Promise<GithubRelease | null> {
  const url = `https://api.github.com/repos/${org}/${repo}/releases/latest`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tag_name: string;
      body?: string;
      published_at: string;
      html_url: string;
    };
    const body = data.body ?? "";
    // Heuristique breaking : mention "BREAKING CHANGE" ou "breaking:" ou major bump
    const isBreaking = /BREAKING CHANGE|breaking:|^v?[0-9]+\.0\.0$/im.test(body) || /^v?[0-9]+\.0\.0$/.test(data.tag_name);
    return {
      org,
      repo,
      tag_name: data.tag_name,
      body,
      published_at: data.published_at,
      url: data.html_url,
      is_breaking: isBreaking,
    };
  } catch {
    return null;
  }
}
