-- Decline reasons are no longer collected.
ALTER TABLE requests DROP COLUMN decision_note;
