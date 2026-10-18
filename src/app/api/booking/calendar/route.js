import { endpoint, json } from '@/lib/booking/http.mjs';
import { getStore, readSettings, reservations } from '@/lib/booking/store.mjs';
import { calendar } from '@/lib/booking/calendar.mjs';
import { dayBounds } from '@/lib/booking/slots.mjs';
import { availableDatesForMonth } from '@/lib/booking/calendar-dates.mjs';
import { Temporal } from '@js-temporal/polyfill';

export const runtime='nodejs';

// One bounded six-week calendar read. Every marked date comes from the same
// availability rules used by the selected-time and reservation endpoints.
export const GET=endpoint(async request=>{
  const params=new URL(request.url).searchParams;
  const month=params.get('month'), service=params.get('service');
  if(!/^\d{4}-\d{2}$/.test(month||'') || !/^[a-z0-9-]{1,40}$/.test(service||''))
    return json({error:'Choose a valid month and service.'},400);
  try { Temporal.PlainYearMonth.from(month); }
  catch { return json({error:'Choose a valid month and service.'},400); }
  const db=getStore(), {settings}=await readSettings(db);
  const first=Temporal.PlainYearMonth.from(month).toPlainDate({day:1});
  const start=first.subtract({days:first.dayOfWeek-1});
  const end=start.add({days:42});
  const [min]=dayBounds(start.toString(),settings.timezone);
  const [,max]=dayBounds(end.toString(),settings.timezone);
  const [busy,booked]=await Promise.all([calendar(db).busy(min,max),reservations(db,min,max)]);
  return json({month,availableDates:availableDatesForMonth({month,service,settings,busy:[...busy,...booked]})});
},{bucket:'availability-calendar',max:60});
