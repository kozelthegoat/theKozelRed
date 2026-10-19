#!/usr/bin/env node
// One deploy engine — the same shape as the guide-site repo's `scripts/deploy.mjs`,
// so both repos deploy the same way. kozel.red is a single production deployment
// (there is no dev/stage); the guide-site repo is the one that defaults to `dev`.
//
//   node scripts/deploy.mjs        # build + wrangler deploy → kozel.red
import { execSync } from 'node:child_process';

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
run('npx wrangler deploy');

console.log(`[deploy] done · ${version}`);
