@echo off
title Ganit Ghar - Trigger Cloud Android APK Build
echo =======================================================
echo     Ganit Ghar - Trigger Cloud Android APK Build
echo =======================================================
echo.
echo This script will trigger the Android APK build in GitHub Actions.
echo.

where gh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo GitHub CLI (gh) found! Triggering workflow via CLI...
    gh workflow run "Build Ganit Ghar Android APK" --repo Prince3636/Ganit-Ghar
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] APK Build has been triggered on GitHub Actions!
        echo Opening Actions page in your browser to watch progress...
        start https://github.com/Prince3636/Ganit-Ghar/actions
        pause
        exit /b 0
    )
)

echo Opening GitHub Actions page in your default browser...
echo Click the "Run workflow" button on GitHub to start building your APK.
start https://github.com/Prince3636/Ganit-Ghar/actions/workflows/build.yml
echo.
pause
