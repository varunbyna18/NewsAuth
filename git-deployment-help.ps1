#!/usr/bin/env powershell

$appName = "news-ai-backend-final"
$resourceGroup = "news-ai"

Write-Host "Azure Deployment Authentication" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To deploy with git push, you need deployment credentials." -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 1: Use Azure Portal (Recommended)" -ForegroundColor Green
Write-Host "  1. Go to: https://portal.azure.com" -ForegroundColor Gray
Write-Host "  2. Search for: $appName" -ForegroundColor Gray
Write-Host "  3. Go to: Deployment slot > Deployment credentials" -ForegroundColor Gray
Write-Host "  4. Create new deployment credentials with username/password" -ForegroundColor Gray
Write-Host "  5. Use: git clone https://<username>:<password>@$appName.scm.azurewebsites.net/$appName.git" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Use Git Credentials Manager" -ForegroundColor Green
Write-Host "  1. Git will prompt for credentials when you push" -ForegroundColor Gray
Write-Host "  2. Enter deployment credentials (from Step 4 above)" -ForegroundColor Gray
Write-Host "  3. A credential helper will save them for future use" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: Use GitHub Actions (Advanced)" -ForegroundColor Green  
Write-Host "  1. Push to GitHub" -ForegroundColor Gray
Write-Host "  2. Connect GitHub in Azure Deployment Center" -ForegroundColor Gray
Write-Host "  3. GitHub Actions will auto-deploy on push" -ForegroundColor Gray
Write-Host ""

Write-Host "To attempt push (will prompt for credentials):" -ForegroundColor Yellow
Write-Host "  cd D:\News\backend" -ForegroundColor Gray
Write-Host "  git push azure master -v" -ForegroundColor Gray
