// tests/unit/eip191-viem.spec.ts
// Vérifie l'intégration viem ecrecover EIP-191.

import { describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import { buildRefundMessage, sha256Hex, verifyEip191 } from "../../src/api/lib/eip191.js";

// Fixture private key (test only — JAMAIS de fonds réels)
const FIXTURE_PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

describe("eip191 / viem", () => {
  it("recovers address + matches wallet_hash", async () => {
    const account = privateKeyToAccount(FIXTURE_PK);
    const message = buildRefundMessage("aud_test_1", "2026-05-06T10:00:00Z");
    const sig = await account.signMessage({ message });
    const walletHash = await sha256Hex(account.address.toLowerCase());

    const r = await verifyEip191(message, sig, walletHash);
    expect(r.ok).toBe(true);
    expect(r.recoveredAddress?.toLowerCase()).toBe(account.address.toLowerCase());
  });

  it("wrong walletHash → WALLET_HASH_MISMATCH", async () => {
    const account = privateKeyToAccount(FIXTURE_PK);
    const message = buildRefundMessage("aud_test_2", "2026-05-06T10:00:00Z");
    const sig = await account.signMessage({ message });
    const r = await verifyEip191(message, sig, "deadbeef".repeat(8));
    expect(r.ok).toBe(false);
    expect(r.error).toBe("WALLET_HASH_MISMATCH");
  });

  it("malformed signature → INVALID_SIGNATURE_FORMAT", async () => {
    const r = await verifyEip191("msg", "0xabc", "x".repeat(64));
    expect(r.ok).toBe(false);
    expect(r.error).toBe("INVALID_SIGNATURE_FORMAT");
  });

  it("tampered message → mismatch", async () => {
    const account = privateKeyToAccount(FIXTURE_PK);
    const message = buildRefundMessage("aud_orig", "2026-05-06T10:00:00Z");
    const sig = await account.signMessage({ message });
    const walletHash = await sha256Hex(account.address.toLowerCase());
    // Verify with different message
    const r = await verifyEip191(buildRefundMessage("aud_OTHER", "2026-05-06T10:00:00Z"), sig, walletHash);
    expect(r.ok).toBe(false);
  });
});
