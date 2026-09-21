@echo off
title Ganit Ghar - One-Click Setup & Launch
echo =======================================================
echo          Ganit Ghar - Setup and Launch
echo =======================================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install npm packages.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Generating App Icons and PWA assets...
call node scripts/generate-icons.js

echo.
echo [3/4] Building production web bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [4/4] Starting Ganit Ghar Development Server...
echo Open your browser at http://localhost:3000
echo.
call npm run dev
pause
