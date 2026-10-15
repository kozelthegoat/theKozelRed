import { describe, it, expect } from 'vitest';
import { computeSlots } from '../src/lib/slots.js';

// Mon = 1, Wed = 3 (0 = Sun … 6 = Sat)
const week = {
  1: ['10:00', '14:00'],
  3: ['09:00']
};

describe('computeSlots', () => {
  it('returns slots only on configured weekdays', () => {
    const slots = computeSlots({
      week,
      from: '2026-10-19',
      to: '2026-10-21',
      nowDate: '2026-10-01',
      nowTime: '00:00',
      taken: new Set()
    });
    expect(slots.map((s) => s.id)).toEqual([
      '2026-10-19T10:00',
      '2026-10-19T14:00',
      '2026-10-21T09:00'
    ]);
  });

  it('excludes slots already in the past today', () => {
    const slots = computeSlots({
      week,
      from: '2026-10-19',
      to: '2026-10-19',
      nowDate: '2026-10-19',
      nowTime: '12:00',
      taken: new Set()
    });
    expect(slots.map((s) => s.time)).toEqual(['14:00']);
  });

  it('excludes taken slots', () => {
    const slots = computeSlots({
      week,
      from: '2026-10-19',
      to: '2026-10-19',
      nowDate: '2026-10-01',
      nowTime: '00:00',
      taken: new Set(['2026-10-19T10:00'])
    });
    expect(slots.map((s) => s.time)).toEqual(['14:00']);
  });

  it('excludes dates before today', () => {
    const slots = computeSlots({
      week,
      from: '2026-10-12',
      to: '2026-10-12',
      nowDate: '2026-10-19',
      nowTime: '00:00',
      taken: new Set()
    });
    expect(slots).toEqual([]);
  });
});
