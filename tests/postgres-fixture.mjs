import { randomUUID } from 'node:crypto';
import { openStore } from '../src/lib/booking/store.mjs';
import { migrate } from '../scripts/booking-migrate.mjs';
export async function testStore(){
 if(!process.env.BOOKING_TEST_DATABASE_URL)throw new Error('Supply a disposable PostgreSQL BOOKING_TEST_DATABASE_URL; no SQLite fallback.');
 const admin=openStore(process.env.BOOKING_TEST_DATABASE_URL),name=`age11_test_${randomUUID().replaceAll('-','')}`;
 await admin.query(`CREATE DATABASE "${name}"`);await admin.end();
 const url=new URL(process.env.BOOKING_TEST_DATABASE_URL);url.pathname=`/${name}`;
 const db=openStore(url.href);db.testUrl=url.href;await migrate(db);return db;
}
