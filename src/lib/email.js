// Booking emails via Resend — on-brand HTML (weekday accent, dark-mode aware) + plain-text fallback.
// Best-effort: if RESEND_API_KEY / BOOKING_TO aren't set, sends are skipped
// (the request is still stored).

import { brandFor } from '../data/palette.js';
import { wallClockInTz, zonedWallClockToUtc, isValidZone } from './tz.js';

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
<tr><td align="center" style="padding:26px 24px 0;">
<div style="font-family:${SANS};font-size:13px;line-height:1;color:${brand};">&#9670;</div>
</td></tr>
<tr><td class="body" style="padding:24px 24px 44px;font-family:${SANS};font-size:16px;line-height:1.6;color:${INK};">${body}</td></tr>
<tr><td style="height:6px;background-color:${brand};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:16px 24px;font-family:${SANS};font-size:12px;"><a class="muted" href="${SITE}" style="color:${MUTED};text-decoration:none;">kozel.red</a></td></tr>
</table>
</td></tr>
</table>
</body></html>`;

const cta = (href, label, brand) =>
  `<p style="margin:28px 0;"><a class="cta" href="${href}" style="display:inline-block;background-color:${brand};color:#ffffff;text-decoration:none;padding:12px 20px;font-family:${MONO};font-size:13px;letter-spacing:.06em;text-transform:uppercase;">${esc(label)}</a></p>`;

const MINSK = 'Europe/Minsk';

// The booked time in the requester's own clock, with the Minsk anchor kept alongside —
// the zone is a browser guess, so never state their time without the one we run on.
export function dualTime({ date, time, visitorTz, tz = MINSK }) {
  const anchor = `${date} ${time} (${tz})`;
  if (!visitorTz || visitorTz === tz || !isValidZone(visitorTz)) return anchor;
  const local = wallClockInTz(zonedWallClockToUtc(date, time, tz).getTime(), visitorTz);
  return `${local.date} ${local.time} (${visitorTz}) — ${anchor}`;
}

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
  const theirs = dualTime({ date: req.date, time: req.time, visitorTz: req.visitorTz });
  const whenForThem = `${theirs} (${req.type.name}, ${req.type.minutes} min)`;

  await send(key, {
    from,
    to,
    reply_to: req.email,
    subject: `1:1 — New · ${req.name} · ${req.type.name} · ${req.date} ${req.time} Minsk`,
    text: `New 1:1 request.\n\n${req.name} <${req.email}>\n${when}\n\n${req.note || '(no note)'}\n\nReply to this email to answer them.`,
    html: wrap(
      `
<p style="margin:0 0 20px;">New 1:1 request.</p>
<p style="margin:0 0 8px;"><strong>${esc(req.name)}</strong> · <a href="mailto:${esc(req.email)}" style="color:${brand};">${esc(req.email)}</a></p>
<p style="margin:0;">${esc(when)}</p>
${req.visitorTz ? `<p class="muted" style="margin:6px 0 0;font-size:14px;color:${MUTED};">Their clock: ${esc(theirs)}</p>` : ''}
${req.note ? `<p style="margin:20px 0 0;padding:16px;background:#fff;border-left:3px solid ${brand};">${esc(req.note)}</p>` : ''}
<p class="muted" style="margin:24px 0 0;font-size:14px;color:${MUTED};">Reply to this email to answer them.</p>`,
      brand
    )
  });

  await send(key, {
    from,
    to: req.email,
    subject: `1:1 · ${req.type.name} · ${req.date} ${req.time} Minsk`,
    text: `Thanks, ${req.name} — your request is in.\n\n${whenForThem}\n\nI'll reply to confirm.\n\nI appreciate your trust,\nAliaksei Kozel`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Thanks, ${esc(req.name)} — your request is in.</p>
<p style="margin:0;">${esc(whenForThem)}</p>
<p style="margin:20px 0 0;">I'll reply to confirm. If you'd rather move it, just pick another time.</p>
${cta(BOOK, 'Pick another time', brand)}
<p style="margin:8px 0 0;">— Aliaksei Kozel</p>`,
      brand
    )
  });

  return { sent: true };
}

// Copy for the decline notice. No apology, no promised reply, no claimed reason:
// it names the declined time, thanks them for the opportunity, and leaves another
// time as theirs to take — true whether the reason was the calendar or a no.
export function declineCopy({ name, when, whenDisplay = when, typeName = '', brand = brandFor() }) {
  return {
    subject: `1:1 — Declined${typeName ? ` · ${typeName}` : ''} · ${when}`,
    text: `Hi ${name},\n\nThank you for reaching out — I'm grateful for the opportunity.\n\nThe time you picked (${whenDisplay}) is off the table now. Call it a race condition — the calendar won this round.\n\nIf you'd still like to talk, you're welcome to pick another time whenever it suits you.\n\n${BOOK}\n\nI appreciate your trust,\nAliaksei Kozel`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Hi ${esc(name)},</p>
<p style="margin:0 0 20px;">Thank you for reaching out — I'm grateful for the opportunity.</p>
<p style="margin:0;">The time you picked (${esc(whenDisplay)}) is off the table now. Call it a race condition — the calendar won this round.</p>
<p style="margin:20px 0 0;">If you'd still like to talk, you're welcome to pick another time whenever it suits you.</p>
${cta(BOOK, 'Pick another time', brand)}
<p style="margin:8px 0 0;">I appreciate your trust.<br>Aliaksei Kozel</p>`,
      brand
    )
  };
}

// Decline notice, sent to the requester.
export async function sendDeclineEmail(env, { name, email, when, whenDisplay, typeName }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || 'Aliaksei Kozel <aliaksei@kozel.red>';
  if (!key || !email) return { skipped: true };

  const { subject, text, html } = declineCopy({ name, when, whenDisplay, typeName });

  await send(key, { from, to: email, subject, text, html });

  return { sent: true };
}
