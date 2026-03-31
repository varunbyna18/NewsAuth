# 🚀 AI-Powered News Verification & Blockchain Storage System

> A production-ready full-stack application combining React, Node.js, Azure AI, IPFS, and Ethereum blockchain for transparent news verification and immutable storage.

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![Solidity](https://img.shields.io/badge/solidity-0.8.20-blue)](https://soliditylang.org)

## 📖 Quick Links

- 📚 [Full Documentation](./docs/deployment/COMPLETE_SETUP.md)
- 🚀 [Quick Start (5 min)](./docs/deployment/QUICK_START.md)
- 📡 [API Documentation](./docs/deployment/API_DOCS.md)
- 🏗️  [System Architecture](./docs/deployment/ARCHITECTURE.md)
- 📂 [Project Structure](./docs/PROJECT_STRUCTURE.md)

## 🎯 Overview

NewsAuth intelligently analyzes news articles for credibility and stores verification records immutably on the blockchain using IPFS and Ethereum.

### Key Features

✅ **AI-Powered Analysis**: Sentiment analysis, credibility scoring, key phrase extraction  
✅ **Decentralized Storage**: IPFS via Pinata for permanent, immutable records  
✅ **Blockchain Verification**: Ethereum Sepolia smart contract for transparent audit trail  
✅ **Full-Stack Web**: React frontend with MetaMask integration  
✅ **Production Deployment**: Azure cloud services with CI/CD  
✅ **Enterprise Security**: Key Vault, HTTPS, rate limiting  

## 🛠️ Tech Stack

**Frontend**: React 18 • TypeScript • Tailwind CSS • ethers.js  
**Backend**: Node.js • Express • Azure AI • Pinata IPFS  
**Blockchain**: Solidity • Ethereum Sepolia • Hardhat  
**Cloud**: Azure App Service • Static Web Apps • Key Vault  
**DevOps**: GitHub Actions • CI/CD pipelines  

## 🚀 Get Started in 5 Minutes

### 1. Clone & Setup Backend
```bash
git clone <repo-url>
cd News/backend
cp .env.example .env
# Edit .env with your keys (see QUICK_START.md)
npm install
npm run dev
```

### 2. Setup Frontend
```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

👉 **[See QUICK_START.md for detailed setup](./docs/deployment/QUICK_START.md)**

## 📡 API Examples

### Analyze News Article
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Your news article here..."
  }'
```

### Get All Records
```bash
curl http://localhost:5000/api/records
```

📖 **[Full API Docs](./docs/deployment/API_DOCS.md)**

## 📁 Project Structure

```
News/
├── frontend/          # React UI
├── backend/           # Node.js API
├── contracts/         # Smart contract
├── scripts/           # Deployment scripts
├── .github/workflows/ # CI/CD pipelines
└── docs/deployment/   # Documentation
```

**[See PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)**

## 🔐 Security

- 🔑 Azure Key Vault for secrets
- 🔒 HTTPS/TLS encryption
- 🛡️  Rate limiting & input validation
- ✅ CORS & XSS protection

## 📊 System Design

```
┌─────────────────────────────┐
│   Frontend (React)          │
│   Wallet Integration        │
└──────────────┬──────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────┐
│  Backend (Node.js/Express)  │
│  • Azure AI Analysis        │
│  • IPFS Upload              │
│  • Blockchain Storage       │
└──────────────┬──────────────┘
      ┌────────┼────────┐
      ▼        ▼        ▼
   Azure    Pinata  Ethereum
    AI      IPFS    Blockchain
```

**[Full Architecture](./docs/deployment/ARCHITECTURE.md)**

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [QUICK_START.md](./docs/deployment/QUICK_START.md) | 5-minute setup guide |
| [COMPLETE_SETUP.md](./docs/deployment/COMPLETE_SETUP.md) | Full installation & deployment |
| [API_DOCS.md](./docs/deployment/API_DOCS.md) | REST API endpoints |
| [ARCHITECTURE.md](./docs/deployment/ARCHITECTURE.md) | System design & integrations |
| [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | Repository layout |

## 🚢 Deploy to Azure

### Backend
```bash
# Create App Service
az webapp create --name newsauth-api --resource-group newsauth-rg

# Deploy
git push azure main:master
```

### Frontend
```bash
# Create Static Web App
az staticwebapp create --name newsauth-frontend ...

# Auto-deploys on push to main
```

**[Complete deployment guide](./docs/deployment/COMPLETE_SETUP.md#-server-deployment)**

## 🔗 Required Services

| Service | Signup | Free Tier |
|---------|--------|-----------|
| Azure Cognitive Services | [portal.azure.com](https://portal.azure.com) | 5K records/month |
| Pinata IPFS | [pinata.cloud](https://pinata.cloud) | 1GB |
| Infura RPC | [infura.io](https://infura.io) | 100K req/day |
| Etherscan API | [etherscan.io](https://etherscan.io) | Unlimited |

## 📋 Environment Variables

Copy templates and fill in your keys:

```bash
cp .env.example .env              # Root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

See [COMPLETE_SETUP.md](./docs/deployment/COMPLETE_SETUP.md#integrating-third-party-services) for where to get each key.

## ✅ Checklist

- [ ] Node.js 18+ installed
- [ ] MetaMask wallet created
- [ ] Azure account created
- [ ] Pinata account created
- [ ] Infura account created
- [ ] Environment variables configured
- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] Smart contract deployed

## 🆘 Troubleshooting

**Port already in use?**
```bash
lsof -i :5000  # Find process
kill -9 <PID>  # Kill it
```

**MetaMask not connecting?**
- Install MetaMask extension
- Refresh page
- Check browser console for errors

**Missing packages?**
```bash
rm -rf node_modules package-lock.json
npm install
```

See [COMPLETE_SETUP.md Troubleshooting](./docs/deployment/COMPLETE_SETUP.md#-troubleshooting) for more help.

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 📧 Support

- 📚 [Documentation](./docs/)
- 🐛 [GitHub Issues](https://github.com/yourorg/newsauth/issues)
- 💬 [GitHub Discussions](https://github.com/yourorg/newsauth/discussions)

---

<div align="center">

**Need Help?** → Read [QUICK_START.md](./docs/deployment/QUICK_START.md)  
**Want Details?** → Check [COMPLETE_SETUP.md](./docs/deployment/COMPLETE_SETUP.md)

Made with ❤️ for transparent journalism

</div>
