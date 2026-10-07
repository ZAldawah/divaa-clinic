import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { settingsSchema, syntheticSettings } from './schema.mjs';

let singleton;
export function getStore() {
  if (!singleton) singleton=openStore(process.env.BOOKING_DB_PATH || resolve('.data/booking.sqlite'));
  return singleton;
}
export function openStore(path) {
  if(path!==':memory:') mkdirSync(dirname(path),{recursive:true});
  const db=new Database(path); db.pragma('journal_mode = WAL'); db.pragma('busy_timeout = 5000'); db.pragma('foreign_keys = ON');
  db.exec(`CREATE TABLE IF NOT EXISTS booking_settings (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS booking_reservations (id TEXT PRIMARY KEY, request_hash TEXT NOT NULL, service_id TEXT NOT NULL, start INTEGER NOT NULL, end INTEGER NOT NULL, occupied_start INTEGER NOT NULL, occupied_end INTEGER NOT NULL, status TEXT NOT NULL, contact TEXT, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS booking_overlap ON booking_reservations(occupied_start,occupied_end,status);
    CREATE TABLE IF NOT EXISTS booking_admins (user_id TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS booking_tokens (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS booking_oauth_state (hash TEXT PRIMARY KEY, session_id TEXT NOT NULL, verifier TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS booking_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS booking_mock_events (id TEXT PRIMARY KEY, body TEXT NOT NULL);`);
  return db;
}
export function readSettings(db=getStore()) {
  const r=db.prepare('SELECT * FROM booking_settings WHERE id=1').get();
  if(!r) throw Object.assign(new Error('Scheduling is not configured.'),{status:503});
  return {version:r.version,settings:settingsSchema.parse(JSON.parse(r.body))};
}
export function seedSynthetic(db=getStore()) { db.prepare('INSERT OR IGNORE INTO booking_settings VALUES(1,1,?)').run(JSON.stringify(syntheticSettings)); }
export function reservations(db,min,max) {
  return db.prepare("SELECT occupied_start AS start, occupied_end AS end FROM booking_reservations WHERE status != 'rejected' AND occupied_start < ? AND occupied_end > ?").all(max,min);
}
export function limit(db,key,max,window=60000) {
  return db.transaction(()=>{
    const now=Date.now(); db.prepare('DELETE FROM booking_limits WHERE expires < ?').run(now);
    db.prepare('INSERT INTO booking_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+window);
    if(db.prepare('SELECT count FROM booking_limits WHERE key=?').get(key).count>max) throw Object.assign(new Error('Too many requests. Please try later.'),{status:429});
  }).immediate();
}
