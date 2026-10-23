import { availability, findSessionType } from '../../data/sessions.js';
import { computeSlots, minBookable } from '../../lib/slots.js';
import { json, jsonError } from '../../lib/api.js';
import { sendBookingEmails } from '../../lib/email.js';
import { isValidZone } from '../../lib/tz.js';
import { rejectReason, ACTIVE_REQUEST_SQL } from '../../lib/abuse.js';
import { locales } from '../../i18n/config.mjs';
import { env } from 'cloudflare:workers';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/requests — create a 1:1 request (no payment).
export const POST = async ({ request, locals }) => {
  const db = env?.DB;
  if (!db) return jsonError('unavailable', 'Please come back later — booking is not available right now.', 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('bad_request', 'Invalid request body.');
  }

  // The two silent checks run before anything is validated or written, so a bot cannot tell a
  // rejection from a success — and neither check costs a query.
  const early = rejectReason({ website: body.website, elapsed: body.elapsed });
  if (early) {
    console.warn(`[requests] dropped automated submission (${early})`);
    return json({ ok: true });
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
  // The language the visitor was reading, kept on the row: the confirmed and declined emails are
  // sent later, from /me, so it has to survive rather than be known only at submit time. Only
  // languages the site actually speaks are kept; anything else sends in English.
  const postedLocale = String(body.locale || '');
  const locale = locales.includes(postedLocale) ? postedLocale : 'en';

  if (name.length < 2 || name.length > 120) return jsonError('invalid_name', 'Please add your name.');
  if (!EMAIL_RE.test(email)) return jsonError('invalid_email', 'Please add a valid email.');

  // One unanswered request per address. Confirming or declining frees it again, so this never
  // blocks a returning visitor — it stops a flood and an accidental double-submit alike.
  const live = await db.prepare(ACTIVE_REQUEST_SQL).bind(email).first();
  const duplicate = rejectReason({
    website: body.website,
    elapsed: body.elapsed,
    active: Boolean(live)
  });
  if (duplicate === 'already_pending') {
    return jsonError(
      'already_pending',
      'You already have a request waiting — I will answer that one first.',
      409
    );
  }
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
    return jsonError('slot_unavailable', 'Please pick another time — that one is no longer available.', 409);
  }

  let id;
  try {
    const info = await db
      .prepare(
        'INSERT INTO requests (type, slot_date, slot_time, name, email, note, visitor_tz, locale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(type.id, date, time, name, email, note || null, visitorTz, locale)
      .run();
    id = info?.meta?.last_row_id;
  } catch (e) {
    if (/unique/i.test(String(e && e.message))) {
      return jsonError('slot_taken', 'Please pick another time — that one was just taken.', 409);
    }
    throw e;
  }

  // The host notification is a record, so it carries the id and the moment the request arrived.
  await sendBookingEmails(env, {
    id,
    requestedAt: Date.now(),
    type,
    date,
    time,
    name,
    email,
    note,
    visitorTz,
    locale
  }).catch((error) => console.error('[requests] the email step failed:', error));

  return json({ ok: true });
};
