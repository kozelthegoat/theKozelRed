// Notes are written by whoever booked, so everything is escaped first and only bare http(s)
// URLs become links — anything else (javascript:, data:) stays inert text.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);

const URL_RE = /https?:\/\/[^\s<>"']+/gi;
// A trailing full stop or bracket usually belongs to the sentence, not to the link.
const TRAILING = /[.,;:!?)\]]+$/;

export function linkify(text) {
  const source = String(text ?? '');
  let out = '';
  let cursor = 0;

  for (const match of source.matchAll(URL_RE)) {
    const trailing = match[0].match(TRAILING)?.[0] ?? '';
    const href = match[0].slice(0, match[0].length - trailing.length);
    if (!href) continue;
    out += esc(source.slice(cursor, match.index));
    out += `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="text-brand underline-offset-2 hover:underline">${esc(href)}</a>`;
    out += esc(trailing);
    cursor = match.index + match[0].length;
  }

  return out + esc(source.slice(cursor));
}
