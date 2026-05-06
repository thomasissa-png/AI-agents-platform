// src/api/lib/jwt.ts
// JWT HS256 minimal pour sponsor dashboard (24 h).
// Source : functional-specs §2.1 (POST /api/jwt/issue) + dev-decisions §"JWT sponsor".

export interface JwtPayload {
  sub: string; // wallet_hash sponsor
  jti: string; // unique id (anti-replay)
  iat: number;
  exp: number;
  scope?: string; // ex. "sponsor.dashboard"
}

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncodeStr(str: string): string {
  return b64urlEncode(new TextEncoder().encode(str));
}

function b64urlDecodeToStr(s: string): string {
  const pad = s + "===".slice((s.length + 3) % 4);
  const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlEncode(sig);
}

export async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const h = b64urlEncodeStr(JSON.stringify(header));
  const p = b64urlEncodeStr(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = await hmacSign(secret, data);
  return `${data}.${sig}`;
}

export async function verifyJwt(
  token: string,
  secret: string,
): Promise<{ ok: boolean; payload?: JwtPayload; error?: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "MALFORMED" };
  const [h, p, sig] = parts;
  const expected = await hmacSign(secret, `${h}.${p}`);
  if (expected.length !== sig.length) return { ok: false, error: "SIGNATURE_INVALID" };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return { ok: false, error: "SIGNATURE_INVALID" };
  let payload: JwtPayload;
  try {
    payload = JSON.parse(b64urlDecodeToStr(p)) as JwtPayload;
  } catch {
    return { ok: false, error: "PAYLOAD_INVALID" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return { ok: false, payload, error: "EXPIRED" };
  return { ok: true, payload };
}

export function newJti(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function mintJwtForSponsor(
  walletHash: string,
  secret: string,
  ttlSec = 24 * 3600,
): Promise<{ token: string; jti: string; iat: number; exp: number }> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSec;
  const jti = newJti();
  const token = await signJwt(
    { sub: walletHash, jti, iat, exp, scope: "sponsor.dashboard" },
    secret,
  );
  return { token, jti, iat, exp };
}
