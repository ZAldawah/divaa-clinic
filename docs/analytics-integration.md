# GA4 integration — draft, not released

## Applied owner direction

Owner comment 8ca1eb8d-5c3e-4637-bcea-5ee4a77bb15d and parent setup evidence
provide account 411237826, property 558023111, stream 16063004300 and
Measurement ID G-J4889EXEE3. Reporting timezone America/Chicago, currency USD.
Enhanced measurement OFF and optional account sharing unchecked are reported
by the owner. Signals, user-provided data, advertising settings and retention
are not independently verified here. No new property was created.

## Implemented

Public routes now live under src/app/(public), which owns its HTML root. URLs
and page contents are preserved. There is no shared src/app/layout.js.
Future private/booking routes must own a separate HTML root, without analytics.
This requirement was posted on AGE-11; its implementation has not been merged.
Next documents that navigation between root layouts loads a new document.
Actual private-route navigation still needs verification against calendar code.

AnalyticsConsent is integrated in the public root behind
NEXT_PUBLIC_ANALYTICS_ENABLED=true. Unset/false omits analytics UI and transport.
Leave production unset until the existing release gate is approved. For a
managed preview, enable it at build time and intercept Google script/collection
requests when testing synthetic data so preview does not contaminate live GA.
Use an approved test stream or explicitly authorized live verification for real
Google network tests; no Google collection was initiated in this heartbeat.

Global basic opt-in: no Google script before acceptance; equal accept/reject
buttons, persistent Privacy settings button, withdrawal, 44px targets, responsive
stacking and focus return. Choice is versioned sessionStorage, tab-session only;
storage failure keeps collection disabled. GA cookies configured as host-only
browser-session cookies; not described as anonymous. No custom identifiers.

The adapter uses verified G- ID, manual pageviews, static page title/location/
type/referrer, empty campaign overrides, advertising consent denied and Signals/
ad personalization disabled in client configuration. It reconstructs event
parameters rather than trusting arbitrary caller fields. Public root uses
no-referrer metadata and Google script uses no-referrer policy. Withdrawal sets
the GA disable flag synchronously, clears queued commands, updates consent and
expires known GA cookies. Script removal is not treated as document isolation.

Pageviews follow permitted pathname changes (queries/hash intentionally ignored).
All service views group to synthetic /services. One delegated click listener
tracks tel/sms protocols without reading href/text; repeated clicks in a browser
double-click sequence are ignored. SMS is only a draft launch. booking_start is
reserved in the allowlist but not bound because no real booking entry exists on
this branch. No enquiry/booking confirmations are emitted.

## Concrete privacy proposal for owner review

Propose the implemented global opt-in, grouped public pages only, browser-session
GA-generated client/session identifiers, no custom identity or advertising, and
two-month GA event-data retention with activity-based retention reset disabled.
Owner must approve or revise identifier use and the following notice before
production activation, and confirm applicable eligibility/legal requirements.

Draft notice: "With your permission, DivaaBeauty uses Google Analytics to measure
grouped public page views and contact-link clicks. Analytics uses browser-session
cookies and generated identifiers. We do not send contact-form contents,
appointment details, contact information or individual treatment labels. Google
receives analytics data. You can reject analytics or withdraw your permission
through Privacy settings. Your choice applies to this browser tab."

This is proposed copy, not legal review or a claim about verified production
collection. Incorporate it into an owner-approved privacy notice with the
owner's chosen retention disclosure before enabling production.

## Verification and limits

11 focused Node tests pass: original core plus consent storage and transport
configuration, static payload reconstruction, private-route suppression,
preacceptance no-load, revocation commands/cookie expiry and script reuse.
Tests use fake DOM/transport and do not prove Google honors each configuration.
An analytics-enabled Next 15.4.10 build passed compilation, lint, type validity
and all 14 static-page generations. Existing img and nested-lockfile warnings
remain. Existing duplicate filler/facials page.js/page.jsx files were preserved;
rendered baseline comparison must confirm the selected versions after relocation.
The final click guard and cookie setting were checked by focused lint/tests after
that build. No dependency versions changed.

Build reports 111 kB first-load JS on home and 105 kB on services; this is bundle
size, not measured network performance or an analytics overhead comparison.
Managed execution workspace remains null. Connection discovery did not expose a
usable Chrome/Comet extension tool in this agent session; unrelated cloud browser
matches were not used. No native desktop control was used.

Remaining before release: approved privacy notice/retention/identifier decision;
property privacy settings verification; calendar root reconciliation; managed
preview and extension access; 390x844 and 1440x900 screenshots; keyboard/focus;
accept/reject/revoke including slow-script race; initial/client/back/StrictMode
duplicate checks; CTA meanings; private-route document destruction; payloads
including automatic events, HTTP referrers and query/ad-click identifiers;
cookie lifecycle and loading timings. Browser assertions and privacy properties
are unverified until those checks pass. No release approval requested yet.

GitHub connection remains pending, so branch is local with no PR/push. CEO must
arrange security/release review and a managed preview plus extension-capable
runtime. Then Web Developer will capture evidence, save a commit/evidence-bound
release confirmation, and after approval verify production payloads/live
aggregate events with Search Analytics. Keep task open through live evidence.

## Primary references

- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/tag-platform/security/guides/privacy
- https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
