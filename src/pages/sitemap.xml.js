import { allNotes } from '../lib/note-source.js';
import { langOfId, slugOfId } from '../lib/notes.js';
import { pageUrls, sitemapXml } from '../lib/sitemap.js';

export const prerender = true;

// One sitemap for all three languages: each locale is a URL of its own, and the registry knows
// which ones exist. Built at deploy time, so it can never lag behind the pages.
export async function GET({ site }) {
  const notes = (await allNotes()).map((entry) => ({
    slug: slugOfId(entry.id),
    locale: langOfId(entry.id),
    date: entry.data.date
  }));

  const origin = site ?? new URL('https://kozel.red');
  return new Response(sitemapXml(pageUrls({ origin, notes })), {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
}
