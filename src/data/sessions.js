// 1:1 session types.
export const sessionTypes = [
  {
    id: 'intro',
    name: 'Intro Call',
    minutes: 30,
    description: 'A short, no-agenda hello — to see if we’re a fit.'
  },
  {
    id: 'deep',
    name: 'Deep Dive',
    minutes: 60,
    description: 'A working session on a specific problem.'
  },
  {
    id: 'career',
    name: 'Career Review',
    minutes: 45,
    description: 'A focused review of your résumé, portfolio, or next move — fresh eyes and concrete steps.'
  }
];

// Weekly availability in the owner's timezone (0 = Sun … 6 = Sat → "HH:MM" starts).
export const availability = {
  timezone: 'Europe/Minsk',
  label: 'GMT+3 (Minsk)',
  week: {
    0: ['10:00', '11:00', '12:00'],
    1: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    2: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    3: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    4: ['10:00', '11:00', '12:00'],
    5: [],
    6: []
  }
};

export const findSessionType = (id) => sessionTypes.find((t) => t.id === id) || null;
