import { describe, it, expect } from 'vitest';
import { pageUrls, sitemapXml } from '../src/lib/sitemap.js';

const ORIGIN = 'https://kozel.red';
const note = (slug, locale, date = '2026-10-01') => ({
  slug,
  locale,
  date: new Date(date)
});

const locs = (notes) => pageUrls({ origin: ORIGIN, notes }).map((entry) => entry.loc);

describe('pageUrls', () => {
  it('lists every language of every public page', () => {
    const urls = locs([]);
    expect(urls).toContain('https://kozel.red/');
    expect(urls).toContain('https://kozel.red/ru/');
    expect(urls).toContain('https://kozel.red/be/schedule/');
    expect(urls).toContain('https://kozel.red/privacy/');
  });

  it('leaves out the 404 and anything that only exists for the owner', () => {
    const urls = locs([note('anything', 'en')]);
    expect(urls.some((url) => url.includes('404'))).toBe(false);
    expect(urls.some((url) => url.includes('/me'))).toBe(false);
    expect(urls.some((url) => url.includes('/api/'))).toBe(false);
  });

  it('holds a language’s notes index back until that language has a note', () => {
    expect(locs([])).not.toContain('https://kozel.red/notes/');

    const englishOnly = locs([note('why-benches-rot', 'en')]);
    expect(englishOnly).toContain('https://kozel.red/notes/');
    expect(englishOnly).not.toContain('https://kozel.red/ru/notes/');
    expect(englishOnly).not.toContain('https://kozel.red/be/notes/');
  });

  it('lists a note only in the languages it was written in', () => {
    const urls = locs([note('why-benches-rot', 'en'), note('why-benches-rot', 'ru')]);
    expect(urls).toContain('https://kozel.red/notes/why-benches-rot/');
    expect(urls).toContain('https://kozel.red/ru/notes/why-benches-rot/');
    expect(urls).not.toContain('https://kozel.red/be/notes/why-benches-rot/');
  });

  it('dates a note and leaves the standing pages undated', () => {
    const entries = pageUrls({ origin: ORIGIN, notes: [note('why-benches-rot', 'en', '2024-07-01')] });
    const dated = entries.find((entry) => entry.loc.endsWith('why-benches-rot/'));
    const home = entries.find((entry) => entry.loc === 'https://kozel.red/');
    expect(dated.lastmod).toBe('2024-07-01');
    expect(home.lastmod).toBeUndefined();
  });

  it('never lists the same URL twice', () => {
    const urls = locs([note('why-benches-rot', 'en'), note('why-benches-rot', 'en')]);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('sitemapXml', () => {
  it('is a sitemap document a crawler will accept', () => {
    const xml = sitemapXml([{ loc: 'https://kozel.red/' }]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://kozel.red/</loc>');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('leaves lastmod out when there is nothing honest to put there', () => {
    const xml = sitemapXml([{ loc: 'https://kozel.red/', lastmod: undefined }]);
    expect(xml).not.toContain('<lastmod>');
  });

  it('escapes what XML will not take raw', () => {
    const xml = sitemapXml([{ loc: 'https://kozel.red/notes/a&b/' }]);
    expect(xml).toContain('<loc>https://kozel.red/notes/a&amp;b/</loc>');
  });
});
