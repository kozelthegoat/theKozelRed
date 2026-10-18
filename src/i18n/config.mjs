// Locales, and the two things everything else needs from them: which language a URL is in, and
// what that same URL looks like in another language.
//
// English lives at the root and the others are path-prefixed, so a link is always self-describing
// and nothing depends on a cookie or an Accept-Language header — which also makes every locale
// indexable and shareable.
export const defaultLocale = 'en';

// Each language carries its own name, its direction and its Intl tag, so nothing downstream has to
// special-case a locale. Direction lives here rather than being assumed: adding an RTL language
// should be a data change, not a plumbing change.
export const localeInfo = {
  en: { label: 'English', dir: 'ltr', intl: 'en-GB' },
  ru: { label: 'Русский', dir: 'ltr', intl: 'ru' },
  be: { label: 'Беларуская', dir: 'ltr', intl: 'be-BY' }
};

export const locales = Object.keys(localeInfo);

export const labelFor = (locale) => localeInfo[locale]?.label ?? locale;
export const dirFor = (locale) => localeInfo[locale]?.dir ?? localeInfo[defaultLocale].dir;
// English maps to en-GB deliberately: plain 'en' gives American order, and the site writes
// 18 October 2026.
export const intlTagFor = (locale) => localeInfo[locale]?.intl ?? localeInfo[defaultLocale].intl;

// English is served from the root, so its prefix is empty and its URLs stay unchanged.
export const prefixFor = (locale) => (locale === defaultLocale ? '' : `/${locale}`);

// The locale a pathname is in. Anything unknown is the default, so a stray URL degrades to English
// rather than to a 404 or an untranslated shell.
export function localeFromPath(pathname) {
  const first = String(pathname || '/').split('/').filter(Boolean)[0];
  return locales.includes(first) ? first : defaultLocale;
}

// The same page in another language: drop any locale prefix and put the new one on the front.
export function pathInLocale(pathname, locale) {
  const rest = String(pathname || '/')
    .split('/')
    .filter(Boolean)
    .filter((segment) => !locales.includes(segment))
    .join('/');
  return `${prefixFor(locale)}/${rest}${rest ? '/' : ''}`;
}

// The prefix is the whole marker: nothing is remembered between visits, so every locale stays
// shareable and indexable, and English stays at the root where its URLs already point.
//
// KozelGo additionally remembers a choice in a cookie and negotiates `/` from Accept-Language.
// That is a decision not taken, rather than work outstanding: `/ru/` does not exist, so a redirect
// would have nowhere to send anyone, and default-language-at-the-root is a pattern hreflang
// already declares properly. Reconsider if Russian ever covers more than the notes list — and the
// page registry is what would make it a table edit rather than a rewrite.
export const isPrefixed = (pathname) => localeFromPath(pathname) !== defaultLocale;
