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
