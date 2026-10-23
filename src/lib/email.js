// Booking emails via Resend — on-brand HTML (weekday accent, dark-mode aware) + plain-text fallback.
// Best-effort: if RESEND_API_KEY / BOOKING_TO aren't set, sends are skipped
// (the request is still stored).
//
// One thread per request: every email to the requester carries the same subject, so the
// confirmation, the confirmation-of-confirmation and the decline stack in one conversation,
// and a status change is read in the body rather than guessed from the subject line.

import { brandFor } from '../data/palette.js';
import { site, nameFor } from '../data/site.js';
import { wallClockInTz, zonedWallClockToUtc, isValidZone, zoneOffsetLabel } from './tz.js';
import { buildIcs, icsFilename } from './ics.js';
import { mailFor } from '../i18n/mail.mjs';
import { fill } from '../i18n/ui.mjs';

const INK = '#282828';
const DARK = '#16150f';
const MUTED = '#72726f';
const DARK_MUTED = '#9a9992';
const BG = '#ffffff';
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

// A greeting wants the given name and the form asks for one field, so the first word is the
// best guess available. The full name stays intact wherever it identifies the person.
const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || '';

// A moment as a person reads it: "2026-10-20 · 15:00 UTC+2".
const momentLine = ({ date, time, zone }) => `${date} · ${time} ${zone}`;

// Each side's subject names the other party, then the session, the date and the time.
export function hostSubject({ name, date, time, typeName }) {
  const instant = zonedWallClockToUtc(date, time, MINSK).getTime();
  return `1:1 · ${name} · ${typeName} · ${date} · ${time} ${zoneOffsetLabel(MINSK, instant)}`;
}

export function requesterSubject({ date, time, visitorTz, typeName, host = HOST }) {
  const m = localMoment({ date, time, visitorTz });
  return `1:1 · ${host} · ${typeName} · ${m.date} · ${m.time} ${m.zone}`;
}

// The three facts worth reading twice — session, date, time — carry the weight in the body.
const momentHtml = ({ typeName, m }) =>
  `<p style="margin:0;"><strong>${esc(typeName)}</strong> · <strong>${esc(m.date)}</strong> · <strong>${esc(m.time)} ${esc(m.zone)}</strong></p>`;

// The close, in the visitor's language and under the spelling of the name their language uses.
const signoff = (copy, host) => `<p style="margin:8px 0 0;">${esc(copy.signoff)}<br>${esc(host)}</p>`;

// Best-effort, but never silent. A failed send leaves the request in /me, and the reason belongs
// in the Workers log (`observability` already collects it). Resend explains a rejected key or an
// unverified domain in the response body rather than the status code, so the body goes in too.
const send = async (key, payload) => {
  const subject = payload?.subject ?? 'email';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return true;
    const detail = await res.text().catch(() => '');
    console.error(`[email] Resend refused "${subject}" (${res.status}): ${String(detail).slice(0, 300)}`);
    return false;
  } catch (error) {
    console.error(`[email] Resend unreachable for "${subject}":`, error);
    return false;
  }
};

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
  const typeName = req.type.name;
  const hostZone = zoneOffsetLabel(MINSK, zonedWallClockToUtc(req.date, req.time, MINSK).getTime());
  const myClock = momentLine({ date: req.date, time: req.time, zone: hostZone });
  const theirClock = momentLine(m);
  // wallClockInTz returns a date and a time but no zone, so the offset is added here.
  const requestedWall = wallClockInTz(Number(req.requestedAt ?? Date.now()), MINSK);
  const requestedLine = `${requestedWall.date} · ${requestedWall.time} ${hostZone}`;
  const sameClock = theirClock === myClock;

  // Everything the request holds, laid out as label → value, so it can be read at a glance
  // instead of picked out of a sentence. When their clock is the same as mine, one line says
  // it rather than two that agree.
  const rows = [
    ['Name', req.name],
    ['Email', req.email],
    ['Session', `${typeName} · ${req.type.minutes} min`],
    ...(sameClock ? [['When', myClock]] : [['Their clock', theirClock], ['My clock', myClock]]),
    ['Requested', requestedLine]
  ];
  const pad = Math.max(...rows.map(([k]) => k.length));
  const tableText = rows.map(([k, v]) => `${k.padEnd(pad)}  ${v}`).join('\n');
  const tableHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td class="muted" style="padding:5px 20px 5px 0;color:${MUTED};font-family:${MONO};font-size:12px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:5px 0;vertical-align:top;white-space:nowrap;">${esc(v)}</td></tr>`
    )
    .join('');

  const hostSent = await send(key, {
    from,
    to,
    reply_to: req.email,
    subject: hostSubject({ name: req.name, date: req.date, time: req.time, typeName }),
    text: `New 1:1 request.\n\n${tableText}\n\nMessage\n${req.note || '(no note)'}`,
    html: wrap(
      `
<p style="margin:0 0 22px;">New 1:1 request.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;line-height:1.5;">${tableHtml}</table>
${
  req.note
    ? `<p style="margin:24px 0 6px;color:${INK};font-family:${MONO};font-size:12px;letter-spacing:.06em;text-transform:uppercase;">Message</p>
<p style="margin:0;padding:16px;background:#fff;color:${INK};border-left:3px solid ${brand};">${esc(req.note)}</p>`
    : ''
}`,
      brand
    )
  });

  // The requester's email, in the language they were reading, signed under the spelling of the name
  // their language uses. The notification above stays English: that one is the host's working copy.
  const copy = mailFor(req.locale);
  const host = nameFor(req.locale);
  const greet = fill(copy.greet, { name: firstName(req.name) });

  const requesterSent = await send(key, {
    from: env.BOOKING_FROM || `${host} <aliaksei@kozel.red>`,
    to: req.email,
    subject: requesterSubject({ date: req.date, time: req.time, visitorTz: req.visitorTz, typeName, host }),
    text: `${greet}\n\n${copy.thanks}\n\n${typeName} · ${theirClock} ${fill(copy.minutes, { n: req.type.minutes })}\n\n${copy.willSee}\n\n${copy.signoff}\n${host}`,
    html: wrap(
      `
<p style="margin:0 0 20px;">${esc(greet)}</p>
<p style="margin:0 0 20px;">${esc(copy.thanks)}</p>
${momentHtml({ typeName, m })}
<p style="margin:20px 0 0;">${esc(copy.willSee)}</p>
${signoff(copy, host)}`,
      brand
    )
  });

  return { sent: hostSent && requesterSent };
}

// Copy for the decline notice. Same subject as the request, so it lands in the existing
// thread; the change of state is stated in the body. No apology, no promised reply, no
// claimed reason: it names the declined time, thanks them, and leaves another time as
// theirs to take — true whether the reason was the calendar or a no.
export function declineCopy({ name, date, time, visitorTz, typeName = '', locale = 'en', brand = brandFor() }) {
  const m = localMoment({ date, time, visitorTz });
  const copy = mailFor(locale);
  const host = nameFor(locale);
  const greet = fill(copy.greet, { name: firstName(name) });
  return {
    subject: requesterSubject({ date, time, visitorTz, typeName, host }),
    text: `${greet}\n\n${copy.grateful}\n\n${copy.declined}\n\n${typeName} · ${momentLine(m)}\n\n${copy.stillWelcome}\n\n${BOOK}\n\n${copy.signoff}\n${host}`,
    html: wrap(
      `
<p style="margin:0 0 20px;">${esc(greet)}</p>
<p style="margin:0 0 20px;">${esc(copy.grateful)}</p>
<p style="margin:0 0 12px;">${esc(copy.declined)}</p>
${momentHtml({ typeName, m })}
<p style="margin:20px 0 0;">${esc(copy.stillWelcome)}</p>
${cta(BOOK, copy.sendLabel, brand)}
${signoff(copy, host)}`,
      brand
    )
  };
}

// Confirmation copy: same subject again, the confirmation stated in the first person, calendar
// file alongside.
export function confirmedCopy({ name, date, time, visitorTz, typeName = '', minutes = 60, meetingUrl = '', locale = 'en', brand = brandFor() }) {
  const m = localMoment({ date, time, visitorTz });
  const copy = mailFor(locale);
  const host = nameFor(locale);
  const greet = fill(copy.greet, { name: firstName(name) });
  return {
    subject: requesterSubject({ date, time, visitorTz, typeName, host }),
    text: `${greet}\n\n${copy.thanks}\n\n${copy.confirm}\n\n${typeName} · ${momentLine(m)} ${fill(copy.minutes, { n: minutes })}\n\n${copy.attached}${meetingUrl ? `\n\n${fill(copy.join, { url: meetingUrl })}` : ''}\n\n${copy.signoff}\n${host}`,
    html: wrap(
      `
<p style="margin:0 0 20px;">${esc(greet)}</p>
<p style="margin:0 0 20px;">${esc(copy.thanks)}</p>
<p style="margin:0 0 20px;">${esc(copy.confirm)}</p>
${momentHtml({ typeName, m })}
<p style="margin:20px 0 0;">${esc(copy.attached)}</p>
${meetingUrl ? cta(meetingUrl, copy.joinLabel, brand) : ''}
${signoff(copy, host)}`,
      brand
    )
  };
}

// Decline notice, sent to the requester.
export async function sendDeclineEmail(env, { name, email, date, time, visitorTz, typeName, locale }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || `${HOST} <aliaksei@kozel.red>`;
  if (!key || !email) return { skipped: true };

  const { subject, text, html } = declineCopy({ name, date, time, visitorTz, typeName, locale });

  const sent = await send(key, { from, to: email, subject, text, html });

  return { sent };
}

// Confirmation notice with the calendar invite. Sent on the transition into confirmed.
export async function sendConfirmEmail(env, { id, name, email, date, time, visitorTz, type, locale }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || `${HOST} <aliaksei@kozel.red>`;
  if (!key || !email) return { skipped: true };

  const typeName = type?.name || '';
  const minutes = type?.minutes || 60;
  const meetingUrl = site.meetingUrl || '';
  const { subject, text, html } = confirmedCopy({ name, date, time, visitorTz, typeName, minutes, meetingUrl, locale });
  const ics = buildIcs({ date, time, minutes, typeName, meetingUrl, uid: `request-${id}@kozel.red` });

  const sent = await send(key, {
    from,
    to: email,
    subject,
    text,
    html,
    attachments: [{ filename: icsFilename({ date, typeName }), content: toBase64(ics) }]
  });

  return { sent };
}
