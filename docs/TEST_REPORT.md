# Verification report — 2026-11-16

This section supersedes older test totals and unsupported feature claims below.

| Check | Observed result |
|---|---|
| npm ci | Exit 0; clean lockfile install, 508 packages added. npm warned about deprecated scmp, unsupported ESLint 9, six moderate advisories and esbuild install-script policy. |
| npm run typecheck | Exit 0 after adding React types and removing unsupported video fetchPriority. |
| npm run lint | Exit 0, zero errors, 65 warnings at final lint capture. Warnings include existing any/unused imports and hook dependencies; they were not suppressed. |
| npm test | Exit 0: 16 existing tests plus 39 Node test-runner checks, **55 passed, zero failed**. |
| npm run build | Exit 0 after clean installation; Vite 6.4.6 built the frontend and prerendered nine public routes. |
| npm audit --omit=dev | Zero reported vulnerabilities. |
| Full npm audit | Six moderate findings; zero high/critical. Initial audit was 24 findings including two critical and thirteen high. |
| Atlas connection / ping | Actual success after selected database name was added. Read-only collection inventory returned zero collections. |
| SMTP verify | Actual failure: EAUTH, responseCode 535. No email sent. |
| Browser | Homepage, calculator, login rendered. Area 1,000 -> 2,000 at existing rate 3 changed estimate 3,000 -> 6,000. Observed browser error log query returned no entries at that point. |
| Production deployment | Not run. No site was deployed. |

## Coverage and interpretation

tests/run-tests.mjs retains the earlier regex/header/auth/input checks, but now explicitly isolates test environment and stubs database availability/account lookup. tests/repair.test.mjs covers disconnected 503s, exact origin rejection, invalid/revoked JWTs, SMTP options and non-sending verification, pending registration after mail failure, resend without identity overwrite, verified duplicates, OTP cooldown/consumption/replay, password login, refresh rotation/blocked users, logout revocation, callback schema/API behavior, mass assignment, gallery validators, house-plan persistence, fixture validation, mocked seed dry-run/idempotency, operator guards, upload mismatch/traversal, bounded connection failure, CAPTCHA rejection/outage, duplicate submission control, appointment persistence, date validation, missing settings and rate limits.

tests/frontend.test.mjs covers calculator arithmetic/rounding/invalid values, custom-rate validation, print HTML escaping, cookie-based API requests/refresh and no automatic retry for rejected login. Added tests ensure failed logout does not claim success, successful logout clears local helper state, and unknown APIs return JSON 404 without query-secret exposure.

All automated tests use test-only generated secrets, isolated fixtures and model/provider mocks. Test mode does not load .env. No actual database connection or email delivery is performed by the suites. Fake addresses are test fixtures only and were not inserted into Atlas. Mocked seed apply calls test insertion behavior in memory; **the operator initialization script was not executed**.

## Live read-only smoke check

After clean installation and the final build, the integrated server connected on port 3000. GET /, /calculator and /login returned HTML 200. Health/readiness and projects/gallery/house-plans/services/blogs returned JSON 200 with empty content. Settings returned the expected 503 because initialization has not occurred; profile/admin without authentication returned 401; unknown API returned JSON 404. A second collection inventory still returned zero collections. Ctrl+C produced the MongoDB disconnect event and stopped the process; the terminal wrapper reported exit 1 for the interrupt, not a successful ordinary exit. Port availability was checked afterward.

## Limits / failed checks

Initial repair-test execution exposed three test/fix issues: wrong gallery export name in the test, asyncHandler not returning its promise, and missing early upload-path rejection. They were corrected and regression checks pass. Adding real React type definitions exposed an unsupported video fetchPriority attribute; it was removed and type checking passes. The earlier invalid PowerShell brace-expansion search was rerun using Windows-compatible paths. No failed command was treated as success.

The intended development database is empty. Successful real registration/OTP verification, inbox delivery, customer data writes, seeded content retrieval, admin login, actual provider uploads and production cookie behavior are not accepted end-to-end. CAPTCHA integration is mocked; no challenge was solved. No pixel-perfect mobile or comprehensive accessibility audit was completed. Nine PDFs were inventoried but not classified by their owner. Pricing consistency cannot be approved until the business resolves the conflicting catalogs. Full clean installation/build passed, but the remaining dev-tool warnings/advisories are not resolved.

Detailed logs from this workspace are in ignored test-run.log and build-run.log; machine-readable lint/audit reports are under docs. These contain test fixtures, not secret values.

---
## Historical test report retained below

# Quality Assurance & Verification Test Report
## NVS Buildcon & Architects Platform

**Date:** October 2026  
**Test Runner:** Node.js native test runner & TypeScript compiler  
**Overall Result:** **ALL SUITES PASSED**

---

## 1. Test Execution Summary

| Test Category | Suite / Command | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Static Type Checking** | `npm run typecheck` (`tsc --noEmit`) | Entire Project | Pass | 0 | **PASS** |
| **Linting** | `npm run lint` (ESLint) | Entire Project | Pass (0 errors) | 0 | **PASS** |
| **Frontend Production Build** | `npm run build` (`vite build + prerender`) | 2725 modules, 9 routes | Pass | 0 | **PASS** |
| **API Integration & Regression** | `npm test` (`node tests/run-tests.mjs`) | 16 test cases | 16 | 0 | **PASS** |

---

## 2. Detailed Integration Test Results

```
====================================================
🧪 Starting NVS Buildcon Production Verification Tests
====================================================

• Testing: escapeRegex: escapes dangerous characters... ✅ PASS
• Testing: escapeRegex: limits maximum length to prevent ReDoS... ✅ PASS
• Testing: escapeRegex: handles non-string and empty input safely... ✅ PASS
• Testing: formatAuthResponse: does NOT expose refreshToken in JSON payload... ✅ PASS
• Testing: Security Headers: X-Content-Type-Options is nosniff on API... GET /api/health 200 ✅ PASS
• Testing: Health Check: /api/health returns 200 with success status... GET /api/health 200 ✅ PASS
• Testing: Access Control: /api/admin/stats blocks unauthenticated requests with 401 JSON... GET /api/admin/stats 401 ✅ PASS
• Testing: Access Control: Non-admin tokens blocked from admin endpoints (403)... GET /api/admin/stats 403 ✅ PASS
• Testing: Input Validation: /api/auth/register validates required email and phone (400)... POST /api/auth/register 400 ✅ PASS
• Testing: Input Validation: /api/auth/login requires valid email format (400)... POST /api/auth/login 400 ✅ PASS
• Testing: Enquiry Route: Rejects invalid empty payload with 400... POST /api/enquiries 400 ✅ PASS
• Testing: Appointment Route: Rejects missing date/time with 400... POST /api/appointments 400 ✅ PASS
• Testing: Global Search: Empty query returns empty structured arrays without DB hit... GET /api/search?q= 200 ✅ PASS
• Testing: House Plan Request: Requires authentication (401)... POST /api/house-plans/:id/request 401 ✅ PASS
• Testing: escapeRegex: project/gallery search metacharacters handled literally... ✅ PASS
• Testing: escapeRegex: caps query length to prevent ReDoS on search... ✅ PASS

====================================================
Results: 16 passed, 0 failed (16 total)
====================================================
```

---

## 3. Verified Fix Highlights

1. **ReDoS Mitigation:** `escapeRegex` applied to `projectController.js` and `galleryController.js` search endpoints (in addition to existing coverage in `searchController`, `blogController`, `housePlanController`). Regression tests confirm metacharacters are escaped literally and query length is capped at 100.

2. **Schema Validation on Updates:** `{ runValidators: true }` added to `galleryController.updateGalleryItem` and `contentController.updateService` / `updateTestimonial`.

3. **Access Tokens & Leakage:** `formatAuthResponse` returns `{ token, accessToken, user }` and omits `refreshToken`.

4. **Route Protections:** Unauthenticated requests to `/api/admin/stats` return HTTP 401; non-admin tokens return HTTP 403.

5. **House-Plan Request Middleware:** `POST /api/house-plans/:id/request` wired with `authenticate`, `submissionLimiter`, and `verifyCaptcha`.

6. **Safe Seeding:** `seedDatabase()` no longer auto-runs on DB connection; admin seed password no longer hard-coded or logged.

7. **Linting:** ESLint configured with TypeScript/React plugins; `npm run lint` exits with 0 errors.

8. **Build:** `npm run build` completes successfully (2725 modules, 9 prerendered routes).

---

## 4. Unverified Items

The following could not be executed in this session because they require a live MongoDB database, external provider credentials, or manual browser interaction:

- End-to-end authentication flows against a live database (registration, login, OTP, refresh, logout).
- Rate-limit enforcement under live traffic.
- House-plan request persistence to a live database.
- Email/SMS/WhatsApp notification delivery.
- Cloudinary file uploads.
- Production deployment.

These are documented as requiring owner approval and a configured `.env` before production deployment.
