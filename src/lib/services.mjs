// Navigation names from the design brief. Backend IDs and timing stay separate.
export const services = [
  { id: 'botox', name: 'Botox' }, { id: 'filler', name: 'Dermal fillers' },
  { id: 'radiesse', name: 'Radiesse' }, { id: 'sculptra', name: 'Sculptra' },
  { id: 'prp', name: 'PRP' }, { id: 'rrf', name: 'Radiofrequency' },
  { id: 'facials', name: 'Facials' }, { id: 'microneedling', name: 'Microneedling' },
  { id: 'collagen', name: 'Collagen services' },
];
export function serviceMetadata(id) {
  const service = services.find(item => item.id === id);
  const title = service.name + ' | Divaa Beauty Clinic';
  const description = 'Explore ' + service.name + ' at Divaa Beauty Clinic. Text the clinic for help with booking, options, or questions.';
  return { title, description, alternates: { canonical: '/' + id }, openGraph: { title, description, url: 'https://www.divaabeauty.com/' + id, type: 'website' } };
}
