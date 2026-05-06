// src/api/lib/eip191.ts
// Vérification stricte EIP-191 via viem.
// Source : dev-decisions §"viem ecrecover" + qa-strategy §4.1 (refund signature obligatoire).

import { recoverMessageAddress } from "viem";

/**
 * SHA256 hex d'une string (lowercase).
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Vérifie qu'une signature EIP-191 a été produite par le wallet dont
 * SHA256(address.lowercase) === expectedWalletHash.
 *
 * Le message canonique DevRefs pour refund :
 *   `DevRefs refund request for audit {audit_id} at {timestamp}`
 *
 * @returns ok=true si recovered hash === expectedWalletHash.
 */
export async function verifyEip191(
  message: string,
  signature: string,
  expectedWalletHash: string,
): Promise<{ ok: boolean; recoveredAddress?: string; error?: string }> {
  if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
    return { ok: false, error: "INVALID_SIGNATURE_FORMAT" };
  }
  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });
    const recoveredHash = await sha256Hex(recoveredAddress.toLowerCase());
    if (recoveredHash !== expectedWalletHash.toLowerCase()) {
      return { ok: false, recoveredAddress, error: "WALLET_HASH_MISMATCH" };
    }
    return { ok: true, recoveredAddress };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ecrecover_failed" };
  }
}

/**
 * Construit le message canonique DevRefs pour la garantie refund.
 */
export function buildRefundMessage(auditId: string, timestamp: string): string {
  return `DevRefs refund request for audit ${auditId} at ${timestamp}`;
}
