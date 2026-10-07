// Foreground host/managed-runtime entrypoint. Never loads .env.local itself.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { syntheticDatabase } from '../src/lib/booking/synthetic.mjs';
import { openStore } from '../src/lib/booking/store.mjs';
const database=syntheticDatabase(); // Must succeed BEFORE spawning setup or Next.
const check=openStore(database);
try {
 if((await check.query("SELECT 1 FROM pg_tables WHERE schemaname='public' LIMIT 1")).rowCount)throw new Error('Local review requires a fresh empty synthetic database; no existing data will be reset.');
} finally {await check.end();}
if(!process.env.BOOKING_ADMIN_PASSWORD || process.env.BOOKING_ADMIN_PASSWORD.length<14)throw new Error('Host must inject a synthetic admin password (14+ characters); never put it in task comments.');
const env={...process.env,DATABASE_URL:database,BOOKING_SYNTHETIC_DATABASE_URL:database,
  BOOKING_CALENDAR_MODE:'mock',BOOKING_ALLOW_SYNTHETIC:'true',BETTER_AUTH_URL:'http://127.0.0.1:3119',
  BOOKING_ADMIN_EMAIL:'staff@example.test',BETTER_AUTH_SECRET:randomBytes(48).toString('base64'),
  BOOKING_ENCRYPTION_KEY:randomBytes(32).toString('base64'),BOOKING_RATE_KEY:randomBytes(32).toString('hex'),
  BOOKING_JOB_SECRET:randomBytes(32).toString('hex'),NEXT_TELEMETRY_DISABLED:'1',
  NEXT_PUBLIC_ANALYTICS_ENABLED:'true',NEXT_PUBLIC_ANALYTICS_PREVIEW:'true'};
// No inherited Google credentials or real ingress mode in synthetic child processes.
for(const key of Object.keys(env))if(key.startsWith('GOOGLE_') || key==='VERCEL' || key==='BOOKING_TRUSTED_EDGE')delete env[key];
async function run(args){return new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,args,{stdio:'inherit',env,windowsHide:true});
 const stop=()=>child.kill();process.once('SIGINT',stop);process.once('SIGTERM',stop);
 child.on('error',reject);child.on('exit',code=>{process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);code===0?resolve():reject(new Error(`Local child exited ${code}`));});
});}
// Use a fresh isolated DB for each review launch: auth/encryption keys are ephemeral.
await run(['scripts/booking-setup.mjs','--synthetic','--admin']);
delete env.BOOKING_ADMIN_PASSWORD;
await run(['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port','3119']);
