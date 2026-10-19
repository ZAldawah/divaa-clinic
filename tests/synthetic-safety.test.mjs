import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { databaseUrl, assertLocalDatabase } from '../src/lib/booking/synthetic.mjs';
import { previewCatalog, previewSettings } from '../src/lib/booking/preview-catalog.mjs';
import { settingsSchema } from '../src/lib/booking/schema.mjs';
import { slotsFor } from '../src/lib/booking/slots.mjs';
import { seedSynthetic } from '../src/lib/booking/store.mjs';

const isolated='postgresql://synthetic@127.0.0.1:55419/divaa_synthetic_review';
test('synthetic runtime never falls back to DATABASE_URL', () => {
  const env={DATABASE_URL:'postgresql://real.invalid/live?sslmode=verify-full',BOOKING_ALLOW_SYNTHETIC:'true'};
  for(const value of [undefined,'','postgresql://remote.invalid/divaa_synthetic_review','postgresql://127.0.0.1:55419/real','postgresql://localhost:55419/divaa_synthetic_review',isolated+'?host=remote.invalid']) {
    assert.throws(()=>databaseUrl({...env,BOOKING_SYNTHETIC_DATABASE_URL:value}));
  }
  assert.equal(databaseUrl({...env,BOOKING_SYNTHETIC_DATABASE_URL:isolated}),isolated);
  assert.throws(()=>databaseUrl({DATABASE_URL:isolated,BOOKING_CALENDAR_MODE:'mock'}));
  assert.throws(()=>databaseUrl({BOOKING_SYNTHETIC_DATABASE_URL:isolated}));
  assert.equal(databaseUrl({DATABASE_URL:env.DATABASE_URL}),env.DATABASE_URL);
  assert.throws(()=>assertLocalDatabase('postgresql://remote.invalid/postgres',{named:false}));
});
test('synthetic CLI exits before migration without explicit isolated override', () => {
  const env={...process.env,DATABASE_URL:'postgresql://127.0.0.1:1/live',BOOKING_ALLOW_SYNTHETIC:'true'};
  delete env.BOOKING_SYNTHETIC_DATABASE_URL;
  const child=spawnSync(process.execPath,['scripts/booking-setup.mjs','--synthetic'],{env,encoding:'utf8',windowsHide:true});
  assert.notEqual(child.status,0);
  assert.match(child.stderr,/Explicit isolated synthetic database URL is required/);
  assert.doesNotMatch(child.stderr,/ECONNREFUSED/);
});
test('fixture seeder rejects a real target before executing a query', async () => {
  let calls=0;
  await assert.rejects(seedSynthetic({options:{connectionString:'postgresql://real.invalid/live'},query(){calls++;}}));
  assert.equal(calls,0);
});
test('preview catalog covers website groups plus Consulting and labels missing facts', () => {
  settingsSchema.parse(previewSettings);
  assert.equal(previewCatalog.length,10);
  assert.equal(new Set(previewCatalog.map(s=>s.id)).size,10);
  for(const service of previewCatalog) {
    assert.match(service.priceNote,/test placeholder/);
    if(!service.publishedDuration)assert.match(service.durationNote,/Test placeholder/);
  }
});
test('preview offers only Saturday 10–16 Chicago and respects service duration', () => {
  const now=Date.parse('2026-10-07T00:00Z');
  for(const s of previewSettings.services) {
    const args={settings:previewSettings,serviceId:s.id,now};
    for(const date of ['2026-10-08','2026-10-09','2026-10-11','2026-10-12'])assert.equal(slotsFor({...args,date}).length,0);
    const slots=slotsFor({...args,date:'2026-10-10'});
    assert.equal(slots[0].start,'2026-10-10T15:00:00.000Z');
    assert.equal(slots.at(-1).end,'2026-10-10T21:00:00.000Z');
    assert.equal(Date.parse(slots[0].end)-Date.parse(slots[0].start),s.duration*60000);
  }
});
