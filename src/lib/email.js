// Booking emails via Resend — on-brand HTML (weekday accent, dark-mode aware) + plain-text fallback.
// Best-effort: if RESEND_API_KEY / BOOKING_TO aren't set, sends are skipped
// (the request is still stored).
//
// One thread per request: every email to the requester carries the same subject, so the
// confirmation, the confirmation-of-confirmation and the decline stack in one conversation,
// and a status change is read in the body rather than guessed from the subject line.

import { brandFor } from '../data/palette.js';
import { wallClockInTz, zonedWallClockToUtc, isValidZone, zoneOffsetLabel } from './tz.js';
import { buildIcs, icsFilename } from './ics.js';

const INK = '#282828';
const DARK = '#16150f';
const MUTED = '#72726f';
const DARK_MUTED = '#9a9992';
const BG = '#f5f5ed';
const SITE = 'https://kozel.red';
const BOOK = 'https://kozel.red/schedule/';
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,monospace";

const HOST = 'Aliaksei Kozel';
const MINSK = 'Europe/Minsk';

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

// Times are labelled by offset, never by city: someone in Paris and someone in Berlin keep the
// same clock, and neither should be told they booked in the other's town. The offset is taken
// at the booked instant, so it follows the zone's rules rather than a fixed number.

// The booked moment in the requester's own clock, falling back to the site's when we never
// learned their zone (or it came back junk).
function localMoment({ date, time, visitorTz }) {
  const instant = zonedWallClockToUtc(date, time, MINSK).getTime();
  if (!visitorTz || visitorTz === MINSK || !isValidZone(visitorTz)) {
    return { date, time, zone: zoneOffsetLabel(MINSK, instant) };
  }
  const local = wallClockInTz(instant, visitorTz);
  return { date: local.date, time: local.time, zone: zoneOffsetLabel(visitorTz, instant) };
}

// The booked time in the requester's own clock, with the anchor we run on kept alongside —
// the zone is a browser guess, so never state their time without the one it was booked in.
export function dualTime({ date, time, visitorTz, tz = MINSK }) {
  const instant = zonedWallClockToUtc(date, time, tz).getTime();
  const anchor = `${date} ${time} (${zoneOffsetLabel(tz, instant)})`;
  if (!visitorTz || visitorTz === tz || !isValidZone(visitorTz)) return anchor;
  const local = wallClockInTz(instant, visitorTz);
  return `${local.date} ${local.time} (${zoneOffsetLabel(visitorTz, instant)}) — ${anchor}`;
}

// Each side's subject names the other party, then the session, the date and the time.
export function hostSubject({ name, date, time, typeName }) {
  const instant = zonedWallClockToUtc(date, time, MINSK).getTime();
  return `1:1 · ${name} · ${typeName} · ${date} · ${time} ${zoneOffsetLabel(MINSK, instant)}`;
}

export function requesterSubject({ date, time, visitorTz, typeName }) {
  const m = localMoment({ date, time, visitorTz });
  return `1:1 · ${HOST} · ${typeName} · ${m.date} · ${m.time} ${m.zone}`;
}

// The three facts worth reading twice — session, date, time — carry the weight in the body.
const momentHtml = ({ typeName, m }) =>
  `<p style="margin:0;"><strong>${esc(typeName)}</strong> · <strong>${esc(m.date)}</strong> · <strong>${esc(m.time)} ${esc(m.zone)}</strong></p>`;

const signoff = `<p style="margin:8px 0 0;">I appreciate your trust.<br>${HOST}</p>`;

const send = (key, payload) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }).then((r) => r.ok);

// Resend wants base64, and btoa() chokes on anything past Latin-1 — Armenian names, em dashes.
const toBase64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

// Host notification + requester confirmation, sent when a request is made.
export async function sendBookingEmails(env, req) {
  const key = env.RESEND_API_KEY;
  const to = env.BOOKING_TO;
  const from = env.BOOKING_FROM || `${HOST} <aliaksei@kozel.red>`;
  if (!key || !to) return { skipped: true };

  const brand = brandFor();
  const m = localMoment({ date: req.date, time: req.time, visitorTz: req.visitorTz });
  const theirs = dualTime({ date: req.date, time: req.time, visitorTz: req.visitorTz });
  const typeName = req.type.name;
  const hostZone = zoneOffsetLabel(MINSK, zonedWallClockToUtc(req.date, req.time, MINSK).getTime());

  await send(key, {
    from,
    to,
    reply_to: req.email,
    subject: hostSubject({ name: req.name, date: req.date, time: req.time, typeName }),
    text: `New 1:1 request.\n\n${req.name} <${req.email}>\n${req.date} at ${req.time} ${hostZone} (${typeName}, ${req.type.minutes} min)\n\n${req.note || '(no note)'}\n\nReply to this email to answer them.`,
    html: wrap(
      `
<p style="margin:0 0 20px;">New 1:1 request.</p>
<p style="margin:0 0 8px;"><strong>${esc(req.name)}</strong> · <a href="mailto:${esc(req.email)}" style="color:${brand};">${esc(req.email)}</a></p>
<p style="margin:0;"><strong>${esc(typeName)}</strong> · <strong>${esc(req.date)}</strong> · <strong>${esc(req.time)} ${esc(hostZone)}</strong></p>
${req.visitorTz ? `<p class="muted" style="margin:6px 0 0;font-size:14px;color:${MUTED};">Their clock: ${esc(theirs)}</p>` : ''}
${req.note ? `<p style="margin:20px 0 0;padding:16px;background:#fff;border-left:3px solid ${brand};">${esc(req.note)}</p>` : ''}
<p class="muted" style="margin:24px 0 0;font-size:14px;color:${MUTED};">Reply to this email to answer them.</p>`,
      brand
    )
  });

  // The visitor's zone is a browser guess, so their clock is never stated alone — but when the
  // two clocks match, a second line saying so is noise.
  const anchorLine =
    m.zone === hostZone ? '' : `\n\nIn my time zone: ${req.date} ${req.time} (${hostZone})`;
  const anchorHtml =
    m.zone === hostZone
      ? ''
      : `<p class="muted" style="margin:6px 0 0;font-size:14px;color:${MUTED};">In my time zone: ${esc(req.date)} ${esc(req.time)} (${esc(hostZone)})</p>`;

  await send(key, {
    from,
    to: req.email,
    subject: requesterSubject({ date: req.date, time: req.time, visitorTz: req.visitorTz, typeName }),
    text: `Thanks, ${req.name} — your request is in.\n\n${typeName} · ${m.date} · ${m.time} ${m.zone} (${req.type.minutes} min)${anchorLine}\n\nI'll reply to confirm.\n\nI appreciate your trust,\n${HOST}`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Thanks, ${esc(req.name)} — your request is in.</p>
${momentHtml({ typeName, m })}
${anchorHtml}
<p style="margin:20px 0 0;">I'll reply to confirm.</p>
${signoff}`,
      brand
    )
  });

  return { sent: true };
}

// Copy for the decline notice. Same subject as the request, so it lands in the existing
// thread; the change of state is stated in the body. No apology, no promised reply, no
// claimed reason: it names the declined time, thanks them, and leaves another time as
// theirs to take — true whether the reason was the calendar or a no.
export function declineCopy({ name, date, time, visitorTz, typeName = '', brand = brandFor() }) {
  const m = localMoment({ date, time, visitorTz });
  const whenDisplay = dualTime({ date, time, visitorTz });
  return {
    subject: requesterSubject({ date, time, visitorTz, typeName }),
    text: `Hi ${name},\n\nThank you for reaching out — I'm grateful for the opportunity.\n\nAn update on your request: I'm not able to take the time you picked — ${whenDisplay}.\n\nIf you'd still like to talk, you're welcome to choose another time whenever it suits you.\n\n${BOOK}\n\nI appreciate your trust,\n${HOST}`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Hi ${esc(name)},</p>
<p style="margin:0 0 20px;">Thank you for reaching out — I'm grateful for the opportunity.</p>
<p style="margin:0 0 12px;">An update on your request: I'm not able to take the time you picked.</p>
${momentHtml({ typeName, m })}
<p style="margin:20px 0 0;">If you'd still like to talk, you're welcome to choose another time whenever it suits you.</p>
${cta(BOOK, 'Choose another time', brand)}
${signoff}`,
      brand
    )
  };
}

// Confirmation copy: same subject again, status stated plainly, calendar file alongside.
export function confirmedCopy({ name, date, time, visitorTz, typeName = '', minutes = 60, brand = brandFor() }) {
  const m = localMoment({ date, time, visitorTz });
  const whenDisplay = dualTime({ date, time, visitorTz });
  return {
    subject: requesterSubject({ date, time, visitorTz, typeName }),
    text: `Hi ${name},\n\nYour 1:1 is confirmed.\n\n${whenDisplay} (${typeName}, ${minutes} min)\n\nI've attached a calendar file so it's in your diary.\n\nI appreciate your trust,\n${HOST}`,
    html: wrap(
      `
<p style="margin:0 0 20px;">Hi ${esc(name)},</p>
<p style="margin:0 0 20px;">Your 1:1 is confirmed.</p>
${momentHtml({ typeName, m })}
<p style="margin:20px 0 0;">I've attached a calendar file so it's in your diary.</p>
${signoff}`,
      brand
    )
  };
}

// Decline notice, sent to the requester.
export async function sendDeclineEmail(env, { name, email, date, time, visitorTz, typeName }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || `${HOST} <aliaksei@kozel.red>`;
  if (!key || !email) return { skipped: true };

  const { subject, text, html } = declineCopy({ name, date, time, visitorTz, typeName });

  await send(key, { from, to: email, subject, text, html });

  return { sent: true };
}

// Confirmation notice with the calendar invite. Sent on the transition into confirmed.
export async function sendConfirmEmail(env, { id, name, email, date, time, visitorTz, type }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || `${HOST} <aliaksei@kozel.red>`;
  if (!key || !email) return { skipped: true };

  const typeName = type?.name || '';
  const minutes = type?.minutes || 60;
  const { subject, text, html } = confirmedCopy({ name, date, time, visitorTz, typeName, minutes });
  const ics = buildIcs({ date, time, minutes, typeName, uid: `request-${id}@kozel.red` });

  await send(key, {
    from,
    to: email,
    subject,
    text,
    html,
    attachments: [{ filename: icsFilename({ date, typeName }), content: toBase64(ics) }]
  });

  return { sent: true };
}
