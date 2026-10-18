// The rules about notes, with no framework in them: what counts as published, what order they
// come in, and how a date reads. Keeping this free of `astro:content` is what makes it testable —
// the collection access lives in note-source.js.

export const isPublished = ({ data }) => !data.draft;

// Newest first, so a backdated thought lands where it belongs rather than at the top — which is
// the whole reason the date comes from the frontmatter rather than the file's history.
export const byNewest = (a, b) => b.data.date.valueOf() - a.data.date.valueOf();

export const published = (entries) => entries.filter(isPublished).sort(byNewest);

// Pinned to UTC. A bare YYYY-MM-DD parses as UTC midnight, so formatting it in whatever zone the
// renderer happens to be in would show the day before for anyone behind UTC.
export const formatNoteDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
