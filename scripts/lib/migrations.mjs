// The migration bookkeeping, kept out of the shell so the part that can be wrong is testable.
//
// D1 owns the record of what has run: the `d1_migrations` table. The files on disk own what
// should have run. `pendingFrom` is the difference between the two, and it is the only thing
// that decides whether a deploy may proceed.

// Migration files are named `NNNN-topic.sql`; the number is what orders them. Anything else in
// migrations/ (a README, .DS_Store) is not a migration.
export function migrationFiles(names) {
  return names
    .filter((name) => String(name).endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

// `pending` is what still has to run, in order. `missing` is a recorded migration whose file is
// gone — the schema moved but the history did not. It is reported, never re-run and never
// treated as pending: it cannot be applied, and pretending otherwise would wedge every deploy.
export function pendingFrom(files, applied) {
  const recorded = new Set(applied);
  const onDisk = new Set(files);
  return {
    pending: files.filter((file) => !recorded.has(file)),
    missing: applied.filter((name) => !onDisk.has(name))
  };
}

// `wrangler d1 execute --json` prints an array (one entry per statement), each with `results`.
// npx notices and wrangler warnings can surround it, so find the last `]` and try the `[`
// positions before it until one parses. A database that has never been migrated has no
// `d1_migrations` table at all — that is "nothing applied", not an error.
export function parseExecuteJson(output) {
  const text = String(output ?? '');
  if (/no such table:\s*d1_migrations/i.test(text)) return [];

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end <= start) {
    throw new Error(`Could not read the D1 migration state from wrangler:\n${text.trim()}`);
  }

  // Wrangler may print a bracketed warning ("▲ [WARNING] …") before its JSON. Walk the `[`
  // positions from the right and take the first slice that actually parses.
  let parsed;
  for (let i = text.lastIndexOf('[', end - 1); i !== -1; i = text.lastIndexOf('[', i - 1)) {
    try {
      parsed = JSON.parse(text.slice(i, end + 1));
      break;
    } catch {
      // not this bracket
    }
  }
  if (parsed === undefined) {
    throw new Error(`Could not read the D1 migration state from wrangler:\n${text.trim()}`);
  }

  const rows = Array.isArray(parsed) ? parsed.flatMap((entry) => entry?.results ?? []) : [];
  return rows.map((row) => row?.name).filter(Boolean);
}
