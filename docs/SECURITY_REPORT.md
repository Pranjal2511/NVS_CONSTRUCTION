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

## 3. Production Deployment Security Checklist

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
