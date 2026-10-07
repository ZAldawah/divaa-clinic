import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { openStore } from '../src/lib/booking/store.mjs';
import { calendar } from '../src/lib/booking/calendar.mjs';
import { seal } from '../src/lib/booking/crypto.mjs';
test('Google adapter rejects partial/malformed responses, minimizes private event payload and fails closed on auth errors',async()=>{
  process.env.BOOKING_ENCRYPTION_KEY=randomBytes(32).toString('base64');
  process.env.GOOGLE_CALENDAR_ID='synthetic@example.test';process.env.GOOGLE_CLIENT_ID='synthetic';process.env.GOOGLE_CLIENT_SECRET='synthetic-test-only';process.env.BETTER_AUTH_URL='http://localhost:3111';process.env.BOOKING_CALENDAR_MODE='google';
  const db=openStore(':memory:');db.prepare('INSERT INTO booking_tokens VALUES(1,?)').run(seal('synthetic-test-token'));
  const original=OAuth2Client.prototype.getAccessToken,originalFetch=globalThis.fetch;
  OAuth2Client.prototype.getAccessToken=async()=>({token:'synthetic-test-token'});
  try {
    const cal=calendar(db);
    for(const data of [{},{calendars:{'synthetic@example.test':{errors:[{reason:'internalError'}],busy:[]}}},{calendars:{'synthetic@example.test':{busy:[{start:'bad',end:'bad'}]}}}]){
      globalThis.fetch=async()=>Response.json(data);await assert.rejects(cal.busy(0,86400000),{status:503});
    }
    globalThis.fetch=async()=>Response.json({calendars:{'synthetic@example.test':{busy:[{start:'2026-10-08T05:00:00Z',end:'2026-10-09T05:00:00Z'}]}}});
    assert.equal((await cal.busy(0,86400000))[0].end-(await cal.busy(0,86400000))[0].start,86400000);
    globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.visibility,'private');assert.equal(body.transparency,'opaque');assert.equal(body.summary,'Reserved appointment');assert.equal(body.attendees,undefined);assert.equal(body.description,undefined);assert(url.endsWith('sendUpdates=none'));return Response.json(body);};
    assert.deepEqual(await cal.insert({id:'abc123',start:1000,end:2000}),{id:'abc123',start:1000,end:2000});
    OAuth2Client.prototype.getAccessToken=async()=>{throw new Error('invalid_grant with sensitive detail');};await assert.rejects(cal.busy(0,86400000),e=>e.status===503 && !e.message.includes('sensitive'));
  } finally {OAuth2Client.prototype.getAccessToken=original;globalThis.fetch=originalFetch;db.close();}
});
