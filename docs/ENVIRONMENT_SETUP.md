# Local Development & Environment Setup Guide
## NVS Buildcon & Architects Platform

---

## 1. Prerequisites

1. **Node.js:** Ensure Node.js 20+ is installed (`node -v`).
2. **MongoDB:** A local MongoDB instance or a free MongoDB Atlas connection URI.
3. **Git:** Installed and configured.

---

## 2. Quickstart Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Open `.env` and configure:
```ini
NODE_ENV=development
IS_PRODUCTION=false
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nvs_buildcon
# Generate random keys:
JWT_SECRET=super_secret_local_dev_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=super_secret_local_dev_refresh_key_at_least_32_chars
ADMIN_SEED_PASSWORD=LocalDevAdminPassword123!
```

---

## 3. Running the Application

### Option A: Full-Stack Integrated Mode (Recommended)
This boots the Express backend server with Vite embedded in middleware mode. Frontend HMR and backend APIs run simultaneously on `http://localhost:3000`.
```bash
npm run dev
```

### Option B: Standalone Frontend Dev Server
If you prefer running Vite standalone on its own port with proxying:
```bash
npm run dev:client
```

---

## 4. Verification & Testing Commands

- **Run Static Type Check:**
  ```bash
  npm run typecheck
  ```
- **Run Production Bundle Build & Route Prerender:**
  ```bash
  npm run build
  ```
- **Run Automated Test Suite:**
  ```bash
  npm test
  ```
