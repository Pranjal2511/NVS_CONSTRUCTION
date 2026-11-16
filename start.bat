@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required.
  exit /b 1
)
if not exist .env (
  echo Copy .env.example to .env and configure it first.
  exit /b 1
)
if not exist node_modules (
  echo Run npm ci first.
  exit /b 1
)
node scripts/check-environment.mjs
if errorlevel 1 exit /b 1
node scripts/check-db.mjs
if errorlevel 1 (
  echo Database unavailable. Frontend can start in development; database APIs return HTTP 503.
)
echo Starting the application. Wait for the server listening message. Ctrl+C stops it.
call npm run dev
exit /b %errorlevel%
