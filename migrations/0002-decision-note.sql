-- Reason the host gave when declining a request.
ALTER TABLE requests ADD COLUMN decision_note TEXT;
