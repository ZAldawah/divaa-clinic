import { readFile } from 'node:fs/promises';
import { transaction } from '../src/lib/booking/store.mjs';
export async function migrate(db){
 await transaction(db,async c=>{
  await c.query('SELECT pg_advisory_xact_lock(11811001)');
  await c.query('CREATE TABLE IF NOT EXISTS booking_migrations(version integer PRIMARY KEY)');
  for(const [version,file] of [[1,'001-booking.sql'],[2,'002-auth.sql']]) {
   if(!(await c.query('SELECT version FROM booking_migrations WHERE version=$1',[version])).rowCount){
    await c.query(await readFile(new URL(`../migrations/${file}`,import.meta.url),'utf8'));
    await c.query('INSERT INTO booking_migrations VALUES($1)',[version]);
   }
  }
 });
}
