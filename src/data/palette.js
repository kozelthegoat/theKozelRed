// The weekday accent hues (Mon → Sun), shared by the site's head script and the emails.
export const WEEKDAY_HUES = [
  '#dc2626',
  '#fa3600',
  '#d97706',
  '#16a34a',
  '#2563eb',
  '#4f46e5',
  '#7c3aed'
];

const ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// The accent colour for a given moment, evaluated in the schedule's timezone.
export function brandFor(date = new Date(), timeZone = 'Europe/Minsk') {
  const abbr = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);
  const i = ORDER.indexOf(abbr);
  return WEEKDAY_HUES[i < 0 ? 1 : i];
}
