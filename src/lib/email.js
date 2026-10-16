// Booking emails via Resend — on-brand HTML (weekday accent, dark-mode aware) + plain-text fallback.
// Best-effort: if RESEND_API_KEY / BOOKING_TO aren't set, sends are skipped
// (the request is still stored).

import { brandFor } from '../data/palette.js';

const INK = '#282828';
const DARK = '#16150f';
const MUTED = '#72726f';
const DARK_MUTED = '#9a9992';
const BG = '#f5f5ed';
const SITE = 'https://kozel.red';
const BOOK = 'https://kozel.red/schedule/';
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,monospace";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const wrap = (body, brand) => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  @media (prefers-color-scheme: dark) {
    .bg { background-color:${DARK} !important; }
    .body { color:#f0efe8 !important; }
    .muted, .muted a { color:${DARK_MUTED} !important; }
    .cta { background-color:${brand} !important; color:#ffffff !important; }
  }
</style>
</head>
<body class="bg" style="margin:0;padding:0;background-color:${BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background-color:${BG};">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
<tr><td style="height:6px;background-color:${brand};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:28px 24px 0;">
<div style="width:11px;height:11px;margin:0 auto;background-color:${brand};-webkit-transform:rotate(45deg);transform:rotate(45deg);font-size:0;line-height:0;">&nbsp;</div>
<div style="padding-top:16px;font-family:${MONO};font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${brand};">Aliaksei Kozel</div>
</td></tr>
<tr><td class="body" style="padding:20px 24px 44px;font-family:${SANS};font-size:16px;line-height:1.6;color:${INK};">${body}</td></tr>
<tr><td style="height:6px;background-color:${brand};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:16px 24px;font-family:${SANS};font-size:12px;"><a class="muted" href="${SITE}" style="color:${MUTED};">kozel.red</a></td></tr>
</table>
</td></tr>
</table>
</body></html>`;

const cta = (href, label, brand) =>
  `<p style="margin:28px 0;"><a class="cta" href="${href}" style="display:inline-block;background-color:${brand};color:#ffffff;text-decoration:none;padding:12px 20px;font-family:${MONO};font-size:13px;letter-spacing:.06em;text-transform:uppercase;">${esc(label)}</a></p>`;

const send = (key, payload) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }).then((r) => r.ok);

// Host notification + requester confirmation, sent when a request is made.
export async function sendBookingEmails(env, req) {
  const key = env.RESEND_API_KEY;
  const to = env.BOOKING_TO;
  const from = env.BOOKING_FROM || 'Aliaksei Kozel <aliaksei@kozel.red>';
  if (!key || !to) return { skipped: true };

  const brand = brandFor();
  const when = `${req.date} at ${req.time} (${req.type.name}, ${req.type.minutes} min)`;

  await send(key, {
    from,
    to,
    reply_to: req.email,
    subject: `New 1:1 request — ${req.name} · ${req.date} ${req.time}`,
    text: `New 1:1 request.\n\n${req.name} <${req.email}>\n${when}\n\n${req.note || '(no note)'}\n\nReply to this email to answer them.`,
    html: wrap(
      `
<p style="margin:0 0 20px;">New 1:1 request.</p>
<p style="margin:0 0 8px;"><strong>${esc(req.name)}</strong> · <a href="mailto:${esc(req.email)}" style="color:${brand};">${esc(req.email)}</a></p>
<p style="margin:0;">${esc(when)}</p>
${req.note ? `<p style="margin:20px 0 0;padding:16px;background:#fff;border-left:3px solid ${brand};">${esc(req.note)}</p>` : ''}
<p class="muted" style="margin:24px 0 0;font-size:14px;color:${MUTED};">Reply to this email to answer them.</p>`,
      brand
    )
  });

  await send(key, {
    from,
    to: req.email,
    subject: `I've got your 1:1 request — ${req.date} ${req.time}`,
    text: `Thanks, ${req.name} — your request is in.\n\n${when}\n\nI'll reply to confirm. If you'd rather move it, pick another time any time: ${BOOK}\n\n— Aliaksei Kozel`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Thanks, ${esc(req.name)} — your request is in.</p>
<p style="margin:0;">${esc(when)}</p>
<p style="margin:20px 0 0;">I'll reply to confirm. If you'd rather move it, just pick another time.</p>
${cta(BOOK, 'Pick another time', brand)}
<p class="muted" style="margin:8px 0 0;color:${MUTED};">— Aliaksei Kozel</p>`,
      brand
    )
  });

  return { sent: true };
}

// Decline notice, sent to the requester. No apology — a calendar gap, not a verdict.
export async function sendDeclineEmail(env, { name, email, when }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || 'Aliaksei Kozel <aliaksei@kozel.red>';
  if (!key || !email) return { skipped: true };

  const brand = brandFor();

  await send(key, {
    from,
    to: email,
    subject: `About your 1:1 request — ${when}`,
    text: `Hi ${name},\n\nThank you for reaching out — I'd like to talk.\n\nThat specific slot doesn't work on my side. I'd welcome another time: pick whatever suits you and I'll confirm right away.\n\n${BOOK}\n\nThanks for your time,\nAliaksei Kozel`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Hi ${esc(name)},</p>
<p style="margin:0 0 20px;">Thank you for reaching out — I'd like to talk.</p>
<p style="margin:0;">That specific slot doesn't work on my side. I'd welcome another time: pick whatever suits you and I'll confirm right away.</p>
${cta(BOOK, 'Pick another time', brand)}
<p class="muted" style="margin:8px 0 0;color:${MUTED};">Thanks for your time,<br>Aliaksei Kozel</p>`,
      brand
    )
  });

  return { sent: true };
}
