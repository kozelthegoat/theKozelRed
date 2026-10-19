// Site-level config. Edit here; components read from this.

export const site = {
  name: 'Aliaksei Kozel',
  altName: 'formerly Aliaksei Pashkel',
  previousName: 'Aliaksei Pashkel',
  bornYear: 1987,
  renameYear: 2026,
  role: 'Strategy / Operations / Production',
  location: 'Minsk, Belarus — right now\nwhere next can be your call',
  // Read as a fact beside the location, not as a pitch. No link of its own: the hero's résumé
  // button is the action, and a second call to action in the same block would compete. The break
  // is deliberate and rendered with whitespace-pre-line, as the location above it is.
  availability: 'Open to part-time roles and contracts\nOpen to full-time roles with relocation',
  email: 'aliaksei.pashkel@gmail.com',
  resume: '/kozel-resume-2026-10-18.pdf',
  languages: ['English (C2)', 'Belarusian (C1)', 'Russian (native)'],
  education: ['BA, English Literature', 'Minsk State Linguistic University'],
  offClock: ['Meditation', 'Mind–body discipline', 'Volunteering', 'Vibe Coding'],
  // Floating "Donate" button target (external). Empty = button hidden.
  donateUrl: '',
  // Where a confirmed 1:1 actually happens. Empty = nothing promises a link and no email sends
  // one. Set it and the confirmation email, the .ics (LOCATION + URL) and the dialog copy all
  // follow. This one is a Whereby room, and a vanity room is guessable by design — the access
  // control is Whereby's room lock, not secrecy, so keep the lock on and admit people by hand.
  meetingUrl: 'https://whereby.com/kozelthegoat',
  // The words shown after a request lands. The per-session line lives on each session type.
  confirmation: {
    thanks: 'Thank you for asking. It means more than the request suggests.',
    next: 'I’ll give it proper attention, and you’ll hear back by email either way — that part I promise.'
  },
  socials: [
    // { label: 'LinkedIn', url: 'https://…' },
  ]
};
