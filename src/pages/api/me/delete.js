import { env } from 'cloudflare:workers';
import { jsonError } from '../../../lib/api.js';
import { parseSort, parsePage, parsePast, listHref } from '../../../lib/requests.js';

export const prerender = false;

// POST /api/me/delete — remove a request for good (Access-protected in production).
// No soft delete: the promise on the privacy page is that the data is gone.
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
  if (!Number.isInteger(id)) return jsonError('bad_request', 'No valid input.');

  const info = await db.prepare('DELETE FROM requests WHERE id = ?').bind(id).run();

  // The id is the only thing logged. The point of deleting is that the payload stops existing,
  // including in a log line.
  console.warn(`[me] deleted request ${id} (${info?.meta?.changes ?? 0} row)`);

  const { sort, dir } = parseSort(form);
  const page = parsePage(form);
  const past = parsePast(form);

  return new Response(null, {
    status: 303,
    headers: { location: listHref({ sort, dir, page, past }) }
  });
};
