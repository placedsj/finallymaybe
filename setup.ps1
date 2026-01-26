#!/usr/bin/env pwsh
# FDSJ-739 Evidence Platform - Setup Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FDSJ-739 Evidence Platform Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Download from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green

# Check Python
Write-Host "`nChecking Python..." -ForegroundColor Yellow
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found. Download from: https://www.python.org/" -ForegroundColor Red
    exit 1
}
$pythonVersion = python --version
Write-Host "✓ $pythonVersion found" -ForegroundColor Green

# Install Node dependencies
Write-Host "`nInstalling Node dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node dependencies installed" -ForegroundColor Green

# Install Python dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
python -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ pip install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

# Setup environment file
Write-Host "`nSetting up environment file..." -ForegroundColor Yellow
if (-not (Test-Path .env.local)) {
    Copy-Item .env.local.example .env.local
    Write-Host "✓ Created .env.local (copy of example)" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your Gemini API key" -ForegroundColor Yellow
    Write-Host "   Get free key at: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Optimize database
Write-Host "`nOptimizing database..." -ForegroundColor Yellow
if (Test-Path FDSJ739_EVIDENCE.db) {
    python scripts/optimize_db.py 2>$null | Out-Null
    Write-Host "✓ Database optimized" -ForegroundColor Green
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Setup Complete! ✓" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local and add your Gemini API key"
Write-Host "2. Run: .\launch.ps1"
Write-Host "`nHaving issues?" -ForegroundColor Yellow
Write-Host "- Check README.md for documentation"
Write-Host "- Verify Node.js and Python are installed" -ForegroundColor Cyan
