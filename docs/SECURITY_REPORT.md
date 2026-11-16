# Current security status — 2026-11-16

This section supersedes older security conclusions below; historical working notes are retained.

Implemented: production security cannot be disabled by setting IS_PRODUCTION=false alongside NODE_ENV=production; exact configured CORS origins; Origin checks for browser cookie writes; HttpOnly cookies; no browser bearer tokens in JSON/localStorage; hashed refresh-token persistence with atomic rotation and random token IDs; current database role/account checks; access session revocation; pending-account retention; fail-closed configured CAPTCHA; content writable fields; query escaping/caps; invalid-upload/path rejection; explicit development-only seed/admin workflows.

Local .env is intentionally private, ignored and untracked. No .env path appeared in the inspected Git history. Presence of local credentials alone is not evidence of compromise. Identical JWT secrets were rotated to independent random values. Other credentials were not changed or printed; rotate them if exposure elsewhere is known. SMTP must be corrected because the real provider rejected authentication.

Known limits: public/pdfs and local upload URLs remain public; robots.txt is not access control. Client-labelled drawings require owner classification and private authenticated delivery before release. MIME/extension validation is not file-content or malware scanning. Phone-ownership enrollment is not implemented, so email login is required. A single refresh slot preserves the existing single-session policy. Rate limiting/duplicate guards need shared state for multiple instances. Live production TLS/origins, provider delivery, CAPTCHA, upload storage and restore drills remain unverified.

npm audit --omit=dev: zero findings. Full audit: six moderate findings in TypeScript ESLint/minimatch. ESLint 9 also emitted an unsupported-version warning. Do not equate a clean production audit with a complete security assessment. Machine-readable reports are in dependency-audit*.json.

The earlier statement that robots.txt resolved private-document exposure is incorrect. No deployment approval should rely on it.

---
## Historical report retained below

# Production Security & Hardening Report
## NVS Buildcon & Architects Platform

**Date:** October 2026  
**Security Posture:** Hardened for Production  
**Target Environment:** Node.js (ESM), Express 4.21, React 19, MongoDB Atlas, Cloudinary, Resend/SMTP

---

## 1. Threat Model & Security Architecture

### 1.1 Authentication & Session Management
- **HttpOnly Secure Cookies:** Authentication session tokens (`accessToken`, `refreshToken`) are stored in `HttpOnly`, `SameSite=Lax` (Strict in production), `Secure` cookies.
- **Dual Support for API Clients:** Bearer Authorization header support is retained for mobile/API clients with automatic fallback.
- **Refresh Token Rotation:** Refresh tokens are single-use per refresh cycle, stored hashed in MongoDB (`User.refreshToken`), and rotated upon each token issuance. Plaintext refresh tokens are never exposed in JSON response bodies.
- **Lockout Protection:** Brute-force protection locks accounts after 5 failed password attempts for 15 minutes (`User.lockUntil`).
- **OTP Verification Flow:** 6-digit cryptographic OTPs with 5-minute expiry and rate-limited resend counters prevent credential stuffing.

### 1.2 Administrative Route Protection
- **Dual-Layer Admin Defense:**
  1. **URL-Level Obfuscation & SSR Interception:** Direct browser navigation to admin portals requires `ADMIN_SECRET_PATH` validation. Unauthorized user attempts redirect to home with a 403 screen.
  2. **API Middleware Authorization:** Administrative API endpoints (`/api/admin/*`, `/api/enquiries` management, `/api/appointments` approval) enforce `[authenticate, authorize('admin')]`, validating JWT role claims against the database.
- **Audit Logging:** Every critical administrative action (login, user updates, appointments, content modifications) is recorded in MongoDB via `server/services/auditService.js`.

### 1.3 Anti-Abuse & Rate Limiting
- **Global API Rate Limiting:** 100 requests per 15 minutes per IP (`express-rate-limit`).
- **Authentication Limiter:** 50 requests per 15 minutes per IP on `/api/auth/*`.
- **Public Lead Submission Limiter:** 5 requests per 15 minutes per IP on `/api/enquiries`, `/api/enquiries/contact`, and `/api/appointments`.
- **Captcha Integration:** hCaptcha verification (`server/middleware/captcha.js`) integrated on lead capture and appointment forms to prevent bot spam.

### 1.4 Injection & Attack Mitigation
- **Regex Injection / ReDoS:** All search and filter queries pass through `escapeRegex` (`server/utils/regex.js`), stripping meta-characters (`.*+?^${}()|[]\`) and bounding length to 100 characters.
- **NoSQL Injection:** `express-mongo-sanitize` strips dollar-signs (`$`) and dots (`.`) from incoming request bodies and query parameters.
- **HTTP Parameter Pollution:** `hpp` protects against multiple parameters confusing Express routers.
- **Cross-Site Scripting (XSS):** Helmet headers configured with strict Content Security Policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: SAMEORIGIN`.
- **CORS:** Restrictive origin checking in production (`CLIENT_URL` / `APP_URL`), allowing credentials only from trusted frontend domains.

---

## 2. Security Vulnerabilities Resolved

| Vulnerability ID | Category | Severity | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Credential Exposure | **P0 (Critical)** | Real JWT secret keys in `.env.example` replaced with placeholders. | **RESOLVED** |
| **SEC-02** | Credential Exposure | **P0 (Critical)** | Hard-coded admin password `AdminPassword123!` eliminated from `seed.js`. Enforced strong env check. | **RESOLVED** |
| **SEC-03** | Data Exposure | **P0 (Critical)** | Client architectural drawing indexing blocked in `public/robots.txt`. | **RESOLVED** |
| **SEC-04** | Data Loss | **P0 (Critical)** | House plan requests now persist to MongoDB `Enquiry` collection with user correlation and notifications. | **RESOLVED** |
| **SEC-05** | Broken Auth | **P0 (Critical)** | Replaced throwing stubs in `login` and `adminLogin` with validated password authentication and audit logging. | **RESOLVED** |
| **SEC-06** | Spam / Abuse | **P1 (High)** | Attached `submissionLimiter` (5 req / 15 min) and `verifyCaptcha` to enquiry and appointment routes. | **RESOLVED** |
| **SEC-07** | Information Leak | **P1 (High)** | Removed `refreshToken` plaintext exposure from `formatAuthResponse` JSON return payload. | **RESOLVED** |
| **SEC-08** | Injection / ReDoS | **P1 (High)** | Implemented `escapeRegex` on global search, blog search, and house plan filters. | **RESOLVED** |
| **SEC-09** | Information Leak | **P1 (High)** | Added `published: { $ne: false }` check on `getBlogBySlug` to prevent unauthenticated access to drafts. | **RESOLVED** |
| **SEC-10** | Caching Defect | **P1 (High)** | Removed invalid `res.setHeader('ETag', 'strong')` override in `server/server.js`. | **RESOLVED** |
| **SEC-11** | Integrity | **P2 (Medium)** | Added `runValidators: true` to blog and appointment update database operations. | **RESOLVED** |

---

## 3. Additional Verified Findings (October 2026 Repair Session)

During verification against current source code, the following findings were confirmed and remediated in this session:

| ID | Category | Severity | File / Location | Description | Status |
|----|----------|----------|-----------------|-------------|--------|
| **NVS-001** | Credential Exposure | **P0 (Critical)** | `.env` (local, gitignored) | Real `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI` with credentials, `SMTP_USER`/`SMTP_PASS`, `ADMIN_SEED_PASSWORD` present in local `.env`. `.env` is gitignored and not tracked, but all secrets must be rotated before production use. | **UNRESOLVED** — rotate all secrets |
| **NVS-002** | Injection / ReDoS | **P1 (High)** | `server/controllers/projectController.js:13-18` | Raw `search` passed to MongoDB `$regex` without `escapeRegex`. | **RESOLVED** — `escapeRegex` applied |
| **NVS-003** | Injection / ReDoS | **P1 (High)** | `server/controllers/galleryController.js:11-16` | Raw `search` passed to MongoDB `$regex` without `escapeRegex`. | **RESOLVED** — `escapeRegex` applied |
| **NVS-004** | Integrity | **P1 (High)** | `server/controllers/galleryController.js:29` | `findByIdAndUpdate` missing `{ runValidators: true }`. | **RESOLVED** — added |
| **NVS-005** | Integrity | **P1 (High)** | `server/controllers/contentController.js:20,45` | `updateService` / `updateTestimonial` missing `{ runValidators: true }`. | **RESOLVED** — added |
| **NVS-006** | Information Leak | **P1 (High)** | `server/utils/seed.js:60` | Temp admin password printed to logs. | **RESOLVED** — password value removed from log |
| **NVS-007** | Data Integrity | **P1 (High)** | `server/config/database.js:15` | `seedDatabase()` auto-ran on every DB connection. | **RESOLVED** — auto-seed removed |

---

## 4. Production Deployment Security Checklist

Before deploying this application to production, system administrators must:
1. **Rotate all Secrets:** Generate new, random 48-byte hex secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. **Configure Production Flags:**
   - Set `NODE_ENV=production`
   - Set `IS_PRODUCTION=true`
   - Set `CLIENT_URL=https://nvsbuildcon.com`
   - Set `APP_URL=https://nvsbuildcon.com`
3. **Configure hCaptcha:** Supply `HCAPTCHA_SECRET` and `HCAPTCHA_SITE_KEY` in environment variables.
4. **Configure Email Service:** Ensure `RESEND_API_KEY` (or SMTP credentials) are set for transactional emails and OTP delivery.
5. **Set Strong Admin Seed Password:** Set `ADMIN_SEED_PASSWORD` in environment before running initial seed operations.
