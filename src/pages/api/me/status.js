import { env } from 'cloudflare:workers';
import { jsonError } from '../../../lib/api.js';
import { sendDeclineEmail } from '../../../lib/email.js';

export const prerender = false;

const STATUSES = new Set(['new', 'confirmed', 'declined']);
const TYPE_NAMES = { intro: 'Intro Call', career: 'Career Review', work: 'Working Session' };

// POST /api/me/status — set a request's status (Access-protected in production).
// A reason may accompany a decline; it is stored and emailed to the requester.
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
  const status = String(form.get('status') || (form.get('reason') ? 'declined' : ''));
  const reason = String(form.get('reason') || '').trim().slice(0, 1000);
  if (!Number.isInteger(id) || !STATUSES.has(status)) {
    return jsonError('bad_request', 'Invalid input.');
  }

  await db
    .prepare('UPDATE requests SET status = ?, decision_note = ? WHERE id = ?')
    .bind(status, reason || null, id)
    .run();

  if (status === 'declined') {
    const { results } = await db
      .prepare('SELECT type, slot_date, slot_time, name, email FROM requests WHERE id = ?')
      .bind(id)
      .all();
    const row = results?.[0];
    if (row) {
      const when = `${row.slot_date} at ${row.slot_time} (${TYPE_NAMES[row.type] || row.type})`;
      await sendDeclineEmail(env, { name: row.name, email: row.email, when, reason }).catch(() => {});
    }
  }

  return new Response(null, { status: 303, headers: { location: '/me' } });
};
