// src/api/lib/hmac.ts
// Helper signature HMAC-SHA256 via Web Crypto API native (pas de dépendance externe).
// Source : functional-specs F13 + dev-decisions §"Watermark HMAC sur output audit".
//
// Pattern : signature reproductible (canonicalize JSON via tri alphabétique des clés)
// → garantit que client + serveur calculent le même hash sur la même donnée logique.

/**
 * Canonicalize un objet JSON en triant récursivement les clés.
 * Garantit que { a:1, b:2 } et { b:2, a:1 } produisent la même signature.
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalizeJson(v)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ":" + canonicalizeJson(obj[k]));
  return "{" + parts.join(",") + "}";
}

/**
 * Convertit un ArrayBuffer en hex lowercase.
 */
function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Signe un payload JSON avec HMAC-SHA256.
 * @param payload - objet à signer (sera canonicalisé)
 * @param secret - HMAC_SECRET_KEY (binding env Worker)
 * @returns signature hex lowercase (64 chars)
 */
export async function signPayload(payload: unknown, secret: string): Promise<string> {
  if (!secret || secret.length < 16) {
    throw new Error("HMAC_SECRET_KEY missing or too short (min 16 chars)");
  }
  const canonical = canonicalizeJson(payload);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(canonical));
  return bufToHex(sig);
}

/**
 * Vérifie une signature HMAC-SHA256.
 * Comparaison constant-time pour éviter timing attacks.
 */
export async function verifySignature(
  payload: unknown,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || typeof signature !== "string") return false;
  const expected = await signPayload(payload, secret);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Génère un audit_id format `aud_{uuid_v4}` (functional-specs §2.4 + agent-audit-spec).
 * Migré du format legacy `aud_{YYYY-MM-DD}_{hex6}` vers UUID v4 pour cohérence spec.
 * Le paramètre `_now` reste accepté pour compatibilité signature des tests existants.
 */
export function generateAuditId(_now: Date = new Date()): string {
  return `aud_${crypto.randomUUID()}`;
}

/**
 * Génère un UUID v4 standard (pour JWT jti, request_id, etc.).
 */
export function generateUuidV4(): string {
  return crypto.randomUUID();
}

/**
 * SHA-256 hex d'une string (pour wallet_hash, etc.).
 */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return bufToHex(buf);
}
