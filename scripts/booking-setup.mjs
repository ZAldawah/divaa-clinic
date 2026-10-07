import { randomUUID } from 'node:crypto';
import { getMigrations } from 'better-auth/db/migration';
import { hashPassword } from 'better-auth/crypto';
import { getAuth } from '../src/lib/booking/auth.mjs';
import { getStore,seedSynthetic } from '../src/lib/booking/store.mjs';
import { readFileSync } from 'node:fs';
import { settingsSchema } from '../src/lib/booking/schema.mjs';
const db=getStore(),{runMigrations}=await getMigrations(getAuth().options);await runMigrations();
if(process.argv.includes('--config')) {
  const path=process.argv[process.argv.indexOf('--config')+1];
  const settings=settingsSchema.parse(JSON.parse(readFileSync(path,'utf8')));
  db.prepare('INSERT INTO booking_settings VALUES(1,1,?)').run(JSON.stringify(settings));
}
if(process.argv.includes('--synthetic')) {
  if(process.env.BOOKING_ALLOW_SYNTHETIC!=='true')throw new Error('Synthetic setup must be explicitly enabled.');
  seedSynthetic(db);
}
if(process.argv.includes('--admin')) {
  const email=process.env.BOOKING_ADMIN_EMAIL,password=process.env.BOOKING_ADMIN_PASSWORD;
  if(!email || !password || password.length<14)throw new Error('Provide admin email and a strong password through secure environment injection.');
  const id=randomUUID(),now=Date.now(),hash=await hashPassword(password);
  db.transaction(()=>{
    db.prepare('INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES(?,?,?,?,?,?)').run(id,'Clinic administrator',email.toLowerCase(),1,now,now);
    db.prepare('INSERT INTO account(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),id,'credential',id,hash,now,now);
    db.prepare('INSERT INTO booking_admins VALUES(?)').run(id);
  }).immediate();
}
console.log('Booking schema/setup complete. No credentials printed.');db.close();
