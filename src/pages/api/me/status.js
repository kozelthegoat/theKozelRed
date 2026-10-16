import { env } from 'cloudflare:workers';
import { jsonError } from '../../../lib/api.js';

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
    return jsonError('bad_request', 'Invalid input.');
  }

  await db.prepare('UPDATE requests SET status = ? WHERE id = ?').bind(status, id).run();
  return new Response(null, { status: 303, headers: { location: '/me' } });
};
