import { describe, it, expect } from 'vitest';
import {
  isPublished,
  byNewest,
  published,
  langOfId,
  slugOfId,
  notesIn,
  localesForSlug,
  formatNoteDate
} from '../src/lib/notes.js';

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

describe('langOfId and slugOfId', () => {
  it('reads the language from the filename suffix', () => {
    expect(langOfId('why-benches-rot')).toBe('en');
    expect(langOfId('why-benches-rot.ru')).toBe('ru');
    expect(langOfId('why-benches-rot.be')).toBe('be');
  });

  it('treats an unknown suffix as part of the slug, not as a language', () => {
    expect(langOfId('notes.xx')).toBe('en');
    expect(slugOfId('notes.xx')).toBe('notes.xx');
  });

  it('strips the language back off the slug, so a translation keeps its counterpart’s URL', () => {
    expect(slugOfId('why-benches-rot')).toBe('why-benches-rot');
    expect(slugOfId('why-benches-rot.ru')).toBe('why-benches-rot');
    expect(slugOfId('why-benches-rot.be')).toBe('why-benches-rot');
  });
});

describe('notesIn', () => {
  it('keeps only the requested language, with drafts still out', () => {
    const entries = [
      { id: 'a', data: { date: new Date('2026-01-01'), draft: false } },
      { id: 'a.ru', data: { date: new Date('2026-01-01'), draft: false } },
      { id: 'b.be', data: { date: new Date('2026-02-01'), draft: false } },
      { id: 'c', data: { date: new Date('2026-03-01'), draft: true } }
    ];
    expect(notesIn(entries, 'en').map((n) => n.id)).toEqual(['a']);
    expect(notesIn(entries, 'ru').map((n) => n.id)).toEqual(['a.ru']);
    expect(notesIn(entries, 'be').map((n) => n.id)).toEqual(['b.be']);
  });
});

describe('localesForSlug', () => {
  // This is what every note page advertises as its hreflang alternates and what the sitemap
  // lists, so a wrong answer here points crawlers at a 404.
  const entries = [
    { id: 'benches', data: { date: new Date('2026-01-01'), draft: false } },
    { id: 'benches.ru', data: { date: new Date('2026-01-01'), draft: false } },
    { id: 'benches.be', data: { date: new Date('2026-01-01'), draft: true } },
    { id: 'solo.be', data: { date: new Date('2026-02-01'), draft: false } }
  ];

  it('lists only the languages the piece was actually written in', () => {
    expect(localesForSlug(entries, 'benches')).toEqual(['en', 'ru']);
  });

  it('does not advertise a translation that is still a draft', () => {
    expect(localesForSlug(entries, 'benches')).not.toContain('be');
  });

  it('is empty for a slug nobody wrote', () => {
    expect(localesForSlug(entries, 'never-written')).toEqual([]);
  });

  it('does not mistake a different slug for a translation', () => {
    expect(localesForSlug(entries, 'solo')).toEqual(['be']);
  });

  it('keeps the site’s language order, not the order files were found in', () => {
    const shuffled = [entries[3], entries[1], entries[0]];
    expect(localesForSlug(shuffled, 'benches')).toEqual(['en', 'ru']);
  });
});

describe('formatNoteDate in another language', () => {
  it('reads as a date in that language, not as an English month', () => {
    expect(formatNoteDate(new Date('2026-10-18T00:00:00Z'), 'ru')).toContain('октября');
    expect(formatNoteDate(new Date('2026-10-18T00:00:00Z'), 'ru')).toContain('2026');
    expect(formatNoteDate(new Date('2026-10-18T00:00:00Z'), 'en')).toBe('18 October 2026');
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
