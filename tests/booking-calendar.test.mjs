import test from 'node:test';
import assert from 'node:assert/strict';
import { syntheticSettings } from '../src/lib/booking/schema.mjs';
import { availableDatesForMonth } from '../src/lib/booking/calendar-dates.mjs';

test('calendar marks only dates with real slots under schedule and busy rules', () => {
  const settings={...syntheticSettings,noticeMinutes:0};
  const busy=[{start:Date.parse('2026-10-12T14:00:00.000Z'),end:Date.parse('2026-10-13T05:00:00.000Z')}];
  const dates=availableDatesForMonth({month:'2026-10',service:'synthetic-consultation',settings,busy,now:Date.parse('2026-10-01T12:00:00.000Z')});
  assert.deepEqual(dates,['2026-10-01','2026-10-02','2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06']);
});

test('calendar returns no marked dates for disabled or unknown services', () => {
  const dates=availableDatesForMonth({month:'2026-10',service:'not-a-service',settings:syntheticSettings,now:Date.parse('2026-10-01T12:00:00.000Z')});
  assert.deepEqual(dates,[]);
});
