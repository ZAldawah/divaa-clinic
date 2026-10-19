# Consent review changes — draft

The visible panel now includes the proposed generated-identifier, Google recipient,
scope-exclusion and withdrawal disclosure. A persistent live status reports on/off
even when settings close. Equal controls and existing focus-return handlers remain.
The owner's pending privacy decision still governs activation; no retention period
or approved legal notice is claimed. Copy must be reconciled with the eventual answer.

## Isolated interface preview

Operator command: `node scripts/consent-preview.mjs` from this worktree.
It binds loopback port 3014 and enables analytics UI with an inert transport.
The panel explicitly labels draft copy and disabled Google collection.
This supports interface review, not real GA network/cookie/security sign-off.
The preview transport cannot access browser globals, load Google, or write cookies;
a regression test exercises start/send/stop/restart with throwing browser proxies.

Paperclip rejected agent configuration of the managed runtime command:
`Agent keys cannot modify host-executed workspace commands`.
The board/host operator must configure this exact command through the managed
project workspace runtime, bind it to the resulting commit, and attach the authorized
Chrome/Comet extension. No unmanaged runtime was started to bypass this restriction.
Expected URL after a successful managed start: http://127.0.0.1:3014 (not yet live).

## Evidence and next action

12 focused Node tests pass. These use fake/inert transports, not browser collection.
Initial plain ESLint invocation skipped JSX; use explicit `--ext .jsx,.mjs` for
targeted verification. No screenshots or rendered keyboard checks are claimed.
Required CX evidence remains 390x844 and 1440x900, long service page, contact
access, accept/reject/reopen/withdraw/reaccept/storage failure, focus and tab order,
reload and fresh/restored/duplicated tabs. Required real transport checks remain
separate and must use approved nonproduction collection or interception.

Do not resubmit as ready for CX sign-off until that browser evidence exists.
Production defaults off; no push, merge, deployment or live collection authorized.
