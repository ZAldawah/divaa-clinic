import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
const origin='http://127.0.0.1:3111';
// Ephemeral synthetic credentials, generated for this test process only.
if(!process.env.BOOKING_TEST_RUN_ID) {
process.env.BOOKING_TEST_RUN_ID=String(Date.now());
process.env.BETTER_AUTH_URL=origin;
process.env.BETTER_AUTH_SECRET=randomBytes(48).toString('base64');
process.env.BOOKING_ENCRYPTION_KEY=randomBytes(32).toString('base64');
process.env.BOOKING_ADMIN_EMAIL='staff@example.test';
process.env.BOOKING_ADMIN_PASSWORD=randomBytes(24).toString('base64');
process.env.BOOKING_DB_PATH=resolve(process.env.PAPERCLIP_RUN_SCRATCH_DIR || '.data',`test-${Date.now()}.sqlite`);
process.env.BOOKING_CALENDAR_MODE='mock';
process.env.BOOKING_ALLOW_SYNTHETIC='true';
}
export default defineConfig({
  testDir:'./tests/browser',workers:1,retries:0,timeout:30000,
  use:{baseURL:origin,channel:'msedge',headless:true},
  webServer:{command:'node scripts/booking-test-server.mjs',url:origin,timeout:60000,reuseExistingServer:false},
  reporter:[['list']],
});

