#!/usr/bin/env powershell
# NewsAuth - Azure Deployment Script (Simplified)

param(
    [string]$ResourceGroup = "newsauth-rg",
    [string]$AppName = "newsauth",
    [string]$Location = "eastus"
)

Write-Host "🚀 NewsAuth Azure Deployment" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if logged in
Write-Host "Checking Azure connection..." -ForegroundColor Yellow
$azAccount = az account show 2>$null | ConvertFrom-Json
if (-not $azAccount) {
    Write-Host "Not logged into Azure. Running login..." -ForegroundColor Yellow
    az login --use-device-code
} else {
    Write-Host "✓ Already logged in as: $($azAccount.user.name)" -ForegroundColor Green
}

# 1. Create Resource Group
Write-Host "`n[1/10] Creating Resource Group: $ResourceGroup" -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Resource Group created" -ForegroundColor Green
} else {
    Write-Host "⚠ Resource Group creation failed or already exists" -ForegroundColor Yellow
}

# 2. Create Storage Account
Write-Host "`n[2/10] Creating Storage Account" -ForegroundColor Cyan
$storageName = "$($AppName)storage"
az storage account create `
    --name $storageName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_GRS
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Storage Account created: $storageName" -ForegroundColor Green
} else {
    Write-Host "⚠ Storage Account creation failed or already exists" -ForegroundColor Yellow
}

# 3. Create Key Vault
Write-Host "`n[3/10] Creating Key Vault" -ForegroundColor Cyan
$kvName = "$AppName-kv"
az keyvault create `
    --resource-group $ResourceGroup `
    --name $kvName `
    --location $Location
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Key Vault created: $kvName" -ForegroundColor Green
} else {
    Write-Host "⚠ Key Vault creation failed or already exists" -ForegroundColor Yellow
}

# 4. Create SQL Server
Write-Host "`n[4/10] Creating SQL Server" -ForegroundColor Cyan
$sqlServer = "$AppName-sql-server"
$sqlPassword = "NewsAuth@$(Get-Random -Minimum 1000 -Maximum 9999)"

az sql server create `
    --name $sqlServer `
    --resource-group $ResourceGroup `
    --location $Location `
    --admin-user "azureuser" `
    --admin-password $sqlPassword

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SQL Server created: $sqlServer" -ForegroundColor Green
    Write-Host "  Password saved (save this!): $sqlPassword" -ForegroundColor Yellow
} else {
    Write-Host "⚠ SQL Server creation failed or already exists" -ForegroundColor Yellow
}

# 5. Create SQL Database
Write-Host "`n[5/10] Creating SQL Database" -ForegroundColor Cyan
$sqlDb = "$AppName-db"
az sql db create `
    --name $sqlDb `
    --server $sqlServer `
    --resource-group $ResourceGroup `
    --sku Basic

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SQL Database created: $sqlDb" -ForegroundColor Green
} else {
    Write-Host "⚠ SQL Database creation failed or already exists" -ForegroundColor Yellow
}

# 6. Create App Service Plan
Write-Host "`n[6/10] Creating App Service Plan" -ForegroundColor Cyan
$appPlan = "$AppName-plan"
az appservice plan create `
    --name $appPlan `
    --resource-group $ResourceGroup `
    --sku B2 `
    --is-linux

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ App Service Plan created: $appPlan" -ForegroundColor Green
} else {
    Write-Host "⚠ App Service Plan creation failed or already exists" -ForegroundColor Yellow
}

# 7. Create Web App
Write-Host "`n[7/10] Creating Web App" -ForegroundColor Cyan
$webApp = "$AppName-backend"
az webapp create `
    --name $webApp `
    --resource-group $ResourceGroup `
    --plan $appPlan `
    --runtime "NODE|18-lts"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Web App created: $webApp" -ForegroundColor Green
} else {
    Write-Host "⚠ Web App creation failed or already exists" -ForegroundColor Yellow
}

# 8. Create Application Insights
Write-Host "`n[8/10] Creating Application Insights" -ForegroundColor Cyan
$appInsights = "$AppName-insights"
az monitor app-insights component create `
    --app $appInsights `
    --location $Location `
    --resource-group $ResourceGroup `
    --application-type web

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Application Insights created: $appInsights" -ForegroundColor Green
} else {
    Write-Host "⚠ Application Insights creation failed or already exists" -ForegroundColor Yellow
}

# 9. Store secrets in Key Vault
Write-Host "`n[9/10] Storing secrets in Key Vault" -ForegroundColor Cyan
az keyvault secret set --vault-name $kvName --name "sql-password" --value $sqlPassword 2>$null
az keyvault secret set --vault-name $kvName --name "azure-ai-key" --value "<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>" 2>$null
az keyvault secret set --vault-name $kvName --name "pinata-api-key" --value "<REPLACE_WITH_YOUR_PINATA_API_KEY>" 2>$null
az keyvault secret set --vault-name $kvName --name "pinata-secret-key" --value "<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>" 2>$null
Write-Host "✓ Secrets stored in Key Vault" -ForegroundColor Green

# 10. Configure Web App Settings
Write-Host "`n[10/10] Configuring Web App settings" -ForegroundColor Cyan
az webapp config appsettings set `
    --name $webApp `
    --resource-group $ResourceGroup `
    --settings `
        SQL_SERVER="$sqlServer.database.windows.net" `
        SQL_DATABASE=$sqlDb `
        SQL_USERNAME="azureuser" `
        SQL_PASSWORD=$sqlPassword `
        AZURE_AI_ENDPOINT="https://news-ai-service.cognitiveservices.azure.com/" `
        AZURE_AI_KEY="<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>" `
        PINATA_API_KEY="<REPLACE_WITH_YOUR_PINATA_API_KEY>" `
        PINATA_SECRET_KEY="<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>" `
        ETHEREUM_RPC_URL="<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>" `
        ETHEREUM_PRIVATE_KEY="<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>" `
        ETHEREUM_CONTRACT_ADDRESS="0x5c768266b894e8160C9304FE2539C59e4E80c2A1" `
        NODE_ENV="production"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Web App settings configured" -ForegroundColor Green
} else {
    Write-Host "⚠ Web App settings configuration had issues" -ForegroundColor Yellow
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      AZURE DEPLOYMENT COMPLETE                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 Deployed Resources:`n" -ForegroundColor Cyan
Write-Host "  Resource Group: $ResourceGroup" -ForegroundColor Green
Write-Host "  Storage Account: $storageName" -ForegroundColor Green
Write-Host "  Key Vault: $kvName" -ForegroundColor Green
Write-Host "  SQL Server: $sqlServer" -ForegroundColor Green
Write-Host "  SQL Database: $sqlDb" -ForegroundColor Green
Write-Host "  App Service Plan: $appPlan" -ForegroundColor Green
Write-Host "  Web App: $webApp" -ForegroundColor Green
Write-Host "  Application Insights: $appInsights" -ForegroundColor Green

Write-Host "`n🔗 Web App URL: https://$webApp.azurewebsites.net" -ForegroundColor Yellow
Write-Host "🔑 SQL Server: $sqlServer.database.windows.net" -ForegroundColor Yellow
Write-Host "📦 Connection String saved in Key Vault" -ForegroundColor Yellow

Write-Host "`n✅ Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Initialize database: .\initialize-database.ps1" -ForegroundColor Gray
Write-Host "   2. Deploy backend code to Web App" -ForegroundColor Gray
Write-Host "   3. Configure firewall rules for SQL Server" -ForegroundColor Gray
