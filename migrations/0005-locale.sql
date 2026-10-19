-- Remember the language the visitor was reading when the request was made.
-- Nullable: requests made before this change have none, and fall back to English.
-- Kept on the row rather than passed at send time, because the confirmed and declined emails are
-- sent later, from /me, when the host decides — by then the visitor's page is long gone.
ALTER TABLE requests ADD COLUMN locale TEXT;
