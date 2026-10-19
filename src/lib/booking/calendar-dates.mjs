import { Temporal } from '@js-temporal/polyfill';
import { dayBounds, slotsFor } from './slots.mjs';

export function availableDatesForMonth({month,service,settings,busy=[],now=Date.now()}) {
  const first=Temporal.PlainYearMonth.from(month).toPlainDate({day:1});
  const start=first.subtract({days:first.dayOfWeek-1});
  if(!settings.services.some(item=>item.id===service && item.enabled)) return [];
  const today=Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO(settings.timezone).toPlainDate();
  const available=[];
  for(let i=0;i<42;i++) {
    const plainDate=start.add({days:i});
    if(Temporal.PlainDate.compare(plainDate,today)<0 || Temporal.PlainDate.compare(plainDate,today.add({days:settings.horizonDays}))>0) continue;
    const date=plainDate.toString();
    const hours=settings.overrides.find(item=>item.date===date)?.intervals ?? settings.weekly[plainDate.dayOfWeek-1];
    if(!hours.length) continue;
    const [min,max]=dayBounds(date,settings.timezone);
    if(slotsFor({settings,date,serviceId:service,busy:busy.filter(item=>item.start<max && item.end>min),now}).length) available.push(date);
  }
  return available;
}
