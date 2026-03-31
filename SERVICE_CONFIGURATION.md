# 📋 NewsAuth - Complete Service Configuration Summary

## 🎯 Project Overview

**NewsAuth** is an AI-powered news verification system that combines:
- 🤖 Azure AI for credibility analysis
- 📦 Pinata IPFS for decentralized storage
- ⛓️ Ethereum Blockchain for immutable proof
- 🌐 Web3 wallet integration for verification

---

## 🔑 Service Credentials (Secure - Store in Azure Key Vault)

### 1️⃣ Azure Cognitive Services - AI Analysis

**Service:** Text Analytics API v3.1

| Property | Value |
|----------|-------|
| **Endpoint** | `https://news-ai-service.cognitiveservices.azure.com/` |
| **API Key** | `<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>` |
| **Region** | East US |
| **Service Tier** | Standard S1 |

**Features Used:**
- Sentiment Analysis - Determines emotional tone of article
- Key Phrase Extraction - Identifies main topics
- Credibility Scoring - Custom algorithm based on linguistic patterns

**API Endpoints:**
```
POST {endpoint}/text/analytics/v3.1/sentiment?model-version=latest
POST {endpoint}/text/analytics/v3.1/keyPhrases
```

**Rate Limits:** 100 requests/min (can be upgraded)

---

### 2️⃣ Pinata IPFS - Decentralized Storage

**Service:** IPFS pinning service

| Property | Value |
|----------|-------|
| **API Key** | `<REPLACE_WITH_YOUR_PINATA_API_KEY>` |
| **API Secret** | `<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>` |
| **Plan** | Paid (Full Access) |
| **Gateway URL** | `https://gateway.pinata.cloud/ipfs/{cid}` |

**What's Stored:**
```json
{
  "article": "Original news text",
  "analysis": {
    "sentiment": "neutral",
    "credibilityScore": 65,
    "keyPhrases": ["phrase1", "phrase2"]
  },
  "metadata": {
    "type": "text",
    "timestamp": "2026-03-31T05:01:48.964Z",
    "walletAddress": "0x917EC2990193714faf62AbF081D9bD694416F8fE"
  }
}
```

**Features:**
- Immutable storage on IPFS
- 99.9% uptime guarantee
- Automatic replication
- Metadata tracking
- Gateway access worldwide

**API Endpoints:**
```
POST https://api.pinata.cloud/pinning/pinFileToIPFS
POST https://api.pinata.cloud/pinning/pinByHash
DELETE https://api.pinata.cloud/pinning/unpin/{cid}
```

---

### 3️⃣ Ethereum Sepolia Blockchain - Immutable Proof

**Network:** Sepolia Testnet (for testing/demo)

| Property | Value |
|----------|-------|
| **RPC Endpoint** | `<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>` |
| **Private Key** | `<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>` |
| **Wallet Address** | `0x917EC2990193714faf62AbF081D9bD694416F8fE` |
| **Contract Address** | `0x5c768266b894e8160C9304FE2539C59e4E80c2A1` |
| **Block Explorer** | `https://sepolia.etherscan.io/` |
| **Network ID** | 11155111 |

**Smart Contract Functions:**
```solidity
function registerArticle(
  string memory ipfsHash,
  address submittedBy,
  uint256 timestamp
) → transaction hash
```

**What's Stored on Blockchain:**
- IPFS CID (hash of the analysis)
- Wallet address of analyzer
- Timestamp of verification
- Transaction hash for proof

**Example Transaction:**
```
TX Hash: 0x541c43c5d1fba3eafb9eb6f38c324b760633c112ce79b251a4e7416693a90b5d
From: 0x917EC2990193714faf62AbF081D9bD694416F8fE
Contract: 0x5c768266b894e8160C9304FE2539C59e4E80c2A1
Data: IPFS CID + Metadata
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│              localhost:3000 / Azure Static               │
│                 MetaMask Wallet Connect                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS API calls
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js Express)                   │
│          localhost:5000 / Azure App Service              │
│                                                          │
│  Routes:                                                 │
│  • POST /api/analyze - Analyze news                      │
│  • GET /api/records - Fetch analyses                     │
│  • GET /api/health - Health check                        │
└─────────────┬─────────────────────┬──────────────────────┘
              │                     │ HTTP requests
              ↓                     ↓
    ┌─────────────────┐    ┌──────────────────────┐
    │  Azure Cognitive│    │  Pinata IPFS         │
    │  Services       │    │  Gateway             │
    │  Text Analytics │    │  api.pinata.cloud    │
    │  Sentiment      │    │                      │
    │  Key Phrases    │    │  Stores analysis     │
    │  Analysis       │    │  JSON permanently    │
    └─────────────────┘    └──────────────────────┘
              │                     │
              └──────────────┬──────┘
                             │ Updates blockchain
                             ↓
                ┌────────────────────────────────┐
                │  Ethereum Sepolia Blockchain   │
                │  Infura RPC + Smart Contract   │
                │                                │
                │  Stores immutable proof:       │
                │  - IPFS CID                    │
                │  - Analyzer wallet            │
                │  - Timestamp                   │
                │  - TX Hash verification        │
                └────────────────────────────────┘
```

---

## 📦 Project Structure

```
D:\News/
├── backend/
│   ├── server.js                 # Main server entry
│   ├── package.json              # Dependencies
│   ├── .env                       # Environment variables
│   ├── routes/
│   │   └── api.js               # API endpoints
│   ├── services/
│   │   ├── azureService.js      # Azure AI integration
│   │   ├── ipfsService.js       # Pinata IPFS integration
│   │   ├── blockchainService.js # Ethereum integration
│   │   └── contentService.js    # Content validation
│   ├── middleware/
│   │   └── errorHandler.js      # Error handling
│   └── utils/
│       └── logger.js            # Logging utility
│
├── frontend/
│   ├── index.html               # HTML entry
│   ├── src/
│   │   ├── main.tsx            # React entry
│   │   ├── App.tsx             # Main component
│   │   ├── components/
│   │   │   ├── SubmitNews.tsx  # News submission form
│   │   │   ├── Dashboard.tsx   # Results display
│   │   │   ├── WalletButton.tsx # MetaMask connect
│   │   │   └── Navbar.tsx      # Navigation
│   │   ├── pages/
│   │   │   ├── About.tsx
│   │   │   └── AnalysisResult.tsx
│   │   └── services/
│   │       ├── blockchainService.ts # Web3 integration
│   │       └── apiService.ts       # Backend API calls
│   └── package.json
│
├── contracts/
│   └── NewsAuth.sol            # Smart contract
│
├── AZURE_DEPLOYMENT.md         # Azure deployment guide
├── deploy-to-azure.ps1         # PowerShell deployment script
├── deploy-to-azure.sh          # Bash deployment script
└── Dockerfile                  # Container image
```

---

## 🚀 Deployment Workflow

### Local Development (Current)
```
Port 3000 (Frontend: Vite) → Port 5000 (Backend: Express)
                                ↓
                        Azure Cognitive Services (AI)
                        Pinata IPFS (Storage)
                        Sepolia Blockchain (Proof)
```

### Azure Production
```
Azure Static Web Apps (Frontend)
                ↓
        API calls to Backend
                ↓
Azure App Service (Backend)
                ↓
        Same external services used
```

---

## 🔐 Security Notes

1. **Never commit .env files to GitHub**
2. **Store secrets in Azure Key Vault** (production)
3. **Use managed identities** for Azure services
4. **Rotate API keys** regularly
5. **Monitor usage** via Application Insights
6. **Use HTTPS only** in production
7. **Rate limit** API endpoints (100 req/min)

---

## 📊 Workflow Example

```
1. User submits article text
   ↓
2. Backend validates content
   ↓
3. REQUEST TO AZURE:
   - Sentiment analysis
   - Key phrase extraction
   - Credibility scoring
   ↓
4. UPLOAD TO PINATA:
   - Store article + analysis as JSON
   - Get IPFS CID hash
   - Data immutably stored
   ↓
5. STORE ON BLOCKCHAIN:
   - Write CID to smart contract
   - Record wallet address
   - Get transaction hash
   ↓
6. RETURN TO USER:
   - Credibility score (0-100)
   - Sentiment (positive/neutral/negative)
   - Key phrases
   - IPFS link: https://gateway.pinata.cloud/ipfs/{cID}
   - Blockchain proof: https://sepolia.etherscan.io/tx/{txHash}
```

---

## ✅ Deployment Checklist

- [ ] Azure subscription active
- [ ] Resource group created
- [ ] App Service plan configured
- [ ] Web app deployed
- [ ] Environment variables set
- [ ] Azure Cognitive Services connected
- [ ] Pinata credentials verified
- [ ] Ethereum wallet funded (testnet)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled
- [ ] Monitoring enabled (Application Insights)
- [ ] CI/CD pipeline set up (optional)

---

## 📞 Support Resources

| Service | Documentation |
|---------|---|
| Azure Cognitive Services | https://docs.microsoft.com/azure/cognitive-services |
| Pinata IPFS | https://docs.pinata.cloud/ |
| Ethereum Sepolia | https://sepoliafaucet.com/ |
| Azure App Service | https://docs.microsoft.com/azure/app-service |
| Ethers.js | https://docs.ethers.org/ |

---

## 💡 Tips & Best Practices

1. **Always test on Sepolia first** before mainnet
2. **Monitor Azure costs** regularly
3. **Use Application Insights** for debugging
4. **Implement caching** for repeated analyses
5. **Set up alerts** for errors and failures
6. **Back up smart contract state** periodically
7. **Use GitHub Actions** for automated deployments

---

**Last Updated:** March 31, 2026  
**System Status:** ✅ Fully Operational  
**Services:** 3/3 Connected & Working
