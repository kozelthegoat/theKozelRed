import { availability, findSessionType } from '../../data/sessions.js';
import { computeSlots } from '../../lib/slots.js';
import { nowInTz } from '../../lib/tz.js';
import { json, jsonError } from '../../lib/api.js';
import { env } from 'cloudflare:workers';

export const prerender = false;

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

// GET /api/slots?type=<id>&from=<date>&to=<date>
export const GET = async ({ url, locals }) => {
  const type = findSessionType(url.searchParams.get('type') || '');
  if (!type) return jsonError('invalid_type', 'Unknown session type.');

  const now = nowInTz(availability.timezone);
  const from = url.searchParams.get('from') || now.date;
  const to = url.searchParams.get('to') || addDays(from, 60);

  const db = env?.DB;
  let taken = new Set();
  if (db) {
    const { results } = await db
      .prepare(
        "SELECT slot_date, slot_time FROM requests WHERE status != 'declined' AND slot_date >= ? AND slot_date <= ?"
      )
      .bind(from, to)
      .all();
    taken = new Set((results || []).map((r) => `${r.slot_date}T${r.slot_time}`));
  }

  const slots = computeSlots({
    week: availability.week,
    from,
    to,
    nowDate: now.date,
    nowTime: now.time,
    taken
  });

  return json({ slots, timezone: availability.timezone, label: availability.label, type: type.id });
};
