# Production Repair & Hardening Plan
## NVS Buildcon & Architects Web Application

**Date:** October 2026  
**Status:** In Execution  
**Target:** NVS Buildcon & Architects (`NVS_CONSTRUCTION`)

---

## 1. Objectives & Guiding Principles

1. **Zero Disruption to Existing Functionality:** Preserve existing brand identity, routing, working UI wizards, and customer data models.
2. **Defensive Security First:** Eliminate secrets in version control, close injection vectors, secure unauthenticated endpoints, and enforce principle of least privilege.
3. **Rigorous Verification:** Validate every fix with automated regression checks and build verification (`tsc`, `vite build`, API test suite).
4. **Comprehensive Documentation:** Provide operators and developers with precise deployment, configuration, security, and testing runbooks.

---

## 2. Phased Remediation Roadmap

### Phase 1: Critical Security & Data Loss Elimination (P0)

| ID | Component | Action Item | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **P0-1** | `.env.example` | Strip hard-coded JWT secret values. Provide clear placeholder guides with instructions to generate random 48-byte hex keys. | Verify file contains only placeholder text; no usable keys present. |
| **P0-2** | `server/utils/seed.js` | Disallow default fallback password `AdminPassword123!`. Require `ADMIN_SEED_PASSWORD` in env with complexity checks. Skip seeding if admin already exists. | Seeding fails safely when no strong password is provided in environment. |
| **P0-3** | `server/controllers/housePlanController.js` | Implement full persistence in `requestHousePlan` via `Enquiry` model (service: 'House Plan Request') with user link and admin notification. | `POST /api/house-plans/:id/request` creates a database record and returns 201 with enquiry ID. |
| **P0-4** | `server/controllers/authController.js` & `server/services/authService.js` | Fix `login` and `adminLogin` handlers. Implement robust admin password authentication with lockout safeguards alongside OTP. | `POST /api/auth/login` and `POST /api/auth/admin-login` function correctly with valid credentials. |
| **P0-5** | `public/robots.txt` & static file serving | Block web crawler indexing of `/pdfs/` and audit PDF distribution route. | Search engines blocked from indexing client PDFs in `/pdfs/`. |

---

### Phase 2: High-Priority Protection & Hardening (P1)

| ID | Component | Action Item | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **P1-1** | `server/routes/enquiryRoutes.js` & `appointmentRoutes.js` | Connect `submissionLimiter` and `verifyCaptcha` middleware to `POST /api/enquiries/`, `POST /api/enquiries/contact`, and `POST /api/appointments/`. | Excessive submissions trigger HTTP 429; submissions without valid captcha rejected in production. |
| **P1-2** | `server/services/authService.js` | Remove `refreshToken` from `formatAuthResponse` JSON payload. Refresh tokens are exclusively stored in secure HttpOnly cookies. | Auth API returns `{ user, accessToken }` without exposing refresh token string to JS runtime. |
| **P1-3** | `server/utils/regex.js` & Controllers | Create `escapeRegex` utility and enforce max length (100) on all search queries across `searchController`, `blogController`, and `housePlanController`. | Input containing characters `.*+?^${}()|[]\` matches literally without causing ReDoS or query syntax errors. |
| **P1-4** | `server/controllers/blogController.js` | In `getBlogBySlug`, enforce `published: { $ne: false }` filter unless the user is an authenticated administrator. | Unauthenticated requests for draft blog slugs return 404. |
| **P1-5** | `server/server.js` | Remove hardcoded `res.setHeader('ETag', 'strong')` override. Allow Express and Vite to handle standard conditional caching. | Response headers contain standard valid ETag hashes. |

---

### Phase 3: Reliability, Validation & Maintainability (P2)

| ID | Component | Action Item | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **P2-1** | `server/controllers/blogController.js` | Add `{ runValidators: true }` to `findByIdAndUpdate` calls. | Invalid schema updates fail with validation errors. |
| **P2-2** | `server/controllers/appointmentController.js` | Wrap appointment update email and SMS notification calls in try-catch to prevent unhandled rejection crashes. | If notification service fails, database status update completes safely. |
| **P2-3** | `package.json` | Reorganize scripts: `typecheck: tsc --noEmit`, normalize build scripts, remove duplicate `vite` from dependencies. | `npm run typecheck` and `npm run build` execute cleanly. |

---

### Phase 4: Automated Testing & Verification (P3)

1. Implement an automated integration test script in `tests/` testing:
   - Security headers (Helmet, CORS)
   - Rate limiting on auth and form submission endpoints
   - Input sanitization and regex injection resistance
   - House plan request persistence
   - Authentication flows (login, refresh, OTP)
2. Execute TypeScript compiler check (`npm run typecheck`).
3. Execute client build (`npm run build`).
4. Execute integration test runner and verify 100% pass rate.

---

### Phase 5: Documentation Suite Delivery

Deliver complete operational and security documentation:
1. `docs/PROJECT_AUDIT.md` (Completed)
2. `docs/REPAIR_PLAN.md` (Completed)
3. `docs/SECURITY_REPORT.md`
4. `docs/DEPLOYMENT_GUIDE.md`
5. `docs/TEST_REPORT.md`
6. `docs/ENVIRONMENT_SETUP.md`
7. Updated `README.md`
