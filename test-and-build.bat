@echo off
title NVS Buildcon - Test and Build
color 0B

echo =======================================================
echo         NVS BUILDCON ^& ARCHITECTS - TEST ^& BUILD
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/3] Running TypeScript Type Check...
call npm run typecheck
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] TypeScript compilation failed!
    pause
    exit /b %errorlevel%
)
echo [OK] TypeScript passed.
echo.

echo [2/3] Running Automated Integration Tests...
call npm test
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Integration tests failed!
    pause
    exit /b %errorlevel%
)
echo [OK] Tests passed.
echo.

echo [3/3] Building Production Bundle ^& Prerendering Routes...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Production build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo =======================================================
echo      ALL CHECKS ^& BUILDS COMPLETED SUCCESSFULLY!
echo =======================================================
echo.
pause
