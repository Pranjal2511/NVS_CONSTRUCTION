@echo off
setlocal
cd /d "%~dp0"
call npm run typecheck
if errorlevel 1 exit /b 1
call npm run lint
if errorlevel 1 exit /b 1
call npm test
if errorlevel 1 exit /b 1
call npm run build
if errorlevel 1 exit /b 1
echo All checks completed. Review lint warnings and remaining integration gates.
