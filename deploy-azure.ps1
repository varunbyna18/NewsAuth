#!/usr/bin/env powershell
# NewsAuth - Azure Deployment Script (Plain ASCII)

param(
    [string]$ResourceGroup = "newsauth-rg",
    [string]$AppName = "newsauth",
    [string]$Location = "eastus"
)

Write-Host "Deploying NewsAuth to Azure" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking Azure connection..." -ForegroundColor Yellow
$azAccount = az account show 2>$null | ConvertFrom-Json
if (-not $azAccount) {
    Write-Host "Not logged into Azure. Running login..." -ForegroundColor Yellow
    az login --use-device-code
} else {
    Write-Host "[OK] Already logged in as: $($azAccount.user.name)" -ForegroundColor Green
}

# 1. Create Resource Group
Write-Host ""
Write-Host "[1/10] Creating Resource Group: $ResourceGroup" -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Resource Group created" -ForegroundColor Green
}

# 2. Create Storage Account
Write-Host ""
Write-Host "[2/10] Creating Storage Account" -ForegroundColor Cyan
$storageName = "$($AppName)storage".ToLower()
$storageName = $storageName -replace "[^a-z0-9]", ""
az storage account create --name $storageName --resource-group $ResourceGroup --location $Location --sku Standard_GRS 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Storage Account created: $storageName" -ForegroundColor Green
}

# 3. Create Key Vault
Write-Host ""
Write-Host "[3/10] Creating Key Vault" -ForegroundColor Cyan
$kvName = "$AppName-kv"
az keyvault create --resource-group $ResourceGroup --name $kvName --location $Location 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Key Vault created: $kvName" -ForegroundColor Green
}

# 4. Create SQL Server
Write-Host ""
Write-Host "[4/10] Creating SQL Server" -ForegroundColor Cyan
$sqlServer = "$AppName-sql-server"
$sqlPassword = "NewsAuth@$(Get-Random -Minimum 1000 -Maximum 9999)!"

az sql server create --name $sqlServer --resource-group $ResourceGroup --location $Location --admin-user "azureuser" --admin-password $sqlPassword 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] SQL Server created: $sqlServer" -ForegroundColor Green
    Write-Host "     Password: $sqlPassword" -ForegroundColor Yellow
}

# 5. Create SQL Database
Write-Host ""
Write-Host "[5/10] Creating SQL Database" -ForegroundColor Cyan
$sqlDb = "$AppName-db"
az sql db create --name $sqlDb --server $sqlServer --resource-group $ResourceGroup --sku Basic 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] SQL Database created: $sqlDb" -ForegroundColor Green
}

# 6. Create App Service Plan
Write-Host ""
Write-Host "[6/10] Creating App Service Plan" -ForegroundColor Cyan
$appPlan = "$AppName-plan"
az appservice plan create --name $appPlan --resource-group $ResourceGroup --sku B2 --is-linux 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] App Service Plan created: $appPlan" -ForegroundColor Green
}

# 7. Create Web App
Write-Host ""
Write-Host "[7/10] Creating Web App" -ForegroundColor Cyan
$webApp = "$AppName-backend"
az webapp create --name $webApp --resource-group $ResourceGroup --plan $appPlan --runtime "NODE|18-lts" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Web App created: $webApp" -ForegroundColor Green
}

# 8. Create Application Insights
Write-Host ""
Write-Host "[8/10] Creating Application Insights" -ForegroundColor Cyan
$appInsights = "$AppName-insights"
az monitor app-insights component create --app $appInsights --location $Location --resource-group $ResourceGroup --application-type web 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Application Insights created: $appInsights" -ForegroundColor Green
}

# 9. Store secrets in Key Vault
Write-Host ""
Write-Host "[9/10] Storing secrets in Key Vault" -ForegroundColor Cyan
az keyvault secret set --vault-name $kvName --name "sql-password" --value $sqlPassword 2>$null
az keyvault secret set --vault-name $kvName --name "azure-ai-key" --value "<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>" 2>$null
az keyvault secret set --vault-name $kvName --name "pinata-api-key" --value "<REPLACE_WITH_YOUR_PINATA_API_KEY>" 2>$null
az keyvault secret set --vault-name $kvName --name "pinata-secret-key" --value "<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>" 2>$null
Write-Host "[OK] Secrets stored in Key Vault" -ForegroundColor Green

# 10. Configure Web App Settings
Write-Host ""
Write-Host "[10/10] Configuring Web App settings" -ForegroundColor Cyan
az webapp config appsettings set --name $webApp --resource-group $ResourceGroup --settings SQL_SERVER="$sqlServer.database.windows.net" SQL_DATABASE=$sqlDb SQL_USERNAME="azureuser" SQL_PASSWORD=$sqlPassword AZURE_AI_ENDPOINT="https://news-ai-service.cognitiveservices.azure.com/" AZURE_AI_KEY="<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>" PINATA_API_KEY="<REPLACE_WITH_YOUR_PINATA_API_KEY>" PINATA_SECRET_KEY="<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>" ETHEREUM_RPC_URL="<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>" ETHEREUM_PRIVATE_KEY="<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>" ETHEREUM_CONTRACT_ADDRESS="0x5c768266b894e8160C9304FE2539C59e4E80c2A1" NODE_ENV="production" 2>$null
Write-Host "[OK] Web App settings configured" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "AZURE DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Deployed Resources:" -ForegroundColor Cyan
Write-Host "  Resource Group: $ResourceGroup" -ForegroundColor Gray
Write-Host "  Storage Account: $storageName" -ForegroundColor Gray
Write-Host "  Key Vault: $kvName" -ForegroundColor Gray
Write-Host "  SQL Server: $sqlServer" -ForegroundColor Gray
Write-Host "  SQL Database: $sqlDb" -ForegroundColor Gray
Write-Host "  App Service Plan: $appPlan" -ForegroundColor Gray
Write-Host "  Web App: $webApp" -ForegroundColor Gray
Write-Host "  Application Insights: $appInsights" -ForegroundColor Gray

Write-Host ""
Write-Host "Connection Info:" -ForegroundColor Yellow
Write-Host "  Web App URL: https://$webApp.azurewebsites.net" -ForegroundColor Gray
Write-Host "  SQL Server: $sqlServer.database.windows.net" -ForegroundColor Gray
Write-Host "  SQL Username: azureuser" -ForegroundColor Gray
Write-Host "  SQL Password: $sqlPassword" -ForegroundColor Red

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Save the SQL password above securely" -ForegroundColor Gray
Write-Host "  2. Run: .\initialize-database.ps1 -ServerName $sqlServer -Password '$sqlPassword'" -ForegroundColor Gray
Write-Host "  3. Deploy backend code to Web App" -ForegroundColor Gray
Write-Host "  4. Add firewall rule for your IP: az sql server firewall-rule create ... " -ForegroundColor Gray
