const descriptions = {
  botox: 'Gloved finger indicating the forehead',
  filler: 'Close view of cheek and lips during facial assessment',
  radiesse: 'Gloved finger indicating the back of a resting hand',
  sculptra: 'Woman looking toward a handheld mirror',
  rrf: 'Gloved finger indicating the jawline',
  facials: 'Facial mask being brushed onto a cheek',
  collagen: 'Close view of natural cheek skin texture',
  prp: 'Two capped empty collection tubes beside gauze',
  microneedling: 'Capped pen-shaped skincare instrument resting on gauze',
};
export const hasServiceImage = id => Object.hasOwn(descriptions, id);
const widths = [384, 768, 1152, 1536];
const cardSizes = '(max-width: 600px) calc(100vw - 34px), (max-width: 900px) calc((100vw - 72px) / 2), (max-width: 1168px) calc((100vw - 96px) / 3), 358px';
const detailSizes = '(max-width: 600px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 48px), (max-width: 1168px) calc((100vw - 96px) / 2.5), 429px';

// Preserve the independently reviewed encodings without optimizer recoding.
export default function ServiceImage({ serviceId, card = false }) {
  if (!hasServiceImage(serviceId)) return null;
  const base = '/images/services/' + serviceId;
  const srcSet = format => widths.map(w => base + '-' + w + '.' + format + ' ' + w + 'w').join(', ');
  const sizes = card ? cardSizes : detailSizes;
  return <picture className="service-image">
    <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
    <img src={base + '-1536.webp'} srcSet={srcSet('webp')} sizes={sizes} width={1536} height={1024} alt={card ? '' : descriptions[serviceId]} loading={card ? 'lazy' : 'eager'} fetchPriority={card ? 'auto' : 'high'} decoding="async" />
  </picture>;
}
