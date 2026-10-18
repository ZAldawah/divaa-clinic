CREATE TABLE IF NOT EXISTS booking_gmail_oauth_state (
  hash text PRIMARY KEY,
  session_id text NOT NULL,
  verifier text NOT NULL,
  sender text NOT NULL,
  expires bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS booking_gmail_oauth_state_expiry
  ON booking_gmail_oauth_state(expires);

CREATE TABLE IF NOT EXISTS booking_gmail_credentials (
  id integer PRIMARY KEY CHECK (id = 1),
  sender text NOT NULL,
  refresh_token text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

ALTER TABLE booking_notification_outbox
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT clock_timestamp();
