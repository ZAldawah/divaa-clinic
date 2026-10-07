import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { settingsSchema, syntheticSettings } from './schema.mjs';
import { databaseUrl, assertLocalDatabase } from './synthetic.mjs';
pg.types.setTypeParser(20, value => { const n=Number(value); if(!Number.isSafeInteger(n)) throw new Error('Database integer out of range.'); return n; });
let singleton;
export function openStore(connectionString) {
  if(!connectionString) throw new Error('DATABASE_URL is required.');
  const url=new URL(connectionString);
  const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if(!local && url.searchParams.get('sslmode')!=='verify-full') throw new Error('Database certificate verification is required.');
  const pool=new pg.Pool({connectionString,max:5,idleTimeoutMillis:10000,connectionTimeoutMillis:3000,statement_timeout:5000,lock_timeout:2000});
  pool.on('error',()=>{});
  if(process.env.VERCEL) attachDatabasePool(pool);
  return pool;
}
export function getStore(){return singleton ||= openStore(databaseUrl());}
export async function transaction(db,fn) {
  const c=await db.connect();
  try {await c.query('BEGIN');const value=await fn(c);await c.query('COMMIT');return value;}
  catch(e){await c.query('ROLLBACK');throw e;} finally{c.release();}
}
export async function readSettings(db=getStore(),lock=false) {
  const {rows:[r]}=await db.query(`SELECT * FROM booking_settings WHERE id=1${lock?' FOR UPDATE':''}`);
  if(!r) throw Object.assign(new Error('Scheduling is not configured.'),{status:503});
  return {version:r.version,settings:settingsSchema.parse(JSON.parse(r.body))};
}
export async function seedSynthetic(db=getStore(), settings=syntheticSettings){
 assertLocalDatabase(db.options?.connectionString);
 await db.query('INSERT INTO booking_settings VALUES(1,1,$1) ON CONFLICT DO NOTHING',[JSON.stringify(settingsSchema.parse(settings))]);
}
export async function reservations(db,min,max) {
  return (await db.query("SELECT occupied_start AS start, occupied_end AS end FROM booking_reservations WHERE status != 'rejected' AND occupied_start < $1 AND occupied_end > $2",[Math.min(max,8640000000000000),Math.max(min,-8640000000000000)])).rows;
}
export async function limit(db,key,max,window=60000) {
  const {rows:[r]}=await db.query(`INSERT INTO booking_limits AS l VALUES($1,1,clock_timestamp()+$2*interval '1 millisecond')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN l.expires<=clock_timestamp() THEN 1 ELSE l.count+1 END,
    expires=CASE WHEN l.expires<=clock_timestamp() THEN EXCLUDED.expires ELSE l.expires END RETURNING count`,[key,window]);
  if(r.count>max) throw Object.assign(new Error('Too many requests. Please try later.'),{status:429});
}

export async function consumeOAuthState(db,hash,sessionId) {
 return (await db.query('DELETE FROM booking_oauth_state WHERE hash=$1 AND session_id=$2 AND expires>extract(epoch FROM clock_timestamp())*1000 RETURNING *',[hash,sessionId])).rows[0];
}
