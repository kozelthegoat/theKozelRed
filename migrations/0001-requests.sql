-- 1:1 booking requests.
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  slot_date TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One active request per slot (declined rows free the slot back up).
CREATE UNIQUE INDEX IF NOT EXISTS requests_slot_active
  ON requests (slot_date, slot_time)
  WHERE status != 'declined';
