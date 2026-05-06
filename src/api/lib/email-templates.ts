// src/api/lib/email-templates.ts
// 5 templates emails transactionnels (Mailchannels) — sujet + html + text.
// Source : copy/landing.md §"5 emails transactionnels" + dev-decisions §"Email transactionnels".

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const FOOTER =
  "\n\n—\nDevRefs — pricing & SDK references for AI agents\nhttps://devrefs.dev";
const FOOTER_HTML =
  '<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0"/>' +
  '<p style="color:#6b7280;font-size:12px">DevRefs — pricing &amp; SDK references for AI agents · ' +
  '<a href="https://devrefs.dev" style="color:#2563eb">devrefs.dev</a></p>';

function wrapHtml(title: string, body: string): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>` +
    `<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;max-width:560px;margin:24px auto;padding:0 16px">` +
    body +
    FOOTER_HTML +
    "</body></html>"
  );
}

export function renderTopupConfirmation(args: {
  amountUsdc: number;
  amountEur: number;
  walletShort: string;
  dashboardUrl: string;
  ts: string;
}): RenderedEmail {
  const subject = `Wallet sponsor DevRefs : top-up ${args.amountUsdc} USDC confirmé`;
  const text =
    `Top-up confirmé.\n\n` +
    `Montant : ${args.amountUsdc} USDC (${args.amountEur.toFixed(2)} EUR)\n` +
    `Wallet : ${args.walletShort}…\n` +
    `Date : ${args.ts}\n\n` +
    `Dashboard : ${args.dashboardUrl}` +
    FOOTER;
  const html = wrapHtml(
    subject,
    `<h2 style="font-size:20px">Top-up confirmé</h2>` +
      `<p>Votre wallet sponsor DevRefs a été crédité.</p>` +
      `<table style="width:100%;border-collapse:collapse"><tbody>` +
      `<tr><td style="padding:8px 0;color:#6b7280">Montant</td><td style="padding:8px 0"><strong>${args.amountUsdc} USDC</strong> (${args.amountEur.toFixed(2)} EUR)</td></tr>` +
      `<tr><td style="padding:8px 0;color:#6b7280">Wallet</td><td style="padding:8px 0"><code>${args.walletShort}…</code></td></tr>` +
      `<tr><td style="padding:8px 0;color:#6b7280">Date</td><td style="padding:8px 0">${args.ts}</td></tr>` +
      `</tbody></table>` +
      `<p style="margin-top:24px"><a href="${args.dashboardUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px">Ouvrir le dashboard</a></p>`,
  );
  return { subject, text, html };
}

export function renderPackExpirationJ7(args: {
  packType: string;
  quotaUnused: number;
  expiresAt: string;
  rePurchaseUrl: string;
}): RenderedEmail {
  const subject = `DevRefs : votre ${args.packType} expire dans 7 jours (${args.quotaUnused} requêtes restantes)`;
  const text =
    `Votre ${args.packType} expire le ${args.expiresAt}.\n\n` +
    `Quota inutilisé : ${args.quotaUnused} requêtes\n` +
    `Re-purchase : ${args.rePurchaseUrl}` +
    FOOTER;
  const html = wrapHtml(
    subject,
    `<h2 style="font-size:20px">Pack expire dans 7 jours</h2>` +
      `<p>Pack : <strong>${args.packType}</strong></p>` +
      `<p>Quota inutilisé : <strong>${args.quotaUnused} requêtes</strong></p>` +
      `<p>Expiration : <strong>${args.expiresAt}</strong></p>` +
      `<p style="margin-top:24px"><a href="${args.rePurchaseUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px">Re-purchase pack</a></p>`,
  );
  return { subject, text, html };
}

export function renderRefundTriggered(args: {
  auditId: string;
  walletShort: string;
  amountUsdc: number;
}): RenderedEmail {
  const subject = `DevRefs : votre demande de garantie ROI a été enregistrée`;
  const text =
    `Audit : ${args.auditId}\n` +
    `Wallet : ${args.walletShort}…\n` +
    `Montant : ${args.amountUsdc} USDC\n\n` +
    `Validation manuelle sous 7 jours ouvrés.` +
    FOOTER;
  const html = wrapHtml(
    subject,
    `<h2 style="font-size:20px">Garantie ROI : demande enregistrée</h2>` +
      `<p>Audit ID : <code>${args.auditId}</code></p>` +
      `<p>Montant : <strong>${args.amountUsdc} USDC</strong></p>` +
      `<p style="color:#6b7280">Validation manuelle ≤ 7 jours ouvrés.</p>`,
  );
  return { subject, text, html };
}

export function renderRefundProcessed(args: {
  auditId: string;
  amountUsdc: number;
  txHash: string;
  walletShort: string;
}): RenderedEmail {
  const subject = `DevRefs : ${args.amountUsdc} USDC remboursé sur Base`;
  const text =
    `Audit : ${args.auditId}\n` +
    `Montant : ${args.amountUsdc} USDC\n` +
    `tx_hash : ${args.txHash}\n` +
    `Wallet : ${args.walletShort}…\n\n` +
    `Voir : https://basescan.org/tx/${args.txHash}` +
    FOOTER;
  const html = wrapHtml(
    subject,
    `<h2 style="font-size:20px">Remboursement effectué</h2>` +
      `<p>Montant : <strong>${args.amountUsdc} USDC</strong></p>` +
      `<p>Audit : <code>${args.auditId}</code></p>` +
      `<p>tx_hash : <a href="https://basescan.org/tx/${args.txHash}" style="color:#2563eb"><code>${args.txHash}</code></a></p>`,
  );
  return { subject, text, html };
}

export function renderFirstX402Alert(args: {
  walletShort: string;
  amountUsdc: number;
  endpoint: string;
}): RenderedEmail {
  const subject = `Premier paiement x402 reel recu`;
  const text =
    `Le premier paiement x402 réel a été détecté.\n\n` +
    `Endpoint : ${args.endpoint}\n` +
    `Wallet : ${args.walletShort}…\n` +
    `Montant : ${args.amountUsdc} USDC` +
    FOOTER;
  const html = wrapHtml(
    subject,
    `<h2 style="font-size:20px">Premier paiement x402</h2>` +
      `<p>La machine tourne.</p>` +
      `<p>Endpoint : <code>${args.endpoint}</code><br/>Wallet : <code>${args.walletShort}…</code><br/>Montant : <strong>${args.amountUsdc} USDC</strong></p>`,
  );
  return { subject, text, html };
}
