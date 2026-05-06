// tests/unit/email-templates.spec.ts
// Vérifie que chaque template email retourne {subject, text, html} valides.

import { describe, expect, it } from "vitest";
import {
  renderFirstX402Alert,
  renderPackExpirationJ7,
  renderRefundProcessed,
  renderRefundTriggered,
  renderTopupConfirmation,
} from "../../src/api/lib/email-templates.js";

describe("email-templates", () => {
  it("topup confirmation : sujet + montant + dashboard", () => {
    const e = renderTopupConfirmation({
      amountUsdc: 10,
      amountEur: 9.5,
      walletShort: "abc12345",
      dashboardUrl: "https://devrefs.dev/dashboard",
      ts: "2026-05-06T10:00:00Z",
    });
    expect(e.subject).toContain("10 USDC");
    expect(e.text).toContain("10 USDC");
    expect(e.text).toContain("9.50 EUR");
    expect(e.html).toContain("https://devrefs.dev/dashboard");
    expect(e.html.startsWith("<!doctype html>")).toBe(true);
  });

  it("pack expiration J-7 : quota + re-purchase URL", () => {
    const e = renderPackExpirationJ7({
      packType: "pack_standard",
      quotaUnused: 42,
      expiresAt: "2026-05-13",
      rePurchaseUrl: "https://devrefs.dev/paywall",
    });
    expect(e.subject).toMatch(/expire dans 7 jours/);
    expect(e.text).toContain("42 requêtes");
    expect(e.html).toContain("Re-purchase pack");
  });

  it("refund triggered : audit_id + amount", () => {
    const e = renderRefundTriggered({
      auditId: "aud_2026-05-01_abc123",
      walletShort: "deadbeef",
      amountUsdc: 4.995,
    });
    expect(e.subject).toMatch(/garantie ROI/i);
    expect(e.text).toContain("aud_2026-05-01_abc123");
    expect(e.text).toContain("4.995 USDC");
  });

  it("refund processed : tx_hash + basescan link", () => {
    const e = renderRefundProcessed({
      auditId: "aud_x",
      amountUsdc: 4.995,
      txHash: "0x" + "f".repeat(64),
      walletShort: "abc",
    });
    expect(e.text).toContain("0x" + "f".repeat(64));
    expect(e.html).toContain("basescan.org/tx/");
  });

  it("first x402 alert (admin) : sujet premier paiement", () => {
    const e = renderFirstX402Alert({
      walletShort: "feed",
      amountUsdc: 0.49,
      endpoint: "/api/llm-prices",
    });
    expect(e.subject).toMatch(/Premier paiement x402/);
    expect(e.text).toContain("/api/llm-prices");
    expect(e.text).toContain("0.49 USDC");
  });
});
