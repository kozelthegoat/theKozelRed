-- A tiny key/value store for facts about the database itself, not about people: when retention
-- last ran, and anything similar later.
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Retention is in force from the moment this migration runs. The next scheduled purge replaces
-- this baseline; until then it is what staleness is measured from, so a cron that never runs is
-- caught a day later instead of looking merely "not started yet".
INSERT OR IGNORE INTO meta (key, value)
VALUES ('last_retention_run', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));
