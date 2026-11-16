# Current project status — 2026-11-16

## Follow-up update — supersedes historical state below

- The operator reported successful Gmail SMTP connection and authentication verification after replacing the App Password. That check did not send mail. A subsequent screenshot showed a signed-in client session.
- At the operator's explicit request, an OTP-only administrator was created in `nvs_buildcon`. Read-back confirmed the admin role and active status. Email ownership remains pending until successful OTP login; no password was assigned. Admin login completion has not been verified.
- The database is no longer empty. Starter content initialization has still not been performed; do not rerun admin bootstrap for the existing account.
- Public login now redirects to the homepage. The dedicated admin login retains its admin dashboard destination.
- Pre-push verification passed: TypeScript, all 55 automated tests, production build and nine prerendered routes. `.env` is untracked and ignored. A scan for current local secret values in Git-visible files found only Cloudinary placeholders in `.env.example`.
- Production gates below still apply where not superseded, including content/settings, public PDF publication rights, live provider checks, pricing and deployment configuration.

The following sections record the earlier repair checkpoint, not the current database or SMTP state.

This report supersedes earlier audit conclusions. Existing React/Express architecture and black-and-gold design were retained. The workspace is F:\nvs\NVS_CONSTRUCTION, not the older D: path in the supplied brief. Pre-existing working changes were preserved; nothing was committed or deployed.

## Verified environment

- Operator confirmed the configured Atlas hostname and selected **nvs_buildcon** as the development database. The local URI now includes this name; its password was left unchanged.
- Actual connection and ping succeeded. A read-only listCollections call returned **zero collections**. This is not recovery of the deleted database. Empty databases may not appear in Compass until their first approved write.
- No seed, administrator, test customer, enquiry, appointment, collection or index was created in Atlas during this repair.
- Local JWT access/refresh secrets were identical. Both were replaced with independently generated random values in the ignored local .env. Existing sessions are invalidated. No values were printed.
- Gmail SMTP verification failed with **EAUTH / 535**. No test email was sent. Correct SMTP credentials must be supplied privately; a successful socket connection alone is not email delivery.
- The full-stack development server started at http://localhost:3000. Browser checks observed the homepage, calculator and login page. The calculator changed from 3,000 to 6,000 at the existing 3/sq.ft rate when area changed from 1,000 to 2,000 sq.ft. No browser submission wrote to the database.
- The seed source validates as 8 projects, 17 gallery items, 10 house plans, 4 testimonials, 3 services, 2 blogs and 1 settings record: **45 starter records**. Existing testimonial text is repository content, not independently verified historical evidence.

## Readiness assessment

Code repair and automated verification are documented in TEST_REPORT.md and REPAIR_LOG.md. The complete application is **not production-ready**, and live registration/form persistence has not been accepted end-to-end. Remaining gates:

| Gate | Exact blocker / next action |
|---|---|
| Starter database and indexes | Operator has not approved initialization. Review the commands below. |
| Admin account | Separate operator-supplied email/password and explicit bootstrap approval are required. |
| Live registration / OTP / reset mail | Gmail rejects credentials. Configure an App Password or verified Resend provider, then approve a test recipient. |
| Live data persistence | Empty database; approved initialization and dedicated test fixtures are pending. Mocked controller persistence tests do not prove Atlas writes. |
| Public PDFs | Nine PDFs are present under public/pdfs; some filenames identify client drawings. Confidentiality and publication rights have not been established. robots.txt is not access control. No files were deleted or moved. |
| Cloudinary | Validation is tested, actual provider upload is not. An approved disposable asset and valid provider configuration are required. |
| CAPTCHA | Form wiring and rejection/outage behavior are tested; actual domain/site-key challenge completion is unverified. |
| Phone OTP | The old deep-link implementation falsely claimed delivery. Real SMS sending now requires a configured Twilio sender and a verified phone binding. There is no phone-ownership enrollment UI yet; use email login. |
| Pricing approval | Settings defaults (planning 5, construction 1,100) differ from the detailed frontend catalog (standard planning 3). No rates were overwritten. Owner must approve the canonical catalog. |
| Deployment / operations | Production domains, reverse-proxy trust, backups, private storage and production smoke tests remain unconfigured/unverified. No deployment was performed. |
| Tooling advisories | Six moderate findings in the TypeScript ESLint/minimatch dependency chain remain. Do not use a forced downgrade to resolve them blindly. |
| Scale-out | Submission deduplication/rate limiting use process-local memory. A shared store is required for multiple backend instances. |

## Reviewable initialization plan — NOT EXECUTED

Seed defaults to a read-only dry-run. It validates all starter records, matches existing records by their natural seed keys, preserves existing content and inserts only missing records. Apply also creates declared indexes without dropping existing indexes or collections. Run only one initializer at a time. Partial failures are reported; there is no transaction covering all collections, so inspect the result and rerun safely if interrupted.

Windows CMD, from the repository:

    cd /d F:\nvs\NVS_CONSTRUCTION
    node scripts/seed.mjs --database nvs_buildcon

Only after approving the plan and target:

    node scripts/seed.mjs --database nvs_buildcon --apply --confirm nvs_buildcon

Admin is separate. Privately set ADMIN_SEED_EMAIL and a unique ADMIN_SEED_PASSWORD (12–72 characters, upper/lower/number/symbol) in the local environment. Then review:

    node scripts/bootstrap-admin.mjs --database nvs_buildcon

Only after separate approval:

    node scripts/bootstrap-admin.mjs --database nvs_buildcon --apply --confirm nvs_buildcon

The admin workflow refuses to promote an existing user or replace an existing admin. Remove bootstrap credentials after use. The compatibility command scripts/make-admin.mjs now invokes the same guarded workflow. Both workflows refuse production mode; permitted development targets are the operator-selected nvs_buildcon or names matching nvs_*_dev / nvs_*_test.

## Windows startup

    cd /d F:\nvs\NVS_CONSTRUCTION
    npm ci
    npm run db:check
    npm run email:verify
    npm run dev

Alternatively run start.bat. It checks Node, dependencies, .env and PORT, reports database failures, and never terminates an unrelated process or seeds data. A database outage permits only the development frontend; data APIs return 503. Use Ctrl+C to stop. The separate optional frontend process uses port 3001 and proxies to the integrated server on port 3000.
