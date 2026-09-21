Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "         Ganit Ghar - Setup & Launch Script           " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Installing NPM dependencies..." -ForegroundColor Green
npm install

Write-Host "`n[2/4] Generating App Icons and PWA assets..." -ForegroundColor Green
node scripts/generate-icons.js

Write-Host "`n[3/4] Building production web bundle..." -ForegroundColor Green
npm run build

Write-Host "`n[4/4] Starting Ganit Ghar Development Server..." -ForegroundColor Green
Write-Host "Navigate to: http://localhost:3000 in your browser`n" -ForegroundColor Yellow
npm run dev
