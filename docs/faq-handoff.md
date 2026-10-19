# Per-service FAQ implementation and image integration preparation

Status: local review candidate, not clinical approval or final site acceptance.

## FAQ change and provenance

All nine service routes (botox, filler, radiesse, sculptra, prp, rrf, facials, microneedling, collagen) now render six route-specific questions/answers (54 total). Shared ServiceFaq server component is placed after the service hero and before next-step actions. Headings use h2/h3; answers stay visible with no disclosure controls or JavaScript requirement. Existing focus-visible styling applies to real citation and consultation links. At <=900px the FAQ becomes one column; 320px layout retains the site's 16px side spacing and 16px body text. Rendered mobile fit is pending.

Content source: AGE-24 route-content-journeys revision 62a5cd31-46d7-47ec-b859-c8cdc23de3bb, accessed 2026-10-08. src/lib/service-faqs.json retains each answer's source IDs, source URL/access date and source revision. Patient UI excludes internal claim IDs/editorial notes and exposes readable source titles in Further reading. No FAQ structured data was added; no stale FAQPage markup exists in the current source.

Scope: definitions; consultation/suitability; preparation; expectations; aftercare/risks; booking. No restored legacy FAQ assertions, prices, duration/longevity ranges, credentials, guarantees or policies. No consultation fee or guaranteed availability implied. Booking links use /book?service=consulting, matching the existing config ID and BookingFlow query selection; actual loaded UI selection remains a host check. No medical history fields or tracking added.

Source text was researched by CX; Developer independently opened FDA filler/microneedling/RF guidance, manufacturer Botox/Radiesse/Sculptra information, AAD PRP/injectable/microneedling guidance and Cleveland Clinic facial guidance. This is source checking, not clinical review. AGE-29 independent review revision ed56ce99-6287-444c-834a-394ee4337ebc is complete; C1–C3 adopted (fuller urgent filler warning with FDA stroke-symptom link, removed unverified Sculptra booking commitment, direct manufacturer safety source, attributed PRP evidence statement); CEO must arrange qualified clinical review. Exact clinic products, RF device/method, PRP vs PRF, collagen grouping and protocols remain unresolved across their respective routes. All nine routes remain source-grounded local drafts with qualified clinical/clinic-specific approval pending. AGE-29 passed bounded educational claims on Botox, RF, facials, microneedling and collagen; requested corrections for filler, Radiesse, Sculptra and PRP, now applied. Independent confirmation of adoption is requested.

Implementation guidance: installed Next 16.4 docs, node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md; official https://nextjs.org/docs/app/getting-started/server-and-client-components. Keep data/markup server-rendered without an unnecessary client boundary. Existing packages reused; no dependency added.

## Checks and limits

- npm run lint: pass.
- next build --webpack: pass in fresh run-scratch faq-build, copied source/public/config only, existing dependency junction; no .env files copied, no database URL, analytics disabled. All 13 routes, global 404 and nine APIs compile. Live preview and its .next were untouched.
- Production HTML parser: nine pages, six FAQ articles each; every expected question/answer visible outside scripts; one h1; unique IDs and resolved aria-labelledby targets; required citation URLs and consultation target present; no editorial/DRAFT/TODO markers. PASS. docs/faq-build-audit.json records per-route results and HTML/gzip byte counts. These are artifact sizes, not measured LCP/CLS/INP.
- git diff --check: pass. No booking/API/auth/session/recovery/analytics source changes. Prior 68-test results remain scoped to parent 31b4819; not relabeled as a rerun.
- No Comet/Chrome control tools exposed. No browser, screenshot, focus, zoom, reflow or runtime performance result claimed. Always-visible answers eliminate FAQ toggle behavior, but source/CTA link keyboard activation, visible focus, reading order, navigation and 320/390/768/1440 rendering still need host verification.
- Host/Designer: record exact commit and dirty state, runtime, route/state, DOM viewport and actual raster size separately; verify six FAQs per route, long heading/source-link wrap, no clipping, consultation selection and return navigation. Include representative 200% zoom/reflow and keyboard focus. Reuse existing host interaction; no new baseline batch.

## Additive inventory / cleanup

Before edit: all nine public detail page files import ServiceLayout; no current per-service FAQ component/data. ServiceLayout is the sole insertion point. New ServiceFaq imports only service-faqs.json; ServiceLayout uses it once. Added .service-faq/.faq-* rules are used by this component, with existing type/color/focus tokens. No deletions, renamed routes, package changes or speculative cleanup. Protected untracked AGENTS.md preserved. No preview restart, push, merge, deployment or timer changes.

## Bounded image integration preparation

New image directive acknowledged from CEO on AGE-26; AGE-31 source/crop pass list was empty at handoff. No generated asset integrated.

| Insertion point | Existing structure / proposed responsive sizing | Conditions / checks |
| --- | --- | --- |
| Home hero | .hero-art beside copy; two columns until 600px, then full width. Current 1120px content cap. Proposed sizes: (max-width: 600px) calc(100vw - 32px), (max-width: 1168px) calc((100vw - 48px) / 2), 560px; reconcile exact Designer column ratio. | Only approved exact file/hash and desktop/mobile crop; explicit intrinsic ratio; prioritize only actual LCP image; preserve hero text/CTA contrast. |
| Service hero | Shared .service-mark currently 1fr beside 1.5fr copy; full width <=600px. Use shared image config keyed by existing service ID. | No false procedure/outcome/patient/staff implication; decorative alt empty or honest illustrative description; Designer owns final ratios/crops. |
| Service cards | Three columns desktop, two <=900px, one <=600px; current text links and labels already provide purpose. | Decorative images with empty alt when redundant; lazy load below-fold images; preserve full-card anchor and focus; do not add nested links. |
| FAQ / page rhythm | FAQ is text-only, two columns to 900px then one; spacing uses existing tokens. | Avoid pictures between question and answer or a competing booking CTA; Designer can tighten section spacing after actual captures. |
| Booking/admin/privacy | Functional surfaces preserved. | No decorative asset insertion that increases task friction. |

Use local reviewed files through Next image optimization where appropriate; inspect actual file dimensions/type/hash, generate no unapproved crops, keep explicit sizes to avoid overfetch and intrinsic dimensions to avoid layout shift. Compression/format and srcset widths must follow supplied assets; no invented byte budget results. Track original/license/provenance, source/crop verdict, output hash, dimensions, alt text and intended placement in final asset manifest. Measure actual responsive network transfer, LCP/CLS and readability with host after integration. Independent image approval is separate from final placement/site/owner approval.

Next owners: AGE-29 correction-adoption confirmation; AGE-25 host visuals and concrete Designer image handoff plus AGE-31 crop/source passes; Developer integrates fixes/approved imagery; CEO arranges clinical and final interactive local owner review. Stopped scheduler and all local-only restrictions remain.
