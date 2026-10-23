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
