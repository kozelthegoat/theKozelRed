// The sitemap, built from the same registry that drives hreflang and the language switcher, so it
// cannot list a URL the site does not have — or miss one it does. No lastmod for the standing
// pages: we do not know when they changed, and a made-up date is worse than none.
import { pages, urlFor } from '../i18n/pages.mjs';

// 404 is a styled page, not an address to index. /me and /api are not in the registry at all.
const NOT_INDEXABLE = new Set(['notFound']);

const absolute = (origin, path) => new URL(path, origin).href;
const isoDate = (date) =>
  date instanceof Date ? date.toISOString().slice(0, 10) : String(date).slice(0, 10);

export function pageUrls({ origin, notes = [] }) {
  const entries = [];
  const seen = new Set();
  const push = (entry) => {
    if (seen.has(entry.loc)) return;
    seen.add(entry.loc);
    entries.push(entry);
  };

  const noteLocales = new Set(notes.map((note) => note.locale));

  for (const [key, page] of Object.entries(pages)) {
    if (NOT_INDEXABLE.has(key)) continue;
    for (const locale of page.locales) {
      // An empty archive is not worth a crawler's time; the navigation hides it for the same reason.
      if (key === 'notes' && !noteLocales.has(locale)) continue;
      push({ loc: absolute(origin, urlFor(key, locale)) });
    }
  }

  for (const note of notes) {
    push({
      loc: absolute(origin, `${urlFor('notes', note.locale)}${note.slug}/`),
      lastmod: note.date ? isoDate(note.date) : undefined
    });
  }

  return entries;
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);

export function sitemapXml(entries) {
  const urls = entries
    .map(({ loc, lastmod }) => {
      const date = lastmod ? `\n    <lastmod>${esc(lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${esc(loc)}</loc>${date}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
