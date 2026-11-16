# Repair log and final handover — 2026-11-16

## Findings and fixes

| Finding / root cause | Implementation |
|---|---|
| Atlas URI omitted database; driver could use default test database | Operator confirmed hostname and nvs_buildcon. Updated only database path in ignored .env. database.js now refuses a missing explicit database name. Actual ping succeeded; database has no collections. |
| Mongoose buffered queries without a connection; health falsely implied readiness | database.js disables buffering/automatic schema writes, adds three bounded attempts and connection events. routes/index.js returns 503 before data routes. /api/health is liveness; /api/ready is database readiness. |
| Startup lacked shutdown and port error handling | server.js closes HTTP/Vite/Mongoose on signals, bounds shutdown, handles EADDRINUSE. start.bat no longer taskkills unrelated processes or announces readiness before listening. |
| Existing seed logic could create a hidden/random admin and swallowed failures; referenced CLI missing | seed.js now constructs validated content entries and insert-only missing-record upserts. scripts/seed.mjs defaults to dry-run; apply/confirm target required. No historical data manufactured. |
| make-admin promoted a fixed email and rewrote notification settings | Replaced with compatibility wrapper for bootstrap-admin.mjs, which requires explicit strong credentials and refuses existing accounts/admins. No normal-startup admin creation. |
| Gmail service preset bypassed configured SMTP port; arbitrary providers had passwords whitespace-stripped | emailService.js now honors host/port/TLS, requires STARTTLS for non-secure SMTP and removes App Password spaces only for Gmail. EMAIL_PROVIDER selects smtp/resend explicitly. |
| Test email utility sent by default, duplicated config, printed credential prefixes and OTP | scripts/test-email.mjs verifies SMTP without mail by default; --send recipient is explicit. Safe code/status diagnostics only. Actual Gmail check failed EAUTH/535. |
| Registration deleted pending users on mail failure and exposed provider errors | Pending identity is retained; duplicate pending registration resends without overwriting account details. Failures return actionable 503. Verified duplicate returns 409. |
| Phone OTP returned a deep link as delivered | Replaced false success with real configured SMS-provider sending; refuses unverified phone ownership. Enrollment and live provider validation remain pending. |
| Access tokens exposed in JSON and localStorage; refresh token stored raw and could repeat within the same second | Cookie-only browser transport, hashed refresh persistence, unique refresh JWT ID and atomic old-token comparison for rotation. Browser API wrapper retries once after shared refresh. |
| Logout/reset did not revoke issued access tokens; roles trusted stale JWT claims | sessionVersion checked against current account on protected routes. Logout/all-device/reset invalidate sessions. Blocked/inactive/unverified users cannot refresh. |
| Local JWT secrets were identical | Generated independent random local secrets; placeholder/equal secrets rejected. No secret logged or committed. |
| CORS allowed arbitrary Vercel domains and permissive development origins | Exact configured origins only; cross-origin cookie writes checked; secure cookies forced by NODE_ENV=production or IS_PRODUCTION=true. |
| Public forms protected by backend CAPTCHA but frontend never supplied tokens | Added widget to enquiry, callback, consultation, contact and wizard forms. Widget loads official script, preserves callbacks and bounds loading. Provider failure fails closed. |
| Callback generated a fabricated email | Removed placeholder; conditional model/route validation permits phone-only Callback Request records. |
| Repeated submissions could insert duplicates | Five-minute, bounded in-memory duplicate guard alongside existing IP rate limiter. Failed writes release guard for retry. Shared store still required for multi-instance deployment. |
| Content updates accepted internal fields; some updates missed validators | Explicit writable field utility for projects/gallery/plans/blogs/services/testimonials; runValidators added where missing, including admin/enquiry updates. Existing regex repairs preserved; search result caps added. |
| GET settings silently wrote defaults | Missing settings now returns 503 until explicit operator initialization. |
| House plan could fabricate name/phone fallback | Existing persistence kept; requires a real account/contact phone and uses plan area. Mock verifies an enquiry is stored before 201. |
| Cloudinary placeholders treated as configured; local deletion allowed path traversal | Placeholder detection, MIME/extension pairing, size limits, unknown-type rejection and safe local identifiers. Production refuses ephemeral local upload fallback. Live uploads and file-content scanning remain unverified. |
| Invalid custom rates could crash pricing; print document interpolated HTML | Validate custom catalog shape, finite/nonnegative arithmetic and rounding; HTML-escape printed text; mark figures as indicative estimates. Business rates unchanged. |
| Missing React type definitions hid an invalid video attribute | Added @types/react and @types/react-dom; removed unsupported video fetchPriority. Added an error boundary without redesign. |
| Render build did not create frontend and enabled automatic deployment | Blueprint now uses npm ci plus build, /api/ready health check and autoDeploy false. No platform settings changed remotely. |

Additional final repairs: logout failures now remain visible instead of falsely clearing local session state; unknown API routes terminate with JSON 404 before Vite proxying; access logs omit query parameters so reset tokens are not logged. test-and-build.bat now includes lint and stops at the first failed stage. The two logout controls both revoke the account session version, consistent with the existing single refresh-session model.

## Dependency changes

The existing lockfile was retained and updated using targeted npm updates. Verified installed versions include Mongoose 9.12.1, Express 4.22.3, Vite 6.4.6, Multer 2.5.0, React Router DOM 7.18.5 and Nodemailer 10.6.0. Nodemailer is the intentional major-version change to address current advisories; transport behavior is covered with mocks, while actual Gmail auth still fails. React type packages were added for real TypeScript checking. No forced audit fix was used.

Initial npm audit: 24 findings (2 critical, 13 high, 9 moderate). Updated full-tree audit: six moderate findings in the TypeScript ESLint/minimatch tooling chain. npm recommends an incompatible parser downgrade; it was not applied. See dependency-audit.json and dependency-audit-production.json for machine-readable reports. npm also warned that ESLint 9 is unsupported and scmp is deprecated; future compatible lint-tool migration remains maintenance work.

Primary references: [Mongoose advisory](https://github.com/Automattic/mongoose/security/advisories/GHSA-8332-j7wj-wjw4), [Nodemailer releases](https://github.com/nodemailer/nodemailer/releases), [Vite support policy](https://vite.dev/releases), [SMTP verification](https://nodemailer.com/smtp).

## Data, integrations and security status

Database reconstruction has not been executed. No customer history was recovered; no surviving dump/export was found in workspace inventory. Gmail credentials must be corrected privately. No sender/domain, real inbox delivery, Cloudinary upload or production CAPTCHA completion is claimed. JWT credentials were rotated locally; MongoDB and SMTP values were not changed. Local .env being present is normal and does not by itself prove exposure. .env is ignored, untracked, and no .env path appeared in the inspected Git history. Rotate other credentials if they were exposed elsewhere; this inspection cannot establish that.

Production approval is blocked by the specific items in CURRENT_PROJECT_STATUS.md. Public PDF access remains an explicit privacy gate: robots.txt does not authorize or secure documents. Pricing owner approval is still required. No deployment, seed or admin bootstrap was performed.

## Validation and modified files

TEST_REPORT.md records exact passing counts and limits. CHANGED_FILES.txt contains the working-tree paths at handover, including earlier user changes; the initial dirty files were docs/PROJECT_AUDIT.md, docs/REPAIR_PLAN.md, docs/SECURITY_REPORT.md, docs/TEST_REPORT.md, package.json/lockfile, database.js, content/gallery/project controllers, housePlanRoutes.js, seed.js, AdminLogin.tsx and run-tests.mjs. Existing untracked audit DOCX, backup guide and ESLint config were preserved.

No claim is made that every feature is bug-free or fully production-tested. Live email-dependent registration, real persistence, private document delivery, production deployment and mobile/accessible interaction coverage remain limited as documented.
