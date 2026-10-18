import { describe, it, expect } from 'vitest';
import { buildIcs, icsFilename, formatIcsUtc } from '../src/lib/ics.js';

const base = {
  date: '2026-10-17',
  time: '16:00',
  minutes: 60,
  typeName: 'Working Session',
  uid: 'request-42@kozel.red',
  now: new Date('2026-10-16T09:00:00Z')
};

describe('formatIcsUtc', () => {
  it('writes an instant as a floating-free UTC stamp', () => {
    expect(formatIcsUtc(new Date('2026-10-17T13:00:00Z'))).toBe('20261017T130000Z');
  });
});

describe('buildIcs', () => {
  it('is a well-formed calendar with one event', () => {
    const ics = buildIcs(base);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('converts the Minsk wall clock to UTC for the start, and adds the duration', () => {
    // Minsk is UTC+3 with no DST, so 16:00 there is 13:00 UTC
    const ics = buildIcs(base);
    expect(ics).toContain('DTSTART:20261017T130000Z');
    expect(ics).toContain('DTEND:20261017T140000Z');
  });

  it('honours a non-hour duration', () => {
    const ics = buildIcs({ ...base, minutes: 30 });
    expect(ics).toContain('DTEND:20261017T133000Z');
    const ics45 = buildIcs({ ...base, minutes: 45 });
    expect(ics45).toContain('DTEND:20261017T134500Z');
  });

  it('stamps the creation time and carries the uid', () => {
    const ics = buildIcs(base);
    expect(ics).toContain('DTSTAMP:20261016T090000Z');
    expect(ics).toContain('UID:request-42@kozel.red');
  });

  it('names the session in the summary', () => {
    expect(buildIcs(base)).toContain('SUMMARY:1:1 · Working Session');
  });

  it('carries the meeting link so the entry can be joined from the calendar', () => {
    const ics = buildIcs({ ...base, meetingUrl: 'https://zoom.us/j/12345' });
    expect(ics).toContain('LOCATION:https://zoom.us/j/12345');
    expect(ics).toContain('URL:https://zoom.us/j/12345');
  });

  it('does not claim a location when there is no meeting link', () => {
    const ics = buildIcs(base);
    expect(ics).not.toContain('LOCATION');
    expect(ics).toContain('URL:https://kozel.red');
  });

  it('uses CRLF line endings throughout', () => {
    const ics = buildIcs(base);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it('escapes the text fields so a comma cannot end a property early', () => {
    const ics = buildIcs({ ...base, typeName: 'Working Session, long' });
    expect(ics).toContain('SUMMARY:1:1 · Working Session\\, long');
    expect(ics).not.toContain('SUMMARY:1:1 · Working Session, long');
  });

  it('folds a line longer than 75 octets, continuing with a space', () => {
    const ics = buildIcs({ ...base, description: 'x'.repeat(200) });
    expect(ics).toContain('\r\n ');
    const bytes = new TextEncoder();
    for (const line of ics.split('\r\n')) {
      expect(bytes.encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe('icsFilename', () => {
  it('reads as a file a person can recognise', () => {
    expect(icsFilename({ date: '2026-10-17', typeName: 'Working Session' })).toBe(
      '1-1-working-session-2026-10-17.ics'
    );
  });

  it('falls back when the type is unknown', () => {
    expect(icsFilename({ date: '2026-10-17', typeName: '' })).toBe('1-1-session-2026-10-17.ics');
  });
});
