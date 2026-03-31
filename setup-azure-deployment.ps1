# Azure Variables
$subscriptionId = "f656d795-3b0c-4f91-bec8-496770136126"
$resourceGroupName = "news-ai"
$appName = "news-ai-backend-final"

# This script retrieves Azure deployment credentials and sets up git remote

Write-Host "Getting Azure deployment credentials..." -ForegroundColor Cyan

# Authenticate to Azure (if not already authenticated)
$context = Get-AzContext
if ($null -eq $context) {
    Write-Host "Not authenticated to Azure. Use: Connect-AzAccount" -ForegroundColor Yellow
    exit 1
}

# Get the web app
$webApp = Get-AzWebApp -Name $appName -ResourceGroupName $resourceGroupName -ErrorAction SilentlyContinue

if ($null -eq $webApp) {
    Write-Host "Web app not found: $appName in resource group: $resourceGroupName" -ForegroundColor Red
    exit 1
}

Write-Host "Found web app: $appName" -ForegroundColor Green

# Enable local git deployment
Write-Host "Enabling local git deployment..." -ForegroundColor Cyan
$deploymentUri = Update-AzWebAppConfiguration -ResourceGroupName $resourceGroupName -Name $appName -LocalGitEnabled $true -ErrorAction SilentlyContinue

# Get deployment credentials and git URL
Write-Host "Getting git deployment credentials..." -ForegroundColor Cyan
$creds = Get-AzWebAppPublishingCredentials -ResourceGroupName $resourceGroupName -Name $appName

# Extract git URL from the publishing profile
$publishProfile = $creds.PublishingCredentials
$gitUrl = "https://$($publishProfile.Username):$($publishProfile.Password)@$appName.scm.azurewebsites.net/$appName.git"

Write-Host ""
Write-Host "Git Remote URL:" -ForegroundColor Green
Write-Host $gitUrl
Write-Host ""

# Set git remote
Write-Host "Setting up git remote..." -ForegroundColor Cyan
cd D:\News\backend
git remote remove azure 2>$null
git remote add azure $gitUrl

# Verify
Write-Host "Git remotes configured:" -ForegroundColor Green
git remote -v

# Ready to push
Write-Host ""
Write-Host "Run this command to deploy:" -ForegroundColor Green
Write-Host "  git push azure master"
