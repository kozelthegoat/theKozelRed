import { describe, it, expect } from 'vitest';
import {
  declineCopy,
  confirmedCopy,
  requesterSubject,
  hostSubject,
  sendBookingEmails,
  sendConfirmEmail
} from '../src/lib/email.js';
import { site } from '../src/data/site.js';

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

  it('gives the moment its own line, in their clock only', () => {
    const { text } = declineCopy(args);
    expect(text).toContain('Working Session · 2026-10-17 · 15:00 UTC+2');
    expect(text).not.toContain('UTC+3');
  });

  it('greets by first name and thanks them', () => {
    const { text, html } = declineCopy({ ...args, name: 'Alex Berlin' });
    expect(text).toContain('Hi Alex,');
    expect(html).toContain('Hi Alex,');
    expect(text).toContain('Thank you');
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

  it('confirms in the first person, and names the moment in their clock', () => {
    const { text, html } = confirmedCopy(args);
    expect(text).toContain('I confirm');
    expect(text).toContain('Working Session · 2026-10-17 · 15:00 UTC+2');
    expect(text).not.toContain('UTC+3');
    expect(html).toContain('2026-10-17');
  });

  it('greets by first name and thanks them', () => {
    const { text, html } = confirmedCopy({ ...args, name: 'Alex Berlin' });
    expect(text).toContain('Hi Alex,');
    expect(html).toContain('Hi Alex,');
    expect(text).toContain('Thank you');
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
          type: { name: 'Working Session', minutes: 30 },
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
    }
    // Mine carries both clocks; theirs carries only the one they booked in.
    expect(`${sent[0].text}${sent[0].html}`).toContain('UTC+3');
    expect(`${sent[1].text}${sent[1].html}`).not.toContain('UTC+3');
    expect(`${sent[1].text}${sent[1].html}`).toContain('UTC+2');
  });

  it('lays the request out as a labelled block, with everything we hold', async () => {
    const sent = await withFetch(() =>
      sendBookingEmails(
        { RESEND_API_KEY: 'k', BOOKING_TO: 'me@kozel.red' },
        {
          id: 42,
          requestedAt: Date.parse('2026-10-01T09:30:00Z'),
          type: { name: 'Working Session', minutes: 30 },
          date: '2026-10-17',
          time: '16:00',
          visitorTz: 'Europe/Berlin',
          name: 'Robin Alvarez',
          email: 'alex@example.com',
          note: 'the crisp one'
        }
      )
    );

    const mail = sent[0];
    for (const label of ['Name', 'Email', 'Session', 'Their clock', 'Requested', 'Request', 'Message']) {
      expect(mail.text).toContain(label);
    }
    expect(mail.text).toContain('#42');
    expect(mail.text).toContain('2026-10-17 · 15:00 UTC+2'); // their clock
    expect(mail.text).toContain('2026-10-17 · 16:00 UTC+3'); // mine
    expect(mail.text).toContain('2026-10-01 · 12:30 UTC+3'); // requested, in my clock
    expect(mail.text).toContain('the crisp one');
  });

  it('does not tell me to reply by email — answers happen in the admin table', async () => {
    const sent = await withFetch(() =>
      sendBookingEmails(
        { RESEND_API_KEY: 'k', BOOKING_TO: 'me@kozel.red' },
        {
          type: { name: 'Working Session', minutes: 30 },
          date: '2026-10-17',
          time: '16:00',
          visitorTz: 'Europe/Berlin',
          name: 'Robin Alvarez',
          email: 'alex@example.com',
          note: 'hi'
        }
      )
    );

    expect(sent[0].text).not.toContain('Reply to this email');
    expect(sent[0].html).not.toContain('Reply to this email');
  });
});

describe('the configured room', () => {
  it('is a link, and reaches the confirmation email and the calendar file', async () => {
    // The site ships with a room configured. Clearing it drops the join link from the email, the
    // .ics and the dialog copy together — so this failing is the reminder to do that on purpose.
    expect(site.meetingUrl).toMatch(/^https:\/\//);

    const sent = await withFetch(() =>
      sendConfirmEmail(
        { RESEND_API_KEY: 'k' },
        {
          id: 7,
          name: 'Alex',
          email: 'a@b.c',
          date: '2026-10-17',
          time: '16:00',
          visitorTz: 'Europe/Berlin',
          type: { name: 'Intro Call', minutes: 30 }
        }
      )
    );

    const mail = sent[0];
    const ics = Buffer.from(mail.attachments[0].content, 'base64').toString('utf8');
    expect(mail.text).toContain(site.meetingUrl);
    expect(mail.html).toContain(site.meetingUrl);
    expect(ics).toContain(`LOCATION:${site.meetingUrl}`);
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
