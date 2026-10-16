import { describe, it, expect } from 'vitest';
import { declineCopy } from '../src/lib/email.js';

const args = {
  name: 'Alex',
  when: '2026-10-17 16:00 · Working Session',
  brand: '#fa3600'
};

describe('declineCopy', () => {
  it('names the declined time in the subject and the body', () => {
    const { subject, text, html } = declineCopy(args);
    expect(subject).toContain(args.when);
    expect(text).toContain(args.when);
    expect(html).toContain(args.when);
  });

  it('thanks them for the opportunity', () => {
    const { text, html } = declineCopy(args);
    expect(text).toContain('grateful for the opportunity');
    expect(html).toContain('grateful for the opportunity');
  });

  it('says the time is off the table, with the race-condition line', () => {
    const { text, html } = declineCopy(args);
    expect(text).toContain('off the table now');
    expect(text).toContain('Call it a race condition — the calendar won this round.');
    expect(html).toContain('the calendar won this round.');
  });

  it('invites another time as theirs to take', () => {
    const { text, html } = declineCopy(args);
    expect(text).toContain("you're welcome to pick another time");
    expect(html).toContain("you're welcome to pick another time");
  });

  it('promises no reply clock', () => {
    const { text, html } = declineCopy(args);
    expect(text).not.toContain('confirm right away');
    expect(html).not.toContain('confirm right away');
  });

  it('escapes the name and carries the brand accent', () => {
    const { html } = declineCopy({ ...args, name: '<b>Alex</b>' });
    expect(html).toContain('&lt;b&gt;Alex&lt;/b&gt;');
    expect(html).not.toContain('<b>Alex</b>');
    expect(html).toContain(args.brand);
  });
});
