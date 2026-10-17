import { describe, it, expect } from 'vitest';
import { linkify } from '../src/lib/linkify.js';

describe('linkify', () => {
  it('leaves plain text alone', () => {
    expect(linkify('hello v3 hello v3')).toBe('hello v3 hello v3');
  });

  it('turns a bare url into a link', () => {
    expect(linkify('see https://kozel.red/schedule/ for times')).toBe(
      'see <a href="https://kozel.red/schedule/" target="_blank" rel="noopener noreferrer" class="text-brand underline-offset-2 hover:underline">https://kozel.red/schedule/</a> for times'
    );
  });

  it('handles several urls, which is what a note actually looked like', () => {
    const out = linkify('hello https://kozel.red/schedule/ and https://kozel.red/me');
    expect(out.match(/<a /g)).toHaveLength(2);
  });

  it('leaves sentence punctuation outside the link', () => {
    expect(linkify('see https://kozel.red/schedule/.')).toContain('>https://kozel.red/schedule/</a>.');
  });

  it('escapes markup instead of rendering it', () => {
    const out = linkify('<script>alert(1)</script> & "quotes"');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
    expect(out).toContain('&amp;');
    expect(out).toContain('&quot;');
  });

  it('does not link anything that is not http(s)', () => {
    for (const input of ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'ftp://kozel.red']) {
      expect(linkify(input)).not.toContain('<a ');
    }
  });

  it('cannot be smuggled out of the href attribute', () => {
    const out = linkify('https://example.com/"onmouseover="alert(1)');
    expect(out).not.toContain('"onmouseover="');
    expect(out).toContain('&quot;onmouseover=&quot;');
  });

  it('tolerates empty input', () => {
    expect(linkify('')).toBe('');
    expect(linkify(null)).toBe('');
  });
});
