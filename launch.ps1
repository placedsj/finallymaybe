#!/usr/bin/env pwsh
# FDSJ-739 Evidence Platform - Launch Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FDSJ-739 Evidence Platform Launcher" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check environment file
if (-not (Test-Path .env.local)) {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Run: .\setup.ps1" -ForegroundColor Yellow
    exit 1
}

# Parse API key
$envContent = Get-Content .env.local
$apiKeyLine = $envContent | Where-Object { $_ -match "VITE_GEMINI_API_KEY" }
if ($apiKeyLine -match "your_gemini_api_key_here") {
    Write-Host "❌ GEMINI_API_KEY not configured!" -ForegroundColor Red
    Write-Host "Edit .env.local and add your API key from: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🚀 Starting services..." -ForegroundColor Green

# Start Flask backend
Write-Host "`nStarting Flask backend (port 5000)..." -ForegroundColor Yellow
$backendJob = Start-Process python -ArgumentList "api_server.py" -NoNewWindow -PassThru
Write-Host "✓ Backend started (PID: $($backendJob.Id))" -ForegroundColor Green

# Wait for backend to be ready
Start-Sleep -Seconds 2

# Start Vite frontend
Write-Host "Starting Vite frontend (port 3000)..." -ForegroundColor Yellow
$frontendJob = Start-Process npm -ArgumentList "run", "dev" -NoNewWindow -PassThru
Write-Host "✓ Frontend started (PID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Services Running" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n📂 Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "`n✓ Ready to use! Browser opening..." -ForegroundColor Green
Write-Host "`nTo stop: Close the terminal windows or press Ctrl+C" -ForegroundColor Yellow

# Keep script running to manage processes
Wait-Process -Id $backendJob.Id, $frontendJob.Id
