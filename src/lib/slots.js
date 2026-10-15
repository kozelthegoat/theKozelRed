const pad = (n) => String(n).padStart(2, '0');

// Every calendar date from `from` to `to` (inclusive), as YYYY-MM-DD strings.
function eachDate(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const cur = new Date(Date.UTC(fy, fm - 1, fd));
  const end = new Date(Date.UTC(ty, tm - 1, td));
  const out = [];
  while (cur <= end) {
    out.push(`${cur.getUTCFullYear()}-${pad(cur.getUTCMonth() + 1)}-${pad(cur.getUTCDate())}`);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

// Pure. Open slots between `from` and `to`, given a weekly `week` map
// (0 = Sun … 6 = Sat → list of "HH:MM" start times), excluding slots already
// in the past (`nowDate`/`nowTime`, in the schedule's own timezone) and any in
// `taken` (a Set of slot ids, "YYYY-MM-DDTHH:MM").
export function computeSlots({ week, from, to, nowDate, nowTime, taken }) {
  const slots = [];
  for (const date of eachDate(from, to)) {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    for (const time of week[weekday] || []) {
      const id = `${date}T${time}`;
      if (date < nowDate) continue;
      if (date === nowDate && time <= nowTime) continue;
      if (taken.has(id)) continue;
      slots.push({ id, date, time });
    }
  }
  return slots;
}
