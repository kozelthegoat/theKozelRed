import { describe, it, expect } from 'vitest';
import { augustDay, ordinal } from '../src/lib/august.js';

describe('augustDay', () => {
  it('counts the first of August as the first', () => {
    expect(augustDay(new Date(2026, 7, 1))).toBe(1);
    expect(augustDay('2026-08-01')).toBe(1);
  });

  it('counts on through the month', () => {
    expect(augustDay(new Date(2026, 7, 2))).toBe(2);
    expect(augustDay(new Date(2026, 7, 31))).toBe(31);
  });

  it('keeps counting into the autumn — the 84th is 23 October 2026', () => {
    expect(augustDay(new Date(2026, 8, 1))).toBe(32);
    expect(augustDay(new Date(2026, 9, 23))).toBe(84);
  });

  it('carries across the new year from the previous August', () => {
    expect(augustDay(new Date(2027, 0, 1))).toBe(154);
    expect(augustDay(new Date(2027, 6, 31))).toBe(365);
  });
});

describe('ordinal', () => {
  it('writes the English endings', () => {
    expect(ordinal(1)).toBe('st');
    expect(ordinal(2)).toBe('nd');
    expect(ordinal(3)).toBe('rd');
    expect(ordinal(4)).toBe('th');
    expect(ordinal(11)).toBe('th');
    expect(ordinal(12)).toBe('th');
    expect(ordinal(13)).toBe('th');
    expect(ordinal(21)).toBe('st');
    expect(ordinal(22)).toBe('nd');
    expect(ordinal(23)).toBe('rd');
    expect(ordinal(84)).toBe('th');
  });
});
