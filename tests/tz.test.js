import { describe, it, expect } from 'vitest';
import { nowInTz, wallClockInTz, instantFromSqliteUtc, zoneOffsetLabel } from '../src/lib/tz.js';

describe('wallClockInTz', () => {
  it('renders an instant as wall-clock in the zone', () => {
    // 01:00 UTC is 04:00 in Minsk (UTC+3, no DST since 2011)
    const at = Date.parse('2026-09-01T01:00:00Z');
    expect(wallClockInTz(at, 'Europe/Minsk')).toEqual({ date: '2026-09-01', time: '04:00' });
  });

  it('rolls the date across midnight', () => {
    const at = Date.parse('2026-09-01T23:30:00Z');
    expect(wallClockInTz(at, 'Europe/Minsk')).toEqual({ date: '2026-09-02', time: '02:30' });
    expect(wallClockInTz(at, 'UTC')).toEqual({ date: '2026-09-01', time: '23:30' });
  });

  it('nowInTz delegates to it', () => {
    const at = new Date('2026-09-01T01:00:00Z');
    expect(nowInTz('Europe/Minsk', at)).toEqual(wallClockInTz(at.getTime(), 'Europe/Minsk'));
  });
});

describe('instantFromSqliteUtc', () => {
  it('reads the space-separated UTC form SQLite writes', () => {
    expect(instantFromSqliteUtc('2026-09-01 01:00:00')).toBe(Date.parse('2026-09-01T01:00:00Z'));
  });
});

describe('zoneOffsetLabel', () => {
  it('labels Minsk as UTC+3', () => {
    expect(zoneOffsetLabel('Europe/Minsk', Date.parse('2026-09-01T12:00:00Z'))).toBe('UTC+3');
  });

  it('is derived from the rules, not hardcoded: pre-2011 Minsk winters were +2', () => {
    expect(zoneOffsetLabel('Europe/Minsk', Date.parse('2005-01-15T12:00:00Z'))).toBe('UTC+2');
    expect(zoneOffsetLabel('Europe/Minsk', Date.parse('2005-07-15T12:00:00Z'))).toBe('UTC+3');
  });

  it('handles UTC and half-hour offsets', () => {
    expect(zoneOffsetLabel('UTC', Date.parse('2026-09-01T12:00:00Z'))).toBe('UTC+0');
    expect(zoneOffsetLabel('Asia/Kolkata', Date.parse('2026-09-01T12:00:00Z'))).toBe('UTC+5:30');
  });
});
