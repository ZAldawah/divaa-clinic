CREATE TABLE IF NOT EXISTS booking_notification_outbox (
  reference text PRIMARY KEY REFERENCES booking_reservations(id),
  encrypted_payload text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('disabled','queued','sent','failed')) DEFAULT 'disabled',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  sent_at timestamptz
);
