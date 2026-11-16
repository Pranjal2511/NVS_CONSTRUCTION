# Deployment guide — approval pending

No deployment was performed. Do not deploy until the blockers in CURRENT_PROJECT_STATUS.md are resolved. Build success does not prove live email, customer persistence, privacy or production readiness.

## Integrated Render / Node service

Use the existing architecture:

    npm ci
    npm run typecheck
    npm run lint
    npm test
    npm run build

Set production environment variables privately, then start with npm start. NODE_ENV must be production. Do not omit build dependencies before building. The Render blueprint now uses npm ci && npm run build, starts npm start, checks /api/ready and disables automatic deployment. These are repository changes only; no hosted service was modified.

Use a supported Node version satisfying dependencies (22.12+; local tests ran on 26.13.1). Configure MONGODB_URI with an explicit intended production database, independent JWT secrets, APP_URL/CLIENT_URL exact HTTPS origins, EMAIL_PROVIDER and valid sender configuration, hCaptcha domain keys and persistent media storage. Local developer credentials must not be copied to production.

The backend currently trusts one reverse-proxy hop. Verify that the hosting edge is the only route to the backend and strips/replaces forwarded headers. Review this setting for a direct-hosted server or a different proxy topology.

## Vercel frontend plus Render API

vercel.json hosts the built frontend only; it does not run the Express/Mongoose backend. Supply VITE_API_URL at frontend build time with the real API origin. Set APP_URL and CLIENT_URL to actual permitted origins on the API service. There is no universal vercel.app allowlist.

Cross-site cookies need COOKIE_SAME_SITE=none with HTTPS Secure cookies, but browsers may still block third-party cookies. Prefer same-site custom domains or a reviewed same-origin proxy. Verify registration, refresh and logout from the actual production browser; localhost success is insufficient.

## Database provisioning

The developer seed/admin tools refuse production mode. Provision production content and the initial administrator through a separately approved, reviewed maintenance procedure, including declared unique/TTL indexes. Never temporarily weaken live authentication or enable public admin registration. Before changing an existing target, take and verify a backup. Do not run any drop/delete/syncIndexes workflow.

## Required release gates

- Actual email sender and inbox test; successful registration/verification, resend after temporary failure, password reset, login, refresh, logout and current-role checks.
- Approved content/catalog and verified persistent enquiries/appointments/house-plan requests on a dedicated test environment.
- Real CAPTCHA and Cloudinary tests using approved test assets.
- Classify every public PDF. Confidential documents must leave public/ and unauthenticated upload serving; implement per-user authorization and signed/private delivery before publishing them. robots.txt cannot secure them.
- Exact CORS/cookie settings, TLS, proxy trust, production CSP and browser testing on the hosted domains.
- Backup policy and a successful restore rehearsal to a separate empty target.
- Uptime monitoring of /api/health and /api/ready, plus separate email-delivery/notification and data-write checks. Readiness endpoint proves database connectivity only.
- Shared rate-limit/idempotency store for more than one backend instance. Current duplicate guard is local to one process.
- Remaining dev-tool advisory/deprecation review and an operational rollback plan.

## Health and rollback

/api/health reports process liveness and a databaseReady boolean. /api/ready returns 200 only while MongoDB is connected; data APIs return 503 when disconnected. Production startup fails after bounded unsuccessful database attempts.

Keep the previous build and environment configuration available for rollback. Rolling back code does not roll back data, and old refresh-token storage is incompatible with the hardened session format; require re-login after a rollback. Do not restore over production without an explicit approved recovery plan.
