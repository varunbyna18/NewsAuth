# Project Structure

```
News/
├── 📁 frontend/                    # React + TypeScript Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── WalletButton.tsx
│   │   │   └── AnalysisResult.tsx
│   │   ├── 📁 pages/
│   │   │   ├── SubmitNews.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── About.tsx
│   │   ├── 📁 services/
│   │   │   └── blockchainService.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── 📁 public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── README.md
│
├── 📁 backend/                     # Node.js + Express Backend
│   ├── 📁 services/
│   │   ├── azureService.js         # Azure AI integration
│   │   ├── ipfsService.js          # IPFS/Pinata integration
│   │   ├── blockchainService.js    # Ethereum integration
│   │   └── contentService.js       # Content validation & fetch
│   ├── 📁 routes/
│   │   └── api.js                  # API endpoints
│   ├── 📁 middleware/
│   │   └── errorHandler.js         # Error & logging middleware
│   ├── 📁 utils/
│   │   └── logger.js               # Logging utility
│   ├── 📁 logs/                    # Application logs
│   ├── server.js                   # Main server entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── 📁 contracts/                   # Smart Contracts
│   └── NewsAuth.sol                # Main smart contract
│
├── 📁 scripts/
│   └── deploy.js                   # Smart contract deployment
│
├── 📁 test/
│   └── Lock.js                     # Contract tests
│
├── 📁 ignition/
│   └── 📁 modules/
│       └── Lock.js                 # Deployment module
│
├── 📁 artifacts/                   # Compiled contracts
│   ├── 📁 build-info/
│   └── 📁 contracts/
│
├── 📁 cache/                       # Hardhat cache
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── backend-deploy.yml      # Backend CI/CD
│       ├── frontend-deploy.yml     # Frontend CI/CD
│       └── contract-deploy.yml     # Contract deployment
│
├── 📁 docs/
│   └── 📁 deployment/
│       ├── COMPLETE_SETUP.md       # Full setup guide
│       ├── QUICK_START.md          # Quick start guide
│       ├── API_DOCS.md             # API documentation
│       └── ARCHITECTURE.md         # System architecture
│
├── 📁 config/                      # Configuration files
│
├── .env.example                    # Environment variables template
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Root dependencies
├── README.md                        # Main project README
└── deployments.json                # Deployment history
```

## 📖 File Descriptions

### Frontend Files

- **components/Navbar.tsx** - Top navigation bar with wallet connection
- **components/WalletButton.tsx** - MetaMask wallet connection button
- **components/AnalysisResult.tsx** - Display analysis results
- **pages/SubmitNews.tsx** - Main page for submitting news
- **pages/Dashboard.tsx** - View analysis records
- **pages/About.tsx** - About page with system info
- **services/blockchainService.ts** - Web3 utilities for smart contract interaction

### Backend Files

- **services/azureService.js** - Azure AI integration for sentiment/credibility analysis
- **services/ipfsService.js** - Pinata IPFS upload and management
- **services/blockchainService.js** - Ethereum smart contract interaction
- **services/contentService.js** - Content validation and URL fetching
- **routes/api.js** - REST API endpoint handlers
- **middleware/errorHandler.js** - Error handling and logging middleware
- **utils/logger.js** - Centralized logging utility

### Smart Contracts

- **contracts/NewsAuth.sol** - Main smart contract for article registration and verification
- **scripts/deploy.js** - Deployment script for smart contract
- **hardhat.config.js** - Hardhat network and compiler configuration

### Configuration & Deployment

- **.env.example** - Environment variables template
- **hardhat.config.js** - Blockchain network configuration
- **.github/workflows/** - GitHub Actions CI/CD pipelines
- **docs/deployment/** - Comprehensive documentation

## 🔄 Key Integration Points

```
Frontend ←→ Backend API
    • REST endpoints
    • JSON payloads
    • WebSocket optional

Backend ←→ External Services
    • Azure Cognitive Services (HTTP)
    • Pinata IPFS API (HTTP)
    • Ethereum RPC (JSON-RPC)
    • Infura provider (HTTPS)

Smart Contract ←→ Blockchain
    • Solidity contract
    • Ethereum Sepolia testnet
    • ethers.js library
```

## 📋 Environment Variables by Layer

### Root Level (.env)
```
NODE_ENV, PORT
ETHEREUM keys and RPC
ETHERSCAN API
```

### Frontend (.env.local)
```
VITE_API_URL
VITE_CONTRACT_ADDRESS
VITE_CHAIN_ID
```

### Backend (.env)
```
AZURE_*, PINATA_*, SEPOLIA_*, CONTRACT_*
All third-party service credentials
```

---

**Last Updated**: 2024
