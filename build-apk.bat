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
echo [3/3] Compiling Android APK...
if exist "android\gradlew.bat" (
    echo Running Gradle assembleDebug...
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
        echo [INFO] Gradle build finished. Check android\app\build\outputs\apk\
    )
) else (
    echo [NOTE] Opening Android project in Android Studio or use GitHub Actions...
    call npx cap open android
)

echo.
pause
