# Redesign inventory and cleanup record
Baseline 6f22570d7176b186a9bcba6c314e8d41784e896c; inspected before edits 2026-10-08. Isolated age-26/redesign worktree. Original baseline and untracked AGENTS.md preserved.

Usage before cleanup: rg --files src confirms 15 page files / 13 URLs / nine API handlers. rg imports confirms Home alone uses BestSellers, PopularServices, ServiceTicker. Replace their partial/carousel/duplicated animated directory with one nine-service grid. Nine page.jsx files consume ServiceLayout. Filler/facials additionally declare standalone page.js: comparison found same unverified clinical/price/FAQ families, SMS hero versus shared treatment-booking CTA. Keep one page.jsx, preserve SMS contact and backend IDs, use consulting for marketing consultation links. Both originals remain in baseline Git history.

Styles: globals.css imported by both document roots; legacy home/widget/navbar/footer/clg selectors replaced with shared semantic tokens and scoped families. Retain privacy aliases. booking.css imported by all three private pages; preserve used form/admin classes. AnalyticsConsent.module.css remains isolated. All live booking/admin/consent components retained.

Dependencies: Next/React/React DOM routes/UI; Temporal timezone; pg persistence; better-auth staff; google-auth-library Calendar; zod validation; @vercel/functions lifecycle; server-only boundaries; ESLint lint; Playwright existing tests (not authorized to execute browser automation); Tailwind/PostCSS build config. No package/lockfile change warranted.

Planned removals: duplicate filler/page.js, facials/page.js; three homepage widgets once unreferenced; obsolete public CSS; unsupported visible/schema/metadata assertions. No asset, secret, backup, evidence, unrelated file, API, backend, security, recovery or test removal. Git history preserves prior code. No unused-dependency assertion.

Assets: original text wordmark/CSS geometry; system sans/Georgia. No downloaded or competitor assets or implied rights. Existing public/pictures files preserved but unused by redesigned pages. No photo placeholders or before/after imagery.

Inputs: design-brief ddef89ef-6166-4513-ad09-66960fac0b30; CX b9d49d8f-492c-447b-a84c-e1ece01a299c; research ff1f3bbe-4b1e-4cf0-8233-6e4865faee18; plan 411a4f77-b67c-4832-86b5-d32c830da8a4.
Guidance: installed Next 16.4 layouts/pages, CSS, error handling; https://nextjs.org/docs/app/getting-started/css and https://react.dev/reference/react-dom/components/input read 2026-10-08. Shared global styles at document roots, scoped component CSS, controlled fields with labels/onChange. No framework/auth migration.

Completed cleanup: all five planned file removals made after usage review. Global CSS/ServiceLayout and public page content replaced. All backend/API/analytics library and lockfile diffs remain empty. globalNotFound is enabled because two existing document roots require a global fallback (installed Next 16.4 file-conventions/not-found guide). No alternate browser automation used.
