// Site-level config. Edit here; components read from this.

export const site = {
  name: 'Aliaksei Kozel',
  // The name written the way each language writes it: a Russian page should not call him "Aliaksei
  // Kozel". The Latin spelling stays for English, and for the request API and the host's own
  // notification, which are not the visitor's to read.
  names: { en: 'Aliaksei Kozel', ru: 'Алексей Козел', be: 'Аляксей Козел' },
  altName: 'formerly Aliaksei Pashkel',
  previousName: 'Aliaksei Pashkel',
  bornYear: 1987,
  renameYear: 2026,
  role: 'Strategy · Operations · Production',
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
  resume: '/kozel-resume-2026-10-23.pdf',
  languages: ['English (C2)', 'Belarusian (C1)', 'Russian (native)'],
  offClock: ['Meditation', 'Mind–body discipline', 'Volunteering', 'Vibe Coding'],
  // Floating "Donate" button target (external). Empty = button hidden.
  donateUrl: '',
  // The ribbon can be dismissed; public/ribbon.js remembers the choice in local storage (one
  // preference, no cookie, no identifier).
  ribbonDismissible: true,
  // Where a confirmed 1:1 actually happens. Empty = nothing promises a link and no email sends
  // one. Set it and the confirmation email, the .ics (LOCATION + URL) and the dialog copy all
  // follow. This one is a Whereby room, and a vanity room is guessable by design — the access
  // control is Whereby's room lock, not secrecy, so keep the lock on and admit people by hand.
  meetingUrl: 'https://whereby.com/kozelthegoat',
  socials: [
    // { label: 'LinkedIn', url: 'https://…' },
  ]
};

// The facts that are sentences rather than names: each language writes its own. English stays on
// the site object, where the emails and anything not locale-aware read it.
const localized = {
  location: {
    ru: 'Минск, Беларусь — сейчас\nа дальше — может стать вашим приглашением',
    be: 'Мінск, Беларусь — зараз\nа далей — можа стаць вашай прапановай'
  },
  availability: {
    ru: ['Частичная занятость и контракты', 'Полная занятость с релокацией'],
    be: ['Частковая занятасць і кантракты', 'Поўная занятасць з рэлакацыяй']
  },
  languages: {
    ru: ['Английский (C2)', 'Белорусский (C1)', 'Русский (родной)'],
    be: ['Англійская (C2)', 'Беларуская (C1)', 'Руская (родная)']
  },
  offClock: {
    ru: ['Медитация', 'Практика ума и тела', 'Волонтёрство', 'Вайб-кодинг'],
    be: ['Медытацыя', 'Практыка розуму і цела', 'Валанцёрства', 'Вайб-кодзінг']
  }
};

export const locationFor = (locale) => localized.location[locale] ?? site.location;
export const availabilityFor = (locale) => localized.availability[locale] ?? site.availability;
export const languagesFor = (locale) => localized.languages[locale] ?? site.languages;
export const offClockFor = (locale) => localized.offClock[locale] ?? site.offClock;

// The name in one language, falling back to the default spelling.
export const nameFor = (locale) => site.names?.[locale] ?? site.name;
