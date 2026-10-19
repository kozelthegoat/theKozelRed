import { env } from 'cloudflare:workers';
import { jsonError } from '../../../lib/api.js';
import { sendDeclineEmail, sendConfirmEmail } from '../../../lib/email.js';
import {
  parseSort,
  parsePage,
  parsePast,
  listHref,
  shouldSendDecline,
  shouldSendConfirm
} from '../../../lib/requests.js';
import { findSessionType } from '../../../data/sessions.js';

export const prerender = false;

const STATUSES = new Set(['new', 'confirmed', 'declined']);

// POST /api/me/status — set a request's status (Access-protected in production).
export const POST = async ({ request }) => {
  const db = env?.DB;
  if (!db) return jsonError('unavailable', 'No database.', 503);

  let form;
  try {
    form = await request.formData();
  } catch {
    return jsonError('bad_request', 'Invalid form body.');
  }

  const id = Number(form.get('id'));
  const status = String(form.get('status') || '');
  if (!Number.isInteger(id) || !STATUSES.has(status)) {
    return jsonError('bad_request', 'No valid input.');
  }

  // Read the row first: each notice depends on the status it is leaving, not the one it gets.
  const { results } = await db
    .prepare(
      'SELECT type, slot_date, slot_time, name, email, status, visitor_tz, locale FROM requests WHERE id = ?'
    )
    .bind(id)
    .all();
  const row = results?.[0];
  if (!row) return jsonError('not_found', 'No such request.', 404);

  await db.prepare('UPDATE requests SET status = ? WHERE id = ?').bind(status, id).run();

  const type = findSessionType(row.type) || { name: row.type, minutes: 60 };
  // The language the request was made in, so both notices answer in it — old rows default to English.
  const when = {
    date: row.slot_date,
    time: row.slot_time,
    visitorTz: row.visitor_tz,
    typeName: type.name,
    locale: row.locale || 'en'
  };

  if (shouldSendDecline(row.status, status)) {
    await sendDeclineEmail(env, { name: row.name, email: row.email, ...when }).catch(() => {});
  }

  if (shouldSendConfirm(row.status, status)) {
    await sendConfirmEmail(env, {
      id,
      name: row.name,
      email: row.email,
      date: row.slot_date,
      time: row.slot_time,
      visitorTz: row.visitor_tz,
      locale: row.locale || 'en',
      type
    }).catch(() => {});
  }

  // Send the browser back to the view it came from (validated, so a crafted form can't
  // redirect anywhere but /me) — including whether past rows were being shown.
  const { sort, dir } = parseSort(form);
  const page = parsePage(form);
  const past = parsePast(form);

  return new Response(null, {
    status: 303,
    headers: { location: listHref({ sort, dir, page, past }) }
  });
};
