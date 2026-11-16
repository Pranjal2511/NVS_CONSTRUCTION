# Master repair plan — execution record

## Completed code work

1. Inspect Git status and preserve existing repairs; inventory source, routes, models, scripts, public assets, tests and deployment files.
2. Centralize bounded MongoDB startup, lifecycle monitoring, disabled query buffering, explicit database selection, readiness gate, graceful shutdown and sanitized failure logs.
3. Separate starter-content initialization from admin creation. Default both operator scripts to dry-run and require target confirmation for writes.
4. Make SMTP port/TLS selection explicit; provide a connectivity-only verification command; retain pending registrations after mail failure.
5. Remove JSON/localStorage bearer tokens; add cookie refresh retry, atomic refresh rotation, hashed refresh storage, access-session revocation and current-role checks.
6. Restrict CORS origins, add browser-origin checks for cookie writes, retain schema validators and restrict content writable fields.
7. Repair callback-without-email, CAPTCHA wiring, missing-settings behavior, upload identifier validation, duplicate submissions and calculator output wording.
8. Apply targeted dependency updates, supply React type definitions and run tests, type checking, lint, clean installation and build.
9. Verify read-only Atlas connectivity and collection inventory; inspect browser rendering and arithmetic without customer writes.
10. Document observed results, blocked integrations and exact operator commands.

## Awaiting operator / external configuration

1. Approve content and initialization commands in CURRENT_PROJECT_STATUS.md. No initialization has run.
2. Supply valid SMTP/App Password privately (or verified Resend configuration); verify transport, then approve a real test recipient.
3. Bootstrap an admin separately after approval; confirm missing collections and unique/TTL indexes before registration tests.
4. Run approved user journeys in an isolated test database: register, verify OTP, login, refresh, logout, password reset, enquiries, appointments and plan requests.
5. Classify each public PDF and move confidential files to authenticated private delivery before publishing. Preserve approved public brochure links.
6. Approve one pricing catalog. Recommended owner: validated SiteSettings.customRates, with public display and calculator using the same catalog; reconcile legacy planningPrice/constructionPrice and published PDF metadata without silently changing rates.
7. Validate live CAPTCHA, upload provider, production origins/cookies, backups, monitoring and a production deployment preview.
8. Resolve remaining dev-tool advisories with a compatible upstream release; validate shared rate limiting/idempotency before horizontal scaling.

No phase is considered live-verified solely because a mock test passes. Detailed limitations are in CURRENT_PROJECT_STATUS.md and TEST_REPORT.md.
