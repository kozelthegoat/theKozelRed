// 1:1 session types.
// Every session is 30 minutes. Short enough to leave room to spare inside any free call, and short
// enough that a request has to arrive specific to be worth booking. What separates the three types
// is what each one sets out to do, not how long it takes.
export const sessionTypes = [
  {
    id: 'intro',
    name: 'Intro Call',
    short: 'Intro',
    minutes: 30,
    audience: 'For everyone',
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
    name: 'Career Review',
    short: 'Career',
    minutes: 30,
    audience: 'For individuals',
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
      'A portfolio that leads with the work you want more of',
      'The confidence to ask for more without excuse'
    ]
  },
  {
    id: 'work',
    name: 'Working Session',
    short: 'Work',
    minutes: 30,
    audience: 'For businesses',
    description: 'One specific problem, taken apart together — and the first move you can make.',
    confirmation: 'You’ve been holding this one alone long enough. Let’s put it on the table.',
    bring: [
      'A launch that keeps slipping',
      'A scope that’s grown out of control',
      'A team that’s busy but not shipping',
      'A plan that doesn’t survive contact with reality'
    ],
    build: [
      'The problem underneath the problem',
      'The trade-offs spelled out, not hidden',
      'Your first move, and what it unlocks',
      'Short written notes afterwards'
    ]
  }
];

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
