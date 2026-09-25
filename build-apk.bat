@echo off
title Ganit Ghar - Build Android APK
echo =======================================================
echo          Ganit Ghar - Android APK Build Tool
echo =======================================================
echo.

echo [1/3] Building latest web bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Checking Capacitor Android Platform...
if not exist "android\" (
    echo Adding Android platform via Capacitor...
    call npx cap add android
)

echo Syncing web build to Android project...
call npx cap sync android
call node scripts/prepare-android.js

echo.
echo [3/3] Checking Gradle and Java environment...
where java >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Java found! Compiling Android APK with Gradle...
    cd android
    call gradlew.bat assembleDebug
    cd ..
    echo.
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        echo =======================================================
        echo [SUCCESS] APK Generated Successfully at:
        echo android\app\build\outputs\apk\debug\app-debug.apk
        echo =======================================================
    ) else (
        echo [INFO] Check android\app\build\outputs\apk\ for outputs.
    )
) else (
    echo -------------------------------------------------------
    echo [NOTE] Local Java / Android SDK is not installed on this PC.
    echo.
    echo Don't worry! You have TWO easy options:
    echo 1. Recommended: Double-click 'trigger-cloud-apk.bat'
    echo    This builds the APK in GitHub Actions cloud for free
    echo    and gives you the APK download link in 2 minutes!
    echo.
    echo 2. Open in Android Studio:
    echo    Run 'npx cap open android' to open and compile.
    echo -------------------------------------------------------
    choice /M "Would you like to trigger cloud APK build now"
    if errorlevel 2 goto end
    if errorlevel 1 call trigger-cloud-apk.bat
)

:end
echo.
pause
