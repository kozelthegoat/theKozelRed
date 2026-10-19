// Site-level config. Edit here; components read from this.

export const site = {
  name: 'Aliaksei Kozel',
  altName: 'formerly Aliaksei Pashkel',
  previousName: 'Aliaksei Pashkel',
  bornYear: 1987,
  renameYear: 2026,
  role: 'Strategy / Operations / Production',
  location: 'Minsk, Belarus — right now\nwhere next can be your call',
  // Read as facts beside the location, not as a pitch. No link of their own: the hero's résumé
  // button is the action, and a second call to action in the same block would compete. An array
  // rather than a line-broken string, so each one renders as its own bullet.
  availability: ['Part-time roles and contracts', 'Full-time roles with relocation'],
  // The business address: for the record, for anything formal, and the one on the domain. Not
  // published anywhere on the site.
  email: 'aliaksei@kozel.red',
  // The address the site actually shows, in the footer. Published on purpose, and the one a
  // stranger should write to.
  contactEmail: 'hello@kozel.red',
  resume: '/kozel-resume-2026-10-18.pdf',
  languages: ['English (C2)', 'Belarusian (C1)', 'Russian (native)'],
  offClock: ['Meditation', 'Mind–body discipline', 'Volunteering', 'Vibe Coding'],
  // Floating "Donate" button target (external). Empty = button hidden.
  donateUrl: '',
  // Where a confirmed 1:1 actually happens. Empty = nothing promises a link and no email sends
  // one. Set it and the confirmation email, the .ics (LOCATION + URL) and the dialog copy all
  // follow. This one is a Whereby room, and a vanity room is guessable by design — the access
  // control is Whereby's room lock, not secrecy, so keep the lock on and admit people by hand.
  meetingUrl: 'https://whereby.com/kozelthegoat',
  socials: [
    // { label: 'LinkedIn', url: 'https://…' },
  ]
};
