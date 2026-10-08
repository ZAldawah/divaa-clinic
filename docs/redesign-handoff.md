# Redesign candidate handoff — 2026-10-08

Status: implemented local candidate, awaiting rendered/interactive validation. Not final acceptance or production ready. Branch `age-26/redesign`, worktree `.worktrees/age-26`, based on `6f22570d7176b186a9bcba6c314e8d41784e896c`. Final commit is recorded on the task. Build ID `W1bEc3TSP3GixZ-RU-lMU` binds the checked source tree before its documentation-only commit.

## What changed

All 13 page routes share the warm neutral/serif design from the reconciled brief. Complete static service discovery, native mobile/desktop menu with Escape/focus exit, original typographic artwork, shorter home content, service breadcrumbs, contact links and staff footer. Service pages intentionally omit optional unapproved clinical text/FAQs, prices, stats and schema. Consulting links select `consulting`; backend treatment links/IDs remain supported without relabeling them. No new dependency, clinical claim, review, policy or photo license assumed.

Booking has compact truthful synthetic disclosure, selected-service summary/change, invalid preselection notice, explicit config/empty/slot/error states, linked details validation, editable review, duplicate-submit guard, conflict refresh and persistent identical-request recovery. Pending is never presented as confirmed; refresh recovery is explicitly not promised. Staff retains all existing controls; adds access/loading states, failed calendar callback notice, explicit 409 draft preservation, focus on error, interval-removal confirmation and disabled edits while saving. Consent opens on request in the page flow, preserves equal accept/reject, failure/reopen/withdraw and disabled transport rules, and cannot overlay content. Root/private render errors avoid unsafe booking resubmission guidance.

No API, backend booking/auth/session/CSRF/recovery library, analytics transport/allowlist, package or lockfile changed. Original source assets and evidence remain. Protected baseline remains at the original commit with only its untracked AGENTS.md.

## Route/state matrix

S = checked source and build HTML; R = regression backend tests; U = unperformed in a browser. Every route still needs exact-candidate desktop 1440×900, tablet 768×1024 and mobile 390×844 captures; representative 320px, zoom and reduced-motion interaction checks. No screenshot in earlier evidence is this candidate.

| Route | Implemented states | Current evidence |
|---|---|---|
| / | Hero, all nine service cards, contact, footer, menu closed/open, consent closed/open/failure | S; all rendered sizes/interactions U |
| /botox | Neutral service hero, consultation, related services, breadcrumbs | S; all rendered sizes U |
| /filler | Same shared states, one authoritative page | S; all rendered sizes U |
| /radiesse | Same shared states | S; all rendered sizes U |
| /sculptra | Same shared states | S; all rendered sizes U |
| /prp | Same shared states; taxonomy review retained | S; all rendered sizes U |
| /rrf | Same shared states; neutral Radiofrequency label | S; all rendered sizes U |
| /facials | Same shared states, one authoritative page | S; all rendered sizes U |
| /microneedling | Same shared states | S; all rendered sizes U |
| /collagen | Same shared states; taxonomy review retained | S; all rendered sizes U |
| /book | Config loading/failure/zero services; valid/invalid preselection; date loading/empty/error; details validation; review/edit; busy/conflict/unknown; pending/confirmed | Initial HTML S; recovery/synthetic scheduling R; end-to-end and all dynamic UI U |
| /admin/login | Labeled email/password; native validation; pending/generic failure | Initial HTML S; session enforcement R; UI/login U |
| /admin/availability | Loading/expired/forbidden; hours/empty days/exceptions; timing/rules; dirty/save/discard/failure/conflict; synthetic/disconnected/callback; reconciliation | Initial HTML S; concurrency/session/recovery R; authenticated UI U |
| Global 404 and render errors | Branded home/services or contact recovery; no stack trace or unsafe booking retry | 404 HTML S; triggered failure UI U |

No service FAQ/loading/empty state is applicable to static neutral service copy: no dynamic fetch or approved FAQ exists. Decorative CSS has no image loading/error state. API transient errors are represented within booking/admin. Existing favicon retained, owner asset provenance still part of release review.

## Verified checks and honest limits

- `npm run lint`: pass after final UI edits. Existing ESLint configuration is a limited correctness ruleset, not a complete accessibility/type/security analyzer.
- `npm run build`: pass, all 13 routes plus global 404 and nine APIs. Both default-disabled and explicit inert analytics preview builds succeeded. Final build uses `NEXT_PUBLIC_ANALYTICS_ENABLED=true`, `NEXT_PUBLIC_ANALYTICS_PREVIEW=true`; no live measurement activated. `globalNotFound` is an experimental Next 16.4 flag used for this existing multi-root app; installed official guide recommends this convention for unmatched routes across separate roots. Revisit on framework upgrades.
- `node scripts/isolated-tests.mjs`: 55/55 pass with PostgreSQL 17 in a fresh run-scratch cluster. Synthetic/mocked integrations only. Child server stopped normally; no shared service restart or deletion. Covers real cross-process collisions/idempotency/recovery, settings races, expired/revoked staff sessions, bound single-use OAuth state, encryption, scheduling and analytics fail-closed behavior. Does not prove browser UI or live providers.
- `node scripts/redesign-audit.mjs`: pass for 13 routes + 404. One main/h1, skip target, all service links, local link/fragment validity, canonical divaabeauty.net, public unsupported-copy exclusions and private privacy-UI exclusions. Six token contrast pairs: 17.68, 11.03, 8.84, 15.42, 4.48 (control border, threshold 3), 6.71. This does not measure every rendered state.
- Source-only responsive rules: 600/900px transitions, fluid grids, native radio/labels, focus outlines, reduced motion; no horizontal-overflow hiding. Keyboard/screen reader/zoom/reflow/target measurements remain U. No WCAG 2.2 AA or security certification claimed.
- Performance: removed remote font and photographic hero requests from rendered routes; CSS source about 38.5k to 9.7k characters. Build artifact report records HTML/CSS/JS raw/gzip sizes. Public HTML roughly 4.2–4.4k gzip; referenced script payload roughly 177k gzip; these are build transfer estimates including shared/legacy bundles, not observed network requests. Browser load/CPU/LCP/CLS/INP remain U. JS hydration is the remaining measurable candidate bottleneck to profile through host DevTools. No fabricated Lighthouse score.
- Audit script first rejected the root canonical's omitted trailing slash; corrected the audit to accept equivalent root URLs, then passed. Initial editing-command syntax/path failures made no source change and were corrected or omitted. No unresolved build/test failure.

## Content, cleanup and asset audit

`redesign-inventory.md` records usage before cleanup and rationale. Removed exactly two duplicate page.js routes and three unreferenced widgets; replaced legacy CSS/optional unsupported marketing/schema. All original content remains recoverable at baseline commit. Static route copy contains no lorem ipsum, TODOs, fake reviews, invented metrics, price amounts, complimentary claims or clinical FAQ schema. Synthetic API catalog still contains truthful internal uncertainty notes; the UI consolidates those into test disclosure and labels every displayed synthetic duration. Legal disclosure remains visibly draft in preview details; this is required truthfulness, not approved legal content. All retained contact facts are owner-provisional, not newly verified. No image downloads or new assets; text/CSS design, system fonts. Existing favicon and unused asset files preserved.

## Configuration register — not production approved

| Requirement | Local behavior / release action and owner |
|---|---|
| Name/address/phone | Preserved provisionally per owner; CEO obtains final owner confirmation of permitted contacts |
| Domain | divaabeauty.net canonical; CEO/host verify DNS/TLS/www redirect before any release |
| Service taxonomy | PRP/PRF, RF terminology and collagen grouping remain CEO/qualified clinical-review items; backend IDs retained |
| Hours/durations/buffers/capacity | Saturday 10am–4pm Chicago only in synthetic catalog; owner must approve permanent settings |
| Booking policy and help | No cancellation policy invented; CEO/owner settle production policy and uncertain-request support |
| Database | Synthetic requires explicit loopback named BOOKING_SYNTHETIC_DATABASE_URL and BOOKING_ALLOW_SYNTHETIC=true; production DATABASE_URL not inspected or used |
| Staff/auth | BETTER_AUTH_URL/SECRET, provisioned staff membership and secure HTTPS cookies; host injects secrets, owner chooses administrators |
| Encryption/abuse | BOOKING_ENCRYPTION_KEY, BOOKING_RATE_KEY; trusted edge configuration must be verified by host/security reviewer |
| Calendar | Local BOOKING_CALENDAR_MODE=mock only; Google credentials/calendar ID and clinic-owned OAuth remain host/owner production configuration |
| Recovery/retention | BOOKING_JOB_SECRET, BOOKING_RECOVERY_ORIGIN and scoped dispatcher/retention operations need host setup/release review; no recurring monitoring added |
| Analytics/legal | UI only with explicit enabled flag; preview transport inert. Owner disclosure approval and Search Analytics activation gate remain; no tracking event change |
| Assets | Text/system-font design avoids unsupported photography; retained favicon and any future imagery require owner rights confirmation |

Never put credentials in task comments. No paid services, production data, Google OAuth/Calendar actions, push/merge or release performed.

## Host handoff and exact remaining action

No managed execution runtime is attached to this issue (`currentExecutionWorkspace=null`). Existing http://127.0.0.1:3119 is the baseline, not this redesign; it has not been restarted. Host must coordinate the candidate switch before any candidate acceptance claim.

From `.worktrees/age-26`, use the established `scripts/local-review.mjs` foreground entrypoint with a fresh named loopback synthetic DB and securely injected synthetic admin password. It rejects nonempty DBs, forces mock Calendar/inert analytics, strips Google credentials, seeds synthetic-only settings and binds loopback 3119. Do not copy baseline secrets or reset its DB. Existing node_modules junction reuses the exact unchanged baseline installation locally; a clean checkout can use `npm ci` against the unchanged lockfile. No install or preview launch was performed here.

Designer owns the existing host interaction 6cfabdbb-9d4c-41db-81bf-f23e34926ccb. Consolidate this exact-candidate request there: switch coordinated preview to this commit; capture every route at desktop/tablet/mobile plus lower sections/footer, native menu and privacy states; exercise synthetic booking all steps/invalid preselection/empty/error/conflict/unknown recovery/pending/confirmed, staff auth/availability save/discard/conflict/calendar feedback. Record URL/query/state, actual DOM viewport and raster separately, UTC, commit/dirty tree/build ID and who performed interactions. Provide 320px, keyboard/escape/focus, zoom/reduced-motion and performance measurements. Do not request a nonexistent baseline menu.

Developer resumes on returned evidence and fixes findings. Independent reviewer on AGE-27 and final interactive owner approval remain mandatory. CEO coordinates release review; no release authorization inferred.
