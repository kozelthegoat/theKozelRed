// 1:1 session types.
export const sessionTypes = [
  {
    id: 'intro',
    name: 'Intro Call',
    minutes: 30,
    description: 'A short, no-agenda hello — to see where you are and where you’re headed.',
    bring: [
      'A problem you can’t quite name yet',
      'A question you want a straight answer to',
      'A hunch that something in the process is off'
    ],
    build: [
      'An honest read on whether I can help',
      'A name for the thing that’s been bugging you',
      'A clear next step — with me or without',
      'Confidence that you’re not missing something obvious'
    ]
  },
  {
    id: 'career',
    name: 'Career Review',
    minutes: 45,
    description: 'For you: your résumé, portfolio, and where you’re headed.',
    bring: [
      'A résumé that isn’t landing interviews',
      'A portfolio that undersells the work',
      'A fork in the road — stay, switch, or go it alone'
    ],
    build: [
      'A sharper story and positioning',
      'A résumé and portfolio that read the way you mean them to',
      'Language for talking about your work',
      'A set of concrete steps for the next chapter',
      'The confidence to ask for more'
    ]
  },
  {
    id: 'work',
    name: 'Working Session',
    minutes: 60,
    description: 'For your work: one specific problem, worked through together.',
    bring: [
      'A launch that keeps slipping',
      'A scope that’s grown out of control',
      'A team that’s busy but not shipping',
      'A plan that doesn’t survive contact with reality'
    ],
    build: [
      'A concrete plan you can act on Monday',
      'The trade-offs spelled out, not hidden',
      'Decision points, and what to do at each',
      'The first three moves, in order',
      'Short written notes afterwards',
      'Confidence that the plan holds when it meets reality'
    ]
  }
];

// Weekly availability in the owner's timezone (0 = Sun … 6 = Sat → "HH:MM" starts).
const everyDay = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export const availability = {
  timezone: 'Europe/Minsk',
  label: 'GMT+3 (Minsk)',
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
