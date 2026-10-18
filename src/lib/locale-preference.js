// What language a visitor would rather read, and what we do with that.
//
// Pure on purpose: the browser's preference list and our supported list go in, a choice comes out,
// and none of it needs a DOM or a request to test.

export const COOKIE_NAME = 'locale';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// "ru-RU" and "ru" are the same language to us; "be-by" is not a language we have, and neither is
// "en-GB" unless we speak it. Region is dropped rather than matched, because someone reading
// ru-RU is served perfectly well by ru.
export function matchTag(tag, supported) {
  const normalised = String(tag || '').trim().toLowerCase();
  if (!normalised) return null;
  if (supported.includes(normalised)) return normalised;
  const base = normalised.split('-')[0];
  return supported.includes(base) ? base : null;
}

// The first language the visitor prefers that we actually speak. Order is the browser's own — for
// navigator.languages that is preference order, and for Accept-Language it is q-weighted order, so
// either way the header's promise is kept rather than re-sorted here.
export function pickLocale(preferred, supported, fallback = 'en') {
  for (const tag of preferred || []) {
    const match = matchTag(tag, supported);
    if (match) return match;
  }
  return fallback;
}

// The choice is remembered, but only as a tie-breaker: the URL always wins for what is displayed,
// and the cookie only decides where a language-neutral `/` should send you next time.
export function readCookie(cookieHeader, name = COOKIE_NAME) {
  const parts = String(cookieHeader || '').split(';');
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}
