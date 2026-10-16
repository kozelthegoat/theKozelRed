import { env } from 'cloudflare:workers';
import { jsonError } from '../../../lib/api.js';
import { parseSort, parsePage, listHref } from '../../../lib/requests.js';
import { applyStatus } from '../../../lib/status.js';

export const prerender = false;

const STATUSES = new Set(['new', 'confirmed', 'declined']);

// POST /api/me/status — set a request's status (Access-protected in production).
// The same change is applied by /action, which the notification email links to.
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

  const row = await applyStatus(db, env, id, status);
  if (!row) return jsonError('not_found', 'No such request.', 404);

  // Send the browser back to the view it came from (validated, so a crafted form can't
  // redirect anywhere but /me).
  const { sort, dir } = parseSort(form);
  const page = parsePage(form);

  return new Response(null, {
    status: 303,
    headers: { location: listHref({ sort, dir, page }) }
  });
};
