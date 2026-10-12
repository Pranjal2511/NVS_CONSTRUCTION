# Production Deployment Guide
## NVS Buildcon & Architects Platform

**Platform:** Node.js (v20+ recommended), MongoDB Atlas, Vite + React 19  
**Hosting Compatibility:** Render, Railway, AWS ECS/App Runner, DigitalOcean App Platform, Ubuntu VPS (PM2 + Nginx)

---

## 1. System Requirements

- **Node.js:** v20.x or v22.x LTS
- **Package Manager:** npm v10+
- **Database:** MongoDB Atlas M0 (Free Tier) or M10+ (Replica Set 5.0+)
- **Cloud Storage:** Cloudinary account for media uploads (blueprints, portfolio images)
- **Email Service:** Resend API (recommended for cloud hosting) or Gmail SMTP App Password
- **Anti-Bot:** hCaptcha Account (Site Key & Secret Key)

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` on your deployment server or inject them into your platform's Environment Secrets:

```ini
# Server
NODE_ENV=production
IS_PRODUCTION=true
PORT=3000
APP_URL=https://nvsbuildcon.com
CLIENT_URL=https://nvsbuildcon.com

# Database
MONGODB_URI=mongodb+srv://<db_user>:<db_pass>@cluster.mongodb.net/nvs_buildcon?retryWrites=true&w=majority

# Security Keys (Generate using: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_SECRET=your_generated_cryptographic_secret_minimum_32_chars
JWT_REFRESH_SECRET=your_generated_cryptographic_refresh_secret_minimum_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ADMIN_SECRET_PATH=/admin-management-portal
ADMIN_SEED_PASSWORD=YourStrongComplexAdminPassword!2026

# Email Delivery
RESEND_API_KEY=re_your_resend_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# hCaptcha (Required for production form anti-bot verification)
HCAPTCHA_SECRET=0x_your_hcaptcha_secret_key
HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
```

---

## 3. Build & Production Start Pipeline

### 3.1 Standard Cloud Deployment (Render / Railway / Heroku)

1. **Build Command:**
   ```bash
   npm run build
   ```
   *Explanation:* This compiles the frontend with Vite 6 into `dist/` and runs `scripts/prerender-public-routes.mjs` to generate SEO-optimized HTML snapshots for all public routes.

2. **Start Command:**
   ```bash
   npm run start
   ```
   *Explanation:* Boots the hardened Express server on `PORT`, serving API endpoints under `/api`, serving prerendered HTML and static assets from `dist/` with automated security headers and caching controls.

---

### 3.2 Linux VPS Deployment (Ubuntu 22.04 / 24.04 with PM2 & Nginx)

#### Step 1: Install Dependencies & Build
```bash
cd /var/www/nvs-buildcon
npm ci --omit=dev
npm run build
```

#### Step 2: Start with PM2
```bash
npm install -g pm2
pm2 start server/server.js --name "nvs-buildcon" --max-memory-restart 500M
pm2 save
pm2 startup
```

#### Step 3: Nginx Reverse Proxy Configuration
```nginx
server {
    server_name nvsbuildcon.com www.nvsbuildcon.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Enable Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## 4. Post-Deployment Verification

1. **Verify Health Endpoint:**
   ```bash
   curl -i https://nvsbuildcon.com/api/health
   ```
   Expected response: `HTTP/1.1 200 OK` with `{"success":true,"message":"NVS Buildcon API is running"}`.

2. **Verify Security Headers:**
   ```bash
   curl -I https://nvsbuildcon.com/api/health
   ```
   Confirm presence of `x-content-type-options: nosniff`, `x-frame-options`, and appropriate CORS headers.

3. **Verify Prerendered SEO Pages:**
   ```bash
   curl -i https://nvsbuildcon.com/services | grep "prerendered-content"
   ```
   Confirm that search crawler HTML snapshots are returned directly in the response payload.
