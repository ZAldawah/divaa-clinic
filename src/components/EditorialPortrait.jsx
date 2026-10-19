const widths = [384, 768, 1152, 1536];
const sizesByPlacement = {
  hero: '(max-width: 600px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 48px), (max-width: 1168px) calc((100vw - 96px) / 2.1), 511px',
  detail: '(max-width: 600px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 48px), (max-width: 1168px) calc((100vw - 96px) / 2.5), 429px',
  directory: '(max-width: 600px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 48px), (max-width: 1168px) calc((100vw - 80px) / 3), 363px',
};

// Native picture preserves the independently reviewed bytes; no optimizer recoding.
export default function EditorialPortrait({ variant = 'warm', placement = 'hero', priority = false }) {
  const base = `/images/editorial/portrait-${variant}`;
  const srcSet = format => widths.map(width => `${base}-${width}.${format} ${width}w`).join(', ');
  return <figure className="editorial-portrait">
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizesByPlacement[placement]} />
      <img src={`${base}-1536.webp`} srcSet={srcSet('webp')} sizes={sizesByPlacement[placement]} width={1536} height={1024} alt="" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    </picture>
  </figure>;
}
