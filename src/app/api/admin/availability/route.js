import { z } from 'zod';
import { endpoint, json, body } from '@/lib/booking/http.mjs';
import { getStore, readSettings } from '@/lib/booking/store.mjs';
import { settingsSchema } from '@/lib/booking/schema.mjs';
import { isMock } from '@/lib/booking/calendar.mjs';
import { fail } from '@/lib/booking/service.mjs';
export const runtime='nodejs';
export const GET=endpoint(async()=>json({...readSettings(),calendar:isMock()?'synthetic':getStore().prepare('SELECT id FROM booking_tokens WHERE id=1').get()?'connected (not health checked)':'disconnected'}),{admin:true});
export const PUT=endpoint(async request=>{
  const value=z.object({version:z.number().int(),settings:settingsSchema}).strict().parse(await body(request));
  const db=getStore();
  const updated=db.prepare('UPDATE booking_settings SET body=?,version=version+1 WHERE id=1 AND version=?').run(JSON.stringify(value.settings),value.version);
  if(!updated.changes) fail(409,'Settings changed elsewhere. Reload and review your edits.');
  return json({...readSettings(),reservationCount:db.prepare("SELECT COUNT(*) AS n FROM booking_reservations WHERE status!='rejected' AND end>?").get(Date.now()).n});
},{admin:true,write:true,bucket:'settings',max:30});
