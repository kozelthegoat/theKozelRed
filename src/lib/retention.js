// How long a booking request is kept after the session it was for. One number, in one place.
// Changing it changes the privacy page's sentence, so the two are edited together.
export const RETENTION_DAYS = 90;

// The backup window quoted on /privacy/. D1 time travel is 30 days on Workers Paid and 7 on Free;
// stating the upper bound means a plan change cannot silently make the page false.
export const BACKUP_DAYS = 30;

// `today` is a wall-clock date in the site's zone (YYYY-MM-DD), not a UTC instant: the schedule
// already thinks in Minsk, and `slot_date` is stored that way, so the cutoff is compared like for like.
export function cutoffDate(today, days = RETENTION_DAYS) {
  const [year, month, day] = String(today).split('-').map(Number);
  const at = new Date(Date.UTC(year, month - 1, day));
  at.setUTCDate(at.getUTCDate() - days);
  return at.toISOString().slice(0, 10);
}

// The session date decides expiry, not when the request arrived: a booking made six months early
// must not be deleted before it happens.
export const PURGE_SQL = 'DELETE FROM requests WHERE slot_date < ?';

export async function purgeExpired(db, today) {
  const cutoff = cutoffDate(today);
  const info = await db.prepare(PURGE_SQL).bind(cutoff).run();
  return Number(info?.meta?.changes ?? 0);
}

// A missed cron should be visible, not silently repaired. The scheduled run writes this marker;
// `/me` reads it and warns when it is too old. That is the alert: a stale fact on the page the
// owner actually looks at, with no second enforcement path to hide the failure.
export const MARKER_KEY = 'last_retention_run';
export const STALE_AFTER_HOURS = 26;

export const MARKER_READ_SQL = 'SELECT value FROM meta WHERE key = ?';
export const MARKER_WRITE_SQL =
  'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value';

export async function lastRetentionRun(db) {
  const row = await db.prepare(MARKER_READ_SQL).bind(MARKER_KEY).first();
  return row?.value ?? null;
}

export async function recordRetentionRun(db, at) {
  await db.prepare(MARKER_WRITE_SQL).bind(MARKER_KEY, at).run();
}

export function isStale(lastRun, now = Date.now(), hours = STALE_AFTER_HOURS) {
  if (!lastRun) return true;
  const at = Date.parse(lastRun);
  if (!Number.isFinite(at)) return true;
  return now - at > hours * 60 * 60 * 1000;
}
