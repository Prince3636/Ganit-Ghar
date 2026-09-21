# Ganit Ghar – Math ki Seedhiyan 📐✨
**Multi-Platform Math Learning & Gaming Suite (Mobile APK, Desktop Windows App, & 100% Offline PWA)**

Ganit Ghar ek educational math application aur gaming suite hai jisme 15 foundational math topics, 150 progressive levels, 4 naye dynamic mini-games, offline synthesized background music (BGM), sound effects, daily streak rewards, aur custom app icons shamil hain.

---

## 🌟 Mukhy Features (Key Features)

1. **15 Topics & 150 Progressive Levels**:
   - Jod-Ghata (Addition & Subtraction)
   - Pahade aur Guna (Multiplication & Tables)
   - Bhaag (Division & Remainder)
   - Ank ki Keemat (Place Value, Rounding, Indian Lakh/Crore)
   - Factors, Multiples, Primes, HCF aur LCM
   - Bhinn (Fractions, Mixed Fractions, Simplification)
   - Dashamlav (Decimals, Rounding, Operations)
   - Pratishat (Percentages, Discounts, Profit & Loss)
   - BODMAS (Operations Order, Brackets, Powers)
   - Algebra (Find $x$, 1-step and 2-step equations)
   - Negative Numbers (Number Line, Temperature, Signs)
   - Kahani wale Sawaal (Real-world Word Problems)
   - Shape aur Naap (Geometry, Area, Perimeter, Angles, Pythagoras)
   - Ghadi aur Samay (Time, 24-hr clock, Speed-Distance-Time)
   - Naap-Tol aur Paise (Unit conversions, Money, Speed)

2. **4 Naye Mazedaar Mini-Games**:
   - ⚡ **Speed Math Sprint (Bijli Round)**: 60-second rapid-fire math blitz combo streaks aur local high-score table ke saath.
   - 🃏 **Jodi Milao (Math Memory Match)**: Equivalent concepts (jaise `½` ↔ `50%`, `3²` ↔ `9`) flip-card memory game.
   - 🎯 **Lakshya 24 (Target 24 Puzzle)**: Diye gaye 4 numbers ko operators ke saath jod kar 24 banao.
   - 🪄 **Jaadui Mental Tricks (Vedic Math)**: Fast calculation shortcuts aur speed practice drills.

3. **100% Offline Synthesized Audio (BGM & SFX)**:
   - Procedural Web Audio background music engine jo bina kisi external audio file ya internet ke chalta hai.
   - Separate BGM & SFX volume sliders, mute toggles, aur tactile haptic feedback.

4. **Multi-Platform Support**:
   - **Android Mobile**: Ready for Capacitor APK generation with custom app icons and splash assets.
   - **Desktop (Windows/Mac/Linux)**: Electron setup ready to generate standalone `.exe` installers.
   - **PWA (Progressive Web App)**: Complete Service Worker caching for 100% offline browser installation.

---

## 🚀 Shuru Kaise Karein (How to Run & Build)

### 1. Ek Click Mein Setup aur Run (One-Click Setup)
Windows par seedha double click karein:
- **`setup.bat`** (ya PowerShell mein `.\setup.ps1`)

Ye script automatically dependencies install karega, app icons generate karega, build banayega, aur local development server start kar dega:
👉 **http://localhost:3000**

---

### 2. Android APK Kaise Banayein (Build Android APK)

#### Tarika A: GitHub Actions (Bina Android Studio ke Cloud mein)
Is project mein `.github/workflows/build.yml` file shamil hai:
1. Is project ko apne GitHub repository mein push karein.
2. GitHub Actions automatically Android APK aur Windows Desktop build banayega.
3. Actions tab mein jaakar direct **`GanitGhar-Android-APK`** download karein!

#### Tarika B: Apne PC par Local Build
Windows par seedha double click karein:
- **`build-apk.bat`**

Ya terminal mein:
```bash
npm run build
npx cap add android   # (Pehli baar)
npx cap sync android
node scripts/prepare-android.js
cd android
.\gradlew.bat assembleDebug
```
Aapka APK yahan tayar milega:
📁 `android/app/build/outputs/apk/debug/app-debug.apk`

---

### 3. Desktop Windows App Kaise Banayein (Build Desktop .exe)
Windows par seedha double click karein:
- **`build-desktop.bat`**

Ya terminal mein:
```bash
npm run build:desktop
```
Aapka standalone installer aur portable `.exe` yahan ban jayega:
📁 `release/Ganit Ghar Setup 1.0.0.exe`

---

## 📱 Offline PWA ke Roop Mein Install Karein
Agar aap bina APK compile kiye apne phone ya PC par app ki tarah chalana chahte hain:
1. Browser mein app open karein (e.g. Chrome / Edge).
2. URL bar ya menu mein **"Install Ganit Ghar"** ya **"Add to Home screen"** par click karein.
3. App offline hone par bhi poori tarah kaam karegi!

---

## ⌨️ Desktop Keyboard Shortcuts
- **0–9, ., /, −**: Numpad input
- **1, 2, 3, 4**: MCQ option select
- **Enter**: Answer submit / Next question
- **Backspace**: Digit mitao (⌫)
- **Esc**: Main menu / Home screen
