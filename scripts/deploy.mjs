#!/usr/bin/env node
// One deploy engine — the same shape as the guide-site repo's `scripts/deploy.mjs`,
// so both repos deploy the same way. kozel.red is a single production deployment
// (there is no dev/stage); the guide-site repo is the one that defaults to `dev`.
//
//   node scripts/deploy.mjs        # build, check the schema, wrangler deploy → kozel.red
//
// The schema check is a refusal, not a migration: if this checkout has migrations the remote
// database does not, the deploy stops before it ships anything and names `npm run db:migrate`.
// CI runs this same engine, so a push cannot deploy code over a stale schema either.
import { execSync } from 'node:child_process';
import { migrationState } from './lib/d1.mjs';

// Never let wrangler guess between our account and a client's.
process.env.CLOUDFLARE_ACCOUNT_ID ||= '0a897bbfe32453c5c5384aaf43bd733e';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const out = (cmd, fallback = '') => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
};

const dirty = out('git status --porcelain');
const version = out('git describe --tags --always', '?');
console.log(`[deploy] kozel.red · ${version}${dirty ? ' (working tree dirty)' : ''}`);

run('npm run build');

console.log('\n→ schema');
const schema = migrationState();
if (schema.missing.length) {
  console.warn(
    `[deploy] recorded but no file on disk (not re-applied): ${schema.missing.join(', ')}`
  );
}
if (schema.pending.length) {
  console.error(
    `[deploy] refusing to deploy — the remote database is behind:\n${schema.pending
      .map((name) => `  · ${name}`)
      .join('\n')}\n\n  run: npm run db:migrate\n`
  );
  process.exit(1);
}
console.log(`[deploy] schema is current (${schema.files.length} migrations)`);

run('npx wrangler deploy');

console.log(`[deploy] done · ${version}`);
