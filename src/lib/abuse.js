// Guards for the public booking endpoint, kept out of the handler so the rules can be tested.
//
// Three signals, cheapest first. The first two are answered silently — the endpoint says "ok" and
// stores nothing — because a bot that learns which check it failed is a bot that retries with that
// fixed. The third is a real refusal, for a person, and it says so.
export const MIN_FILL_MS = 2000;

// One request awaiting an answer per address. Confirming or declining frees it again, so a
// returning visitor can book another session — only an unanswered request blocks.
// COLLATE NOCASE so a second request in a different case is still caught.
export const ACTIVE_REQUEST_SQL =
  "SELECT id FROM requests WHERE email = ? COLLATE NOCASE AND status = 'new' LIMIT 1";

export function rejectReason({ website, elapsed, active = false } = {}) {
  // A field only a form-filler fills. Whitespace does not count, so an autofill quirk cannot lock
  // a real person out of booking.
  if (String(website ?? '').trim()) return 'honeypot';

  // A person cannot read the page, choose a slot and type a note in two seconds. A missing or
  // unreadable timer is treated as automated: every real submission comes from the script.
  const ms = Number(elapsed);
  if (!Number.isFinite(ms) || ms < MIN_FILL_MS) return 'too_fast';

  if (active) return 'already_pending';

  return null;
}
