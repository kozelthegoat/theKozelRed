// Booking emails via Resend — on-brand HTML + plain-text fallback.
// Best-effort: if RESEND_API_KEY / BOOKING_TO aren't set, sends are skipped
// (the request is still stored).

const BRAND = '#fa3600';
const INK = '#282828';
const MUTED = '#72726f';
const BORDER = '#d9d9d5';
const BG = '#f5f5ed';
const SITE = 'https://kozel.red';
const BOOK = 'https://kozel.red/schedule/';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const wrap = (body) => `<!doctype html>
<html><body style="margin:0;padding:0;background:${BG};">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${INK};">
<p style="margin:0 0 28px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${BRAND};">Aliaksei Kozel</p>
${body}
<hr style="border:none;border-top:1px solid ${BORDER};margin:32px 0 16px;">
<p style="margin:0;font-size:13px;color:${MUTED};">Aliaksei Kozel · <a href="${SITE}" style="color:${MUTED};">kozel.red</a></p>
</div>
</body></html>`;

const cta = (href, label) =>
  `<p style="margin:28px 0;"><a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:12px 20px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;letter-spacing:.06em;text-transform:uppercase;">${esc(label)}</a></p>`;

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

  const when = `${req.date} at ${req.time} (${req.type.name}, ${req.type.minutes} min)`;

  await send(key, {
    from,
    to,
    reply_to: req.email,
    subject: `New 1:1 request — ${req.name} · ${req.date} ${req.time}`,
    text: `New 1:1 request.\n\n${req.name} <${req.email}>\n${when}\n\n${req.note || '(no note)'}\n\nReply to this email to answer them.`,
    html: wrap(`
<p style="margin:0 0 20px;">New 1:1 request.</p>
<p style="margin:0 0 8px;"><strong>${esc(req.name)}</strong> · <a href="mailto:${esc(req.email)}" style="color:${BRAND};">${esc(req.email)}</a></p>
<p style="margin:0;">${esc(when)}</p>
${req.note ? `<p style="margin:20px 0 0;padding:16px;background:#fff;border-left:3px solid ${BRAND};">${esc(req.note)}</p>` : ''}
<p style="margin:24px 0 0;font-size:14px;color:${MUTED};">Reply to this email to answer them.</p>`)
  });

  await send(key, {
    from,
    to: req.email,
    subject: `I've got your 1:1 request — ${req.date} ${req.time}`,
    text: `Thanks, ${req.name} — your request is in.\n\n${when}\n\nI'll reply to confirm. If you'd rather move it, pick another time any time: ${BOOK}\n\n— Aliaksei`,
    html: wrap(`
<p style="margin:0 0 20px;">Thanks, ${esc(req.name)} — your request is in.</p>
<p style="margin:0;">${esc(when)}</p>
<p style="margin:20px 0 0;">I'll reply to confirm. If you'd rather move it, just pick another time.</p>
${cta(BOOK, 'Pick another time')}`)
  });

  return { sent: true };
}

// Decline notice, sent to the requester with the host's reason.
export async function sendDeclineEmail(env, { name, email, when, reason }) {
  const key = env.RESEND_API_KEY;
  const from = env.BOOKING_FROM || 'Aliaksei Kozel <aliaksei@kozel.red>';
  if (!key || !email) return { skipped: true };

  const why = reason || 'Something came up on my side.';

  await send(key, {
    from,
    to: email,
    subject: `About your 1:1 request — ${when}`,
    text: `Hi ${name},\n\nThank you for reaching out — and I'm sorry: I can't make ${when}.\n\n${why}\n\nI'd genuinely like to talk, though. If it still makes sense, pick any other time that works and I'll confirm: ${BOOK}\n\nThanks for understanding,\nAliaksei`,
    html: wrap(`
<p style="margin:0 0 20px;">Hi ${esc(name)},</p>
<p style="margin:0 0 12px;">Thank you for reaching out — and I'm sorry: I can't make <strong>${esc(when)}</strong>.</p>
<p style="margin:0 0 20px;padding:16px;background:#fff;border-left:3px solid ${BRAND};">${esc(why)}</p>
<p style="margin:0;">I'd genuinely like to talk, though. If it still makes sense, pick any other time that works and I'll confirm.</p>
${cta(BOOK, 'Pick another time')}
<p style="margin:24px 0 0;">Thanks for understanding,<br>Aliaksei</p>`)
  });

  return { sent: true };
}
