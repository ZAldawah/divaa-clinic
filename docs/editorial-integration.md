# Direction A integration handoff

Local candidate on age-26/redesign; parent 7b9a9ec6d38a92dd1f83d8cce3e3736dfce8ffbb. Owner opened the host window in comment 48159109-cb2e-4efc-a92f-9e1616cee4df. Sole writer; protected untracked AGENTS.md preserved. No restart, service/configuration change, push, merge, timer or release.

## Change and provenance

Home hero and all nine detail heroes use warm portrait; home service directory uses natural portrait. Shared server-rendered EditorialPortrait uses native picture AVIF/WebP at 384/768/1152/1536 widths, explicit 1536x1024 intrinsic ratio, contain/center, no clipping, no runtime recoding. Exact reviewed bytes are in public/images/editorial. docs/portrait-manifest.json records every exported hash, bytes, source hash/rectangle, encoding and approval revision. Original downloadable files: /api/attachments/651dddb5-bc98-4221-bf22-a2cb63c4b7af/content. No board/conversation pixels or PNG masters shipped.

Decorative empty alt with adjacent 14px disclosure at all 11 placements: “Illustrative generated models; not patients or treatment results.” Hero eager/high priority; directory lazy. sizes follows 1120px container and actual column fractions; tablet <=900px stacks, <=600px uses 16px gutters. Browser may select any listed export according to DPR; currentSrc remains host evidence. Maximum source resolution is 1536px: verify high-DPR tablet sharpness rather than claiming unlimited resolution. Intrinsic ratio reserves image space; no measured CLS/LCP claim.

Compact equal service cards keep h3/name/full-card anchor, minimum 96px height and one arrow. Two directory columns desktop/tablet, one narrow; desktop directory includes a full-frame image column. Editorial section spacing 48px desktop/32px narrow, current typography and 40px narrow service headings preserved. All nine services including Facials and 54 visible sourced answers remain; no FAQ wording or functional code changed. Booking/admin have no portraits.

## Usage-backed cleanup

Before edit, rg found hero-art/art-orbit/art-letter/art-caption only in Home and their CSS; service-mark only in ServiceLayout and its CSS; service-number only in Home and CSS. Replaced those two decorative marks and removed only their now-unused selectors, pseudo-elements and responsive overrides. Removed redundant service-card number and repeated “Explore service” text; service name remains the anchor label, arrow decorative. Removed forced 235/190px card heights and obsolete card-action span rule because that nested span no longer exists. Retained shared section-space outside bounded editorial sections, private styles, FAQ, all routes/dependencies and unrelated assets. No speculative removal.

## Verification

- Lint PASS; isolated production build PASS (source/public/config copied into run scratch, existing node_modules junction, no .env or database copied; live .next untouched).
- Production HTML checks PASS: 13 routes, 11 portraits with disclosures, intrinsic dimensions/srcsets/sizes/loading, 54 exact unchanged answers, six FAQ articles per detail route, consultation target and Facials retained. docs/editorial-build-audit.json.
- Existing redesign audit PASS: 13 routes + global 404, landmarks, links, content exclusions and six token contrast pairs. docs/editorial-static-audit.json. Asset sizes are not runtime timings.
- 16 application asset hashes independently matched both preparation manifest and reviewer register; maximum file 97,196 bytes. git diff --check PASS.
- Prior 68 regression passes retain parent 31b4819 scope. No booking/API/auth/recovery/analytics changes; not rerun for this presentation change.
- No Comet/Chrome controls; no rendered acceptance, focus/keyboard/reflow, blocked-image browser behavior or runtime performance pass. Standalone CSS parser attempt used an unavailable module path; production build successfully parsed/compiled CSS.

Guidance read: installed Next 16.4 node_modules/next/dist/docs/01-app/01-getting-started/12-images.md (public files, intrinsic dimensions, lazy loading), corresponding https://nextjs.org/docs/app/getting-started/images. Native picture intentionally preserves independently approved encodings instead of introducing optimizer-generated unreviewed bytes. No dependency added.

## Existing review path and runtime

Existing host-reported loopback http://127.0.0.1:3119 uses Next dev, isolated synthetic DB/mock Calendar/inert analytics; not restarted or newly runtime-verified here. Host must confirm served commit/dirty state before captures; no production-build binding inferred from scratch build.

Designer/host uses existing interaction 6cfabdbb-9d4c-41db-81bf-f23e34926ccb, returning through Developer interaction 25b414a2-b920-43bf-ad34-0bb28bdbaa8f. Capture home hero/directory plus all nine heroes/FAQ contexts at 1440/768/390/320; bind route, UTC, DOM viewport, raster, DPR, currentSrc/hash, media bounds and fit/position. Verify full source frame, captions, card/heading fit, keyboard focus/activation, broken-image fallback and image loading/CLS/LCP. Existing FAQ and booking/admin/consent recovery checks remain open. Reviewer placement intake d7b55ae5-fc67-498e-8a6a-b620ed0e9c99 awaits actual rendered evidence; do not resolve it with source-only evidence. Independent image and functional review, CEO clinical/configuration review and final interactive owner approval remain mandatory.
