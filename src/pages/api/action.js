import { env } from 'cloudflare:workers';
import { jsonError } from '../../lib/api.js';
import { verifyAction } from '../../lib/action.js';
import { applyStatus } from '../../lib/status.js';

export const prerender = false;

// POST /api/action — applies a decision that came from the notification email.
//
// Public by design (the signed token is the authority, so there is an Access login to skip)
// but POST-only: mail scanners fetch links, they do not submit forms.
export const POST = async ({ request }) => {
  const db = env?.DB;
  const key = env?.RESEND_API_KEY;
  if (!db || !key) return jsonError('unavailable', 'Actions are not available.', 503);

  let form;
  try {
    form = await request.formData();
  } catch {
    return jsonError('bad_request', 'Invalid form body.');
  }

  const token = String(form.get('t') || '');
  const action = await verifyAction(token, key);
  if (!action) return jsonError('expired', 'That link is no longer valid.', 410);

  const row = await applyStatus(db, env, action.id, action.status);
  if (!row) return jsonError('not_found', 'No such request.', 404);

  return new Response(null, {
    status: 303,
    headers: { location: `/action?t=${encodeURIComponent(token)}&done=1` }
  });
};
