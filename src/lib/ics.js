// An .ics for a confirmed 1:1, attached to the confirmation email. Deliberately dependency-free:
// a VCALENDAR is a handful of CRLF lines, and the only real work is the UTC conversion, which
// lib/tz.js already owns (so the invite follows the zone's rules instead of a hardcoded offset).
import { zonedWallClockToUtc } from './tz.js';

const MINSK = 'Europe/Minsk';
const PRODID = '-//kozel.red//1:1//EN';
const DEFAULT_DESCRIPTION = 'With Aliaksei Kozel — booked via https://kozel.red';

export function formatIcsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// A comma, semicolon or backslash inside a text value would end the property early.
const esc = (s) =>
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// RFC 5545 folds a content line past 75 octets, continuing with a single leading space.
const enc = new TextEncoder();
function fold(line) {
  if (enc.encode(line).length <= 75) return line;
  let out = '';
  let current = '';
  let count = 0;
  for (const ch of line) {
    const size = enc.encode(ch).length;
    if (count + size > 74) {
      out += `${current}\r\n `;
      current = '';
      count = 1;
    }
    current += ch;
    count += size;
  }
  return out + current;
}

export function buildIcs({
  date,
  time,
  minutes = 60,
  typeName = '1:1',
  description = DEFAULT_DESCRIPTION,
  uid,
  now = new Date()
}) {
  const start = zonedWallClockToUtc(date, time, MINSK);
  const end = new Date(start.getTime() + minutes * 60000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(now)}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${esc(`1:1 · ${typeName}`)}`,
    `DESCRIPTION:${esc(description)}`,
    'URL:https://kozel.red',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

export function icsFilename({ date, typeName = '' }) {
  const slug = String(typeName || 'session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `1-1-${slug || 'session'}-${date}.ics`;
}
