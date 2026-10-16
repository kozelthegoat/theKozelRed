import { describe, it, expect } from 'vitest';
import { declineCopy, dualTime, sendBookingEmails } from '../src/lib/email.js';

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

describe('dualTime', () => {
  const base = { date: '2026-10-17', time: '16:00' };

  it('states Minsk alone when the zone is unknown', () => {
    expect(dualTime(base)).toBe('2026-10-17 16:00 (Europe/Minsk)');
    expect(dualTime({ ...base, visitorTz: null })).toBe('2026-10-17 16:00 (Europe/Minsk)');
  });

  it('quotes their clock first and keeps the Minsk anchor, when known', () => {
    // Berlin is still on summer time in mid-October (UTC+2), so 16:00 Minsk is 15:00 there
    expect(dualTime({ ...base, visitorTz: 'Europe/Berlin' })).toBe(
      '2026-10-17 15:00 (Europe/Berlin) — 2026-10-17 16:00 (Europe/Minsk)'
    );
  });

  it('does not repeat itself when they are already on Minsk', () => {
    expect(dualTime({ ...base, visitorTz: 'Europe/Minsk' })).toBe('2026-10-17 16:00 (Europe/Minsk)');
  });

  it('falls back to the anchor rather than throwing on a junk zone', () => {
    expect(dualTime({ ...base, visitorTz: 'Not/AZone' })).toBe('2026-10-17 16:00 (Europe/Minsk)');
  });
});

describe('subject shape', () => {
  it('reads the same way for every email about a request', async () => {
    const sent = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (_url, opts) => {
      sent.push(JSON.parse(opts.body));
      return { ok: true };
    };
    try {
      await sendBookingEmails(
        { RESEND_API_KEY: 'k', BOOKING_TO: 'me@kozel.red' },
        {
          type: { name: 'Working Session', minutes: 60 },
          date: '2026-10-17',
          time: '16:00',
          name: 'Alex Berlin',
          email: 'alex@example.com',
          note: 'hi'
        }
      );
    } finally {
      globalThis.fetch = realFetch;
    }

    expect(sent[0].subject).toBe('1:1 — New · Alex Berlin · Working Session · 2026-10-17 16:00 Minsk');
    expect(sent[1].subject).toBe('1:1 — Received · Working Session · 2026-10-17 16:00 Minsk');

    const decline = declineCopy({
      name: 'Alex Berlin',
      when: '2026-10-17 16:00 Minsk',
      typeName: 'Working Session'
    });
    expect(decline.subject).toBe('1:1 — Declined · Working Session · 2026-10-17 16:00 Minsk');
  });
});
