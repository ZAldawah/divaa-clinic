# Static hosting requirements

This candidate is a Next.js static export. The deployment host must honor the
`public/_headers` file emitted at the root of `out/`. It restores the response
headers previously configured in `next.config.mjs`: `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`.

The static preview and deployment host must be checked for these response
headers before acceptance. Static export does not apply Next.js response-header
configuration itself. No host-specific configuration or production deployment
is included in this candidate.
