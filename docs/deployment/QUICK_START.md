# Quick Start Guide

## 🚀 5-Minute Local Setup

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Git

### 2. Clone & Setup Backend

```bash
git clone <repo-url>
cd News/backend

# Copy environment template
cp .env.example .env

# Add these minimum variables to .env
echo "AZURE_ENDPOINT=https://demo.cognitiveservices.azure.com/" >> .env
echo "AZURE_KEY=demo-key" >> .env
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key" >> .env
echo "PRIVATE_KEY=your-private-key" >> .env

# Install & start
npm install
npm run dev
```

✅ Backend ready at `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../frontend

# Copy environment
cp .env.example .env.local

# Start dev server
npm install
npm run dev
```

✅ Frontend ready at `http://localhost:3000`

### 4. Test It

1. Open `http://localhost:3000`
2. Click "Connect Wallet"
3. Select MetaMask
4. Try submitting a news article
5. Watch it get analyzed and stored on blockchain!

---

## 📝 Environment Variables (Minimum)

### Backend
```env
AZURE_ENDPOINT=https://yourresource.cognitiveservices.azure.com/
AZURE_KEY=your-key-here
PINATA_API_KEY=your-key
PINATA_SECRET=your-secret
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
PRIVATE_KEY=your-private-key-no-0x-prefix
CONTRACT_ADDRESS=0x
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=0xdeployed-address
```

---

## 🔗 Getting Keys

| Service | How to Get Key | Free Tier |
|---------|---------------|-----------|
| **Azure Text Analytics** | Azure Portal → Create Resource | 5K records/month |
| **Pinata IPFS** | [pinata.cloud](https://pinata.cloud) Sign up | 1GB free |
| **Infura RPC** | [infura.io](https://infura.io) Sign up | 100K requests/day |
| **Etherscan** | [etherscan.io](https://etherscan.io) → API | Unlimited |
| **Sepolia testnet ETH** | [sepoliafaucet.com](https://sepoliafaucet.com) | 0.5 ETH/day |

---

## 📜 Smart Contract Deployment

```bash
# From root directory
cd News

# Set your keys in .env first, then:
npx hardhat run scripts/deploy.js --network sepolia

# Copy the contract address to .env and .env.local files
```

---

## ✅ Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Frontend loads
open http://localhost:3000

# Check logs
tail -f backend/logs/info.log
```

---

## 🆘 Common Issues

**Port 5000 already in use?**
```bash
lsof -i :5000  # Find process
kill -9 <PID>  # Kill it
```

**MetaMask not appearing?**
- Make sure you have MetaMask extension installed
- Refresh page
- Check console for errors

**"Cannot find module" errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. ✅ Local testing working?
2. → Read [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) for Azure deployment
3. → Check [API_DOCS.md](./API_DOCS.md) for backend endpoints
4. → See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

---

Happy building! 🚀
