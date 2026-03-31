#!/usr/bin/env powershell
# Complete Azure Deployment Script
# This automates all deployment steps to Azure App Service

param(
    [string]$GitUrl = ""
)

$appName = "news-ai-backend-final"
$resourceGroup = "news-ai"
$backendDir = "D:\News\backend"

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   NewsAuth Backend - Azure Deploy  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start the app
Write-Host "Step 1: Starting Azure App Service..." -ForegroundColor Yellow
if (-not $GitUrl) {
    Write-Host "  Command: az webapp start --resource-group $resourceGroup --name $appName" -ForegroundColor Gray
    az webapp start --resource-group $resourceGroup --name $appName 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ App started" -ForegroundColor Green
    } else {
        Write-Host "  ⓘ App might already be running" -ForegroundColor Yellow
    }
}

# Step 2: Get git URL if not provided
if (-not $GitUrl) {
    Write-Host ""
    Write-Host "Step 2: Getting deployment URL..." -ForegroundColor Yellow
$GitUrl = az webapp deployment source config-local-git --resource-group $resourceGroup --name $appName --query url -o tsv

if ($LastExitCode -ne 0 -or -not $GitUrl) {
    Write-Host "  Warning: Could not retrieve URL from Azure CLI" -ForegroundColor Yellow
    Write-Host "  Please provide the git URL manually from Azure Portal" -ForegroundColor Yellow
} else {
    Write-Host "  Got deployment URL" -ForegroundColor Green
# Step 3: Configure git remote
Write-Host ""
Write-Host "Step 3: Configuring git remote..." -ForegroundColor Yellow
cd $backendDir
git remote remove azure 2>$null
git remote add azure $GitUrl
Write-Host "  ✓ Git remote added" -ForegroundColor Green

# Step 4: Show remotes
Write-Host ""
Write-Host "Step 4: Verifying remotes..." -ForegroundColor Yellow
git remote -v | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# Step 5: Configure app settings
Write-Host ""
Write-Host "Step 5: Configuring app settings..." -ForegroundColor Yellow
$settings = @(
    "SQL_SERVER=localhost\SQLEXPRESS",
    "SQL_DATABASE=newsauth",
    "SQL_USERNAME=sa",
    "SQL_PASSWORD=NewsAuth@2024",
    "PINATA_API_KEY=[REDACTED]",
    "PINATA_SECRET=[REDACTED]",
    "AZURE_KEY=[REDACTED]",
    "AZURE_ENDPOINT=https://news-ai-service.cognitiveservices.azure.com/",
    "SEPOLIA_RPC_URL=[REDACTED]",
    "PRIVATE_KEY=[REDACTED]",
    "CONTRACT_ADDRESS=0x5c768266b894e8160C9304FE2539C59e4E80c2A1"
)

Write-Host "  Settings to apply:" -ForegroundColor Gray
$settings | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }

Write-Host "  Run this command in Azure Portal or CLI:" -ForegroundColor Yellow
Write-Host "  az webapp config appsettings set --resource-group $resourceGroup --name $appName --settings $($settings -join ' ')" -ForegroundColor Gray

# Step 6: Deploy
Write-Host ""
Write-Host "Step 6: Deploying code..." -ForegroundColor Yellow
Write-Host "  Running: git push azure master" -ForegroundColor Gray
git push azure master

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Deployment failed. Check the error above." -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Deployment Complete!        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app is live at: https://$appName.azurewebsites.net" -ForegroundColor Green
Write-Host "API endpoint: https://$appName.azurewebsites.net/api/analyze" -ForegroundColor Green
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  az webapp log tail --resource-group $resourceGroup --name $appName" -ForegroundColor Gray
