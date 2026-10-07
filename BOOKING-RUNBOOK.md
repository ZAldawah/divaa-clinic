# Booking development handoff — 7 October 2026

Current integrated local candidate instructions are in `LOCAL-REVIEW.md`.
They supersede the historical status and screenshot acceptance wording below.
Owner acceptance is interactive Comet through the host browser extension;
screenshots alone are not acceptance. AGE-18 is the independent reviewer.

Status: PostgreSQL revision for CEO security re-review on `dev/age-9-calendar`.
The original SQLite candidate ae07f60 remains immutable for the existing visual
review. This revision is not hosted/production acceptance. No merge, deployment,
real Calendar booking, credentials provisioning or live tracking occurred.

## Setup

Node 24; `npm ci`, `npm run build`. All mutable data now requires a shared
PostgreSQL primary. No local-file fallback or automatic HTTP migrations exist.
Use an isolated database per preview/environment. The module pool has at most five
connections, 3-second connection timeout, 5-second statement timeout and 2-second
lock timeout. Transactions use one checked-out client. Vercel pool lifecycle
attachment is enabled on Vercel; provider sizing and hosted behavior need review.

Inject server configuration securely; never paste secrets into tasks or git:

| Variable | Purpose |
| --- | --- |
| DATABASE_URL | PostgreSQL primary; remote connections require `sslmode=verify-full` with a trusted certificate |
| BETTER_AUTH_URL | Exact origin, HTTPS except local development |
| BETTER_AUTH_SECRET | Independent high-entropy secret, at least 32 characters |
| BOOKING_ENCRYPTION_KEY | Independent base64-encoded 32-byte AES-GCM key |
| BOOKING_RATE_KEY | Independent high-entropy HMAC key, at least 32 characters |
| BOOKING_TRUSTED_EDGE | `vercel` only on a verified Vercel ingress deployment (`VERCEL=1`); other public configurations fail closed |
| BOOKING_JOB_SECRET | Independent high-entropy bearer secret, at least 32 characters, for an approved scheduler |
| BOOKING_ADMIN_EMAIL / BOOKING_ADMIN_PASSWORD | Temporary secure injection for setup only; password at least 14 characters |
| BOOKING_CALENDAR_MODE | `mock` only for synthetic checks; otherwise Google, fail closed if unconfigured |
| BOOKING_ALLOW_SYNTHETIC | `true` explicitly enables synthetic fixtures and loopback-only synthetic client identity; never enable in production |
| BOOKING_SYNTHETIC_DATABASE_URL | Mandatory in synthetic mode; explicit loopback IP/port and divaa_synthetic_* database; NEVER falls back to DATABASE_URL |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Website runtime OAuth web application credentials |
| GOOGLE_CALENDAR_ID | Dedicated calendar owned by consenting clinic identity |

Run `npm run booking:setup -- --admin --synthetic` only in a synthetic environment.
It applies the versioned booking and Better Auth SQL migrations under a migration
lock. `002-auth.sql` was generated from pinned Better Auth 1.7.7 and inspected for
session expiry, credential fields, references and indexes. Use a migration role
for setup, then a restricted runtime role with table read/write and sequence
access, no schema creation. Future auth upgrades require a reviewed migration;
setup does not dynamically alter the auth schema.

For separately approved real use, replace `--synthetic` with
`--config /secure/path/clinic-settings.json` matching `settingsSchema`. Existing
configuration is never overwritten. Remove provisioning variables after setup.
Public signup is disabled. Revoke staff by removing their `booking_admins` row
and sessions. Password recovery/email delivery is not implemented.

The synthetic hours/services are test fixtures, not clinic business facts. Owner
approval is required for real timezone, hours, services, timing and policies.
Do not import old synthetic SQLite data into production. If real data is found,
stop and arrange a reviewed migration rather than deleting or silently resetting it.

## Google runtime setup

The pending Paperclip Calendar connection on AGE-9 is separate from website OAuth.
Do not duplicate it. An authorized operator enables Calendar API, configures the
OAuth web app/test audience and exact callback
`<BETTER_AUTH_URL>/api/admin/calendar/callback`, and injects runtime credentials.
Live consent/revocation and HTTPS cookies remain untested.

Staff connection uses session-bound, one-use state with ten-minute expiry, atomic
DELETE RETURNING consumption and PKCE. Refresh tokens and contacts are encrypted
in PostgreSQL; access tokens remain in memory. Scopes are `calendar.events.owned`
and `calendar.events.freebusy`. The former reaches other calendars owned by that
identity; use a dedicated clinic identity. Private opaque events contain only a
reference, generic summary and occupied times including buffers. No contact,
medical data, attendees or invitations reach Calendar.

## Consistency and recovery

UTC epoch milliseconds form half-open `int8range` exclusion constraints. This is
the implemented equivalent of the design's proposed timestamp range: exact numeric
bounds, no timezone cast or rounding. Pending/confirmed/review rows exclude overlap.
Settings updates and reservation transactions lock the same settings row. A unique
idempotency key and hash distinguish replay from changed requests. Reservation and
job commit together; external calls run outside the transaction.

Jobs use database-clock 90-second leases, SKIP LOCKED claims, and lease tokens on
conditional result writes. Only one job is claimed at a time. Insert intent is
persisted before Google insert. A later worker first looks up the stable event ID;
matching times confirm. A missing or changed event after an attempted insert keeps
a review hold. No blind resend, automatic expiry or release of uncertain holds.
A crash before insert intent can safely continue the first delivery. A crash after
intent but before sending can conservatively require operator review.

First delivery now checks **current** policy after Calendar lookup/free-busy and
credential refresh, immediately before insert intent. The saved start/end and
buffered interval must still be an exact offered slot: current enabled service,
duration/buffers, timezone, hours/closures, grid, notice and horizon all apply.
Removed/disabled services or changed timing reject the queued request rather than
silently changing it. The database clock must strictly precede the current notice
cutoff, appointment start and buffered start; expired unattempted jobs reject.
The settings row lock serializes policy changes with intent, and the conditional
intent write rechecks the clock after slot calculation/lock waits. Policy edits
committed after intent do not retroactively cancel an in-flight Calendar write.

An ineligible **unattempted** job becomes `rejected`, clears contact, releases its
local exclusion hold and is reported as rejected by recovery/admin verification.
Retrying that booking reference returns the existing 409 unavailable response.
This does not send cancellation mail or change any Calendar event. Attempted or
unknown writes bypass rejection: absence/mismatch remains `review` with the hold
and contact retained; exact existing event evidence may confirm, including after
the appointment time. No resend or automatic uncertain-hold release occurs.
The intent transaction is the first-delivery authorization point. Database commit,
network dispatch and Google acceptance cannot be one atomic action; a process pause
or provider delay after authorization remains an uncertain write to reconcile.

`POST /api/internal/recover` requires `Authorization: Bearer <BOOKING_JOB_SECRET>`
and a shared rate limit. It runs at most ten due jobs, stopping between jobs after
20 seconds. Network calls can extend the elapsed time; routes declare a 120-second
ceiling, which the selected hosting plan must support. A stopped function leaves
a lease recoverable after 90 seconds. Five-minute failed/review backoff and hourly
confirmed checks apply only until the occupied interval ends. Pending jobs have
claim priority, then review holds, then future confirmations. Past confirmed and
rejected jobs do not consume background recovery capacity; explicit admin
verification remains available. Uncertain holds are never retired by age.
`scripts/recovery-dispatch.mjs` is a bounded one-shot dispatcher (up to six batches,
60 claims); it installs no timer. No scheduler is activated here.
An approved scheduler must invoke this endpoint regularly and alert on overdue
jobs/review holds. Without it, immediate attempts and explicit admin checks are the
only execution paths; this is a release blocker, not an active monitoring promise.

Admin Reconcile reservations uses bounded keyset pages and a Continue reconciliation
button. The returned `nextCursor` must be followed to completion. A concurrent lease
is reported busy and remains recoverable by the durable queue. New IDs behind a
scan cursor are included in the next scan and remain independent queue jobs.

For protected operator verification, POST JSON `{ "reference": "<64-hex-id>" }`
to `/api/admin/reconcile` with a valid admin session and exact Origin. The request
and outcome are recorded in `booking_audit`; matching Calendar events confirm,
otherwise holds remain. The endpoint intentionally does not release uncertain
holds. Cancellation/release needs a separately reviewed operator protocol that
accounts for delayed upstream writes; no direct SQL release is recommended.
No self-service cancellation/rescheduling or notification delivery is provided.

External Calendar edits cannot share a PostgreSQL transaction. Restrict writers
and arrange conflict review: Google offers no atomic reserve-if-free guarantee.
Changing hours does not cancel existing appointments; staff must review conflicts.

## Abuse, auth and privacy boundary

Public limits are shared atomic per-client PostgreSQL counters: 90 slot reads,
15 booking submissions and 15 auth requests per minute; default reads 120/minute.
Denied increments persist. Admin limits are per user. Raw client IP is not stored
in these counters: HMAC identifiers group IPv6 at /64. Only the platform-owned
`x-vercel-forwarded-for` is accepted when explicitly configured on Vercel; arbitrary
X-Forwarded-For is ignored. Missing/invalid identity fails closed. Loopback synthetic
mode is explicitly gated. Better Auth IP tracking/library limits are disabled in
favor of the atomic wrapper, preventing a second spoofable header path. Shared NAT
users still share quotas; distributed abuse requires edge/WAF controls and alerting.
Hosted ingress overwrite behavior must be verified before public release.

Every protected request checks a one-hour Better Auth database session plus the
admin allowlist. Sessions do not refresh or use cookie caches. Cookies are host-only,
HttpOnly, SameSite=Lax and secure on HTTPS. Writes enforce exact Origin and bounded
JSON (32 KiB). OAuth callback uses one-use session binding. Provider errors are redacted.
Public API output contains only catalog/slots or the request's reference/status/times.

Public routes are under `(public)` and booking/admin under `(private)`, each with
its own HTML root. There is no shared root layout. Keep all analytics providers
exclusively in the public root when integrating AGE-14. This revision contains no
live tag. Browser testing uses a synthetic public timer/request probe, establishes
its document is unloaded entering booking, and observes no private probe requests.
This does not verify a merged GA4 candidate or grant live tracking approval.

## Retention and operations gates

`npm run booking:retention` removes encrypted contact after 30 days and expires
rate/OAuth-state rows. The period needs clinic approval and a configured scoped job.
Reservation/job/audit metadata, auth records and backups need an approved retention
policy. Key loss makes data unreadable; rotation requires reviewed re-encryption.
Owner selected **Neon Free, $0 database budget**; the host reported an empty existing
`divaabeauty-booking` project (`cool-recipe-36109536`), PostgreSQL 18 in AWS Ohio,
on 2026-10-07. Host subsequently completed migrations 001/002, restricted pooled
runtime credentials and actual openStore TLS/read-write/rollback verification.
Reuse that connection only for separately authorized real operations; never fixtures.
No paid Neon or Vercel upgrade is authorized. AGE-17 design is complete; the
developer owns remaining implementation. Actual hosting region/function limits,
operations ownership and independent review remain pending. Never place credentials
in source or task comments.
Restrict roles, test backup restoration and key recovery,
measure connection/function capacity, configure recovery/retention/alerts and verify
HTTPS/OAuth before requesting release. No additional service purchase or provisioning
is authorized by this handoff.
Rollback disables new bookings while retaining PostgreSQL and recovery; never revert
to independent SQLite ledgers or discard holds.

## Verification

Set BOOKING_TEST_DATABASE_URL to a **disposable** PostgreSQL cluster where tests may
create synthetic databases; then run `npm test`. Tests use unique databases and
separate Node processes. No SQLite substitute. This run used local PostgreSQL 18.1.
`npm run lint`, `npm run build`, `npm audit` and `npx playwright test` are complementary.
Playwright creates its own synthetic database and loopback server with ephemeral
credentials, using installed Microsoft Edge; the server stops when tests finish.
Test cluster lifecycle/cleanup belongs to its harness/operator, not application code.

Evidence and final counts are recorded in the task's revision handoff. Tests cover
cross-process collision/idempotency, restart persistence, crash recovery before and
after insert, stale leases, 205-job draining/keyset pagination, shared quotas,
OAuth-state races, session revocation/expiry, settings races, upstream/database
outage, encrypted payloads, DST, HTTP authorization/CSRF and public minimization.
Desktop/mobile synthetic screenshots remain evidence for the preceding c26b085 revision.
The recovery-freshness correction adds real PostgreSQL cases for elapsed start/end,
current policy changes, serialized closure writes, slow busy/token-preparation
boundaries and uncertain holds. The 205-job test now uses valid future intervals.
No UI changed in this correction; earlier screenshots are historical evidence.

Browser checks include 390x844 and 1440x900, 320px reflow and keyboard slot selection.
They are not a full WCAG/screen-reader/zoom audit. Local loading measurements are
unthrottled observations, not field Core Web Vitals or hosted capacity evidence.
Basic ESLint is used; framework-specific rules remain absent from the prior slice.
Live OAuth, deployed TLS/ingress, merged GA4, production workload/soak, restore drills
and full accessibility remain unverified. CEO is the confirmed native security
reviewer; AGE-12 is the separate visual review path. Passing tests does not release.

## Primary sources revisited 2026-10-07

- https://node-postgres.com/features/transactions — one client per transaction.
- https://better-auth.com/docs/adapters/postgresql — pg Pool adapter and migrations.
- https://www.postgresql.org/docs/current/sql-select.html — SKIP LOCKED queue claims.
- https://www.postgresql.org/docs/current/rangetypes.html — exclusion ranges.
- https://vercel.com/docs/headers/request-headers — platform client-address header.
- Earlier dated Google/OAuth/OWASP research remains in the task architecture document.
