// Links handed out in the host's notification email, so a request can be answered without
// opening /me.
//
// The token carries its own authority: an HMAC over what it does and when it stops working.
// That is why /action can sit outside Cloudflare Access — there is no login to complete, and
// no cookie is involved, so there is nothing for a cross-site request to ride on.

const enc = new TextEncoder();
const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const ACTIONABLE = new Set(['confirmed', 'declined']);
export const ACTION_TTL_DAYS = 30;

async function hmac(key, message) {
  const k = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return b64url(await crypto.subtle.sign('HMAC', k, enc.encode(message)));
}

export async function signAction({ id, status, exp }, key) {
  const payload = `${id}.${status}.${exp}`;
  return `${payload}.${await hmac(key, payload)}`;
}

export async function verifyAction(token, key, now = Date.now()) {
  const [id, status, exp, sig] = String(token || '').split('.');
  if (!id || !status || !exp || !sig) return null;

  const expected = await hmac(key, `${id}.${status}.${exp}`);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  if (!Number.isInteger(Number(id)) || !ACTIONABLE.has(status)) return null;
  if (!(Number(exp) > now)) return null;
  return { id: Number(id), status };
}

// Built together so the signer and the verifier cannot drift on the expiry format.
export function actionExpiry(now = Date.now()) {
  return now + ACTION_TTL_DAYS * 24 * 60 * 60 * 1000;
}
