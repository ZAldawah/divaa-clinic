import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { getStore,seedSynthetic,transaction } from '../src/lib/booking/store.mjs';
import { readFileSync } from 'node:fs';
import { settingsSchema } from '../src/lib/booking/schema.mjs';
import { migrate } from './booking-migrate.mjs';
import { syntheticDatabase } from '../src/lib/booking/synthetic.mjs';
import { previewSettings } from '../src/lib/booking/preview-catalog.mjs';
if(process.argv.includes('--synthetic')) syntheticDatabase(); // Before migration or any connection.
const db=getStore();await migrate(db);
if(process.argv.includes('--config')) {
 const path=process.argv[process.argv.indexOf('--config')+1];
 const settings=settingsSchema.parse(JSON.parse(readFileSync(path,'utf8')));
 await db.query('INSERT INTO booking_settings VALUES(1,1,$1)',[JSON.stringify(settings)]);
}
if(process.argv.includes('--synthetic')) {
 if(process.env.BOOKING_ALLOW_SYNTHETIC!=='true')throw new Error('Synthetic setup must be explicitly enabled.');
 await seedSynthetic(db,previewSettings);
}
if(process.argv.includes('--admin')) {
 const email=process.env.BOOKING_ADMIN_EMAIL,password=process.env.BOOKING_ADMIN_PASSWORD;
 if(!email || !password || password.length<14)throw new Error('Provide admin email and a strong password through secure environment injection.');
 const id=randomUUID(),now=new Date(),hash=await hashPassword(password);
 await transaction(db,async c=>{
  await c.query('INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6)',[id,'Clinic administrator',email.toLowerCase(),true,now,now]);
  await c.query('INSERT INTO account(id,"accountId","providerId","userId",password,"createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),id,'credential',id,hash,now,now]);
  await c.query('INSERT INTO booking_admins VALUES($1)',[id]);
 });
}
console.log('Booking schema/setup complete. No credentials printed.');await db.end();
