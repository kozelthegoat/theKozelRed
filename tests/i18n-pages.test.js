import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales } from '../src/i18n/config.mjs';
import { pages, urlFor, pageKeyForPath, alternatesForPath } from '../src/i18n/pages.mjs';
import { ui } from '../src/i18n/ui.mjs';

const root = new URL('../', import.meta.url);

describe('urlFor', () => {
  it('keeps the default language at the root', () => {
    expect(urlFor('home', 'en')).toBe('/');
    expect(urlFor('notes', 'en')).toBe('/notes/');
    expect(urlFor('privacy', 'en')).toBe('/privacy/');
  });

  it('prefixes every other language', () => {
    expect(urlFor('notes', 'ru')).toBe('/ru/notes/');
    expect(urlFor('notes', 'be')).toBe('/be/notes/');
  });

  it('falls back rather than emitting undefined for a page it does not know', () => {
    expect(urlFor('nonsense', 'ru')).toBe('/ru/');
  });
});

describe('pageKeyForPath', () => {
  it('matches a page exactly', () => {
    expect(pageKeyForPath('/')).toBe('home');
    expect(pageKeyForPath('/notes/')).toBe('notes');
    expect(pageKeyForPath('/ru/notes/')).toBe('notes');
  });

  it('does not match a note to the index around it', () => {
    // A note and the list around it can exist in different languages, so a prefix match here
    // would hand a note the index's languages and offer translations that were never written.
    expect(pageKeyForPath('/notes/why-benches-rot/')).toBeNull();
    expect(pageKeyForPath('/ru/notes/why-benches-rot/')).toBeNull();
    expect(pageKeyForPath('/nonsense/')).toBeNull();
  });
});

describe('alternatesForPath', () => {
  it('reports the languages a page exists in, and nothing for an unknown path', () => {
    expect(alternatesForPath('/notes/')).toEqual(['en', 'ru', 'be']);
    expect(alternatesForPath('/schedule/')).toEqual(['en', 'ru', 'be']);
    expect(alternatesForPath('/ru/notes/')).toEqual(['en', 'ru', 'be']);
    expect(alternatesForPath('/notes/why-benches-rot/')).toBeNull();
  });
});

describe('the registry against the routes on disk', () => {
  // The registry declares which languages each page exists in. If it drifts from the files, a
  // switcher or an hreflang tag starts pointing at a 404 — so this checks it in both directions.
  // A page can be a directory (notes/index.astro) or a flat file (schedule.astro), so both
  // layouts are accepted rather than the test assuming one.
  const routeFiles = (key, locale) => {
    const url = urlFor(key, locale);
    const flat = url.replace(/\/$/, '');
    return [
      new URL(join('src/pages', url, 'index.astro'), root),
      new URL(join('src/pages', `${flat}.astro`), root)
    ].map(fileURLToPath);
  };
  const hasRoute = (key, locale) => routeFiles(key, locale).some((file) => existsSync(file));
  const checkable = Object.keys(pages).filter((key) => key !== 'notFound');

  it('has a route file for every language it claims', () => {
    for (const key of checkable) {
      for (const locale of pages[key].locales) {
        expect(hasRoute(key, locale), `${key} / ${locale}`).toBe(true);
      }
    }
  });

  it('does not claim a language it has no route for', () => {
    for (const key of checkable) {
      for (const locale of locales.filter((l) => !pages[key].locales.includes(l))) {
        expect(hasRoute(key, locale), `${key} / ${locale}`).toBe(false);
      }
    }
  });
});

describe('the registry against the dictionary', () => {
  // Base names a page from `page.<key>`, resolved out of the path. A missing key does not throw —
  // it silently falls back to English, which is exactly how /ru/privacy/ served a translated body
  // under an English <title> for as long as the route wrappers held their own copy.
  //
  // Notes are excluded because the notes index and each note name themselves: a note's title is the
  // note's, and the index sets `Aliaksei Kozel — Notes` from notes.title.
  const named = Object.keys(pages).filter((key) => key !== 'notFound' && key !== 'notes');

  it('gives every page a title and a description in every language it exists in', () => {
    for (const key of named) {
      for (const locale of pages[key].locales) {
        expect(ui[locale][`page.${key}`], `page.${key} / ${locale}`).toBeTruthy();
        expect(ui[locale][`page.${key}.description`], `page.${key}.description / ${locale}`).toBeTruthy();
      }
    }
  });
});
