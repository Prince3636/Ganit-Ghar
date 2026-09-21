@echo off
title Ganit Ghar - Build Desktop App (Windows .exe)
echo =======================================================
echo         Ganit Ghar - Windows Desktop App Builder
echo =======================================================
echo.

echo [1/2] Building web bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Packaging Desktop App via Electron Builder...
call npm run build:desktop

echo.
if exist "release\" (
    echo =======================================================
    echo [SUCCESS] Desktop App built successfully!
    echo Check the 'release' folder for your .exe installer and portable files.
    echo =======================================================
)

pause
