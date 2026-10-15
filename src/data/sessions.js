// 1:1 session types.
export const sessionTypes = [
  {
    id: 'intro',
    name: 'Intro Call',
    minutes: 30,
    description: 'A short, no-agenda hello — to see if we’re a fit.',
    bring: [
      'A problem you can’t quite name yet',
      'One question you want a straight answer to',
      'A hunch that something in the process is off'
    ],
    leave: ['An honest read on whether I can help', 'A clear next step — with me or without']
  },
  {
    id: 'deep',
    name: 'Deep Dive',
    minutes: 60,
    description: 'A working session on one specific problem.',
    bring: [
      'A launch that keeps slipping',
      'Scope that’s grown out of control',
      'A team that’s busy but not shipping',
      'A plan that doesn’t survive contact with reality'
    ],
    leave: ['A concrete plan you can act on Monday', 'The trade-offs spelled out, not hidden', 'Short written notes afterwards']
  },
  {
    id: 'career',
    name: 'Career Review',
    minutes: 45,
    description: 'A focused review of your résumé, portfolio, or next move.',
    bring: [
      'A résumé that isn’t landing interviews',
      'A portfolio that undersells the work',
      'A fork in the road — stay, switch, or go it alone'
    ],
    leave: ['A sharper story and positioning', 'Concrete steps for the next few weeks']
  }
];

// Weekly availability in the owner's timezone (0 = Sun … 6 = Sat → "HH:MM" starts).
export const availability = {
  timezone: 'Europe/Minsk',
  label: 'GMT+3 (Minsk)',
  week: {
    0: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    1: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    2: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    3: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    4: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    5: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    6: ['10:00', '11:00', '12:00', '15:00', '16:00']
  }
};

export const findSessionType = (id) => sessionTypes.find((t) => t.id === id) || null;
