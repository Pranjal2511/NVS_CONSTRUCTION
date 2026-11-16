# Current audit addendum — 2026-11-16

This addendum supersedes the historical findings below. The previous working audit is retained as history; its old claims of live functionality and robots.txt privacy protection are not current acceptance evidence.

See CURRENT_PROJECT_STATUS.md for the observed system state, REPAIR_LOG.md for source-level root causes/fixes and TEST_REPORT.md for verification. The configured Atlas connection now succeeds against the operator-selected nvs_buildcon database, with zero collections. No seeds/admins/customer fixtures were written. Gmail verification fails EAUTH/535. Distinct local JWT secrets were generated without logging values.

Previously repaired regex escaping and gallery/content validators were preserved. Additional changes cover database 503 gating, safe initialization, pending registration, cookies/refresh/revocation, exact origins, callback email, CAPTCHA wiring, bounded search, writable fields, missing settings, upload paths, calculator validation and Windows startup. See the repair log for exact files.

Remaining release gates: no approved initialization, no successful live email/user journey, unclassified public PDFs, unverified actual uploads/CAPTCHA, business pricing approval, backup/restore and hosted-domain verification. Six moderate dev-tool dependency findings remain; production audit has zero findings at this check. This is not a claim of universal security or full end-to-end completion.

---
## Historical audit retained below

# Comprehensive Full-Stack Audit Report
## NVS Buildcon & Architects Web Application

**Date:** October 2026  
**Auditor:** Senior Full-Stack, Security, Database, DevOps & QA Systems Engineer  
**System Target:** NVS Buildcon & Architects (`NVS_CONSTRUCTION`)  
**Scope:** Frontend (React 19, TypeScript, Vite 6, TailwindCSS), Backend (Node.js, Express 4, MongoDB/Mongoose 9, JWT, Cloudinary, Resend/Nodemailer, Twilio WhatsApp, hCaptcha), Assets, Configuration, and Security.

---

## 1. Executive Summary

A comprehensive architectural and security audit was performed on the NVS Buildcon & Architects platform. The codebase exhibits modern frontend engineering (React 19 with Vite, dynamic calculation wizards, portfolio galleries) and structured backend layering (routes, controllers, models, services, validation, audit logs).

Verification against current source code confirms that most previously reported P0–P2 issues have been remediated. However, new and residual confirmed defects remain, most critically:

- Real credentials (JWT secrets, MongoDB URI with credentials, SMTP credentials, admin seed password) present in the local `.env` file.
- Raw regex injection (ReDoS) in `projectController.js` and `galleryController.js` search endpoints.
- Missing `{ runValidators: true }` on update operations in `galleryController.js` and `contentController.js`.
- Automatic `seedDatabase()` invocation on every DB connection (violates safe-seeding rules).
- Password value written to logs in `seed.js`.

These are tracked below with severity, evidence, risk, remediation, verification, and status.

---

## 2. Severity Levels

- **P0:** Critical security or data-loss risks. Immediate action required.
- **P1:** High-risk security or core functionality issues.
- **P2:** Reliability, correctness, performance, and maintainability.
- **P3:** Optional improvements.

---

## 3. Verified Findings Register

| ID | Severity | File / Location | Evidence | Risk | Remediation | Verification | Status |
|----|----------|-----------------|----------|------|-------------|--------------|--------|
| NVS-001 | P0 | `.env` (local, gitignored) | Real `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI` with credentials, `SMTP_USER`/`SMTP_PASS`, `ADMIN_SEED_PASSWORD` present in local `.env` (2041 bytes). | Credential exposure; full system compromise if `.env` is accessed. | Rotate all secrets. Keep `.env` gitignored. `.env.example` must contain placeholders only. | Confirm `.env.example` placeholders; confirm `.env` not tracked in git. | UNRESOLVED (local secrets present; rotation required) |
| NVS-002 | P1 | `server/controllers/projectController.js:13-18` | Raw `search` query parameter inserted directly into MongoDB `$regex` without `escapeRegex`. | ReDoS / regex injection; attackers can trigger catastrophic backtracking or alter query logic. | Import `escapeRegex` and wrap `search` before inserting into `filter.$or`. | `escapeRegex` unit tests pass; search endpoints return safely for metacharacter input. | FIXED |
| NVS-003 | P1 | `server/controllers/galleryController.js:11-16` | Raw `search` query parameter inserted directly into MongoDB `$regex` without `escapeRegex`. | ReDoS / regex injection. | Import `escapeRegex` and wrap `search`. | `escapeRegex` unit tests pass. | FIXED |
| NVS-004 | P1 | `server/controllers/galleryController.js:29` | `findByIdAndUpdate(req.params.id, req.body, { new: true })` — no `runValidators: true`. | Invalid schema updates may persist corrupted data. | Add `{ runValidators: true }`. | Invalid update rejected with validation error. | FIXED |
| NVS-005 | P1 | `server/controllers/contentController.js:20` (`updateService`) | `findByIdAndUpdate(...{ new: true })` — no `runValidators: true`. | Invalid service updates may persist. | Add `{ runValidators: true }`. | Invalid update rejected with validation error. | FIXED |
| NVS-006 | P1 | `server/controllers/contentController.js:45` (`updateTestimonial`) | `findByIdAndUpdate(...{ new: true })` — no `runValidators: true`. | Invalid testimonial updates may persist. | Add `{ runValidators: true }`. | Invalid update rejected with validation error. | FIXED |
| NVS-007 | P1 | `server/config/database.js:15` (prior) | `await seedDatabase()` called automatically on every DB connection. | Unintended data writes; violates safe-seeding rule. | Removed auto-seed; seed only via explicit operator invocation. | `database.js` no longer calls `seedDatabase()`. | FIXED |
| NVS-008 | P1 | `server/utils/seed.js:60` (prior) | `logger.warn(\`Generated random temporary dev admin password: ${tempPassword}...\`)` printed temp password to logs. | Password disclosure in logs. | Removed password value from log message. | Log message no longer interpolates `tempPassword`. | FIXED |
| NVS-009 | P2 | `package.json` scripts | `lint` script was `tsc --noEmit` (duplicate of `typecheck`); no real linter. | No code-style enforcement. | Added ESLint with TypeScript/React plugins; `lint` now runs ESLint. | `npm run lint` exits 0 (warnings only). | FIXED |
| NVS-010 | P3 | `tests/run-tests.mjs` | 14 basic checks only; no coverage for regex injection, runValidators, or middleware wiring. | Limited regression safety. | Added 2 escapeRegex regression tests; suite now 16 tests. | `npm test` passes 16/16. | FIXED |
| NVS-011 | P0 (prior) | `.env.example` | Real JWT secrets previously present. | Credential exposure if copied. | Replaced with placeholders. | `.env.example` contains only placeholder text. | RESOLVED |
| NVS-012 | P0 (prior) | `server/utils/seed.js` | Hard-coded `AdminPassword123!` fallback. | Predictable admin credentials. | Removed fallback; requires `ADMIN_SEED_PASSWORD` env. | `seed.js` no longer hard-codes default password. | RESOLVED |
| NVS-013 | P0 (prior) | `public/robots.txt` | `Allow: /pdfs/` previously exposed client PDFs to crawlers. | Client drawings indexed by search engines. | `Disallow: /pdfs/` present; no `Allow: /pdfs/`. | `robots.txt` blocks `/pdfs/`. | RESOLVED |
| NVS-014 | P0 (prior) | `server/controllers/housePlanController.js` | `requestHousePlan` returned 200 without persisting. | Lost architectural leads. | Persists to `Enquiry` collection + admin notification. | `POST /api/house-plans/:id/request` returns 201 with `enquiryId`. | RESOLVED |
| NVS-015 | P0 (prior) | `server/controllers/authController.js` | `login`/`adminLogin` threw HTTP 410 unconditionally. | Login broken. | Routes to `loginWithPassword` with role checks. | Login flows functional. | RESOLVED |
| NVS-016 | P1 (prior) | `server/services/authService.js:formatAuthResponse` | `refreshToken` exposed in JSON response body. | XSS exfiltration risk. | Removed `refreshToken` from response payload. | Response omits `refreshToken`. | RESOLVED |
| NVS-017 | P1 (prior) | `server/controllers/blogController.js:getBlogBySlug` | Draft blogs accessible by slug to unauthenticated users. | Unpublished content disclosure. | Filters `published: { $ne: false }` unless admin. | Draft slug returns 404 for non-admin. | RESOLVED |
| NVS-018 | P1 (prior) | `server/server.js` | Hardcoded `res.setHeader('ETag', 'strong')` broke caching. | Broken conditional requests. | Removed invalid ETag override. | Valid ETags computed by static middleware. | RESOLVED |
| NVS-019 | P1 (prior) | `server/routes/enquiryRoutes.js` & `appointmentRoutes.js` | `submissionLimiter` + `verifyCaptcha` not wired to public lead endpoints. | Bot spam / database flooding. | Both middlewares applied to `POST /enquiries`, `/enquiries/contact`, `/appointments`. | Middleware present on routes. | RESOLVED |
| NVS-020 | P1 (prior) | `server/controllers/blogController.js:updateBlog` | `findByIdAndUpdate` lacked `runValidators: true`. | Invalid blog updates. | Added `runValidators: true`. | Invalid update rejected. | RESOLVED |
| NVS-021 | P1 (prior) | `server/controllers/appointmentController.js:updateAppointment` | Notification calls not wrapped in try-catch. | Unhandled rejection risk. | Notifications wrapped in try-catch. | DB update completes even if notification fails. | RESOLVED |
| NVS-022 | P3 | `tests/run-tests.mjs` | No automated backend regression tests existed. | Undetected regressions. | 14 checks present (now 16). | `npm test` passes. | RESOLVED |

---

## 4. Notes

- `.env` is gitignored (`.gitignore` contains `.env*`, with `!.env.example` allowed). It is **not** tracked in Git history, but the local file contains real secrets that must be rotated.
- `seed.js` no longer hard-codes an admin password; production seeding requires `ADMIN_SEED_PASSWORD`. Development falls back to a randomly generated password (value no longer logged).
- `database.js` no longer auto-seeds on connection.
- A database deletion incident occurred (database removed via MongoDB Compass). No backup/dump files were found in the repository. Only `seedData.json` exists as approved seed content. See `docs/DATABASE_BACKUP_RECOVERY.md`.
