@echo off
title NVS Buildcon - Local Server Launcher
color 0A

echo =======================================================
echo          NVS BUILDCON ^& ARCHITECTS - LAUNCHER
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking if port 3000 is already in use...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [!] Port 3000 is occupied by process PID %%a.
    echo [*] Terminating old process %%a to prevent conflict...
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [2/3] Checking MongoDB connection...
node scripts/check-db.mjs
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] MongoDB check reported an issue. Starting server anyway...
)

echo.
echo [3/3] Starting full-stack development server...
echo.
echo =======================================================
echo   Server is running at: http://localhost:3000
echo   Press Ctrl + C in this window to stop the server.
echo =======================================================
echo.

start "" "http://localhost:3000"

npm run dev
pause
