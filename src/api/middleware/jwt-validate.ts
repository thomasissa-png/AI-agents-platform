// src/api/middleware/jwt-validate.ts
// Validation JWT HMAC sponsor pour endpoints dashboard /api/pack/quota.
// Source : functional-specs F10 — JWT 24h, secret JWT_SECRET, jti tracké KV pour révocation.

import { KV_KEYS } from "@/api/lib/kv-keys";

export interface JwtEnv {
  JWT_SECRET?: string;
  JWT_KV: KVNamespace;
}

export interface JwtPayload {
  sub: string; // wallet_hash sponsor
  iat: number;
  exp: number;
  jti: string;
  scope: "sponsor_dashboard";
}

function base64UrlDecode(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bufToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return bufToBase64Url(sig);
}

export async function validateJwt(
  token: string,
  env: JwtEnv,
): Promise<{ ok: boolean; payload?: JwtPayload; error?: string }> {
  if (!env.JWT_SECRET) return { ok: false, error: "jwt_secret_missing" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "malformed" };
  const [headerB64, payloadB64, sigB64] = parts;
  const expectedSig = await hmacSha256(env.JWT_SECRET, `${headerB64}.${payloadB64}`);
  if (expectedSig !== sigB64) return { ok: false, error: "bad_signature" };

  let payload: JwtPayload;
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    payload = JSON.parse(json) as JwtPayload;
  } catch {
    return { ok: false, error: "bad_payload" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return { ok: false, error: "expired" };
  if (payload.scope !== "sponsor_dashboard") return { ok: false, error: "wrong_scope" };

  // Vérification révocation KV
  const revoked = await env.JWT_KV.get(KV_KEYS.jwt(payload.jti));
  if (revoked === "revoked") return { ok: false, error: "revoked" };

  return { ok: true, payload };
}

/**
 * Émet un nouveau JWT (pour endpoints d'auth — non utilisé en 4a/4b mais helper prêt pour 4e).
 */
export async function issueJwt(walletHash: string, env: JwtEnv): Promise<string | null> {
  if (!env.JWT_SECRET) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: walletHash,
    iat: now,
    exp: now + 24 * 3600,
    jti: crypto.randomUUID(),
    scope: "sponsor_dashboard",
  };
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const sig = await hmacSha256(env.JWT_SECRET, `${headerB64}.${payloadB64}`);
  // Trace jti en KV (état "active") pour révocation future
  await env.JWT_KV.put(KV_KEYS.jwt(payload.jti), "active", { expirationTtl: 25 * 3600 });
  return `${headerB64}.${payloadB64}.${sig}`;
}
