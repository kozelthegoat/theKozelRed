#!/usr/bin/env node
// Apply the migrations this checkout has but the remote database does not.
//
// Deliberately not part of the deploy: a schema change is its own operation, with its own
// failure and rollback. The deploy refuses to ship while this is behind, so the two can never
// drift — it just cannot half-migrate production on its way past.
import { execSync } from 'node:child_process';
import { ROOT, applyCommand, migrationState } from './lib/d1.mjs';

const before = migrationState();

if (before.missing.length) {
  console.warn(
    `[migrate] recorded but no file on disk (history drift, not applied again):\n${before.missing
      .map((name) => `  · ${name}`)
      .join('\n')}`
  );
}

if (!before.pending.length) {
  console.log('[migrate] nothing pending — the remote schema is current');
  process.exit(0);
}

console.log(
  `[migrate] applying ${before.pending.length}:\n${before.pending.map((name) => `  · ${name}`).join('\n')}`
);
execSync(applyCommand, { cwd: ROOT, stdio: 'inherit' });

// Trust, but verify: wrangler reports success per statement, and the next deploy is only safe
// if the bookkeeping table now agrees with the files.
const after = migrationState();
if (after.pending.length) {
  console.error(
    `[migrate] still pending after apply — do not deploy:\n${after.pending
      .map((name) => `  · ${name}`)
      .join('\n')}`
  );
  process.exit(1);
}

console.log(`[migrate] done — ${after.files.length} migrations applied`);
