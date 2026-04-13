@echo off
REM ITMAGNET Project Setup Script for Windows
REM This script automates the initial setup and verification

setlocal enabledelayedexpansion

cls
echo ================================================
echo ITMAGNET PROJECT SETUP
echo ================================================
echo.

REM Check Node.js
echo Checking Node.js version...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

for /f "delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("!NODE_VERSION!") do set NODE_MAJOR=%%i

if !NODE_MAJOR! lss 18 (
    echo ERROR: Node.js 18+ required. Current: %NODE_VERSION%
    pause
    exit /b 1
)

echo [OK] Node.js %NODE_VERSION% found
echo.

REM Check npm
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

echo [OK] npm found
echo.

REM Install dependencies
echo Installing dependencies...
if not exist "node_modules" (
    call npm install
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)
echo.

REM Setup .env files
echo Setting up environment files...

if not exist ".env.local" (
    if exist ".env.local.example" (
        copy .env.local.example .env.local
        echo [OK] Created .env.local
        echo WARNING: Please update NEXT_PUBLIC_API_BASE_URL in .env.local
    )
) else (
    echo [OK] .env.local already exists
)
echo.

REM Verify critical files
echo Verifying project structure...

if exist "package.json" (echo [OK] package.json) else echo [ERROR] package.json missing
if exist "next.config.mjs" (echo [OK] next.config.mjs) else echo [ERROR] next.config.mjs missing
if exist "middleware.ts" (echo [OK] middleware.ts) else echo [ERROR] middleware.ts missing
if exist "lib\api.ts" (echo [OK] lib\api.ts) else echo [ERROR] lib\api.ts missing
if exist "lib\axios.ts" (echo [OK] lib\axios.ts) else echo [ERROR] lib\axios.ts missing

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Update .env.local with your API URL
echo    NEXT_PUBLIC_API_BASE_URL=http://YOUR_API/api
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in browser
echo.
echo Documentation:
echo   - API Integration: API_INTEGRATION_GUIDE.md
echo   - Setup Guide: SETUP_GUIDE.md
echo.
echo Make sure your backend API is running before starting!
echo.

pause
