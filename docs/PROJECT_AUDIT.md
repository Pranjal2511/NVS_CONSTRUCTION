# Comprehensive Full-Stack Audit Report
## NVS Buildcon & Architects Web Application

**Date:** October 2026  
**Auditor:** Senior Full-Stack, Security, Database, DevOps & QA Systems Engineer  
**System Target:** NVS Buildcon & Architects (`NVS_CONSTRUCTION`)  
**Scope:** Frontend (React 19, TypeScript, Vite 6, TailwindCSS), Backend (Node.js, Express 4, MongoDB/Mongoose 9, JWT, Cloudinary, Resend/Nodemailer, Twilio WhatsApp, hCaptcha), Assets, Configuration, and Security.

---

## 1. Executive Summary

A comprehensive architectural and security audit was performed on the NVS Buildcon & Architects platform. The codebase exhibits modern frontend engineering (React 19 with Vite, dynamic calculation wizards, portfolio galleries) and structured backend layering (routes, controllers, models, services, validation, audit logs).

However, critical security vulnerabilities (P0), reliability flaws (P1), and maintainability issues (P2) were identified that jeopardize sensitive customer data, administrative control, search engine indexing, and system availability in production:
1. **Critical Secret Exposure:** Production-like JWT secret keys were committed in `.env.example`.
2. **Hard-coded Admin Credentials:** A default hard-coded admin password (`AdminPassword123!`) is stored in plain text in `server/utils/seed.js`.
3. **Sensitive Client Architectural Drawings Exposed Publicly:** Unauthenticated, indexed access to real client structural and EPD drawings (`public/pdfs/`) without access controls.
4. **Data Loss / False Confirmation in Core Lead Funnel:** `POST /api/house-plans/:id/request` returned a HTTP 200 success response without persisting the user's house plan request to the database or alerting admins.
5. **Broken Administrative & User Password Authentication:** `login` and `adminLogin` handlers unconditionally threw HTTP 410 errors without delegating to functional authentication pipelines.
6. **Missing Anti-Abuse Controls on Lead Ingestion:** The `submissionLimiter` (5 req / 15 min) and `verifyCaptcha` middleware exist but were not connected to public appointment and enquiry submission endpoints.
7. **ReDoS / Injection Vulnerability in Search:** User input from search queries was passed unescaped directly into MongoDB `$regex` queries.

---

## 2. Architecture & Tech Stack Assessment

### 2.1 Technology Matrix
| Layer | Technologies | Status / Observations |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, TypeScript, TailwindCSS v4 (@tailwindcss/vite), Lucide Icons | Modern, component-driven, responsive UI |
| **Build & Bundler** | Vite 6, Custom Prerender Script (`scripts/prerender-public-routes.mjs`) | Duplicate `vite` dependency in package.json; prerender works well for SEO |
| **Backend API** | Node.js (ESM), Express 4.21, Mongoose 9 | Hybrid server (serves Vite in dev; static dist in prod) |
| **Database** | MongoDB with Mongoose Schemas & Indexes | Schema-enforced, custom `toJSON` plugin sanitizes `_id` and `__v` |
| **Authentication** | Dual: HttpOnly Cookies + Bearer Token, OTP via Email/SMS, Refresh Token Rotation | High security architecture, but dual exposure of refresh token in JSON response |
| **Static & Media** | Local `public/` assets, Cloudinary integration | Sensitive client PDFs stored in public webroot |

---

## 3. Vulnerability Findings by Severity

### P0 — Critical (Immediate Action Required)

#### P0-1: Committed JWT Secrets in `.env.example`
- **Location:** `.env.example:16-17`
- **Risk:** High entropy strings that look like actual cryptographic tokens (`e9e5b1e9...`) were published in the example environment file. If copied or left unchanged in any environment, attackers can forge admin JWTs and achieve complete system compromise.
- **Remediation:** Replace with explicit placeholder strings and instructions to generate secrets using `crypto.randomBytes(48).toString('hex')`.

#### P0-2: Hard-coded Admin Password in Source Code
- **Location:** `server/utils/seed.js:44`
- **Risk:** The admin seeding script falls back to `AdminPassword123!` if `ADMIN_PASSWORD` is not set. Anyone with access to the source code can authenticate as the super administrator if the seed script was executed.
- **Remediation:** Remove the hard-coded default. Require `ADMIN_SEED_PASSWORD` in the environment, validate minimum password complexity, and refuse to seed weak or predictable credentials.

#### P0-3: Public Unauthenticated Access to Client Architectural PDFs
- **Location:** `public/pdfs/` (e.g. `Mr Vikram ji .epd drawing .pdf 20-01-2026.pdf`, room layout drawings)
- **Risk:** Express serves all files under `public/` statically to anyone at `https://domain/pdfs/...`. Furthermore, `robots.txt` had `Allow: /pdfs/`, instructing search engines to crawl and index private client documents.
- **Remediation:** Disallow `/pdfs/` in `public/robots.txt`. Provide an authenticated, authorized document download route for client-specific drawings.

#### P0-4: Silent Data Loss in House Plan Request Flow
- **Location:** `server/controllers/housePlanController.js:53-62`
- **Risk:** `requestHousePlan` returned `{ planId, title, message: "An admin will contact you..." }` but never wrote anything to MongoDB or triggered an admin notification. Potential high-value architectural leads were permanently lost.
- **Remediation:** Persist the request to the `Enquiry` collection (categorized as "House Plan Request"), associate it with the authenticated user, and dispatch notification events.

#### P0-5: Broken Admin & User Login Route Handlers
- **Location:** `server/controllers/authController.js:31-37`
- **Risk:** Both `login` and `adminLogin` handlers called `loginUser()`, which unconditionally threw an HTTP 410 error. Any client expecting traditional login contracts was blocked.
- **Remediation:** Route `login` to `loginWithPassword`, add proper admin password authentication with rate limiting and lockout, and clearly document the OTP alternative.

---

### P1 — High Priority (System Security & Reliability)

#### P1-1: Missing Rate Limiting and Captcha on Public Enquiry and Appointment Endpoints
- **Location:** `server/routes/enquiryRoutes.js`, `server/routes/appointmentRoutes.js`
- **Risk:** While `submissionLimiter` (5 requests / 15 minutes) and `verifyCaptcha` exist in `server/middleware/`, they were not applied to `POST /api/enquiries`, `POST /api/enquiries/contact`, or `POST /api/appointments`. Attackers or bots could flood the database and trigger massive email/SMS spam.
- **Remediation:** Attach `submissionLimiter` and `verifyCaptcha` to all public inquiry and appointment creation routes.

#### P1-2: Refresh Token Dual Exposure in API Response Body
- **Location:** `server/services/authService.js:316-324` (`formatAuthResponse`)
- **Risk:** Although refresh tokens are saved in HttpOnly, secure cookies, `formatAuthResponse` also included `refreshToken` in the JSON response payload. If client code stores it in `localStorage`, it becomes vulnerable to XSS exfiltration.
- **Remediation:** Strip `refreshToken` from the JSON response object while keeping HttpOnly cookie storage.

#### P1-3: Regex Injection & ReDoS in Global Search and Blog Filters
- **Location:** `server/controllers/searchController.js:19`, `server/controllers/blogController.js:15`, `server/controllers/housePlanController.js:14`
- **Risk:** Raw user query strings were passed directly to `{ $regex: query, $options: 'i' }` without escaping regex meta-characters (`.*+?^${}()|[]\`). Users could trigger slow catastrophic backtracking regexes or bypass intended filtering.
- **Remediation:** Create a utility function to escape all regex special characters and enforce a maximum query length (100 characters).

#### P1-4: Draft & Unpublished Blogs Accessible by Slug
- **Location:** `server/controllers/blogController.js:23-27`
- **Risk:** While `getBlogs` filters by `{ published: { $ne: false } }`, `getBlogBySlug` queried purely by `{ slug }`. Anyone with knowledge of a draft blog's slug could read unpublished content.
- **Remediation:** Add `{ published: { $ne: false } }` filter unless the requesting user has the `admin` role.

#### P1-5: Invalid ETag Header Override Breaking Browser Caching
- **Location:** `server/server.js:65`
- **Risk:** `res.setHeader('ETag', 'strong')` was hardcoded on all responses. `"strong"` is not a valid HTTP ETag entity tag, breaking HTTP 304 conditional request negotiation for assets and pages.
- **Remediation:** Remove the hardcoded override and allow Express and static middleware to compute valid ETags.

---

### P2 — Medium Priority (Code Quality & Maintainability)

#### P2-1: Schema Validation Skipped on Updates
- **Location:** `server/controllers/blogController.js:39`
- **Risk:** `findByIdAndUpdate` calls lacked `{ runValidators: true }`, allowing invalid fields or corrupted schemas on update.
- **Remediation:** Add `{ runValidators: true }` to all update operations.

#### P2-2: Unhandled Rejection Risk in Appointment Notifications
- **Location:** `server/controllers/appointmentController.js`
- **Risk:** Notification dispatches in appointment status updates were not safely wrapped in try-catch blocks like enquiry notifications, risking unhandled promise errors.
- **Remediation:** Wrap all secondary notification and email triggers in defensive try-catch handlers.

#### P2-3: Package.json Scripts Inconsistencies & Duplicate Dependencies
- **Location:** `package.json`
- **Risk:** `npm run lint` was defined as `tsc --noEmit` (typecheck, not ESLint). `vite` was listed in both `dependencies` and `devDependencies`.
- **Remediation:** Reorganize `package.json` scripts: `typecheck`, `lint`, remove duplicate `vite`.

---

### P3 — Low Priority / Operational

#### P3-1: Test Suite Absence
- **Risk:** Zero automated backend or API regression tests existed.
- **Remediation:** Add automated API tests covering security middleware, authentication, inquiry validation, rate limiting, and house plan requests.

---

## 4. Remediation Progress Checklist

- [x] Comprehensive Repository Audit Complete
- [ ] P0 Fixes: `.env.example` sanitized
- [ ] P0 Fixes: `seed.js` secured against default passwords
- [ ] P0 Fixes: `requestHousePlan` persistence implemented
- [ ] P0 Fixes: Admin & User login routes restored and secured
- [ ] P0 Fixes: Public client drawings protected
- [ ] P1 Fixes: Rate limiting & Captcha attached to lead forms
- [ ] P1 Fixes: Dual refresh token exposure removed
- [ ] P1 Fixes: Regex injection eliminated
- [ ] P1 Fixes: Blog draft access filtered
- [ ] P1 Fixes: ETag header override removed
- [ ] P2 Fixes: Schema update validation added
- [ ] P2 Fixes: Package scripts normalized
- [ ] P3 Fixes: Automated tests added & verified
- [ ] Full Documentation Suite Delivered
