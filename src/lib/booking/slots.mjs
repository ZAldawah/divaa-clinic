import { Temporal } from '@js-temporal/polyfill';

export function dayBounds(date, zone) {
  const d=Temporal.PlainDate.from(date);
  return [d.toZonedDateTime(zone).epochMilliseconds,d.add({days:1}).toZonedDateTime(zone).epochMilliseconds];
}
export const overlaps=(a,b)=>a.start<b.end && b.start<a.end;
// Reject both occurrences of ambiguous wall times, and missing spring-forward times.
function uniqueWall(z) {
  try { return z.toPlainDateTime().toZonedDateTime(z.timeZoneId,{disambiguation:'reject'}).epochMilliseconds===z.epochMilliseconds; } catch { return false; }
}
export function slotsFor({settings,date,serviceId,busy=[],now=Date.now()}) {
  const service=settings.services.find(s=>s.id===serviceId && s.enabled);
  if (!service) return [];
  const d=Temporal.PlainDate.from(date);
  const today=Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO(settings.timezone).toPlainDate();
  if(Temporal.PlainDate.compare(d,today)<0 || Temporal.PlainDate.compare(d,today.add({days:settings.horizonDays}))>0) return [];
  const hours=settings.overrides.find(r=>r.date===date)?.intervals ?? settings.weekly[d.dayOfWeek-1];
  const [min,max]=dayBounds(date,settings.timezone), out=[];
  for(let start=min;start<max;start+=60000) {
    const z=Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(settings.timezone);
    if((z.hour*60+z.minute)%settings.incrementMinutes || !uniqueWall(z) || start<now+settings.noticeMinutes*60000) continue;
    const end=start+service.duration*60000, occupied={start:start-service.before*60000,end:end+service.after*60000};
    const valid=hours.some(r=>{
      try {
        const open=d.toPlainDateTime(r.start).toZonedDateTime(settings.timezone,{disambiguation:'reject'}).epochMilliseconds;
        const close=d.toPlainDateTime(r.end).toZonedDateTime(settings.timezone,{disambiguation:'reject'}).epochMilliseconds;
        return occupied.start>=open && occupied.end<=close;
      } catch { return false; }
    });
    // Reject appointments crossing an offset change, including buffered span.
    const a=Temporal.Instant.fromEpochMilliseconds(occupied.start).toZonedDateTimeISO(settings.timezone);
    const b=Temporal.Instant.fromEpochMilliseconds(occupied.end-1).toZonedDateTimeISO(settings.timezone);
    if(valid && a.offset===b.offset && !busy.some(v=>overlaps(occupied,v))) out.push({start:new Date(start).toISOString(),end:new Date(end).toISOString()});
  }
  return out;
}
