import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales } from '../src/i18n/config.mjs';
import { pages, urlFor, pageKeyForPath, alternatesForPath } from '../src/i18n/pages.mjs';
import { matchTag, pickLocale, readCookie } from '../src/lib/locale-preference.js';

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

describe('matchTag', () => {
  it('drops the region, because ru-RU is served perfectly well by ru', () => {
    expect(matchTag('ru-RU', ['en', 'ru'])).toBe('ru');
    expect(matchTag('ru', ['en', 'ru'])).toBe('ru');
    expect(matchTag('BE-BY', ['en', 'be'])).toBe('be');
  });

  it('returns nothing for a language we do not speak', () => {
    expect(matchTag('de', ['en', 'ru', 'be'])).toBeNull();
    expect(matchTag('', ['en'])).toBeNull();
    expect(matchTag(undefined, ['en'])).toBeNull();
  });
});

describe('pickLocale', () => {
  it('takes the first language the visitor prefers that we actually have', () => {
    expect(pickLocale(['de-DE', 'ru-RU', 'en'], ['en', 'ru', 'be'])).toBe('ru');
    expect(pickLocale(['en-GB', 'ru'], ['en', 'ru'])).toBe('en');
  });

  it('falls back when we speak none of them', () => {
    expect(pickLocale(['de', 'fr'], ['en', 'ru'], 'en')).toBe('en');
    expect(pickLocale([], ['en', 'ru'], 'ru')).toBe('ru');
    expect(pickLocale(undefined, ['en', 'ru'])).toBe('en');
  });
});

describe('readCookie', () => {
  it('finds one cookie among several and decodes it', () => {
    expect(readCookie('a=1; locale=ru; b=2')).toBe('ru');
    expect(readCookie('locale=be')).toBe('be');
    expect(readCookie('locales=ru')).toBeNull();
    expect(readCookie('')).toBeNull();
    expect(readCookie(undefined)).toBeNull();
  });
});
