import { env } from 'cloudflare:workers';
import { jsonError } from '../../../lib/api.js';
import { sendDeclineEmail } from '../../../lib/email.js';
import { parseSort, parsePage, listHref, shouldSendDecline } from '../../../lib/requests.js';
import { dualTime } from '../../../lib/email.js';

export const prerender = false;

const STATUSES = new Set(['new', 'confirmed', 'declined']);
const TYPE_NAMES = { intro: 'Intro Call', career: 'Career Review', work: 'Working Session' };

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
    return jsonError('bad_request', 'Invalid input.');
  }

  // Read the row first: the notice depends on the status it is leaving, not the one it gets.
  const { results } = await db
    .prepare(
      'SELECT type, slot_date, slot_time, name, email, status, visitor_tz FROM requests WHERE id = ?'
    )
    .bind(id)
    .all();
  const row = results?.[0];
  if (!row) return jsonError('not_found', 'No such request.', 404);

  await db.prepare('UPDATE requests SET status = ? WHERE id = ?').bind(status, id).run();

  if (shouldSendDecline(row.status, status)) {
    const typeName = TYPE_NAMES[row.type] || row.type;
    const when = `${row.slot_date} ${row.slot_time} Minsk`;
    // The subject stays Minsk; the body can also quote the clock they booked in.
    const whenDisplay = dualTime({
      date: row.slot_date,
      time: row.slot_time,
      visitorTz: row.visitor_tz
    });
    await sendDeclineEmail(env, { name: row.name, email: row.email, when, whenDisplay, typeName }).catch(
      () => {}
    );
  }

  // Send the browser back to the view it came from (validated, so a crafted form can't
  // redirect anywhere but /me).
  const { sort, dir } = parseSort(form);
  const page = parsePage(form);

  return new Response(null, {
    status: 303,
    headers: { location: listHref({ sort, dir, page }) }
  });
};
