import { z } from 'zod';
import { Temporal } from '@js-temporal/polyfill';
import { contactShape } from './contact-schema.mjs';

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  try { Temporal.PlainDate.from(v); return true; } catch { return false; }
});
const clock = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const intervals = z.array(z.object({ start: clock, end: clock }).strict()).max(4).superRefine((v, ctx) => {
  const sorted = [...v].sort((a,b) => a.start.localeCompare(b.start));
  sorted.forEach((r,i) => { if (r.start >= r.end || (i && sorted[i-1].end > r.start)) ctx.addIssue({ code:'custom', message:'Hours must be ordered, non-overlapping and within one day.' }); });
});
export const settingsSchema = z.object({
  timezone: z.string().max(80).refine(v => { try { Temporal.Now.zonedDateTimeISO(v); return true; } catch { return false; } }),
  weekly: z.array(intervals).length(7), // Monday first
  overrides: z.array(z.object({ date: dateSchema, intervals }).strict()).max(366).refine(v => new Set(v.map(r=>r.date)).size === v.length, 'One override per date.'),
  services: z.array(z.object({ id:z.string().regex(/^[a-z0-9-]{1,40}$/), name:z.string().trim().min(1).max(80), duration:z.number().int().min(5).max(240), before:z.number().int().min(0).max(120), after:z.number().int().min(0).max(120), enabled:z.boolean() }).strict()).min(1).max(20).refine(v=>new Set(v.map(s=>s.id)).size===v.length),
  noticeMinutes:z.number().int().min(0).max(43200), horizonDays:z.number().int().min(1).max(180), incrementMinutes:z.number().int().min(5).max(60),
}).strict();
export const bookingSchema = z.object({
  serviceId:z.string().max(40), start:z.iso.datetime(), ...contactShape, key:z.uuid(),
}).strict();
export const syntheticSettings = {
  timezone:'America/Chicago', weekly:Array.from({length:7},(_,i)=>i<5?[{start:'09:00',end:'17:00'}]:[]), overrides:[],
  services:[{id:'synthetic-consultation',name:'Synthetic consultation',duration:30,before:10,after:15,enabled:true}], noticeMinutes:1440,horizonDays:60,incrementMinutes:15,
};
