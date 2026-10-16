import { availability, findSessionType } from '../../data/sessions.js';
import { computeSlots, minBookable } from '../../lib/slots.js';
import { json, jsonError } from '../../lib/api.js';
import { sendBookingEmails } from '../../lib/email.js';
import { isValidZone } from '../../lib/tz.js';
import { env } from 'cloudflare:workers';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/requests — create a 1:1 request (no payment).
export const POST = async ({ request, locals }) => {
  const db = env?.DB;
  if (!db) return jsonError('unavailable', 'Booking is not available right now.', 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('bad_request', 'Invalid request body.');
  }

  const type = findSessionType(String(body.type || ''));
  if (!type) return jsonError('invalid_type', 'Unknown session type.');

  const date = String(body.date || '');
  const time = String(body.time || '');
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const note = String(body.note || '').trim().slice(0, 1000);
  // The visitor's zone is a guess from the browser; keep it only if Intl accepts it, so
  // the emails can quote their clock. Absent → the emails stay Minsk-only.
  const postedTz = String(body.tz || '');
  const visitorTz = isValidZone(postedTz) ? postedTz : null;

  if (name.length < 2 || name.length > 120) return jsonError('invalid_name', 'Please add your name.');
  if (!EMAIL_RE.test(email)) return jsonError('invalid_email', 'Please add a valid email.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return jsonError('invalid_slot', 'Pick a time.');
  }

  // The slot must be one we offer, with enough notice.
  const min = minBookable(availability);
  const offered = computeSlots({
    week: availability.week,
    from: date,
    to: date,
    nowDate: min.date,
    nowTime: min.time,
    taken: new Set()
  });
  if (!offered.some((s) => s.id === `${date}T${time}`)) {
    return jsonError('slot_unavailable', 'That time is no longer available.', 409);
  }

  let insertedId = null;
  try {
    const result = await db
      .prepare(
        'INSERT INTO requests (type, slot_date, slot_time, name, email, note, visitor_tz) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(type.id, date, time, name, email, note || null, visitorTz)
      .run();
    insertedId = result?.meta?.last_row_id ?? null;
  } catch (e) {
    if (/unique/i.test(String(e && e.message))) {
      return jsonError('slot_taken', 'That time was just taken.', 409);
    }
    throw e;
  }

  await sendBookingEmails(env, { id: insertedId, type, date, time, name, email, note, visitorTz }).catch(
    () => {}
  );

  return json({ ok: true });
};
