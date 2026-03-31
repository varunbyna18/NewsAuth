# 🚀 Complete Azure Deployment Guide

## Overview
This guide walks you through deploying the NewsAuth system to Azure with all 6+ services integrated and working.

---

## Phase 1: Prerequisites (5 minutes)

### ✅ Required Setup
- [ ] Azure subscription active
- [ ] Azure CLI installed and authenticated: `az login`
- [ ] PowerShell 5.1 or higher: `$PSVersionTable`
- [ ] Node.js 18+ installed: `node --version`
- [ ] git installed: `git --version`

### ✅ Verify Installation
```powershell
# Check Azure CLI
az version

# Check PowerShell
$PSVersionTable.PSVersion

# Check Node
node --version
npm --version
```

---

## Phase 2: Infrastructure Deployment (15-20 minutes)

### Step 1: Deploy Azure Services
```powershell
cd D:\News

# Run the deployment script
.\deploy-all-services.ps1 `
    -ResourceGroup "newsauth-rg" `
    -AppName "newsauth" `
    -Location "eastus"
```

**What This Does:**
- Creates Resource Group
- Creates Storage Account (geo-redundant)
- Creates Key Vault with secrets
- Creates SQL Server + Database
- Creates App Service Plan (B2)
- Creates Web App (Node.js)
- Creates Application Insights
- Enables Managed Identity
- Stores all credentials in Key Vault

**Expected Output:**
```
🌥️  Deploying NewsAuth Infrastructure
==============================================

✓ Connecting to Azure (newsauth-rg)
✓ Creating Storage Account...
✓ Creating Key Vault...
✓ Creating SQL Server...
✓ Creating SQL Database...
✓ Creating App Service Plan...
✓ Creating Web App...
✓ Creating Application Insights...
[... more deployment steps ...]

✓ All services deployed successfully!
```

### Step 2: Save Deployment Outputs
After deployment, the script will display important connection strings. **Copy and save these:**

```
SQL Server: newsauth-sql-server.database.windows.net
Database: newsauth-db
Username: azureuser
Password: [saved in Key Vault]

Web App: newsauth.azurewebsites.net
Storage Account: newsauthstorage.blob.core.windows.net
```

---

## Phase 3: Database Setup (5 minutes)

### Step 1: Initialize Database Schema
```powershell
cd D:\News

# Run database initialization
.\initialize-database.ps1 `
    -ServerName "newsauth-sql-server" `
    -DatabaseName "newsauth-db" `
    -Username "azureuser" `
    -Password "[YOUR_PASSWORD_FROM_DEPLOYMENT]"
```

**What This Does:**
- Creates 6 main tables (AnalysisRecords, ErrorLogs, UserActivity, etc.)
- Creates stored procedures for analytics
- Creates views for reporting
- Creates indexes for performance
- Enables change tracking
- Inserts sample configuration data

**Expected Output:**
```
🗄️  NewsAuth Database Initialization
======================================

Connecting to: newsauth-sql-server / newsauth-db

✓ Connection successful

Creating tables and objects...

✓ All tables created successfully

📊 Created Database Objects:

  • AnalysisRecords (7 columns)
  • AnalysisMetrics (8 columns)
  • ErrorLogs (9 columns)
  • UserActivity (9 columns)
  • SystemConfig (5 columns)
  • BackupLog (8 columns)

✓ Database schema applied successfully!

╔════════════════════════════════════════════════════════╗
║     DATABASE INITIALIZED AND READY FOR USE           ║
╚════════════════════════════════════════════════════════╝
```

### Step 2: Verify Database Connection
```powershell
# Test the connection
$ConnectionString = "Server=tcp:newsauth-sql-server.database.windows.net,1433;Initial Catalog=newsauth-db;User ID=azureuser;Password=[PASSWORD];Encrypt=true;"

$connection = New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString = $ConnectionString
$connection.Open()
Write-Host "✓ Database connection successful!" -ForegroundColor Green
$connection.Close()
```

---

## Phase 4: Backend Configuration (10 minutes)

### Step 1: Setup Backend Database Integration
```powershell
cd D:\News

# Generate database service and environment template
.\setup-backend-database.ps1
```

**Output:**
- Creates `backend/services/databaseService.js`
- Creates `.env.template` for reference

### Step 2: Update Backend .env File

Edit `d:\News\backend\.env` with your Azure credentials:

```env
# Azure SQL Database
SQL_SERVER=newsauth-sql-server.database.windows.net
SQL_DATABASE=newsauth-db
SQL_USERNAME=azureuser
SQL_PASSWORD=<REPLACE_WITH_YOUR_PASSWORD>

# Azure Cognitive Services
AZURE_AI_ENDPOINT=https://news-ai-service.cognitiveservices.azure.com/
AZURE_AI_KEY=<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>

# Pinata IPFS
PINATA_API_KEY=<REPLACE_WITH_YOUR_PINATA_API_KEY>
PINATA_SECRET_KEY=<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>

# Ethereum Blockchain
ETHEREUM_RPC_URL=<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>
ETHEREUM_PRIVATE_KEY=<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>
ETHEREUM_CONTRACT_ADDRESS=0x5c768266b894e8160C9304FE2539C59e4E80c2A1
```

### Step 3: Install Database Driver
```powershell
cd D:\News\backend
npm install mssql
```

### Step 4: Update Backend API Routes

Edit `d:\News\backend\routes\api.js`:

```javascript
// Add at the top
const db = require('../services/databaseService');

// In POST /api/analyze route, add after getting results:
try {
    // Store analysis in database
    const recordId = await db.storeAnalysis({
        ipfsHash: ipfsResult.IpfsHash,
        articleText: newsText,
        sentimentLabel: azureResult.documents[0].sentiment,
        sentimentScore: azureResult.documents[0].confidenceScores.positive,
        credibilityScore: credibilityScore,
        keyPhrases: azureResult.keyPhrases,
        walletAddress: walletAddress,
        txHash: transactionResult.tx_hash
    });

    // Store performance metrics
    const endTime = Date.now();
    await db.storeMetrics(recordId, {
        requestTime: endTime - startTime,
        azureTime: azureEndTime - azureStartTime,
        ipfsTime: ipfsEndTime - ipfsStartTime,
        blockchainTime: blockchainEndTime - blockchainStartTime,
        totalTime: endTime - startTime
    });

    // Log user activity
    await db.logUserActivity({
        wallet: walletAddress,
        action: 'SUBMIT_NEWS',
        details: { ipfsHash: ipfsResult.IpfsHash },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS',
        responseTime: endTime - startTime
    });

} catch (dbError) {
    logger.error('Database storage error: ' + dbError.message);
    // Continue with response even if DB fails
}
```

---

## Phase 5: Test Services (10 minutes)

### Step 1: Test Local Backend Connection
```powershell
cd D:\News\backend

# Start the backend
npm start

# In another terminal, test database connection
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "azure": "connected",
  "ipfs": "connected",
  "blockchain": "connected"
}
```

### Step 2: Test Analysis Endpoint
```powershell
# Test the full analysis workflow
$body = @{
    newsText = "Bitcoin reaches new all-time high"
    walletAddress = "0x917EC2990193714faf62AbF081D9bD694416F8fE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Expected response:
```json
{
  "success": true,
  "analyse": {
    "sentiment": "positive",
    "credibilityScore": 75,
    "keyPhrase": ["Bitcoin", "all-time high"],
    "ipfsCid": "bafkrei..."
  },
  "blockchain": {
    "tx_hash": "0x...",
    "confirmed": true
  }
}
```

### Step 3: Query Database
```powershell
# Check if data was stored
.\initialize-database.ps1 -VerifyOnly

# Or run SQL query directly:
sqlcmd -S newsauth-sql-server.database.windows.net `
       -d newsauth-db `
       -U azureuser `
       -P [PASSWORD] `
       -Q "SELECT TOP 5 * FROM AnalysisRecords ORDER BY created_at DESC;"
```

---

## Phase 6: Deploy to Azure App Service (5 minutes)

### Step 1: Prepare Backend for Deployment
```powershell
cd D:\News\backend

# Install production dependencies
npm install --production

# Build if needed
npm run build
```

### Step 2: Deploy Using Git or ZIP

**Option A: Using Git**
```powershell
# Inside backend directory
git init
git add .
git commit -m "Initial backend deployment"

# Configure remote
az webapp deployment source config-local-git `
    --name newsauth `
    --resource-group newsauth-rg

# Push to Azure
git remote add azure https://newsauth-rg@newsauth.scm.azurewebsites.net/newsauth.git
git push azure master
```

**Option B: Using ZIP**
```powershell
# Create deployment package
cd D:\News\backend
Compress-Archive -Path ./* -DestinationPath ../backend-deploy.zip

# Deploy
az webapp deployment source config-zip `
    --name newsauth `
    --resource-group newsauth-rg `
    --src ../backend-deploy.zip
```

### Step 3: Configure App Settings in Azure
```powershell
az webapp config appsettings set `
    --name newsauth `
    --resource-group newsauth-rg `
    --settings `
        SQL_SERVER="newsauth-sql-server.database.windows.net" `
        SQL_DATABASE="newsauth-db" `
        SQL_USERNAME="azureuser" `
        SQL_PASSWORD="[PASSWORD]" `
        AZURE_AI_ENDPOINT="https://news-ai-service.cognitiveservices.azure.com/" `
        AZURE_AI_KEY="<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>" `
        PINATA_API_KEY="<REPLACE_WITH_YOUR_PINATA_API_KEY>" `
        PINATA_SECRET_KEY="<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>" `
        ETHEREUM_RPC_URL="<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>" `
        ETHEREUM_PRIVATE_KEY="<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>" `
        ETHEREUM_CONTRACT_ADDRESS="0x5c768266b894e8160C9304FE2539C59e4E80c2A1"
```

### Step 4: Test Deployed Backend
```powershell
# Test the deployed endpoint
$deployedBackend = "https://newsauth.azurewebsites.net"

Invoke-RestMethod -Uri "$deployedBackend/api/health"
```

Expected: `{"status": "ok", ...}`

---

## Phase 7: Monitor & Verify (5 minutes)

### Step 1: Check Application Insights
```powershell
# View recent errors
az monitor metrics list `
    --resource-group newsauth-rg `
    --resource-type "Microsoft.Insights/components" `
    --resource newsauth-insights `
    --metric "Exceptions"
```

### Step 2: View Database Activity
```sql
-- Query recent analyses
SELECT TOP 10 * FROM AnalysisRecords ORDER BY created_at DESC;

-- Check error logs
SELECT TOP 10 * FROM ErrorLogs ORDER BY created_at DESC;

-- View performance metrics
SELECT * FROM vw_PerformanceMetrics;

-- Get analysis statistics
EXECUTE sp_GetAnalysisStats @DateFrom = GETUTCDATE();
```

### Step 3: Verify All Services
```powershell
# Create master health check script
$services = @(
    @{ name = "Backend"; url = "https://newsauth.azurewebsites.net/api/health" },
    @{ name = "Database"; server = "newsauth-sql-server.database.windows.net" },
    @{ name = "Storage"; account = "newsauthstorage.blob.core.windows.net" },
    @{ name = "Key Vault"; name = "newsauth-kv" }
)

foreach ($service in $services) {
    Write-Host "Checking $($service.name)..." -ForegroundColor Yellow
    try {
        if ($service.url) {
            $response = Invoke-RestMethod -Uri $service.url -ErrorAction Stop
            Write-Host "✓ $($service.name) is operational" -ForegroundColor Green
        }
    } catch {
        Write-Host "✗ $($service.name) error: $_" -ForegroundColor Red
    }
}
```

---

## Troubleshooting

### Database Connection Failed
**Problem:** "Cannot connect to SQL Server"
```powershell
# Verify firewall rules
az sql server firewall-rule list `
    --name newsauth-sql-server `
    --resource-group newsauth-rg

# Add your IP if needed
az sql server firewall-rule create `
    --name AllowMyIP `
    --server newsauth-sql-server `
    --resource-group newsauth-rg `
    --start-ip-address [YOUR_IP] `
    --end-ip-address [YOUR_IP]
```

### Backend Not Starting
**Problem:** "Cannot load environment variables"
```powershell
# Check App Service logs
az webapp log tail --name newsauth --resource-group newsauth-rg

# Verify settings were applied
az webapp config appsettings list `
    --name newsauth `
    --resource-group newsauth-rg
```

### IPFS Upload Failing
**Problem:** "401 Unauthorized from Pinata"
```powershell
# Verify Pinata credentials are correct
curl -X POST https://api.pinata.cloud/data/testAuthentication \
    -H "pinata_api_key: <REPLACE_WITH_YOUR_PINATA_API_KEY>" \
    -H "pinata_secret_api_key: <REPLACE_WITH_YOUR_PINATA_SECRET_KEY>"
```

### Azure AI Analysis Not Working
**Problem:** "Cannot access Azure Cognitive Services"
```powershell
# Test Azure endpoint
curl -X POST "https://news-ai-service.cognitiveservices.azure.com/text/analytics/v3.1/sentiment" \
    -H "Ocp-Apim-Subscription-Key: <REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>" \
    -H "Content-Type: application/json" \
    -d '{"documents":[{"id":"1","text":"This is a test"}],"displayName":"Task"}'
```

---

## Post-Deployment Checklist

- [ ] All 6+ Azure services created and running
- [ ] Database schema initialized with all tables
- [ ] Backend deployed to App Service
- [ ] Environment variables configured
- [ ] Health check endpoint responding (/api/health)
- [ ] Analysis endpoint working (/api/analyze)
- [ ] Database accepting and storing records
- [ ] IPFS integration working (real CIDs being generated)
- [ ] Blockchain transactions confirmed on Sepolia
- [ ] Application Insights collecting metrics
- [ ] Error logging working
- [ ] User activity tracked

---

## Performance Baseline

After deployment, you should see:

| Metric | Expected | Target |
|--------|----------|--------|
| Azure AI Response | 200-400ms | < 500ms |
| IPFS Upload | 1-2s | < 3s |
| Blockchain TX | 2-5s | < 10s |
| Total Analysis | 4-8s | < 15s |
| Database Query | 10-50ms | < 100ms |
| Concurrent Users | 10-20 | > 5 |

---

## Cost Estimation

Monthly costs at typical usage:

- **App Service (B2):** ~$50
- **SQL Database:** ~$30-50
- **Storage Account:** ~$5-10
- **Key Vault:** ~$0.50
- **Application Insights:** ~$2-5
- **Azure Cognitive Services:** ~$15

**Total: $106-120/month**

---

## Next Steps

1. ✅ Deploy infrastructure (Phase 2)
2. ✅ Initialize database (Phase 3)
3. ✅ Configure backend (Phase 4)
4. ✅ Test services (Phase 5)
5. ✅ Deploy to Azure (Phase 6)
6. ✅ Monitor & verify (Phase 7)
7. 📋 Setup CI/CD pipeline (optional)
8. 📋 Deploy frontend to Static Web Apps (optional)
9. 📋 Configure auto-scaling (optional)
10. 📋 Setup backup strategy (optional)

---

## Support & Documentation

- [Azure Documentation](https://docs.microsoft.com/azure)
- [App Service Best Practices](https://docs.microsoft.com/en-us/azure/app-service)
- [SQL Database Docs](https://docs.microsoft.com/azure/azure-sql/database)
- [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)

---

**Last Updated:** $(Get-Date -Format 'yyyy-MM-dd')
**Version:** 1.0.0
**Status:** Ready for Deployment 🚀
