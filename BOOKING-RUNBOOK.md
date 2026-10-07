# Booking development handoff — 7 October 2026

Status: reviewable synthetic implementation on `dev/age-9-calendar`. No merge,
deployment, live Calendar booking, real customer data or production credentials.
Architecture, dated primary sources and threat model are saved on AGE-11.

## Runtime and setup

Node 24 was used. Install with `npm ci`, then `npm run build`. This implementation
requires a durable local SQLite volume and one application host. Multiple Node
processes may share that local database; independent replica files, network file
systems and ephemeral/serverless storage are **not supported**. SQLite WAL and
immediate transactions serialize overlap checks, reservation insertion and limits.
Restrict database directory and backup access to the runtime identity.

Provide configuration through the runtime's secure environment facility. Never
paste credentials into git, Paperclip comments or client variables:

| Variable | Purpose |
| --- | --- |
| BETTER_AUTH_URL | Exact site origin; HTTPS except localhost/127.0.0.1 development |
| BETTER_AUTH_SECRET | Independently generated high-entropy secret, at least 32 characters |
| BOOKING_ENCRYPTION_KEY | Independently generated 32-byte key, base64 encoded; AES-256-GCM for contacts/tokens/state |
| BOOKING_DB_PATH | Absolute persistent SQLite file path, outside public assets |
| BOOKING_ADMIN_EMAIL / BOOKING_ADMIN_PASSWORD | Temporary secure injection for offline provisioning only; password >=14 characters |
| BOOKING_CALENDAR_MODE | `mock` for synthetic checks; other values use Google and fail closed if unconfigured |
| BOOKING_ALLOW_SYNTHETIC | Must equal `true` to enable mock mode/setup; never enable on a live booking site |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Website-specific OAuth web application credentials |
| GOOGLE_CALENDAR_ID | Dedicated calendar owned by the consented clinic Google account |

Initialize schema and a staff account:

```sh
npm run booking:setup -- --admin --synthetic
```

Use `--synthetic` only for a synthetic environment. For a separately approved live
environment, substitute `--config /secure/path/clinic-settings.json`; that file must
match `settingsSchema` in `src/lib/booking/schema.mjs`. This inserts configuration
only if none exists; it never overwrites existing configuration. Remove admin
provisioning variables after setup. Public signup is disabled. Additional users
are provisioned offline with the same command without `--synthetic`/`--config`.
Remove a user's `booking_admins` membership and sessions to revoke access. Password
recovery/email delivery is not implemented; operations must securely reprovision.

The synthetic fixture is **not a statement of clinic hours or offered services**.
It uses America/Chicago, weekday 09:00–17:00, a synthetic 30-minute consultation,
10/15-minute buffers, 24-hour notice and 60-day horizon. Approved service names,
durations, bookability, hours, timezone, policies and retention are required before
real use. Existing address/contact text is reused from the repository.

## Google website runtime OAuth

Paperclip's pending parent connection is independent from website runtime OAuth.
Do not create a duplicate Paperclip connection request. An operator must enable the
Calendar API and configure a Google OAuth web application with exactly:
`<BETTER_AUTH_URL>/api/admin/calendar/callback`. Configure its consent audience and
authorized test users; Google test-mode refresh-token expiry may require renewed
consent. Securely inject credentials; do not send credentials to an issue thread.

An authorized, signed-in administrator uses Connect Google Calendar. The flow uses
session-bound one-use state (10-minute expiry), PKCE and a fixed callback. It asks
for `calendar.events.owned` and `calendar.events.freebusy`, not full calendar/account
access. The granted refresh token is encrypted in SQLite; access tokens remain in
memory. The owned-events scope can reach other calendars owned by that account:
use a dedicated least-privilege clinic identity and review consent before launch.
The configured calendar must be owned by that identity. No client token exchange.

Private opaque events contain only `Reserved appointment`, a random-derived
reference and occupied start/end, **including buffers**. No name, email, attendee,
medical text, email invite or notification is sent to Google. Free/busy errors,
including per-calendar errors inside HTTP 200 responses, fail closed. Auth token
exchange and Calendar fetches have bounded timeouts. Revoked tokens require staff
reconnection; errors expose no provider response/token details.

## Reservation and recovery semantics

Availability is computed in the configured IANA zone. Date exceptions replace
weekly hours. Candidates must fit buffers inside open hours, avoid internal holds
and upstream busy intervals, and satisfy notice/horizon. Ambiguous fall-back times
and appointments crossing an offset change are conservatively excluded. Free/busy
provides absolute intervals for all-day events. Overnight hours must be split.

Submit rechecks Calendar, inserts a pending reservation under an immediate SQLite
transaction, rechecks Calendar again while the hold excludes competing application
requests, then inserts a stable-ID Calendar event. Confirmation requires observed
matching event start/end and a durable database update. Identical retry keys/bodies
return the existing outcome; changed bodies are rejected. A lost upstream response
never releases a hold. Pending outcomes show no false success. Keep the page open
and retry the same request; after closing the page contact staff with the reference.
The browser keeps contact/idempotency data in memory only, never in URLs/analytics.

Staff can Reconcile reservations. Matching events become confirmed; missing,
cancelled or moved events are marked for review and retain their occupied span.
This conservative implementation **does not automatically recreate or release a
missing event**, because the insert may still have completed upstream. Staff must
inspect the dedicated calendar and database using a controlled operator process.
No client self-service cancellation/rescheduling is provided; contact the clinic.
Reconciliation currently checks up to 100 active/recent reservations per invocation;
batch pagination and a reviewed release/resolution UI are required for larger use.
No background monitor or recurring reconciliation job has been scheduled.

External Calendar editors cannot participate in the SQLite transaction. An outside
edit can race the final busy check or move/delete an event later. Google Calendar
does not offer atomic reserve-if-free. Restrict external writers and require an
operator conflict-review process; this code does not claim absolute prevention.
Admin setting changes never cancel or move existing appointments. Save reports
the count of upcoming reservations requiring operational consideration, not a
calculated conflict count. Concurrent settings saves return 409 rather than overwrite.

## Security and retention

Every admin API read/write checks the current Better Auth database session and the
explicit admin table. Sessions expire after one hour with refresh disabled; cookies
are HttpOnly, SameSite=Lax, secure on HTTPS and host-only. Public signup is disabled.
Mutations enforce the exact configured Origin and JSON input with a 32 KiB body
limit. Auth library CSRF/origin controls remain enabled. No raw request/provider
exceptions are logged. Public responses expose catalog/slots or the submitted
request's reference/status/times, never calendars, contacts or staff configuration.

Public limits are durable and intentionally global (90 slot reads/minute, 15
reservations/minute) rather than trusting spoofable forwarded headers. Admin limits
are per user. Before launch, configure trusted edge limits/abuse protection and
validate proxy behavior; global limits alone allow denial of availability by a
malicious caller. Do not deploy this development slice as an unattended public system.

`npm run booking:retention` clears encrypted contact blobs 30 days after the
appointment. This proposed retention period needs clinic approval and a scoped,
configured job before production. Reservation metadata remains for reconciliation;
define its retention and encrypted-backup deletion policy separately. Auth/session
metadata and backups also need an operator retention policy. Key loss makes encrypted
data unreadable; rotation requires a reviewed decrypt/re-encrypt migration.

## Verification and review limits

Run `npm test`, `npm run lint`, `npm run build`, `npm audit`, then
`npx playwright test`. Browser tests use installed Microsoft Edge, a test-owned
loopback server that stops afterward, generated ephemeral credentials and a new
synthetic SQLite database in the run scratch directory. No auth bypass is used.
Change Playwright's channel if Edge is unavailable on another workstation.

Observed: seven core/adapter tests pass; four HTTP/browser tests pass; production
build and basic ESLint checks pass; full npm audit reports zero vulnerabilities.
Tests include DST, overrides, buffers, all-day busy, overlap/idempotency, uncertain
insert reconciliation, encrypted contact/tamper checks, malformed Google responses,
auth failures, private event payloads, unauthorized/non-admin requests, CSRF, disabled
signup, session expiry, optimistic saves, public minimization and real mock booking
and staff flows. Browser failure screens use explicit intercepted synthetic data.
Client static bundle marker scan found no server credential/token markers.

Screenshots cover 390×844 and 1440×900 booking selection/slots/review/confirmation,
staff login/settings, and mobile outage/empty/pending states. Observed 320px reflow
has no horizontal document overflow. Native slot radio was selected with keyboard;
this is not a full keyboard/screen-reader/WCAG audit. Screenshot inspection led to
fixing inherited page clipping and the header action wrapping.

Local unthrottled performance identified the original logo transfer at 2,242,439
bytes; Next Image delivery reduced the observed transfer to 7,284 bytes. Cold image
optimization took 125ms in the measured run; local navigation was 151.5ms mobile and
63.2ms desktop. These are observations, not field Core Web Vitals or mobile-network
benchmarks. Other JS chunks are approximately 68 KB/64 KB transferred.

Known unverified/deferred items: live OAuth consent/revocation and real Calendar
semantics; secure HTTPS cookie behavior in a deployed environment; multiple-process
stress/soak; full 200% zoom and assistive-technology review; comprehensive error-state
visual matrix; service catalog addition through UI; draft availability preview and
copy-hours convenience controls; automated notifications; operational reconciliation
resolution/pagination; production edge limits, backups and retention scheduling.

The Next ESLint preset depended on an unpatched vulnerable glob package. It was
removed in favor of basic ESLint correctness checks; framework-specific lint rules
are not currently run. Dependencies are pinned with a lockfile (Next 16.4.0, React
19.3.0, Better Auth 1.7.7). Repeat advisory review before any authorized release.

CEO must arrange independent security/release review. AGE-12 is the rendered UX
review path. Neither review is claimed here. No production release authorization
is implied by passing synthetic tests.
