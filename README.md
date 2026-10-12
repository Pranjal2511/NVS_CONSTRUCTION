# NVS Buildcon & Architects

> Premium architectural design, Vastu-compliant residential/commercial planning, and turnkey construction management platform based in Lucknow & Delhi NCR.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite 6, TailwindCSS v4, GSAP, Lucide Icons
- **Backend:** Node.js (ES Modules), Express 4.21, Mongoose 9 (MongoDB)
- **Security:** HttpOnly JWT authentication, bcryptjs, Helmet, CORS, express-rate-limit, express-mongo-sanitize, hCaptcha
- **Third-Party Integrations:** Cloudinary (asset hosting), Resend & Nodemailer (email notifications), Twilio (WhatsApp notifications)
- **SEO & Performance:** Prerendered static public routes (`scripts/prerender-public-routes.mjs`), terser compression, optimized asset pipeline

---

## 📚 Documentation Directory

The project includes a complete audit and hardening documentation suite in the `docs/` folder:

- 📑 [PROJECT_AUDIT.md](file:///d:/nvs/NVS_CONSTRUCTION/docs/PROJECT_AUDIT.md) — Comprehensive architectural, security, and codebase audit report.
- 📋 [REPAIR_PLAN.md](file:///d:/nvs/NVS_CONSTRUCTION/docs/REPAIR_PLAN.md) — Step-by-step remediation roadmap and verification matrix.
- 🛡️ [SECURITY_REPORT.md](file:///d:/nvs/NVS_CONSTRUCTION/docs/SECURITY_REPORT.md) — Complete security posture, threat mitigation, and production hardening details.
- 🚀 [DEPLOYMENT_GUIDE.md](file:///d:/nvs/NVS_CONSTRUCTION/docs/DEPLOYMENT_GUIDE.md) — Deployment instructions for Render, Railway, VPS, Nginx, and cloud platforms.
- 🧪 [TEST_REPORT.md](file:///d:/nvs/NVS_CONSTRUCTION/docs/TEST_REPORT.md) — Test execution report with 100% passing results.
- ⚙️ [ENVIRONMENT_SETUP.md](file:///d:/nvs/NVS_CONSTRUCTION/docs/ENVIRONMENT_SETUP.md) — Local development and environment configuration guide.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```

### 3. Development Server
Run the integrated full-stack server (Express + embedded Vite dev middleware):
```bash
npm run dev
```
Or simply double-click [`start.bat`](file:///d:/nvs/NVS_CONSTRUCTION/start.bat) on Windows to automatically handle port cleanup, verify database connection, launch the server, and open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

```bash
# Type check TypeScript code
npm run typecheck

# Run automated integration tests
npm test

# Build production bundle and prerender SEO routes
npm run build
```

---

## 🔐 Security Features

- **HttpOnly Cookies:** Authentication tokens are stored in secure cookies to prevent XSS exfiltration.
- **Dedicated Abuse Limiters:** Public inquiries and consultations are protected by rate limiters (5 req / 15 min) and hCaptcha anti-bot checks.
- **ReDoS Protection:** Search and filter strings are sanitized through `escapeRegex` utilities.
- **Admin Defense:** Strict role-based authorization (`[authenticate, authorize('admin')]`) and secret path SSR interception.
