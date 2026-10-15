// Current wall-clock date/time (YYYY-MM-DD / HH:MM) in an IANA timezone.
export function nowInTz(tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value || '00';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

const zoneFormatters = new Map();
const offsetByDay = new Map();

function zoneFormatter(tz) {
  let f = zoneFormatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    zoneFormatters.set(tz, f);
  }
  return f;
}

// Offset (ms) of `tz` at instant `atMs` (east of UTC = positive).
function zoneOffset(atMs, tz) {
  const parts = zoneFormatter(tz).formatToParts(new Date(atMs));
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  const asIfUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return asIfUtc - atMs;
}

// Offset (ms) of `tz` on the given calendar day (sampled at noon UTC), memoized.
function offsetForDay(tz, y, mo, d) {
  const key = `${tz}|${y}-${mo}-${d}`;
  let off = offsetByDay.get(key);
  if (off === undefined) {
    off = zoneOffset(Date.UTC(y, mo - 1, d, 12), tz);
    offsetByDay.set(key, off);
  }
  return off;
}

// The instant (Date) for a wall-clock date/time in an IANA timezone.
export function zonedWallClockToUtc(date, time, tz) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) - offsetForDay(tz, y, mo, d));
}
