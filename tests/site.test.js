import { describe, it, expect } from 'vitest';
import { locales } from '../src/i18n/config.mjs';
import {
  site,
  locationFor,
  availabilityFor,
  languagesFor,
  offClockFor
} from '../src/data/site.js';

describe('localized site facts', () => {
  it('gives every locale a location', () => {
    for (const locale of locales) expect(locationFor(locale)).toBeTruthy();
  });

  it('keeps the same number of bullets in every language', () => {
    for (const locale of locales) {
      expect(availabilityFor(locale)).toHaveLength(site.availability.length);
      expect(languagesFor(locale)).toHaveLength(site.languages.length);
      expect(offClockFor(locale)).toHaveLength(site.offClock.length);
    }
  });

  it('actually translates the facts instead of falling back to English', () => {
    for (const locale of ['ru', 'be']) {
      expect(locationFor(locale)).not.toBe(site.location);
      expect(availabilityFor(locale)).not.toEqual(site.availability);
      expect(languagesFor(locale)).not.toEqual(site.languages);
      expect(offClockFor(locale)).not.toEqual(site.offClock);
    }
  });

  it('uses the English values for English', () => {
    expect(locationFor('en')).toBe(site.location);
    expect(availabilityFor('en')).toBe(site.availability);
    expect(languagesFor('en')).toBe(site.languages);
    expect(offClockFor('en')).toBe(site.offClock);
  });
});
