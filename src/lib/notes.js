// The rules about notes, with no framework in them: what counts as published, what language it is
// in, what order they come in, and how a date reads. Keeping this free of `astro:content` is what
// makes it testable — the collection access lives in note-source.js.
import { defaultLocale, locales, intlTagFor } from '../i18n/config.mjs';

export const isPublished = ({ data }) => !data.draft;

// Newest first, so a backdated thought lands where it belongs rather than at the top — which is
// the whole reason the date comes from the frontmatter rather than the file's history.
export const byNewest = (a, b) => b.data.date.valueOf() - a.data.date.valueOf();

export const published = (entries) => entries.filter(isPublished).sort(byNewest);

// A note's language is its filename suffix: `why-benches-rot.ru.md` is the Russian one. The
// default language carries no suffix, so English files are named for their slug alone and an
// unknown suffix is read as part of the slug rather than silently as a language.
export const langOfId = (id) => {
  const match = /\.([a-z]{2})$/.exec(String(id));
  return match && locales.includes(match[1]) ? match[1] : defaultLocale;
};

export const slugOfId = (id) => {
  const lang = langOfId(id);
  return lang === defaultLocale ? String(id) : String(id).slice(0, -(lang.length + 1));
};

export const notesIn = (entries, locale) =>
  published(entries).filter((entry) => langOfId(entry.id) === locale);

// Which languages a given slug actually exists in. A switcher built on this can never offer a
// translation that isn't there, which is the difference between a language menu and four 404s.
export const localesForSlug = (entries, slug) =>
  locales.filter((locale) =>
    published(entries).some((entry) => langOfId(entry.id) === locale && slugOfId(entry.id) === slug)
  );

// Pinned to UTC. A bare YYYY-MM-DD parses as UTC midnight, so formatting it in whatever zone the
// renderer happens to be in would show the day before for anyone behind UTC. The Intl tag comes
// from the locale itself, so a new language brings its date format with it rather than needing a
// second list here to drift out of step.
export const formatNoteDate = (date, locale = defaultLocale) =>
  new Intl.DateTimeFormat(intlTagFor(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
