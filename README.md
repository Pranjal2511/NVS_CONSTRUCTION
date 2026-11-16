# NVS Buildcon & Architects

Existing React/TypeScript/Vite frontend and Express/Mongoose backend. The integrated development server runs at http://localhost:3000.

## Current repair status

See [current project status](docs/CURRENT_PROJECT_STATUS.md), [repair log](docs/REPAIR_LOG.md), [master plan](docs/MASTER_REPAIR_PLAN.md) and [test report](docs/TEST_REPORT.md). Atlas connects to the operator-selected nvs_buildcon database, but it has no collections. Gmail SMTP verification fails EAUTH/535. No initialization, admin creation or deployment has been performed.

## Windows CMD

    cd /d F:\nvs\NVS_CONSTRUCTION
    npm ci
    npm run db:check
    npm run dev

For a fresh checkout only, copy .env.example to .env and supply private configuration first. Do not overwrite an existing .env. Use two independently generated JWT secrets. See [environment setup](docs/ENVIRONMENT_SETUP.md).

start.bat checks Node, .env, dependencies, configured port and database connectivity. It does not kill other processes or seed data. Database outages return 503 from data APIs; development frontend startup can continue. Ctrl+C stops the server. Optional npm run dev:client runs a separate frontend on port 3001, proxying to backend port 3000.

## Checks

    npm run typecheck
    npm run lint
    npm test
    npm run build
    npm run email:verify

Tests use isolated fixtures/model/provider mocks and never load local .env. The email verification command uses the configured SMTP server but sends no email. Actual delivery requires explicit operator invocation of node scripts/test-email.mjs --send recipient@example.com.

## Database initialization

Do not run initialization without reviewing the target/content and approving writes. [Current project status](docs/CURRENT_PROJECT_STATUS.md) contains the exact dry-run, apply and separate administrator commands. scripts/seed.mjs inserts only missing repository starter content. It never reconstructs historical users or enquiries. scripts/make-admin.mjs now routes to the guarded bootstrap procedure.

## Runtime and deployment

Use a supported Node release satisfying the installed packages (Node 22.12+; this repair ran on Node 26.13.1). Production requires NODE_ENV=production, explicit database URI, distinct strong secrets, HTTPS origins, configured mail/CAPTCHA/storage and backups.

[Deployment guide](docs/DEPLOYMENT_GUIDE.md) covers Render and Vercel. [Backup/recovery](docs/DATABASE_BACKUP_RECOVERY.md) distinguishes starter initialization from data recovery. Public PDF confidentiality, business pricing approval and live integration tests remain deployment gates.

## API layout

/api/auth, /api/user and /api/admin handle authentication and protected account operations. Public content is under /api/projects, /api/gallery, /api/house-plans, /api/blogs, /api/services, /api/testimonials and /api/search. Lead submissions use /api/enquiries and /api/appointments; media uses admin-protected /api/uploads. /api/settings returns 503 until settings are initialized. /api/health is process liveness; /api/ready verifies database connectivity, not content or email readiness.
