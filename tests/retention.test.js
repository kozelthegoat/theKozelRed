import { describe, it, expect } from 'vitest';
import {
  RETENTION_DAYS,
  STALE_AFTER_HOURS,
  cutoffDate,
  purgeExpired,
  isStale,
  lastRetentionRun,
  recordRetentionRun,
  PURGE_SQL
} from '../src/lib/retention.js';

describe('cutoffDate', () => {
  it('counts back the retention window in whole days', () => {
    expect(RETENTION_DAYS).toBe(90);
    expect(cutoffDate('2026-10-23')).toBe('2026-07-25');
  });

  it('crosses a month boundary', () => {
    expect(cutoffDate('2026-03-01', 1)).toBe('2026-02-28');
  });

  it('crosses a year boundary', () => {
    expect(cutoffDate('2026-01-01', 1)).toBe('2025-12-31');
  });

  it('knows February in a leap year', () => {
    expect(cutoffDate('2024-03-01', 1)).toBe('2024-02-29');
  });
});

describe('PURGE_SQL', () => {
  it('compares the session date, not when the request arrived', () => {
    // A request for a session in the future must never be expired, however old the request is.
    expect(PURGE_SQL).toMatch(/slot_date </);
    expect(PURGE_SQL).not.toMatch(/created_at/);
  });
});

describe('purgeExpired', () => {
  const fakeDb = (changes) => {
    const calls = [];
    return {
      calls,
      prepare(sql) {
        return {
          bind(arg) {
            return {
              async run() {
                calls.push({ sql, arg });
                return { meta: { changes } };
              }
            };
          }
        };
      }
    };
  };

  it('deletes everything older than the cutoff and reports how many went', async () => {
    const db = fakeDb(3);
    await expect(purgeExpired(db, '2026-10-23')).resolves.toBe(3);
    expect(db.calls).toEqual([{ sql: PURGE_SQL, arg: '2026-07-25' }]);
  });

  it('is a no-op that still reports zero when nothing has expired', async () => {
    await expect(purgeExpired(fakeDb(0), '2026-10-23')).resolves.toBe(0);
  });

  it('reads zero when D1 omits the change count', async () => {
    const db = {
      prepare: () => ({ bind: () => ({ run: async () => ({}) }) })
    };
    await expect(purgeExpired(db, '2026-10-23')).resolves.toBe(0);
  });
});

describe('isStale', () => {
  const now = Date.parse('2026-10-23T12:00:00Z');

  it('is true when nothing has ever run', () => {
    expect(isStale(null, now)).toBe(true);
  });

  it('is true when the marker is unreadable', () => {
    expect(isStale('yesterday', now)).toBe(true);
  });

  it('treats a run inside the window as healthy', () => {
    expect(isStale('2026-10-23T06:17:00Z', now)).toBe(false);
    expect(isStale('2026-10-22T10:00:01Z', now)).toBe(false);
  });

  it('treats a run older than the window as a missed cron', () => {
    expect(isStale('2026-10-22T09:00:00Z', now)).toBe(true);
    expect(STALE_AFTER_HOURS).toBe(26);
  });
});

describe('the heartbeat', () => {
  it('reads the marker, and null when it is missing', async () => {
    const withRow = { prepare: () => ({ bind: () => ({ first: async () => ({ value: '2026-10-23T06:17:00Z' }) }) }) };
    const empty = { prepare: () => ({ bind: () => ({ first: async () => null }) }) };
    await expect(lastRetentionRun(withRow)).resolves.toBe('2026-10-23T06:17:00Z');
    await expect(lastRetentionRun(empty)).resolves.toBeNull();
  });

  it('writes the marker as an upsert, so the table keeps one row per key', async () => {
    const calls = [];
    const db = {
      prepare(sql) {
        return {
          bind(...args) {
            return { run: async () => calls.push({ sql, args }) };
          }
        };
      }
    };
    await recordRetentionRun(db, '2026-10-23T06:17:00Z');
    expect(calls).toHaveLength(1);
    expect(calls[0].args).toEqual(['last_retention_run', '2026-10-23T06:17:00Z']);
    expect(calls[0].sql).toMatch(/ON CONFLICT/i);
  });
});
