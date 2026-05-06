// src/cron/lib/mailchannels.ts
// Helper email via Cloudflare Workers → Mailchannels API.
// Gratuit pour Workers CF (auth via DKIM/SPF DNS, pas de clé API).
// Limite V1 : 100 emails/jour (rate-limit applicatif côté caller).
// Source : functional-specs §4 (cron pack-expiry-check) + dev-decisions §"Email transactionnels".

export interface MailchannelsRequest {
  to: string;
  toName?: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

const DEFAULT_FROM = "no-reply@devrefs.dev";
const DEFAULT_FROM_NAME = "DevRefs";
const MAILCHANNELS_URL = "https://api.mailchannels.net/tx/v1/send";

/**
 * Envoie un email via Mailchannels (gratuit pour CF Workers).
 * Retourne true si 202 Accepted, false sinon (jamais de throw — caller log+continue).
 */
export async function sendMail(req: MailchannelsRequest): Promise<boolean> {
  const body = {
    personalizations: [
      {
        to: [{ email: req.to, name: req.toName ?? req.to }],
      },
    ],
    from: {
      email: req.from ?? DEFAULT_FROM,
      name: req.fromName ?? DEFAULT_FROM_NAME,
    },
    reply_to: req.replyTo ? { email: req.replyTo } : undefined,
    subject: req.subject,
    content: [
      { type: "text/plain", value: req.textBody },
      ...(req.htmlBody ? [{ type: "text/html", value: req.htmlBody }] : []),
    ],
  };

  try {
    const res = await fetch(MAILCHANNELS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "DevRefs-Bot/1.0 (+https://devrefs.dev/bot)",
      },
      body: JSON.stringify(body),
    });
    return res.status === 202;
  } catch {
    return false;
  }
}

/**
 * Envoi alerte interne (admin team) — destinataire codé en dur depuis env.
 */
export async function sendAdminAlert(
  adminEmail: string | undefined,
  subject: string,
  body: string,
): Promise<boolean> {
  if (!adminEmail) return false;
  return sendMail({
    to: adminEmail,
    subject: `[DevRefs Alert] ${subject}`,
    textBody: body,
  });
}
