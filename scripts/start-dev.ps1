# ============================================
# AITY local dev environment launcher
# Backend(3001, remote test DB) + Frontend H5(5173, local backend)
# Usage: .\scripts\start-dev.ps1
# ============================================
$root = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'aity-uni-app-v2'

Write-Host ""
Write-Host "=== AITY local dev environment ===" -ForegroundColor Cyan
Write-Host "Backend API : http://localhost:3001  (remote test DB: touyan_test)" -ForegroundColor DarkGray
Write-Host "Frontend H5 : http://localhost:5173  (local backend)" -ForegroundColor DarkGray
Write-Host "WeCom notify: enabled, real push to admin group" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path (Join-Path $backend 'node_modules'))) {
  Write-Host "[ERROR] backend deps missing. Run: cd backend; npm install" -ForegroundColor Red
  exit 1
}
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
  Write-Host "[ERROR] frontend deps missing. Run: cd aity-uni-app-v2; npm install --registry=https://registry.npmmirror.com" -ForegroundColor Red
  exit 1
}

Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$backend'; npm run dev" -WindowStyle Normal
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$frontend'; npm run dev:h5" -WindowStyle Normal

Write-Host "Opened 2 terminal windows (backend + frontend)." -ForegroundColor Green
Write-Host "After frontend compiles, open http://localhost:5173 to test posting." -ForegroundColor Green
Write-Host "Close the two windows to stop services." -ForegroundColor DarkGray
Write-Host ""
