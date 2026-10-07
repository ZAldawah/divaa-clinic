# GA4 preparation — draft, 2026-10-07

## Scope and evidence

Isolated branch `dev/age-14-ga4`, based on `039393f`. Shared master untouched.
This delivery is a pure event/consent core and tests, **not an installed Google tag**.
No property or measurement ID was supplied. No new property was created.

Observed source: Next 15.4.10 / React 19.1.0. No GA/GTM, analytics SDK or consent
implementation found in src. Root layout mounts Navbar, page and Footer.
SMS links appear in Navbar, homepage, ServiceLayout and legacy filler/facials
pages. They launch prefilled SMS drafts; they do not confirm a send or booking.
There are duplicate page.js/page.jsx files in filler and facials; resolve during
integration without overwriting the calendar branch.

Observed deployed homepage: fetched https://www.divaabeauty.net and all eight
referenced JS files. No googletagmanager, google-analytics, gtag(, GTM-, consent,
Cookiebot or OneTrust markers found. HTML contains no consent interface.
This is static inspection only: no browser cookies/network capture, service-page
chunk inspection, or regional variation check yet. Do not infer absence of all
runtime tracking from this inventory.

## Event contract proposed to Search Analytics

| Event | Exact trigger | Exclusions |
| --- | --- | --- |
| page_view | Initial permitted page after acceptance, then each pathname transition | No duplicate render/StrictMode emissions; no query/hash navigation |
| call_click | Activation of tel: link | Not a connected call or enquiry |
| sms_click | Activation of sms: link | Not a sent message, enquiry or booking |
| booking_start | Explicit click opening future public booking journey | Never infer from SMS CTA or page view |

No completion events exist in this delivery. Calendar implementation must provide
an authoritative committed success and local deduplication before a later event
contract is reviewed; no appointment ID or details may be sent to GA.

Allowlist: / plus /botox, /filler, /radiesse, /sculptra, /prp, /rrf, /facials,
/microneedling, /collagen. All service paths map to one synthetic reporting URL
https://www.divaabeauty.net/services and title Services. This is not a real page.
Home maps to / and title Home. page_referrer is always empty. No service labels,
user IDs, user properties, dynamic parameters, href, query strings, fragments,
form values, campaign values or completion identifiers are accepted.
All other routes, including admin, login, booking and management, fail closed.
Original service paths are held transiently only for navigation deduplication.

## Consent and transport requirements still to implement

Proposed basic opt-in globally: do not fetch Google code or send denied-state pings
before acceptance. Equal Accept and Reject controls; persistent privacy settings
with withdrawal. Store only versioned choice and expiry, failing closed on storage
errors; no pre-consent replay. Core rejection/revocation calls a synchronous stop
hook, but there is no browser transport, cookie deletion or consent UI yet.

Future transport must suppress automatic initial/history pageviews, disable all
enhanced measurement in the owner stream, suppress automatic URL/title/referrer
and campaign data, and keep advertising storage/user data/personalization denied.
Disable Signals, user-provided data and advertising personalization. No User-ID.
GA-generated client/session identifiers may still exist: owner must decide whether
this fits the requested identifier restriction; do not describe GA as anonymous.
Owner decides retention, privacy notice, regional obligations and whether any
public service pages are eligible at all. Route grouping is not legal clearance.

Do not mount a persistent root tag that can follow client navigation into private
screens. Use a tested document boundary between public and private areas; removal
of a script element alone does not stop an already executed tag. Inspect actual
requests, including automatic engagement events and HTTP referrers, before release.

## Primary guidance consulted

- [Google consent setup](https://developers.google.com/tag-platform/security/guides/consent): defaults precede measurement; update and persist changed choices.
- [Manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views): manual collection requires suppressing automatic pageviews to avoid duplicates.
- [PII prevention](https://support.google.com/analytics/answer/6366371): URLs, titles and user-entered values can disclose PII; explicit sanitization is necessary.
- [Enhanced measurement](https://support.google.com/analytics/answer/9216061): automatic history, outbound, search and form collection require explicit stream review.
- [Google HIPAA guidance](https://support.google.com/analytics/answer/13297105): Google does not offer a GA BAA; owner/legal must identify eligible pages and prevent PHI collection. Clinic regulatory status is unknown.

## Verification and next actions

Verified: `node --test tests/analytics.test.mjs` — 7 passing tests under Node
24.19.0. Tests cover consent gate, repeated navigation, service transitions, back
navigation, revoke/reaccept, private and malformed routes, static payloads, CTA
semantics, rejected completion events and transport exceptions. Only injected
in-memory transport was tested. No GA requests were made.

Untested: browser transport, consent UI, mobile/desktop rendering, keyboard/focus,
cookies, actual GA payloads, network performance, property settings and live data.
Paperclip heartbeat context reports currentExecutionWorkspace=null; a managed
preview runtime must be configured for this worktree before browser evidence.

Owner/CEO: supply account/property/stream identifiers and G- ID, confirm stream
privacy settings and eligible pages/identifier policy. GitHub connection card is
pending for PR access. Search Analytics: review the proposed contract. Web Developer:
then implement transport/UI and calendar boundaries, configure managed preview,
capture 390x844 and 1440x900 evidence with synthetic data and inspect all requests.
Test initial/client/back navigation, accept/reject/revoke, cookies, no duplicates,
CTA meanings, admin entry and suppressed sensitive payloads.

CEO must arrange security/release review if no specialist is available. Once the
actual integrated branch and preview evidence are reviewable, save a release
confirmation bound to that evidence revision. Exact later release action: approve
the reviewed commit, merge through the repository release process, configure the
owner-provided ID/settings and deploy; then independently verify live collection.
No merge/deployment authorization is implied by preparation or ID provision.
Keep the issue open until approved release and live evidence.

## Search Analytics reconciliation (2026-10-07)

Reviewed AGE-15 ga4-reporting revision 9e8c6b2b-dbcc-4dd5-9511-a1181ae9860f.
Event names and launch/start meanings agree. Added static page_type values home
and services; service names remain suppressed. The synthetic /services reporting
URL is deliberately grouped and must not be interpreted as a real landing page
or treatment-level reporting. Owner eligibility decisions remain pending.

cta_placement is optional and currently omitted; define a fixed enum against the
actual UI during integration. No arbitrary attributes may enter payloads. Browser
listener/double-click deduplication remains unimplemented and unverified. Core
navigation deduplication is tested; do not treat that as browser verification.
Reserved enquiry_confirmed and booking_confirmed remain unavailable. AGE-11 must
supply authoritative success and application-side dedup before their integration.

Re-ran seven focused Node tests after adding page_type; all passed. No browser,
Google transport, cookies, mobile/desktop or live collection was tested.
Before reporting activation, hand off the approved release commit, UTC deployment
time, production hostname, owner-verified Measurement ID/stream, sanitized network
payload evidence and matching aggregate live observations to Search Analytics.
Preview evidence alone cannot satisfy production acceptance.
