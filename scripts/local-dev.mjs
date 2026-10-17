// Run the site against a working local D1.
//
// Two traps this exists to stop relearning:
//   1. `astro build` resets the local D1 state, so /me 500s and the calendar has no slots.
//   2. Running any `wrangler d1` command while `wrangler dev` holds the database open crashes
//      the runtime — not just migrations. So the seed happens before the server starts.
// Hence the order: build → migrate → seed → serve.
import { execSync, spawn } from 'node:child_process';

const DIR = 'dist/server';
const PORT = process.env.PORT || '8787';

const SEED = `DELETE FROM requests;
INSERT INTO requests (type, slot_date, slot_time, name, email, note, status, created_at)
SELECT CASE i % 3 WHEN 0 THEN 'intro' WHEN 1 THEN 'career' ELSE 'work' END,
       date('2026-10-01', '+' || i || ' days'),
       printf('%02d:00', 8 + (i % 10)),
       'Name ' || printf('%02d', i),
       'person' || i || '@example.com',
       CASE WHEN i % 4 = 0 THEN NULL ELSE 'Note for request ' || i || '.' END,
       CASE i % 3 WHEN 0 THEN 'new' WHEN 1 THEN 'confirmed' ELSE 'declined' END,
       datetime('2026-09-01', '+' || i || ' hours')
FROM (WITH RECURSIVE seq(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM seq WHERE i < 23) SELECT i FROM seq);
UPDATE requests
   SET name = 'Alexandra Constantinescu-Petrova',
       email = 'alexandra.constantinescu-petrova@verylongdomain.example',
       note = 'hello v3 hello v3 hello v3 hello v3 hello v3 https://kozel.red/schedule/ https://kozel.red/schedule/ https://kozel.red/schedule/ https://kozel.red/schedule/ and then more words to push it past two lines at this width.'
 WHERE name = 'Name 01';`
  // single line: JSON.stringify keeps newlines as literal \n, which SQLite then rejects
  .replace(/\s+/g, ' ');

// A stale server from a previous run holds the local D1 open — the usual reason the seed fails.
// Clear my own leftovers, and stand aside loudly for anything that is not mine.
function clearPort() {
  const pids = execSync(`lsof -ti:${PORT} || true`)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);

  for (const pid of pids) {
    const command = execSync(`ps -p ${pid} -o command= || true`).toString();
    if (command.includes(process.cwd()) || command.includes('@theKozelRed')) {
      console.log(`→ stopping my own stale server on :${PORT} (pid ${pid})`);
      execSync(`kill -9 ${pid}`);
    } else {
      console.error(
        `Port ${PORT} is held by something else:\n  ${command.trim()}\nStop it, or run with PORT=<other>.`
      );
      process.exit(1);
    }
  }
}

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });

clearPort();

console.log('\n→ build');
run('npm run build');

console.log('\n→ local migrations');
run('npx wrangler d1 migrations apply kozel-red --local -c wrangler.json', { cwd: DIR });

console.log('\n→ seed');
run(`npx wrangler d1 execute kozel-red --local -c wrangler.json --command ${JSON.stringify(SEED)}`, {
  cwd: DIR
});

console.log(`\n→ wrangler dev on http://127.0.0.1:${PORT}  (Ctrl-C to stop)`);
const dev = spawn('npx', ['wrangler', 'dev', '-c', 'wrangler.json', '--port', PORT], {
  stdio: 'inherit',
  cwd: DIR
});
process.on('SIGINT', () => {
  dev.kill('SIGINT');
  process.exit(0);
});
