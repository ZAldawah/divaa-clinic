ALTER TABLE booking_notification_outbox
  DROP CONSTRAINT IF EXISTS booking_notification_outbox_status_check;
ALTER TABLE booking_notification_outbox
  ADD CONSTRAINT booking_notification_outbox_status_check
  CHECK (status IN ('disabled','queued','sending','sent','failed','uncertain'));
