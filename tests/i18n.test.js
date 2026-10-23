import { describe, it, expect } from 'vitest';
import {
  locales,
  localeInfo,
  labelFor,
  dirFor,
  intlTagFor,
  localeFromPath,
  pathInLocale,
  prefixFor
} from '../src/i18n/config.mjs';
import { ui } from '../src/i18n/ui.mjs';

describe('the dictionary', () => {
  // Every language is a first-class language: a key that exists in one and not another is a
  // sentence that silently disappears when someone switches. This is cheaper than discovering it
  // on a page in Belarusian.
  it('has the same keys in every language', () => {
    const keys = Object.fromEntries(locales.map((locale) => [locale, new Set(Object.keys(ui[locale]))]));
    for (const locale of locales) {
      const missing = [...keys[locales[0]]].filter((key) => !keys[locale].has(key));
      const extra = [...keys[locale]].filter((key) => !keys[locales[0]].has(key));
      expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
    }
  });

  // The retention sentence and the retention rule are one fact. A hardcoded "90" in three
  // translations is three places to forget; these placeholders are filled from src/lib/retention.js.
  it('leaves the retention numbers for the code to fill', () => {
    for (const locale of locales) {
      const body = ui[locale]['privacy.retention.body'];
      expect({ locale, days: body.includes('{days}'), backup: body.includes('{backup}') }).toEqual({
        locale,
        days: true,
        backup: true
      });
    }
  });
});

describe('locale data', () => {
  it('gives every locale a name, a direction and a date tag, so nothing downstream special-cases one', () => {
    for (const locale of locales) {
      expect(localeInfo[locale].label).toBeTruthy();
      expect(['ltr', 'rtl']).toContain(localeInfo[locale].dir);
      expect(localeInfo[locale].intl).toBeTruthy();
    }
  });

  it('falls back rather than throwing on a language it does not know', () => {
    expect(dirFor('xx')).toBe('ltr');
    expect(intlTagFor('xx')).toBe('en-GB');
    expect(labelFor('xx')).toBe('xx');
  });

  it('writes English dates in the site order, not the American one', () => {
    // Plain 'en' would give October 18, 2026; the site writes 18 October 2026.
    expect(intlTagFor('en')).toBe('en-GB');
  });
});

describe('localeFromPath', () => {
  it('reads the prefix, and treats anything unknown as English rather than as a 404', () => {
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('/notes/')).toBe('en');
    expect(localeFromPath('/ru/')).toBe('ru');
    expect(localeFromPath('/ru/notes/why/')).toBe('ru');
    expect(localeFromPath('/be/notes/')).toBe('be');
    expect(localeFromPath('/xx/notes/')).toBe('en');
    expect(localeFromPath()).toBe('en');
  });
});

describe('pathInLocale', () => {
  it('moves a page between languages, keeping everything after the prefix', () => {
    expect(pathInLocale('/notes/', 'ru')).toBe('/ru/notes/');
    expect(pathInLocale('/ru/notes/', 'be')).toBe('/be/notes/');
    expect(pathInLocale('/ru/notes/why-benches-rot/', 'en')).toBe('/notes/why-benches-rot/');
  });

  it('collapses the root rather than doubling the slash', () => {
    expect(pathInLocale('/', 'ru')).toBe('/ru/');
    expect(pathInLocale('/ru/', 'en')).toBe('/');
  });
});

describe('prefixFor', () => {
  it('keeps the default language at the root, so its URLs never changed', () => {
    expect(prefixFor('en')).toBe('');
    expect(prefixFor('ru')).toBe('/ru');
  });
});
