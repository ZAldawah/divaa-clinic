# Integrated local review candidate

Draft for independent AGE-18 review and host-run interactive Comet acceptance.
No production activation, remote publication, main/master merge, paid resources,
real database fixtures, live tracking, or release approval is included.

## Source and environment

Branch: `dev/age-19-integrated`; worktree: `.worktrees/age-19` under the shared
project root. Exact immutable SHA is recorded in the AGE-19 candidate document.
Includes booking `316ad6cf9f690f53a51f58ac93d96ce1f8b09d8e`, analytics
`5765459662956e20ea06c32dfde8fc75f58038b0`, and consent remediation
`2cc230b442e9012d809f119cf0abef90fb6e6632` plus the local safety/operations slice.
Node 24, pinned Next 16.4.0 / React 19.3.0 / Better Auth 1.7.7 / pg 8.23.1.
Use `npm ci` in a fresh checkout. This worktree reuses the booking worktree's
identical dependency install through a local junction; the lockfile is authoritative.

## Host launch (no secrets in task comments)

Host owns the synthetic PostgreSQL lifecycle and managed preview configuration.
No Paperclip execution workspace/preview service is currently configured for this
issue. Do not confuse a launch recipe with a running or browser-verified preview.

1. Provision a NEW empty disposable PostgreSQL database on loopback, explicit
   port, named `divaa_synthetic_<unique suffix>`. A restricted disposable cluster
   is preferable. Do not point this at Neon or reuse any populated database.
2. Inject `BOOKING_ALLOW_SYNTHETIC=true` and `BOOKING_SYNTHETIC_DATABASE_URL`
   through the host environment. Only postgres/postgresql URLs on 127.0.0.1 or
   ::1 with explicit port and no query parameters are accepted. `DATABASE_URL`
   alone is insufficient, even if an inherited `.env.local` contains a real URL.
3. Inject `BOOKING_ADMIN_PASSWORD` securely (14+ characters). Synthetic admin is
   `staff@example.test`. Host enters that password directly for owner review;
   do not store it in git, task text, images, or reports.
4. From this worktree run `node scripts/local-review.mjs` as the configured
   foreground managed command. App binds **127.0.0.1:3119**. It refuses a populated
   database, generates ephemeral independent session/encryption/rate/job keys,
   migrates/seeds synthetic data, removes inherited Google credentials and forces
   **mock Calendar + inert analytics preview**. It then launches Next dev.
5. Host opens `http://127.0.0.1:3119/`, `/book`, and `/admin/login` through the
   Comet extension. Do not use headless/native browser controls. Stop the managed
   command (or Ctrl+C in its host foreground shell); stop the host-owned disposable
   database afterward. Each new launch needs a new database because keys are
   intentionally ephemeral; this harness is not a restart/backup test.

The existing production Measurement ID is retained in source but preview transport
is inert even after Accept. No synthetic events should reach the real property.
The owner selected GA4 preparation in AGE-13 comment
7582e0cc-462b-4c98-a910-1a3975162349. Approach interaction
24039de7-79cc-48be-9cd9-3083d2b78320 is now answered by local-board (20:46:19 UTC)
with that GA4 selection. This settles preparation only, not production tracking,
audience geography or privacy-setting approval. Do not reopen the question.

## Catalog and scheduling facts

The public homepage's nine service groups are represented, plus owner-requested
Consulting. Sources: https://www.divaabeauty.net/ and corresponding route pages.
Homepage and six duration pages were fetched on 2026-10-07; repo pages were
also checked. Filler variants (lip/cheek/under-eye), Botox/Dysport, PRP/PRF, and
facial/hydrofacial remain grouped as on the homepage, not invented separate offers.

| Service | Published appointment/treatment duration | Test slot |
| --- | --- | --- |
| Consulting | Unconfirmed | 30 minutes, placeholder |
| Botox & Dysport | 15–30 minutes | 30 minutes |
| Dermal Fillers | 45 minutes | 45 minutes |
| Radiesse | Not found | 60 minutes, placeholder |
| Sculptra | Not found | 60 minutes, placeholder |
| PRP Treatment | 45 minutes | 45 minutes |
| Radiofrequency Facial | 60–90 minutes | 90 minutes |
| Facials & Hydrofacials | 45–60 minutes | 60 minutes |
| Microneedling | 60-minute appointment; FAQ says procedure 30–45 | 60 minutes |
| Collagen & Biostimulators | Not found | 60 minutes, placeholder |

For ranges, choosing the upper endpoint is a conservative test scheduling choice,
not an approved clinic policy. Prices are unconfigured and visibly labeled; no
payment is collected. Test hours are Saturday only 10:00–16:00 America/Chicago,
zero test buffers/notice, 15-minute grid, 60-day horizon. Those defaults and the
unknown timings require clinic validation before real booking.

## Recovery and host backup handoff

`node scripts/recovery-dispatch.mjs` is a runnable **one-shot** operator command.
Inject BOOKING_RECOVERY_ORIGIN and BOOKING_JOB_SECRET securely for the intended
separately approved runtime. It rejects redirects, requires HTTPS except loopback,
does at most six authenticated batches (60 claims), reports aggregate health only,
and exits 1 on failure / 2 for backlog or unresolved holds. No secret is logged.
Connect its exit status to an approved operator/alert path before activation.
No recurring timer, dispatcher installation, or external alert has been activated.

Pending jobs have priority; uncertain review holds precede future confirmed checks.
Confirmed jobs stop consuming automatic recovery after their occupied end; their
rows and holds remain, and explicit admin reconciliation still works. Failed or
uncertain jobs retry after five minutes; no age-based uncertain-hold release occurs.
At a proposed 30-minute cadence six full batches cap at 2,880 claims/day BEFORE
provider latency/failures. Future confirmations still recur hourly and unresolved
holds need operator action. This is a ceiling, not measured hosted capacity or an
approved service level. A 125-second dispatcher timeout does not raise the host's
function ceiling. Verify actual free-tier runtime limits before scheduling.

Host personally owns backup/recovery verification. Required drill:

1. Record agreed RPO/RTO, approved encrypted export destination/retention, restore
   operator and key custody. Current proposals (daily exports/six-hour provider
   history) are not verified guarantees or accepted objectives.
2. Restore an authorized snapshot/export to an isolated target, preserving encrypted
   contacts/tokens and the matching key version. Never load real contacts into this
   synthetic UI or restore over the connected Neon primary.
3. With synthetic data on that separate target, verify settings/admin/session
   tables, reservation exclusions, pending/attempted jobs, lease recovery, idempotent
   replay and unknown-write holds. Compare counts and protected decryptability;
   do not log contact/token values. Record elapsed restore time and data-loss window.
4. Approve destination ACLs, retention/deletion, key recovery and rollback procedure;
   arrange free-tier storage/compute/connection/function usage checks and named
   alert recipient. No export destination, scheduler or paid plan is configured here.

## Verification and remaining review

Run bounded disposable database tests with:

```powershell
# BOOKING_TEST_PG_BIN points to existing trusted PostgreSQL binaries.
# BOOKING_TEST_SCRATCH_DIR is an operator-designated writable scratch directory;
# in Paperclip the run scratch is selected automatically.
node scripts/isolated-tests.mjs
npm run lint
$env:NEXT_PUBLIC_ANALYTICS_ENABLED='true'
$env:NEXT_PUBLIC_ANALYTICS_PREVIEW='true'
npm run build
```

The bounded harness starts only its NEW cluster on **127.0.0.1:55419**, verifies
data_directory before any fixtures, runs Node tests, and stops its own cluster.
It refuses to reuse another process on that port. Fixtures use random databases;
no real URL or credentials are loaded. Run scratch is removed by Paperclip later.
This is test infrastructure, not an unattended preview server.

AGE-19 task document records exact test counts/build result and timing for final SHA.
Do not substitute unit tests/build output for browser verification. Browser tests
remain historical scripts; they were not run because extension-only controls apply.
Host must verify 390x844 / 1440x900 plus 320px reflow, keyboard labels/order/focus,
booking success/stale/unavailable/uncertain states, admin login/hours/closures and
reconciliation, pagehide/BFCache consent, storage failure, network/cookies and
public/private full-document transitions. Measure loading/request bottlenecks there.
Independent AGE-18 security and AGE-21 CX consent review remain actual reviewer
paths. Calendar connection/OAuth and host backup drill remain unverified here.
Owner acceptance must identify the final integrated SHA in the interactive local
Comet session; AGE-11/14 gates and all release/publication restrictions remain.
