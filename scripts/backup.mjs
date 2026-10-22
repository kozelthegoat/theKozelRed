#!/usr/bin/env node
// A full SQL snapshot of the remote database, for the migrations that remove things. D1 also
// keeps its own 30-day time travel, but an export is a file you can read before you need it.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DB, ROOT } from './lib/d1.mjs';

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dir = path.join(ROOT, 'backups');
const file = path.join(dir, `${DB}-${stamp}.sql`);

mkdirSync(dir, { recursive: true });
console.log(`[backup] ${path.relative(ROOT, file)}`);
execSync(`npx wrangler d1 export ${DB} --remote --output "${file}" --skip-confirmation`, {
  cwd: ROOT,
  stdio: 'inherit'
});
console.log('[backup] done');
