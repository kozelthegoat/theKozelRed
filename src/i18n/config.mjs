// Locales, and the two things everything else needs from them: which language a URL is in, and
// what that same URL looks like in another language.
//
// English lives at the root and the others are path-prefixed, so a link is always self-describing
// and nothing depends on a cookie or an Accept-Language header — which also makes every locale
// indexable and shareable.
export const defaultLocale = 'en';
export const locales = ['en', 'ru', 'be'];

// Each language names itself. A switcher that translates "Russian" into the reader's language is
// the one place translation is wrong: someone looking for their own tongue scans for its letters.
export const localeNames = {
  en: 'English',
  ru: 'Русский',
  be: 'Беларуская'
};

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

// A locale prefix is the whole marker — no cookie, no redirect, nothing to remember.
export const isPrefixed = (pathname) => localeFromPath(pathname) !== defaultLocale;
