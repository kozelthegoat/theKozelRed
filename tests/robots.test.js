import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');

describe('public/robots.txt', () => {
  it('points crawlers at the sitemap, at the apex', () => {
    expect(robots).toMatch(/^Sitemap: https:\/\/kozel\.red\/sitemap\.xml$/m);
  });

  it('keeps the owner pages and the API out of the crawl', () => {
    expect(robots).toMatch(/^Disallow: \/me$/m);
    expect(robots).toMatch(/^Disallow: \/api\/$/m);
  });

  it('does not block the pages that are meant to be indexed', () => {
    expect(robots).not.toMatch(/^Disallow: \/$/m);
    expect(robots).not.toMatch(/^Disallow: \/\*$/m);
  });
});
