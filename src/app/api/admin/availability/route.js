import { z } from 'zod';
import { endpoint, json, body } from '@/lib/booking/http.mjs';
import { getStore, readSettings } from '@/lib/booking/store.mjs';
import { settingsSchema } from '@/lib/booking/schema.mjs';
import { isMock } from '@/lib/booking/calendar.mjs';
import { fail } from '@/lib/booking/service.mjs';
export const runtime='nodejs';
export const GET=endpoint(async()=>json({...await readSettings(),calendar:isMock()?'synthetic':(await getStore().query('SELECT id FROM booking_tokens WHERE id=1')).rowCount?'connected (not health checked)':'disconnected'}),{admin:true});
export const PUT=endpoint(async request=>{
  const value=z.object({version:z.number().int(),settings:settingsSchema}).strict().parse(await body(request));
  const db=getStore();
  const updated=await db.query('UPDATE booking_settings SET body=$1,version=version+1 WHERE id=1 AND version=$2',[JSON.stringify(value.settings),value.version]);
  if(!updated.rowCount) fail(409,'Settings changed elsewhere. Reload and review your edits.');
  return json({...await readSettings(),reservationCount:(await db.query('SELECT COUNT(*) AS n FROM booking_reservations WHERE status!=\'rejected\' AND "end">$1',[Date.now()])).rows[0].n});
},{admin:true,write:true,bucket:'settings',max:30});
