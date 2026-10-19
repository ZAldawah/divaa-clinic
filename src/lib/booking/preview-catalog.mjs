// Website route inventory checked 2026-10-07. Durations below are source-page
// appointment times, NOT outcome duration, recovery time or number of sessions.
// For published ranges the upper endpoint is a conservative TEST slot choice.
export const previewCatalog = [
  ['consulting', 'Consulting', 30, null, null],
  ['botox', 'Botox & Dysport', 30, '15–30 minutes', '/botox'],
  ['filler', 'Dermal Fillers', 45, '45 minutes', '/filler'],
  ['radiesse', 'Radiesse', 60, null, '/radiesse'],
  ['sculptra', 'Sculptra', 60, null, '/sculptra'],
  ['prp', 'PRP Treatment', 45, '45 minutes', '/prp'],
  ['rrf', 'Radiofrequency Facial', 90, '60–90 minutes', '/rrf'],
  ['facials', 'Facials & Hydrofacials', 60, '45–60 minutes', '/facials'],
  ['microneedling', 'Microneedling', 60, '60 minutes', '/microneedling'],
  ['collagen', 'Collagen & Biostimulators', 60, null, '/collagen'],
].map(([id, name, duration, publishedDuration, source]) => ({
  id, name, duration, publishedDuration, source,
  durationNote: publishedDuration ? `Website: ${publishedDuration}. Test slot: ${duration} minutes.` : `Test placeholder: ${duration} minutes; clinic duration unconfirmed.`,
  priceNote: 'Price not configured; test placeholder, no payment collected.',
}));

export const previewSettings = {
  timezone: 'America/Chicago',
  weekly: Array.from({length: 7}, (_, i) => i === 5 ? [{start:'10:00', end:'16:00'}] : []),
  overrides: [],
  services: previewCatalog.map(({id,name,duration}) => ({id,name,duration,before:0,after:0,enabled:true})),
  noticeMinutes: 0, horizonDays: 60, incrementMinutes: 30,
};
