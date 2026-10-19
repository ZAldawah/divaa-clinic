# Consent withdrawal remediation — developer evidence

Base: 5765459662956e20ea06c32dfde8fc75f58038b0. Branch: dev/age-20-consent.

## Behavior and rationale

SEC-18-01: a previously accepted sessionStorage value could survive a failed rejection write and restart collection on reload. Writes now require matching readback; failed writes/readback trigger best-effort removal and return saved=false even if removal succeeds. Analytics stops before persistence access. Failure copy stays visible and does not claim a saved rejection.

When both storage writing and removal fail, stale acceptance is indistinguishable from valid acceptance on a later document. Therefore stored acceptance never authorizes startup. Explicit verified acceptance enables only the current document runtime; session-stored rejection remains effective. Reload needs fresh acceptance. pagehide stops the existing runtime; BFCache pageshow restores only rejected/unknown state. Client-side navigation within the mounted document retains explicit acceptance, and navigation after withdrawal stays off.

This deliberately narrows acceptance lifetime. Updated disclosure is draft pending Customer Experience and owner review. No production setting changed.

## Verified synthetic results

Run from this worktree, requiring only Node (no database, dependencies, server or Google access):

    node --test tests/analytics-consent.test.mjs tests/analytics.test.mjs tests/ga4-transport.test.mjs

16 tests passed, 0 failed. New regressions execute the same chooseConsent/restoreConsent functions imported by AnalyticsConsent.jsx and the real createAnalytics runtime with a recording transport.

- Prior explicit acceptance -> rejection write throws with reads succeeding -> saved=false, transport off.
- Removal succeeds: stored value null. Removal throws: stale value accepted. Both reload into unknown with zero transport starts/events.
- Restoring the previously accepted runtime through the restoration function does not restart collection or emit on navigation/contact actions.
- Storage recovers: no automatic restart; explicit reacceptance starts once and emits current page only.
- Normal rejection persists, reads rejected, and remains off on reload.
- Silent/no-op writes and read failures do not claim saved consent or start transport.
- Existing payload minimization, private-path exclusion, preview, and synchronous transport revocation tests remain passing.

## Limits and next owners

Synthetic lifecycle restoration is verified; actual browser BFCache event delivery, mobile/desktop rendering, screen-reader announcements and keyboard focus are not tested in this task. Existing native buttons, status roles and focus handling remain in source. No real Google collection, database fixtures, browser control, service restart, merge or deployment occurred.

Independent Security Reviewer: recheck immutable fix and integrated candidate under AGE-18. Customer Experience: review the narrower lifetime and failure disclosure. AGE-19 integration owner: include this commit after the analytics base and report the final integrated SHA; do not overwrite an active worktree. Preserve all existing owner/release gates.
