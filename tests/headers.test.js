import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SECURITY_HEADERS } from '../src/lib/headers.js';

const raw = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

const parseBlock = (text) => {
  const out = {};
  let inBlock = false;
  for (const line of text.split('\n')) {
    if (!line.trim()) {
      inBlock = false;
      continue;
    }
    if (!/^\s/.test(line)) {
      inBlock = line.trim() === '/*';
      continue;
    }
    if (!inBlock) continue;
    const m = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (m) out[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return out;
};

describe('security headers', () => {
  it('public/_headers mirrors every header in lib/headers.js', () => {
    const parsed = parseBlock(raw);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(parsed[name.toLowerCase()], name).toBe(value);
    }
  });

  it('CSP blocks the high-value injection vectors', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('HSTS is a full year, subdomains included, no preload', () => {
    const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
    expect(hsts).toContain('max-age=31536000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).not.toContain('preload');
  });
});
