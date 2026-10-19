// Bounded build-artifact checks. These are not browser/accessibility certification.
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { services } from '../src/lib/services.mjs';

const publicRoutes = ['/', ...services.map(item => '/' + item.id)];
const routes = [...publicRoutes, '/book', '/admin/login', '/admin/availability', '/_not-found'];
const known = new Set(routes);
const report = { provenance: 'Next build HTML/source checks, no browser interaction', routes: [], contrast: [] };
for (const route of routes) {
  const html = readFileSync(join('.next/server/app', (route === '/' ? 'index' : route.slice(1)) + '.html'), 'utf8');
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  assert.equal((markup.match(/<h1[ >]/g) || []).length, 1, route + ': one h1');
  assert.equal((markup.match(/<main[ >]/g) || []).length, 1, route + ': one main');
  assert.match(markup, /id="main-content"/, route + ': skip target');
  assert.match(markup, /href="#main-content"/, route + ': skip link');
  assert.match(markup, /aria-label="Main navigation"/, route + ': navigation');
  const links = [...markup.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
  for (const href of links) {
    if (href.startsWith('/') && !href.startsWith('//')) assert(known.has(href.split(/[?#]/)[0]), route + ': valid local link ' + href);
    if (href.startsWith('#')) assert(markup.includes('id="' + href.slice(1) + '"'), route + ': anchor ' + href);
  }
  if (publicRoutes.includes(route)) {
    assert(/rel="canonical" href="https:\/\/divaabeauty\.net(?:\/[^\"]*)?"/.test(markup), route + ': canonical domain');
    for (const service of services) assert(links.includes('/' + service.id), route + ': reachable ' + service.id);
    const text = markup.replace(/<[^>]*>/g, ' ');
    assert(!/lorem ipsum|top-rated|complimentary|master injectors|best seller|\$\d|TODO|placeholder/i.test(text), route + ': no unsupported/filler copy');
    assert(!markup.includes('application/ld+json'), route + ': unsupported clinical schema omitted');
  } else assert(!markup.includes('id="privacy-settings"'), route + ': privacy UI excluded');
  const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+\.(?:js|css))"/g)].map(match => match[1]))];
  const assetSizes = assets.map(url => {
    const path = join('.next', url.replace('/_next/', ''));
    const data = readFileSync(path);
    return { url, bytes: statSync(path).size, gzipBytes: gzipSync(data).length };
  });
  report.routes.push({ route, h1: 1, main: 1, links: links.length, htmlBytes: Buffer.byteLength(html), htmlGzipBytes: gzipSync(html).length, assets: assetSizes });
}
const luminance = hex => {
  const rgb = hex.match(/[\da-f]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
for (const [foreground, background, minimum] of [['111110', 'fef6f0', 4.5], ['3d3c39', 'ffffff', 4.5], ['8b2424', 'ffffff', 4.5], ['fef6f0', '1d201b', 4.5], ['81756b', 'ffffff', 3], ['554334', 'e5d8cb', 4.5]]) {
  const a = luminance(foreground), b = luminance(background), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  assert(ratio >= minimum, foreground + '/' + background + ': contrast');
  report.contrast.push({ foreground, background, ratio: Number(ratio.toFixed(2)), minimum });
}
writeFileSync('docs/redesign-static-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log('PASS: 13 routes and global 404; landmarks, local links, canonical domain, public content exclusions, private privacy exclusion, six token contrast pairs. Asset sizes saved; no runtime speed or visual claim.');
