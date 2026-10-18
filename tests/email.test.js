import { describe, it, expect } from 'vitest';
import {
  declineCopy,
  confirmedCopy,
  dualTime,
  requesterSubject,
  hostSubject,
  sendBookingEmails,
  sendConfirmEmail
} from '../src/lib/email.js';

const args = {
  name: 'Alex',
  date: '2026-10-17',
  time: '16:00',
  visitorTz: 'Europe/Berlin',
  typeName: 'Working Session',
  minutes: 60,
  brand: '#fa3600'
};

const withFetch = async (run) => {
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, opts) => {
    sent.push(JSON.parse(opts.body));
    return { ok: true };
  };
  try {
    await run();
  } finally {
    globalThis.fetch = realFetch;
  }
  return sent;
};

describe('subjects', () => {
  it('names the counterparty, the session, the date and the local time', () => {
    expect(hostSubject({ name: 'Alex Berlin', date: '2026-10-17', time: '16:00', typeName: 'Working Session' })).toBe(
      '1:1 · Alex Berlin · Working Session · 2026-10-17 · 16:00 UTC+3'
    );
    expect(requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Europe/Berlin', typeName: 'Working Session' })).toBe(
      '1:1 · Aliaksei Kozel · Working Session · 2026-10-17 · 15:00 UTC+2'
    );
  });

  it('names the offset, not a city — another city on the same clock reads the same', () => {
    // Paris and Berlin share a zone in October; the subject must not say either one
    expect(requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Europe/Paris', typeName: 'Intro Call' })).toBe(
      requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Europe/Berlin', typeName: 'Intro Call' })
    );
    expect(requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Europe/Paris', typeName: 'Intro Call' })).toContain('UTC+2');
  });

  it('falls back to the site offset when the zone is unknown or junk', () => {
    expect(requesterSubject({ date: '2026-10-17', time: '16:00', typeName: 'Intro Call' })).toBe(
      '1:1 · Aliaksei Kozel · Intro Call · 2026-10-17 · 16:00 UTC+3'
    );
    expect(requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Not/AZone', typeName: 'Intro Call' })).toBe(
      '1:1 · Aliaksei Kozel · Intro Call · 2026-10-17 · 16:00 UTC+3'
    );
  });
});

describe('declineCopy', () => {
  it('keeps the requester thread subject, so the whole exchange threads together', () => {
    const { subject } = declineCopy(args);
    expect(subject).toBe(requesterSubject(args));
  });

  it('states the status change in the body', () => {
    const { text, html } = declineCopy(args);
    expect(text).toContain('An update on your request');
    expect(html).toContain('An update on your request');
  });

  it('thanks them for the opportunity', () => {
    const { text, html } = declineCopy(args);
    expect(text).toContain('grateful for the opportunity');
    expect(html).toContain('grateful for the opportunity');
  });

  it('drops the race-condition line and the off-the-table phrasing', () => {
    const { text, html } = declineCopy(args);
    for (const s of [text, html]) {
      expect(s).not.toContain('race condition');
      expect(s).not.toContain('off the table');
      expect(s).not.toContain('calendar won');
    }
  });

  it('does not apologise with the disappoint line', () => {
    const { text, html } = declineCopy(args);
    expect(text).not.toContain('sorry to disappoint');
    expect(html).not.toContain('sorry to disappoint');
  });

  it('leaves another time as theirs to take, with a standard button label', () => {
    const { text, html } = declineCopy(args);
    expect(text).toContain("you're welcome to choose another time");
    expect(html).toContain('Choose another time');
    expect(html).not.toContain('Pick another time');
  });

  it('quotes the local clock and the anchor the time was booked in, as offsets', () => {
    const { text } = declineCopy(args);
    expect(text).toContain('2026-10-17 15:00 (UTC+2) — 2026-10-17 16:00 (UTC+3)');
  });

  it('escapes the name and carries the brand accent', () => {
    const { html } = declineCopy({ ...args, name: '<b>Alex</b>' });
    expect(html).toContain('&lt;b&gt;Alex&lt;/b&gt;');
    expect(html).not.toContain('<b>Alex</b>');
    expect(html).toContain(args.brand);
  });
});

describe('confirmedCopy', () => {
  it('reuses the same subject, so a confirmation threads with the request', () => {
    const { subject } = confirmedCopy(args);
    expect(subject).toBe(requesterSubject(args));
  });

  it('says it is confirmed and names the moment', () => {
    const { text, html } = confirmedCopy(args);
    expect(text).toContain('confirmed');
    expect(text).toContain('2026-10-17 15:00 (UTC+2)');
    expect(html).toContain('2026-10-17');
  });

  it('carries the join link when a room is configured', () => {
    const { text, html } = confirmedCopy({ ...args, meetingUrl: 'https://zoom.us/j/12345' });
    expect(text).toContain('https://zoom.us/j/12345');
    expect(html).toContain('https://zoom.us/j/12345');
    expect(html).toContain('Join the call');
  });

  it('promises no link when no room is configured', () => {
    const { text, html } = confirmedCopy(args);
    expect(text).not.toContain('Join');
    expect(html).not.toContain('Join the call');
  });
});

describe('bold', () => {
  it('emphasises the session type, date and time in the html body', () => {
    const host = declineCopy(args).html;
    expect(host).toContain('<strong>Working Session</strong>');
    expect(host).toContain('<strong>2026-10-17</strong>');
  });

  it('emphasises them in the confirmation too', () => {
    const { html } = confirmedCopy(args);
    expect(html).toContain('<strong>Working Session</strong>');
    expect(html).toContain('<strong>2026-10-17</strong>');
  });
});

describe('dualTime', () => {
  const base = { date: '2026-10-17', time: '16:00' };

  it('states the offset alone when the zone is unknown', () => {
    expect(dualTime(base)).toBe('2026-10-17 16:00 (UTC+3)');
    expect(dualTime({ ...base, visitorTz: null })).toBe('2026-10-17 16:00 (UTC+3)');
  });

  it('quotes their clock first and keeps the anchor, when known', () => {
    // Berlin is still on summer time in mid-October (UTC+2), so 16:00 UTC+3 is 15:00 there
    expect(dualTime({ ...base, visitorTz: 'Europe/Berlin' })).toBe(
      '2026-10-17 15:00 (UTC+2) — 2026-10-17 16:00 (UTC+3)'
    );
  });

  it('does not repeat itself when they are already on the site clock', () => {
    expect(dualTime({ ...base, visitorTz: 'Europe/Minsk' })).toBe('2026-10-17 16:00 (UTC+3)');
  });

  it('falls back to the anchor rather than throwing on a junk zone', () => {
    expect(dualTime({ ...base, visitorTz: 'Not/AZone' })).toBe('2026-10-17 16:00 (UTC+3)');
  });
});

describe('sendBookingEmails', () => {
  it('sends the host subject to me and the requester subject to them', async () => {
    const sent = await withFetch(() =>
      sendBookingEmails(
        { RESEND_API_KEY: 'k', BOOKING_TO: 'me@kozel.red' },
        {
          type: { name: 'Working Session', minutes: 60 },
          date: '2026-10-17',
          time: '16:00',
          visitorTz: 'Europe/Berlin',
          name: 'Alex Berlin',
          email: 'alex@example.com',
          note: 'hi'
        }
      )
    );

    expect(sent[0].subject).toBe(hostSubject({ name: 'Alex Berlin', date: '2026-10-17', time: '16:00', typeName: 'Working Session' }));
    expect(sent[1].subject).toBe(requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Europe/Berlin', typeName: 'Working Session' }));
  });

  it('never names a city in either email — offsets only', async () => {
    const sent = await withFetch(() =>
      sendBookingEmails(
        { RESEND_API_KEY: 'k', BOOKING_TO: 'me@kozel.red' },
        {
          type: { name: 'Working Session', minutes: 60 },
          date: '2026-10-17',
          time: '16:00',
          visitorTz: 'Europe/Berlin',
          name: 'Robin Alvarez',
          email: 'alex@example.com',
          note: 'hi'
        }
      )
    );

    for (const mail of sent) {
      const all = `${mail.subject}${mail.text}${mail.html}`;
      expect(all).not.toContain('Minsk');
      expect(all).not.toContain('Berlin');
      expect(all).toContain('UTC+3');
    }
  });
});

describe('sendConfirmEmail', () => {
  it('attaches an .ics that decodes to a calendar', async () => {
    const sent = await withFetch(() =>
      sendConfirmEmail(
        { RESEND_API_KEY: 'k' },
        {
          id: 42,
          name: 'Alex Berlin',
          email: 'alex@example.com',
          date: '2026-10-17',
          time: '16:00',
          visitorTz: 'Europe/Berlin',
          type: { name: 'Working Session', minutes: 60 }
        }
      )
    );

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('alex@example.com');
    expect(sent[0].subject).toBe(requesterSubject({ date: '2026-10-17', time: '16:00', visitorTz: 'Europe/Berlin', typeName: 'Working Session' }));

    const attachment = sent[0].attachments[0];
    expect(attachment.filename).toBe('1-1-working-session-2026-10-17.ics');
    const decoded = Buffer.from(attachment.content, 'base64').toString('utf8');
    expect(decoded).toContain('BEGIN:VCALENDAR');
    expect(decoded).toContain('DTSTART:20261017T130000Z');
    expect(decoded).toContain('UID:request-42@kozel.red');
  });

  it('skips quietly without a key', async () => {
    const sent = await withFetch(() =>
      sendConfirmEmail({}, { id: 1, name: 'A', email: 'a@b.c', date: '2026-10-17', time: '16:00', type: { name: 'Intro Call', minutes: 30 } })
    );
    expect(sent).toHaveLength(0);
  });
});
