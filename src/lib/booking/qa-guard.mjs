export function bookingQaEnabled(env) {
  return env.NODE_ENV === 'development' && env.BOOKING_ALLOW_SYNTHETIC === 'true' &&
    env.BOOKING_CALENDAR_MODE === 'mock' && env.BOOKING_QA_DISABLED !== 'true';
}
