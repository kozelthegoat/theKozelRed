// Best-effort booking emails via Resend. If RESEND_API_KEY / BOOKING_TO aren't
// configured, sends are skipped (the request is still stored).
export async function sendBookingEmails(env, req) {
  const key = env.RESEND_API_KEY;
  const to = env.BOOKING_TO;
  const from = env.BOOKING_FROM || 'aliaksei@kozel.red';
  if (!key || !to) return { skipped: true };

  const when = `${req.date} at ${req.time} (${req.type.name}, ${req.type.minutes} min)`;
  const send = (payload) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((r) => r.ok);

  await send({
    from,
    to,
    reply_to: req.email,
    subject: `New 1:1 request — ${req.name}`,
    text: `${req.name} <${req.email}> requested a ${req.type.name} (${req.type.minutes} min)\n${when}\n\n${req.note || '(no note)'}`
  });

  await send({
    from,
    to: req.email,
    subject: `Your 1:1 request — ${when}`,
    text: `Thanks, ${req.name}. I've received your request for a ${req.type.name} (${req.type.minutes} min):\n${when}\n\nI'll confirm by reply shortly.\n\n— Aliaksei`
  });

  return { sent: true };
}
