// Every page, and where it lives in each language.
//
// Slugs are stored per language rather than derived from the English one, because a translation is
// allowed to live at a different address — /ru/privacy/ can become /ru/konfidentsialnost/ by
// editing this table, with nothing else needing to know. Today they happen to match; that is a
// value here, not an assumption in the code.
//
// `locales` is which languages the page actually exists in. It is what stops a switcher, an
// hreflang tag or a redirect from pointing at a 404, and a test checks it against the routes on
// disk so it cannot quietly drift.
import { defaultLocale, localeFromPath, prefixFor } from './config.mjs';

export const pages = {
  home: { slug: { en: '', ru: '', be: '' }, locales: ['en', 'ru', 'be'] },
  notes: { slug: { en: 'notes', ru: 'notes', be: 'notes' }, locales: ['en', 'ru', 'be'] },
  recommendations: { slug: { en: 'recommendations', ru: 'recommendations', be: 'recommendations' }, locales: ['en', 'ru', 'be'] },
  schedule: { slug: { en: 'schedule', ru: 'schedule', be: 'schedule' }, locales: ['en', 'ru', 'be'] },
  privacy: { slug: { en: 'privacy', ru: 'privacy', be: 'privacy' }, locales: ['en', 'ru', 'be'] },
  notFound: { slug: { en: '404', ru: '404', be: '404' }, locales: ['en'] }
};

export function urlFor(pageKey, locale = defaultLocale) {
  const page = pages[pageKey];
  const prefix = prefixFor(locale);
  if (!page) return `${prefix}/`;
  const slug = page.slug[locale] ?? page.slug[defaultLocale];
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

// The page a pathname belongs to, exactly. Not a prefix match: /notes/why-benches-rot/ must not
// resolve to the notes index, because the index and a given note can exist in different sets of
// languages — a note is often translated only once, while the list around it is translated always.
export function pageKeyForPath(pathname) {
  const locale = localeFromPath(pathname);
  const path = String(pathname || '/');
  for (const [key, page] of Object.entries(pages)) {
    if (path === urlFor(key, locale)) return key;
  }
  return null;
}

// Which languages exist for the page at this path, or null when the path is not a known page.
export function alternatesForPath(pathname) {
  const key = pageKeyForPath(pathname);
  return key ? pages[key].locales : null;
}
