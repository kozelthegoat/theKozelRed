import { describe, it, expect } from 'vitest';
import { isPublished, byNewest, published, formatNoteDate } from '../src/lib/notes.js';

const note = (date, draft = false) => ({ id: date, data: { date: new Date(date), draft } });

describe('isPublished', () => {
  it('keeps drafts out of the site', () => {
    expect(isPublished(note('2026-01-01'))).toBe(true);
    expect(isPublished(note('2026-01-01', true))).toBe(false);
  });
});

describe('published', () => {
  it('drops drafts and orders what is left, newest first', () => {
    const entries = [note('2021-03-04'), note('2026-10-18', true), note('2024-07-01')];
    expect(published(entries).map((n) => n.id)).toEqual(['2024-07-01', '2021-03-04']);
  });

  it('is empty when everything is a draft, which is what hides the navigation link', () => {
    expect(published([note('2026-01-01', true)])).toEqual([]);
  });
});

describe('byNewest', () => {
  it('orders newest first, so a backdated thought lands where it belongs', () => {
    const sorted = [note('2021-03-04'), note('2026-10-18'), note('2024-07-01')].sort(byNewest);
    expect(sorted.map((n) => n.id)).toEqual(['2026-10-18', '2024-07-01', '2021-03-04']);
  });

  it('leaves same-day notes in the order they were given', () => {
    const same = [note('2026-01-01'), note('2026-01-01')];
    same[0].id = 'first';
    same[1].id = 'second';
    expect([...same].sort(byNewest).map((n) => n.id)).toEqual(['first', 'second']);
  });
});

describe('formatNoteDate', () => {
  it('reads as a date a person would write', () => {
    expect(formatNoteDate(new Date('2026-10-18T00:00:00Z'))).toBe('18 October 2026');
  });

  it('does not slip a day depending on where it is rendered', () => {
    // A bare YYYY-MM-DD parses as UTC midnight; formatted in a zone behind UTC that becomes the
    // day before, which is why the formatter pins itself to UTC.
    expect(formatNoteDate(new Date('2026-01-01T00:00:00Z'))).toBe('1 January 2026');
  });
});
