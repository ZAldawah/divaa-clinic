import { test,expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { openStore } from '../../src/lib/booking/store.mjs';
const origin='http://127.0.0.1:3111';
const output=resolve(process.env.PAPERCLIP_RUN_SCRATCH_DIR || 'test-results','booking-evidence');
mkdirSync(output,{recursive:true});
const headers={origin,'content-type':'application/json'};
test('HTTP access control, CSRF, data minimization, validation, admin conflict and expiry',async({request})=>{
  expect((await request.get('/api/admin/availability')).status()).toBe(401);
  expect((await request.post('/api/admin/reconcile',{headers,data:{}})).status()).toBe(401);
  expect((await request.post('/api/booking/reserve',{headers:{...headers,origin:'https://evil.example'},data:{}})).status()).toBe(403);
  expect((await request.post('/api/booking/reserve',{headers,data:{medicalNotes:'not allowed'}})).status()).toBe(400);
  const config=await (await request.get('/api/booking/config')).json();expect(Object.keys(config).sort()).toEqual(['horizonDays','services','synthetic','timezone']);
  expect((await request.post('/api/auth/sign-up/email',{headers,data:{email:'intruder@example.test',password:'Synthetic-intruder-only-123',name:'Intruder'}})).ok()).toBe(false);
  const login=await request.post('/api/auth/sign-in/email',{headers,data:{email:process.env.BOOKING_ADMIN_EMAIL,password:process.env.BOOKING_ADMIN_PASSWORD}});expect(login.status(),await login.text()).toBe(200);
  const cookie=login.headers()['set-cookie'];expect(cookie).toContain('HttpOnly');expect(cookie).toContain('SameSite=Lax');
  const settings=await (await request.get('/api/admin/availability')).json();expect(settings.version).toBe(1);
  expect((await request.put('/api/admin/availability',{headers:{...headers,origin:'https://evil.example'},data:{version:1,settings:settings.settings}})).status()).toBe(403);
  expect((await request.put('/api/admin/availability',{headers,data:{version:1,settings:settings.settings}})).status()).toBe(200);
  expect((await request.put('/api/admin/availability',{headers,data:{version:1,settings:settings.settings}})).status()).toBe(409);
  const db=openStore(process.env.DATABASE_URL);
  const admin=(await db.query('SELECT user_id FROM booking_admins')).rows[0];
  await db.query('DELETE FROM booking_admins');
  expect((await request.get('/api/admin/availability')).status()).toBe(403);
  expect((await request.post('/api/admin/reconcile',{headers,data:{}})).status()).toBe(403);
  await db.query('INSERT INTO booking_admins VALUES($1)',[admin.user_id]);
  await db.query('UPDATE session SET "expiresAt"=$1',[new Date(Date.now()-60000)]);
  expect((await request.get('/api/admin/availability')).status()).toBe(401);await db.end();
  expect((await request.post('/api/auth/sign-out',{headers,data:{}})).status()).toBe(200);
  expect((await request.get('/api/admin/availability')).status()).toBe(401);
});
for(const viewport of [{width:390,height:844},{width:1440,height:900}])test(`booking and admin at ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);const suffix=String(viewport.width);
  await page.goto('/book');await expect(page.getByText('Synthetic preview.',{exact:false})).toBeVisible();
  const metrics=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation').map(n=>({duration:n.duration,domContentLoaded:n.domContentLoadedEventEnd,transfer:n.transferSize})),resources:performance.getEntriesByType('resource').sort((a,b)=>b.duration-a.duration).slice(0,5).map(r=>({name:new URL(r.name).pathname,duration:r.duration,bytes:r.transferSize}))}));
  console.log(`Synthetic local load ${suffix}px: ${JSON.stringify(metrics)}`);
  await page.screenshot({path:resolve(output,`booking-service-${suffix}.png`),fullPage:true});
  await page.getByRole('radio',{name:/Synthetic consultation/}).check();await page.getByRole('button',{name:'Choose date and time'}).click();
  const date=new Date();date.setUTCDate(date.getUTCDate()+3);while([0,6].includes(date.getUTCDay()))date.setUTCDate(date.getUTCDate()+1);
  await page.getByLabel('Date',{exact:true}).fill(date.toISOString().slice(0,10));await expect(page.getByRole('radio').first()).toBeVisible();
  await page.getByRole('radio').first().focus();await page.keyboard.press('Space');await page.keyboard.press('Tab');
  await page.screenshot({path:resolve(output,`booking-slots-${suffix}.png`),fullPage:true});
  await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByLabel('Name',{exact:true}).fill('Avery Example');await page.getByLabel('Email',{exact:true}).fill('avery@example.test');await page.getByRole('button',{name:'Review appointment'}).click();
  await page.screenshot({path:resolve(output,`booking-review-${suffix}.png`),fullPage:true});await page.getByRole('button',{name:'Confirm appointment',exact:true}).click();await expect(page.getByRole('heading',{name:'Appointment confirmed'})).toBeVisible();
  await page.screenshot({path:resolve(output,`booking-confirmed-${suffix}.png`),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.setViewportSize(viewport);
  await page.goto('/admin/login');await page.screenshot({path:resolve(output,`admin-login-${suffix}.png`),fullPage:true});
  await page.getByLabel('Email',{exact:true}).fill(process.env.BOOKING_ADMIN_EMAIL);await page.getByLabel('Password',{exact:true}).fill(process.env.BOOKING_ADMIN_PASSWORD);await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page.getByLabel('IANA timezone')).toHaveValue('America/Chicago');
  await page.getByLabel('Minimum notice (minutes)').fill(viewport.width===390?'120':'180');await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('status')).toContainText(['Saved.','No unsaved changes']);
  await page.screenshot({path:resolve(output,`admin-availability-${suffix}.png`),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByRole('heading',{name:'Staff sign in'})).toBeVisible();
});
test('synthetic error and unknown-outcome screens preserve contact and retry key',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/book');await page.getByRole('radio',{name:/Synthetic consultation/}).check();await page.getByRole('button',{name:'Choose date and time'}).click();
  let state='outage';
  await page.route('**/api/booking/slots?*',route=>route.fulfill({status:state==='outage'?503:200,json:state==='outage'?{error:'We cannot check availability right now.'}:{slots:state==='empty'?[]:[{start:'2026-10-12T14:15:00.000Z',end:'2026-10-12T14:45:00.000Z'}]}}));
  await page.getByLabel('Date',{exact:true}).fill('2026-10-12');await expect(page.locator('main [role=alert]')).toContainText('cannot check');await page.screenshot({path:resolve(output,'booking-outage-390.png'),fullPage:true});
  state='empty';await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('status')).toContainText('No appointments');await page.screenshot({path:resolve(output,'booking-empty-390.png'),fullPage:true});
  state='available';await page.getByLabel('Date',{exact:true}).fill('2026-10-13');await page.getByRole('radio').first().check();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByLabel('Name',{exact:true}).fill('Avery Example');await page.getByLabel('Email',{exact:true}).fill('avery@example.test');await page.getByRole('button',{name:'Review appointment'}).click();
  const bodies=[];await page.route('**/api/booking/reserve',route=>{bodies.push(route.request().postDataJSON());return route.fulfill({status:202,json:{reference:'synthetic-pending-reference',status:'pending',start:'2026-10-12T14:15:00.000Z',end:'2026-10-12T14:45:00.000Z'}});});
  await page.getByRole('button',{name:'Confirm appointment',exact:true}).click();await expect(page.getByRole('heading',{name:'Confirmation pending'})).toBeVisible();await page.screenshot({path:resolve(output,'booking-pending-390.png'),fullPage:true});await page.getByRole('button',{name:'Check confirmation'}).click();expect(bodies).toHaveLength(2);expect(bodies[0]).toEqual(bodies[1]);
});



test('public document is unloaded entering booking/admin; no private telemetry or contact URLs',async({page})=>{
 const telemetry=[];
 page.on('request',r=>{if(/google-analytics|googletagmanager|synthetic-telemetry/.test(r.url()))telemetry.push(r.url());});
 await page.route('**/synthetic-telemetry*',r=>r.fulfill({status:204,body:''}));
 await page.goto('/');
 // Synthetic public tag models a previously loaded script without sending data to Google.
 await page.evaluate(()=>{window.publicTagProbe=true;window.publicProbeTimer=setInterval(()=>fetch('/synthetic-telemetry'),50);});
 await expect.poll(()=>telemetry.length).toBeGreaterThan(0);
 await page.locator('a[href="/book"]').first().click();await expect(page.getByRole('heading',{name:/Book/}).first()).toBeVisible();
 expect(await page.evaluate(()=>window.publicTagProbe)).toBeUndefined();
 const count=telemetry.length;await page.waitForTimeout(200);expect(telemetry.length).toBe(count);
 await page.goto('/admin/login');expect(await page.evaluate(()=>window.publicTagProbe)).toBeUndefined();
 await page.getByLabel('Email',{exact:true}).fill('avery@example.test');
 expect(page.url()).not.toContain('avery');expect(telemetry.every(v=>!v.includes('avery'))).toBe(true);
 expect(await page.locator('script[src*="googletagmanager"],script[src*="google-analytics"]').count()).toBe(0);
});

test('scheduler authentication and public auth quota enforce fail-closed boundaries',async({request})=>{
 expect((await request.post('/api/internal/recover',{data:{}})).status()).toBe(401);
 expect((await request.post('/api/internal/recover',{headers:{authorization:'Bearer invalid'},data:{}})).status()).toBe(401);
 expect((await request.post('/api/internal/recover',{headers:{authorization:`Bearer ${process.env.BOOKING_JOB_SECRET}`},data:{}})).status()).toBe(200);
 const responses=[];for(let i=0;i<17;i++)responses.push((await request.post('/api/auth/sign-in/email',{headers,data:{email:'unknown@example.test',password:'Synthetic-invalid-password'}})).status());
 expect(responses).toContain(429);expect(responses.at(-1)).toBe(429);
 expect((await request.get('/api/booking/config')).status()).toBe(200);
});
