# Azure Deployment Guide - NewsAuth Backend

## Status
✅ **Ready for Deployment**
- Git repository initialized: `D:\News\backend`
- Code committed with message: "Initial NewsAuth backend deployment"
- Deployment files created: `web.config`, `.deployment`

## Current Setup
- **App Name**: news-ai-backend-final
- **Resource Group**: news-ai  
- **Current State**: App is STOPPED (need to start it)

## Deployment Steps

### Step 1: Start the Azure App Service
```powershell
# In Azure Portal:
# 1. Go to Resources > news-ai-backend-final
# 2. Click "Start" button
```

### Step 2: Configure Deployment from Git
```bash
# Using Azure CLI (requires 'az login' first)
az webapp deployment source config-local-git --resource-group news-ai --name news-ai-backend-final
```

Or manually from Azure Portal:
1. Go to **news-ai-backend-final** > **Deployment Center**
2. Copy the **Git Clone URL**
3. Return to this terminal

### Step 3: Set Up Git Remote
```bash
# Replace with the URL from Step 2
git remote add azure https://<username>:<password>@news-ai-backend-final.scm.azurewebsites.net/news-ai-backend-final.git

# Verify:
git remote -v
```

### Step 4: Configure Environment Variables in Azure
Go to **news-ai-backend-final** > **Configuration** > **Application settings** and add:

| Key | Value |
|-----|-------|
| `SQL_SERVER` | `localhost\SQLEXPRESS` (or your Azure SQL server) |
| `SQL_DATABASE` | `newsauth` |
| `SQL_USERNAME` | `sa` |
| `SQL_PASSWORD` | `<REPLACE_WITH_YOUR_PASSWORD>` |
| `PINATA_API_KEY` | `<REPLACE_WITH_YOUR_PINATA_API_KEY>` |
| `PINATA_SECRET` | `<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>` |
| `AZURE_KEY` | `<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>` |
| `AZURE_ENDPOINT` | `https://news-ai-service.cognitiveservices.azure.com/` |
| `SEPOLIA_RPC_URL` | `<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>` |
| `PRIVATE_KEY` | `<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>` |
| `CONTRACT_ADDRESS` | `0x5c768266b894e8160C9304FE2539C59e4E80c2A1` |

### Step 5: Deploy Code
```bash
# From D:\News\backend directory
git push azure master
```

### Step 6: Monitor Deployment
```bash
# View deployment logs
az webapp deployment slot list --resource-group news-ai --name news-ai-backend-final

# Or in Azure Portal > Deployment Center > Logs
```

## Files Ready for Deployment

### web.config
Routes all requests to Node.js server (server.js). Required for IIS on Azure App Service.

### .deployment
Defines build commands (npm install).

### package.json
All dependencies are pre-configured:
- express
- dotenv
- cors
- mssql
- form-data
- ethers
- axios

## Troubleshooting

### "Cannot connect to database"
- If using local SQL Server: Azure App Service can't access local computers
- **Solution**: Migrate to Azure SQL Database (free tier available)

### "Port already in use"
- Azure automatically assigns port via WEBSITE_PORT environment variable
- This is handled by web.config

### "Module not found"
- Run `npm install` locally: `cd D:\News\backend && npm install`
- Commit changes and redeploy

## Database Options

### Option 1: Local SQL Server (Current)
✅ Working locally on `localhost\SQLEXPRESS`
❌ Can't connect from Azure (firewall/IP restrictions)

### Option 2: Azure SQL Database
Uses free tier
```sql
-- Create Azure SQL Database
az sql db create --resource-group news-ai --server <server-name> --name newsauth
```

### Option 3: Keep Local, Access via VPN
Not recommended - just use Azure SQL instead

## Next Steps

1. Complete Steps 1-5 above
2. Monitor deployment in Azure Portal
3. Test the endpoint: `https://news-ai-backend-final.azurewebsites.net/api/analyze`
4. Migrate database to Azure SQL if needed

## Support

For deployment issues:
- Check Azure Portal > Deployment Center > Logs
- View runtime logs: `az webapp log tail --resource-group news-ai --name news-ai-backend-final`
- SSH into app: `az webapp ssh --resource-group news-ai --name news-ai-backend-final`
