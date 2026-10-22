// Reading the remote migration state. The shell is the only thing here — the ordering and the
// diff live in migrations.mjs, where they are tested without a database.
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrationFiles, parseExecuteJson, pendingFrom } from './migrations.mjs';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const DB = 'kozel-red';

// D1 owns the record of what has run. A failure here is not swallowed: parseExecuteJson turns
// anything it cannot read into an error that names wrangler's own output, and treats exactly one
// case — the bookkeeping table not existing yet — as "nothing applied".
function appliedNames() {
  let output;
  try {
    output = execSync(
      `npx wrangler d1 execute ${DB} --remote --json --command "select name from d1_migrations"`,
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  } catch (error) {
    // execSync drops stdout on a non-zero exit; wrangler's explanation is in stderr.
    output = `${error?.stdout ?? ''}${error?.stderr ?? ''}`;
  }
  return parseExecuteJson(output);
}

// The one call both the deploy guard and `npm run db:migrate` make.
export function migrationState() {
  const files = migrationFiles(readdirSync(path.join(ROOT, 'migrations')));
  return { files, ...pendingFrom(files, appliedNames()) };
}

export const applyCommand = `npx wrangler d1 migrations apply ${DB} --remote`;
