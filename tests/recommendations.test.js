import { describe, it, expect } from 'vitest';
import { slideState } from '../src/lib/recommendations.js';

// A section 1000px of scroll long, 12 quotes: each quote owns 1/12 of it.
const at = (fraction, count = 12) =>
  slideState({ scrollY: fraction * 1000, top: 0, stickLength: 1000, count });

describe('slideState', () => {
  it('shows the first quote before the section is even reached', () => {
    expect(slideState({ scrollY: 0, top: 500, stickLength: 1000, count: 12 })).toEqual({
      index: 0,
      progress: 0
    });
    expect(slideState({ scrollY: -200, top: 0, stickLength: 1000, count: 12 })).toEqual({
      index: 0,
      progress: 0
    });
  });

  it('advances one quote per equal share of the scroll', () => {
    expect(at(0).index).toBe(0);
    expect(at(1 / 12 + 0.001).index).toBe(1);
    expect(at(0.5).index).toBe(6);
    expect(at(0.999).index).toBe(11);
  });

  it('clamps at the last quote rather than running off the end', () => {
    expect(at(1).index).toBe(11);
    expect(at(2).index).toBe(11);
    expect(at(1).progress).toBe(1);
  });

  it('reports the rail as a fraction of the whole section', () => {
    expect(at(0).progress).toBe(0);
    expect(at(0.25).progress).toBeCloseTo(0.25);
  });

  it('survives a section with no scroll length, and a list with no quotes', () => {
    // No stick length is not "past the end" — it is a section that did not lay out, so it should
    // read as not yet reached rather than pinning to the last quote.
    expect(slideState({ scrollY: 0, top: 0, stickLength: 0, count: 3 })).toEqual({
      index: 0,
      progress: 0
    });
    expect(slideState({ scrollY: 0, top: 0, stickLength: 100, count: 0 })).toEqual({
      index: 0,
      progress: 0
    });
  });
});
