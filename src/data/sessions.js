// 1:1 session types.
export const sessionTypes = [
  {
    id: 'intro',
    name: 'Intro Call',
    minutes: 30,
    description: 'A short, no-agenda hello — to see if we’re a fit.',
    bring: 'A straight read on your situation, and an honest answer on whether I can help.',
    leave: ['A clear next step', 'A useful pointer either way']
  },
  {
    id: 'deep',
    name: 'Deep Dive',
    minutes: 60,
    description: 'A working session on a specific problem.',
    bring: 'Structure and prioritisation for one stuck problem, shaped around your real constraints.',
    leave: ['A plan you can act on Monday', 'The trade-offs, spelled out', 'Short written notes afterwards']
  },
  {
    id: 'career',
    name: 'Career Review',
    minutes: 45,
    description: 'A focused review of your résumé, portfolio, or next move.',
    bring: 'Candid eyes on how you come across — and where the market really is.',
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
