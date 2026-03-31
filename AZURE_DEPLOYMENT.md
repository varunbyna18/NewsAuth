# NewsAuth - Azure Deployment Guide

## 📋 Overview

Deploy NewsAuth (AI-Powered News Verification System) to Azure using:
- **Azure App Service** - Backend API & Frontend
- **Azure Cognitive Services** - Text Analytics (AI Analysis)
- **Pinata IPFS** - Decentralized Storage
- **Ethereum Sepolia** - Blockchain Verification

---

## 🔧 Services Configuration

### 1. Azure Cognitive Services (Already Set Up)
```
Endpoint: https://news-ai-service.cognitiveservices.azure.com/
API Key: [REDACTED - Add your Azure Cognitive Services key]
Region: [Check your portal]
```

### 2. Pinata IPFS (Already Configured)
```
API Key: <REPLACE_WITH_YOUR_PINATA_API_KEY>
API Secret: <REPLACE_WITH_YOUR_PINATA_SECRET_KEY>
Gateway: https://gateway.pinata.cloud/ipfs/{cid}
```

### 3. Ethereum Sepolia Testnet (Already Configured)
```
RPC: <REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>
Private Key: <REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>
Contract: 0x5c768266b894e8160C9304FE2539C59e4E80c2A1
Explorer: https://sepolia.etherscan.io/
```

---

## 📦 Deployment Steps

### Step 1: Prepare Production Environment Variables

Create `.env.production` in backend folder:

```env
# Azure App Service
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://your-domain.azurewebsites.net

# Azure Cognitive Services
AZURE_ENDPOINT=https://news-ai-service.cognitiveservices.azure.com/
AZURE_KEY=[REDACTED - Add your Azure key]

# Pinata IPFS
PINATA_API_KEY=[REDACTED - Add your Pinata key]
PINATA_SECRET=[REDACTED - Add your Pinata secret]

# Ethereum Sepolia
SEPOLIA_RPC_URL=[REDACTED - Add your Sepolia RPC URL]
PRIVATE_KEY=<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>
CONTRACT_ADDRESS=0x5c768266b894e8160C9304FE2539C59e4E80c2A1

# Security
JWT_SECRET=your-secure-random-string-here
RATE_LIMIT=100
```

### Step 2: Set Azure App Service Environment Variables

Go to Azure Portal → App Service → Settings → Configuration:

Add all the variables from above in the "Application settings" section.

### Step 3: Deploy to Azure

#### Option A: Using Azure CLI (Recommended)

```powershell
# 1. Login to Azure
az login

# 2. Create Resource Group
az group create --name newsauth-rg --location eastus

# 3. Create App Service Plan
az appservice plan create `
  --name newsauth-plan `
  --resource-group newsauth-rg `
  --sku B2 `
  --is-linux

# 4. Create App Service for Backend
az webapp create `
  --resource-group newsauth-rg `
  --plan newsauth-plan `
  --name newsauth-backend `
  --runtime "node|18"

# 5. Set environment variables
az webapp config appsettings set `
  --resource-group newsauth-rg `
  --name newsauth-backend `
  --settings @azure-settings.json

# 6. Deploy code
cd D:\News\backend
az webapp up --name newsauth-backend --resource-group newsauth-rg
```

#### Option B: Using Visual Studio Code Extension

1. Install "Azure App Service" extension
2. Sign in to Azure
3. Right-click backend folder → Deploy to App Service
4. Select/create App Service
5. Deploy

### Step 4: Configure Frontend to Use Backend API

Update `frontend/.env.production`:

```env
VITE_API_URL=https://newsauth-backend.azurewebsites.net
VITE_RPC_URL=<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>
VITE_CONTRACT_ADDRESS=0x5c768266b894e8160C9304FE2539C59e4E80c2A1
```

### Step 5: Deploy Frontend to Azure Static Web Apps

```powershell
# Using Angular CLI
az staticwebapp create `
  --name newsauth-frontend `
  --resource-group newsauth-rg `
  --source https://github.com/your-repo.git `
  --branch main `
  --app-location frontend `
  --output-location dist
```

---

## 🔐 Security Checklist

- [ ] Use managed identities for Azure services
- [ ] Store secrets in Azure Key Vault (not in .env)
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable Application Insights for monitoring
- [ ] Use private endpoints for sensitive services

---

## 🚀 Deployment Verification

1. **Backend Health Check**
   ```
   GET https://newsauth-backend.azurewebsites.net/api/health
   ```

2. **Frontend Access**
   ```
   https://newsauth-frontend.azurewebsites.net
   ```

3. **Test Full Workflow**
   - Submit news → Analyze → Verify IPFS upload → Check blockchain

---

## 📊 Monitoring

Enable Application Insights:

```powershell
az monitor app-insights component create `
  --app newsauth-insights `
  --location eastus `
  --resource-group newsauth-rg `
  --application-type web
```

---

## 💰 Estimated Azure Costs (Monthly)

- App Service Plan (B2): $65
- Application Insights: $2.99 (0-1GB free)
- Azure Cognitive Services: $1-10 (depends on usage)

**Total: ~$70-80/month for production**

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Authentication Error | Check API keys in App Service settings |
| Port 5000 already in use | Azure uses port 8080, update in .env |
| CORS errors | Update CORS_ORIGIN to match Azure domain |
| Blockchain fails | Verify PRIVATE_KEY and RPC_URL in settings |
| Pinata upload fails | Check API credentials and rate limits |

---

## 📚 Useful Links

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Ethereum Sepolia Faucet](https://www.sepoliafaucet.com/)
