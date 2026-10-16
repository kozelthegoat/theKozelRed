-- Remember the zone the requester booked in, so emails can quote their own clock.
-- Nullable: requests made before this change have none (they fall back to Minsk only).
ALTER TABLE requests ADD COLUMN visitor_tz TEXT;
