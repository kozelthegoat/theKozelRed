// 1:1 session types.
// Every session is 30 minutes. Short enough to leave room to spare inside any free call, and short
// enough that a request has to arrive specific to be worth booking. What separates the three types
// is what each one sets out to do, not how long it takes.
//
// The label reads "RE:" because each session is a reply to whatever you bring — anything, a career,
// a business. It is one string, and `audience` is derived from it below, so the page, the footer,
// the emails and the calendar file all read the same value and cannot drift apart.
const types = [
  {
    id: 'intro',
    name: 'RE: Anything',
    short: 'Anything',
    minutes: 30,
    description: 'A short, no-agenda hello — to hear where you are, and what might come next.',
    confirmation: 'Come as you are. Nothing needs polishing — the rough version is usually the honest one.',
    bring: [
      'A problem you can’t quite name yet',
      'A question you want a straight answer to',
      'A hunch that something in the process is off'
    ],
    build: [
      'An honest read on whether I can help',
      'A name for the thing that’s been bugging you',
      'A clear next step — with me or without',
      'The confidence to keep going and stay on track'
    ]
  },
  {
    id: 'career',
    name: 'RE: Career',
    short: 'Career',
    minutes: 30,
    description: 'Your résumé, your portfolio, and the story they’re not telling yet.',
    confirmation: 'You’re not behind. You’re carrying a good story in the wrong order.',
    bring: [
      'A résumé that isn’t landing interviews',
      'A portfolio that undersells the work',
      'A fork in the road — stay, switch, or go it alone'
    ],
    build: [
      'A sharper story and positioning',
      'A résumé that reads the way you mean it to',
      'A portfolio that leads the way you wish',
      'The confidence to ask for more without excuse'
    ]
  },
  {
    id: 'work',
    name: 'RE: Business',
    short: 'Business',
    minutes: 30,
    description: 'Your products, your programs, your tools, and the value you’re willing to deliver.',
    confirmation: 'You’ve been holding this one alone long enough. Let’s put it on the table.',
    bring: [
      'A launch that keeps slipping',
      'A scope that’s grown out of control',
      'A team that’s busy but not shipping',
      'A plan that doesn’t survive contact with reality'
    ],
    build: [
      'The problem underneath the problem',
      'What each option really costs',
      'Your first move, and what it unlocks',
      'Notes afterwards, so it survives the week'
    ]
  }
];

// Spread rather than a second literal field: the label is shown on the page as `audience` and
// carried into the emails as `name`, and one value means they can only ever agree.
export const sessionTypes = types.map((t) => ({ ...t, audience: t.name }));

// Weekly availability in the owner's timezone (0 = Sun … 6 = Sat → "HH:MM" starts).
const everyDay = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export const availability = {
  timezone: 'Europe/Minsk',
  minNoticeHours: 24,
  week: {
    0: everyDay,
    1: everyDay,
    2: everyDay,
    3: everyDay,
    4: everyDay,
    5: everyDay,
    6: everyDay
  }
};

export const findSessionType = (id) => sessionTypes.find((t) => t.id === id) || null;
