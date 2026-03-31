# AI-Powered News Verification System - Complete Setup & Deployment Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Blockchain Setup](#blockchain-setup)
5. [Integrating Third-Party Services](#integrating-third-party-services)
6. [Server Deployment](#server-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Smart Contract Deployment](#smart-contract-deployment)
9. [CI/CD Setup](#cicd-setup)
10. [Monitoring & Logs](#monitoring--logs)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Azure Static Web Apps)             │
│              React 18 + TypeScript + Tailwind CSS               │
│                    (vite dev server on :3000)                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS API Calls
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Backend (Azure App Service)                      │
│           Node.js/Express REST API (port 5000)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Azure Text  │  │   Pinata     │  │  Blockchain  │          │
│  │  Analytics   │  │    IPFS      │  │  Services    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    ┌────────┐   ┌──────────┐   ┌──────────────┐
    │ IPFS   │   │ Ethereum │   │    Azure     │
    │Network │   │ Sepolia  │   │  Key Vault   │
    └────────┘   └──────────┘   └──────────────┘
```

---

## 📦 Prerequisites

### Required Tools
- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **npm** v9+ (comes with Node.js)
- **MetaMask** browser extension or Ethereum wallet

### Azure Account
- Azure Subscription ([Create free account](https://azure.microsoft.com/free/))
- Resource Group created
- Storage account for backups

### Third-Party Accounts
- **Azure Cognitive Services** account (Text Analytics)
- **Pinata** account for IPFS ([pinata.cloud](https://pinata.cloud))
- **Infura** account for Ethereum RPC ([infura.io](https://infura.io))
- **Etherscan** API key ([etherscan.io](https://etherscan.io))

### Tokens & Keys
- Private key for Ethereum transactions (from MetaMask or similar)
- Azure subscription credentials
- Ethereum testnet ETH (get from [Sepolia faucet](https://sepoliafaucet.com/))

---

## 🚀 Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd News
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Required .env variables:**
```env
AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_KEY=your_key_here
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
PRIVATE_KEY=your_private_key  # without 0x prefix
CONTRACT_ADDRESS=0x...  # will be set after deployment
ETHERSCAN_API_KEY=your_etherscan_key
```

**Install dependencies:**
```bash
npm install
```

**Start backend server:**
```bash
npm run dev  # dev mode with auto-reload
# or
npm start   # production mode
```

Backend will be available at `http://localhost:5000`

### 3. Setup Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Create environment file
cp .env.example .env.local

# Edit with your backend URL
nano .env.local
```

**Required .env.local variables:**
```env
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=0x...  # use deployed contract address
VITE_CHAIN_ID=11155111
```

**Install dependencies:**
```bash
npm install
```

**Start frontend dev server:**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 4. Test Local Setup

```bash
# Frontend:
# Visit http://localhost:3000

# Try the /health endpoint:
curl http://localhost:5000/health

# Response should show all env variables loaded
```

---

## 🔗 Blockchain Setup

### 1. Ethereum Sepolia Testnet Account

1. Install **MetaMask** browser extension
2. Create or import wallet
3. Switch to Sepolia testnet in MetaMask
4. Export private key:
   - Click MetaMask → Account Details → Export Private Key
   - Copy and store safely (never share!)

### 2. Get Test ETH

Visit one of these faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

Each gives 0.5-2 ETH per 24 hours (enough for testing).

### 3. View Smart Contract Events

Monitor your contract:
- **Etherscan**: https://sepolia.etherscan.io
- Search by contract address or tx hash
- View all transactions and events

---

## 🔑 Integrating Third-Party Services

### Azure Cognitive Services (Text Analytics)

#### Setup:
1. Go to **Azure Portal** → Create Resource
2. Search for **Text Analytics**
3. Create new instance:
   - Resource Group: your-rg
   - Region: closest to you
   - Pricing: Free tier (5K records/month)

4. After creation, get keys:
   - Go to resource → Keys and Endpoint
   - Copy **Key 1** and **Endpoint URL**

```env
AZURE_ENDPOINT=https://region.tis.cognitiveservices.azure.com/
AZURE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Test Azure connection:**
```bash
curl -X POST \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"documents":[{"language":"en","id":"1","text":"Hello world"}]}' \
  "https://YOUR_ENDPOINT/text/analytics/v3.1/sentiment?model-version=latest"
```

### Pinata IPFS API

#### Setup:
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for free account
3. Go to API Keys section
4. Click "New Key"
5. Copy **API Key** and **API Secret**

```env
PINATA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PINATA_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Test Pinata connection:**
```bash
curl -X GET -H "pinata_api_key: YOUR_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET" \
  https://api.pinata.cloud/data/testAuthentication
```

### Infura Ethereum RPC

#### Setup:
1. Go to [infura.io](https://infura.io)
2. Sign up and create project
3. Select **Ethereum** project
4. Copy **Sepolia RPC URL**

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

**Test Infura connection:**
```bash
curl https://sepolia.infura.io/v3/YOUR_PROJECT_ID \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🌐 Server Deployment

### Deploy Backend to Azure App Service

#### Step 1: Create App Service

```bash
# Using Azure CLI
az group create --name newsauth-rg --location eastus

az appservice plan create \
  --name newsauth-plan \
  --resource-group newsauth-rg \
  --sku B1

az webapp create \
  --name newsauth-api \
  --resource-group newsauth-rg \
  --plan newsauth-plan \
  --runtime "NODE|20-lts"
```

#### Step 2: Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group newsauth-rg \
  --name newsauth-api \
  --settings \
    NODE_ENV=production \
    AZURE_ENDPOINT=$AZURE_ENDPOINT \
    AZURE_KEY=$AZURE_KEY \
    PINATA_API_KEY=$PINATA_API_KEY \
    PINATA_SECRET=$PINATA_SECRET \
    SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL \
    PRIVATE_KEY=$PRIVATE_KEY \
    CONTRACT_ADDRESS=$CONTRACT_ADDRESS
```

#### Step 3: Deploy Code

```bash
# Get publish profile
az webapp deployment list-publishing-profiles \
  --resource-group newsauth-rg \
  --name newsauth-api \
  --query "[?publishMethod=='MSDeploy'].publishUrl" -o tsv

# Deploy backend
cd backend
npm install --production
npm start  # web.config will handle startup

# Using git deployment
git remote add azure <git-clone-url-from-portal>
git push azure main:master
```

#### Step 4: Verify Deployment

```bash
# Check app status
curl https://newsauth-api.azurewebsites.net/health

# View logs
az webapp log tail \
  --resource-group newsauth-rg \
  --name newsauth-api
```

---

## 🎨 Frontend Deployment

### Deploy Frontend to Azure Static Web Apps

#### Method 1: Azure Portal

1. Go to Azure Portal → Create Resource
2. Search **Static Web App**
3. **Basics tab:**
   - Resource group: newsauth-rg
   - Name: newsauth-frontend
4. **Deployment source:** GitHub
   - Authorize GitHub
   - Select your repository and branch (main)
5. **Build Presets:**
   - Build Presets: React
   - App location: frontend
   - Output location: dist
6. Review and create

#### Method 2: Azure CLI

```bash
az staticwebapp create \
  --name newsauth-frontend \
  --resource-group newsauth-rg \
  --source https://github.com/your-org/your-repo \
  --branch main \
  --login-with-github \
  --app-location frontend \
  --output-location dist
```

#### Configure Frontend Environment

```bash
# In Azure Portal → Static Web App → Configuration

# Set these application settings:
VITE_API_URL=https://newsauth-api.azurewebsites.net
VITE_CONTRACT_ADDRESS=0x...your-contract-address...
VITE_CHAIN_ID=11155111
```

#### Test Frontend

```
https://newsauth-frontend.azurestaticapps.net
```

---

## 📜 Smart Contract Deployment

### Deploy NewsAuth Contract

#### Step 1: Update Configuration

```bash
# Root directory .env
cat > .env << EOF
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
EOF
```

#### Step 2: Compile Contract

```bash
npx hardhat compile
```

#### Step 3: Deploy Contract

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Output:
# ✅ NewsAuth deployed successfully!
# 📍 Contract Address: 0x...
# 🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/0x...
# 📝 CONTRACT_ADDRESS updated in .env
```

#### Step 4: Verify on Etherscan

```bash
# Optional: Verify contract source on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

#### Step 5: Update Backend

```bash
# Copy CONTRACT_ADDRESS from deploy output
# Update backend/.env
CONTRACT_ADDRESS=0x...from-deploy-output...

# Frontend/.env.local
VITE_CONTRACT_ADDRESS=0x...from-deploy-output...
```

---

## 🔄 CI/CD Setup

### GitHub Actions Configuration

#### 1. Add Secrets to GitHub

1. Go to Repository → Settings → Secrets and Variables → Actions
2. Add these secrets:

```
AZURE_ENDPOINT
AZURE_KEY
PINATA_API_KEY
PINATA_SECRET
SEPOLIA_RPC_URL
PRIVATE_KEY
CONTRACT_ADDRESS
AZURE_APP_SERVICE_NAME
AZURE_APP_SERVICE_PUBLISH_PROFILE  # Get from Azure
AZURE_STATIC_WEB_APPS_TOKEN        # Get from Azure
ETHERSCAN_API_KEY
VITE_API_URL  # e.g., https://newsauth-api.azurewebsites.net
```

#### 2. Get Azure Publish Profile

```bash
# For App Service
az webapp deployment list-publishing-profiles \
  --resource-group newsauth-rg \
  --name newsauth-api \
  --xml
```

Copy the XML output → GitHub Secret `AZURE_APP_SERVICE_PUBLISH_PROFILE`

#### 3. Get Static Web Apps Token

In Azure Portal → Static Web Apps → Manage deployment token → Copy deployment token

Add to GitHub Secret `AZURE_STATIC_WEB_APPS_TOKEN`

#### 4. Workflows Activated

On commit to `main`:
- ✅ Backend tests & deploys to App Service
- ✅ Frontend compiles & deploys to Static Web Apps
- ✅ Smart contract compiles

---

## 📊 Monitoring & Logs

### Azure Application Insights

#### Setup:

```bash
# Create Application Insights
az monitor app-insights component create \
  --app newsauth-insights \
  --location eastus \
  --resource-group newsauth-rg \
  --application-type web
```

#### Connect to Backend:

```env
# In backend/.env
APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx
```

#### View Logs:

1. Azure Portal → Application Insights
2. Logs → Exceptions, Traces, Requests
3. Set time range and filter

### View Backend Logs

```bash
# Live streaming
az webapp log tail \
  --resource-group newsauth-rg \
  --name newsauth-api

# Download logs
az webapp log download \
  --resource-group newsauth-rg \
  --name newsauth-api \
  --log-file ./logs.zip

unzip logs.zip
```

### Monitor Smart Contract

```bash
# View transactions on Etherscan
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>

# Query events
# Use contract ABI to decode event logs
```

### Azure Key Vault (Secret Management)

```bash
# Create Key Vault
az keyvault create --name newsauth-vault --resource-group newsauth-rg

# Store secrets
az keyvault secret set \
  --vault-name newsauth-vault \
  --name PrivateKey \
  --value $PRIVATE_KEY

# Grant App Service access
az keyvault set-policy \
  --name newsauth-vault \
  --resource-group newsauth-rg \
  --object-id <app-service-identity-id> \
  --secret-permissions get list
```

---

## ✅ Deployment Checklist

- [ ] Blockchain
  - [ ] MetaMask wallet created & funded
  - [ ] Private key exported & stored safely
  - [ ] Smart contract compiled
  - [ ] Smart contract deployed to Sepolia
  - [ ] Contract address noted

- [ ] Third-Party Services
  - [ ] Azure Text Analytics configured
  - [ ] Pinata IPFS account created
  - [ ] Infura RPC URL obtained
  - [ ] Etherscan API key obtained

- [ ] Backend
  - [ ] .env file configured with all variables
  - [ ] Local tests pass
  - [ ] App Service created in Azure
  - [ ] Environment variables set in Azure
  - [ ] Backend deployed & health check passes

- [ ] Frontend
  - [ ] .env.local configured
  - [ ] Local build completes
  - [ ] Static Web App created
  - [ ] Frontend deployed & accessible
  - [ ] Wallet connection works

- [ ] CI/CD
  - [ ] GitHub repository created
  - [ ] All secrets added to GitHub
  - [ ] GitHub Actions workflows configured
  - [ ] Test commit triggers deployment

- [ ] Monitoring
  - [ ] Application Insights configured
  - [ ] Logs accessible in Azure
  - [ ] Error monitoring enabled
  - [ ] Performance alerts set

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check dependencies
npm install

# Check environment variables
npm run dev --debug

# Check logs
tail -f logs/error.log
```

### Smart contract deployment fails
```bash
# Ensure you have testnet ETH
# Check your RPC URL is correct
# Verify PRIVATE_KEY format (no 0x prefix)

curl -X POST <YOUR_RPC_URL> \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["<YOUR_ADDRESS>","latest"],"id":1}'
```

### Frontend can't connect to backend
```bash
# Check CORS is enabled in backend
# Verify VITE_API_URL points to correct backend
# Check Azure App Service is running
```

### IPFS upload fails
```bash
# Test Pinata API credentials
curl -X GET -H "pinata_api_key: YOUR_KEY" \
  https://api.pinata.cloud/data/testAuthentication

# Check uploaded file size doesn't exceed limits
```

---

## 🔒 Security Checklist

- [ ] Private keys never committed to git
- [ ] .env files in .gitignore
- [ ] Secrets stored in Azure Key Vault
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (if using DB)
- [ ] XSS protection on frontend
- [ ] Signed + verified GitHub commits

---

## Additional Resources

- [Ethereum Sepolia Testnet](https://sepoliafaucet.com)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org)
- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [React + Vite Guide](https://vitejs.dev/guide/)
- [Pinata IPFS API](https://docs.pinata.cloud/)

---

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review Azure logs
3. Check GitHub Actions workflow runs
4. Open an issue on GitHub

---

**Last Updated**: 2024
**Version**: 1.0.0
