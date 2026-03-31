# System Architecture & Design

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                   Frontend (React + TypeScript)                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Submit     │  │  Dashboard   │  │    About     │          │
│  │   News       │  │   Records    │  │    Page      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ 
         ┌─────────────┴─────────────┐
         │ REST API Calls (HTTPS)    │
         │ JSON payloads             │
         │                           │
         ▼                           │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND APPLICATION SERVER                   │
│                  Node.js + Express.js Framework                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               MIDDLEWARE LAYER                          │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ CORS Filter  │ │ Auth & Rate  │ │ Error        │    │   │
│  │  │              │ │ Limiting     │ │ Handling     │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            ROUTE HANDLERS & CONTROLLERS                 │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │   │
│  │  │ /analyze    │ │ /records    │ │ /verify          │  │   │
│  │  │ POST        │ │ GET         │ │ POST             │  │   │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             BUSINESS LOGIC LAYER                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ Content      │  │ Azure        │  │ IPFS         │  │   │
│  │  │ Service      │  │ AI Service   │  │ Service      │  │   │
│  │  │              │  │              │  │              │  │   │
│  │  │ • Fetch URL  │  │ • Sentiment  │  │ • Upload     │  │   │
│  │  │ • Validate   │  │ • Phrases    │  │ • Pin        │  │   │
│  │  │ • Sanitize   │  │ • Credibility│  │ • Unpin      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                       │
│  ┌─────────────────────┴──────────────────────────────────┐   │
│  │          BLOCKCHAIN SERVICE LAYER                      │   │
│  │                                                        │   │
│  │  • Connect to Ethereum Sepolia                        │   │
│  │  • Create transactions                               │   │
│  │  • Register article on smart contract                │   │
│  │  • Verify articles                                   │   │
│  │  • Get transaction receipts                          │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                       │
│  ┌─────────────────────┴──────────────────────────────────┐   │
│  │              DATA PERSISTENCE                          │   │
│  │                                                        │   │
│  │  • Logging (file-based)                              │   │
│  │  • Config management                                 │   │
│  │  • Cache (optional)                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────┐   ┌──────────┐   ┌──────────────┐
   │ Azure  │   │ Pinata   │   │  Ethereum    │
   │ Text   │   │  IPFS    │   │  Blockchain  │
   │Analytics  │  Network │   │  Sepolia     │
   └────────┘   └──────────┘   └──────────────┘
```

---

## 📊 Data Flow Diagram

### 1. News Analysis Pipeline

```
User Input
    │
    ├─ [TYPE CHECK]
    │   - text input or URL?
    │
    ├─ [FETCH CONTENT]
    │   - If URL: download & extract text
    │   - If text: use directly
    │
    ├─ [VALIDATION]
    │   - Min/max length check
    │   - Format validation
    │   - Content sanitization
    │
    ├─ [AI ANALYSIS] (Azure Cognitive Services)
    │   - Sentiment Analysis
    │     └─ Score: 0-1 (negative/positive)
    │   - Key Phrase Extraction
    │     └─ List of important concepts
    │   - Credibility Calculation
    │     └─ Algorithm-based scoring (0-100%)
    │
    ├─ [IPFS UPLOAD] (Pinata)
    │   - Encrypt analysis data
    │   - Upload to IPFS network
    │   - Receive Content ID (CID)
    │   - Pin for permanence
    │
    ├─ [BLOCKCHAIN STORAGE] (Ethereum Sepolia)
    │   - Create transaction
    │   - Call smart contract
    │   - Register article hash + IPFS CID
    │   - Wait for confirmation
    │   - Get transaction hash
    │
    └─ [RETURN TO USER]
        - Sentiment score + label
        - Key phrases
        - Credibility score
        - IPFS link (for retrieval)
        - Transaction hash (proof on blockchain)
        - Etherscan link (view transaction)
```

---

## 🔐 Security Architecture

### Layers of Security

```
┌─ LAYER 1: TRANSPORT ─────────────────────────────────────────┐
│                                                              │
│  HTTPS/TLS Encryption                                       │
│  ├─ All API calls encrypted in transit                      │
│  ├─ Certificate verification                                │
│  └─ No plaintext passwords over network                     │
└──────────────────────────────────────────────────────────────┘

┌─ LAYER 2: INPUT VALIDATION ──────────────────────────────────┐
│                                                              │
│  Frontend                                                   │
│  ├─ Type checking (TypeScript)                              │
│  ├─ Content length validation                               │
│  └─ URL format validation                                   │
│                                                              │
│  Backend                                                    │
│  ├─ Type validation (required fields)                       │
│  ├─ Regex patterns for URLs                                 │
│  ├─ Content sanitization (XSS prevention)                   │
│  ├─ SQL injection prevention (parameterized queries)        │
│  └─ Rate limiting (DDoS mitigation)                         │
└──────────────────────────────────────────────────────────────┘

┌─ LAYER 3: AUTHENTICATION & AUTHORIZATION ────────────────────┐
│                                                              │
│  Wallet Authentication (Optional)                           │
│  ├─ MetaMask signature verification                         │
│  ├─ Nonce-based to prevent replay attacks                   │
│  └─ JWT tokens for session management                       │
│                                                              │
│  API Key Management                                         │
│  ├─ Separate keys per service                               │
│  ├─ Rotation policies                                       │
│  └─ Key expiration                                          │
└──────────────────────────────────────────────────────────────┘

┌─ LAYER 4: SECRETS MANAGEMENT ────────────────────────────────┐
│                                                              │
│  Azure Key Vault                                            │
│  ├─ Never hardcode secrets                                  │
│  ├─ Private keys encrypted at rest                          │
│  ├─ Access controls & RBAC                                  │
│  ├─ Audit logging                                           │
│  └─ Secrets rotated regularly                               │
│                                                              │
│  Environment Variables                                      │
│  ├─ .env files NEVER committed                              │
│  ├─ Different configs per environment                       │
│  └─ Secrets injected at runtime                             │
└──────────────────────────────────────────────────────────────┘

┌─ LAYER 5: BLOCKCHAIN SECURITY ───────────────────────────────┐
│                                                              │
│  Smart Contract                                             │
│  ├─ Solidity best practices followed                        │
│  ├─ Reentrancy protection                                   │
│  ├─ Integer overflow/underflow (Solidity 0.8+)             │
│  ├─ Access controls (onlyOwner)                             │
│  └─ Events for auditability                                 │
│                                                              │
│  Transaction Security                                       │
│  ├─ Private key only on backend                             │
│  ├─ Never exposed in frontend/logs                          │
│  ├─ Secure signing library (ethers.js)                      │
│  ├─ Gas price protection                                    │
│  └─ Transaction verification                                │
└──────────────────────────────────────────────────────────────┘

┌─ LAYER 6: MONITORING & AUDIT ────────────────────────────────┐
│                                                              │
│  Logging                                                    │
│  ├─ All API requests logged                                 │
│  ├─ Error logging with stack traces                         │
│  ├─ Sensitive data masked in logs                           │
│  └─ Centralized logging (Application Insights)              │
│                                                              │
│  Alerts & Thresholds                                        │
│  ├─ High error rate alerts                                  │
│  ├─ Rate limiting triggered alerts                          │
│  ├─ Unusual transaction patterns                            │
│  └─ Security event notifications                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Service Integration Points

### 1. Azure Cognitive Services Integration

```
┌──────────────┐
│ Input Text   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Azure Text Analytics API               │
├─────────────────────────────────────────┤
│ POST /text/analytics/v3.1/sentiment     │
│ POST /text/analytics/v3.1/keyPhrases    │
│ POST /text/analytics/v3.1/entities      │
└──────┬────────────────────────────────────┘
       │
       ▼
┌─────────────────────┬──────────────────┐
│ Sentiment Results   │ Key Phrases      │
├─────────────────────┼──────────────────┤
│ - Score: 0-1        │ - Phrases: []    │
│ - Label:            │                  │
│   positive,         │                  │
│   neutral,          │                  │
│   negative          │                  │
└─────────────────────┴──────────────────┘
       │
       ▼
┌─────────────────────┐
│ Credibility Score   │
│ (Calculated)        │
└─────────────────────┘
```

### 2. Pinata IPFS Integration

```
┌────────────────┐
│ Analysis Data  │
│ (JSON)         │
└────────┬───────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Pinata IPFS API                        │
├─────────────────────────────────────────┤
│ POST /pinning/pinFileToIPFS             │
│ Headers:                                │
│  - pinata_api_key                       │
│  - pinata_secret_api_key                │
└──────┬────────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ IPFS Content ID (CID)    │
│ Qm...                    │
│                          │
│ Pinned for permanence    │
│ Retrievable via gateway  │
└──────────────────────────┘
```

### 3. Ethereum Smart Contract Integration

```
┌────────────────┐
│ IPFS CID       │
│ + Metadata     │
└────────┬───────┘
         │
         ▼
┌───────────────────────────────────────────────┐
│ ethers.js Client Library                      │
├───────────────────────────────────────────────┤
│ - Create wallet from private key              │
│ - Connect to Infura RPC endpoint              │
│ - Create contract instance                    │
│ - Sign & send transaction                     │
└──────┬────────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────────┐
│ Smart Contract Method Call                    │
│ function registerArticle(hash, cid)           │
├───────────────────────────────────────────────┤
│ - Validate inputs (non-zero, not duplicate)   │
│ - Store in mapping                            │
│ - Emit ArticleRegistered event                │
│ - Emit confirmation to caller                 │
└──────┬────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Transaction Hash (0x...)         │
│ Block Number                      │
│ Gas Used                          │
│ Status: confirmed                 │
└──────────────────────────────────┘
```

---

## 🔄 Component Interactions

### Request Lifecycle

```
1. FRONTEND
   └─ User submits news via web interface
   └─ Content validation (client-side)
   └─ MetaMask wallet connection required
   └─ Send POST to /api/analyze

2. BACKEND - ROUTE HANDLER
   ├─ Receive HTTP POST request
   ├─ CORS validation
   ├─ Rate limiting check
   ├─ Parse JSON payload
   └─ Route to /api/analyze handler

3. BACKEND - CONTENT SERVICE
   ├─ Validate input (type, length, format)
   ├─ If URL: fetch and extract text
   ├─ If text: use directly
   ├─ Sanitize content
   └─ Return validated content

4. BACKEND - AZURE AI SERVICE
   ├─ Call Azure Text Analytics API
   ├─ Sentiment analysis
   ├─ Key phrase extraction
   ├─ Calculate credibility score
   └─ Return analysis results

5. BACKEND - IPFS SERVICE
   ├─ Package analysis results as JSON
   ├─ Call Pinata API
   ├─ Upload to IPFS network
   ├─ Receive Content ID (CID)
   ├─ Pin for permanence
   └─ Return IPFS hash

6. BACKEND - BLOCKCHAIN SERVICE
   ├─ Create Ethereum transaction
   ├─ Call NewsAuth smart contract
   ├─ registerArticle(hash, cid)
   ├─ Wait for transaction confirmation
   ├─ Return transaction hash & block number
   └─ Store confirmation in logs

7. BACKEND - RESPONSE
   ├─ Compile results:
   │  ├─ Sentiment score
   │  ├─ Key phrases
   │  ├─ Credibility score
   │  ├─ IPFS hash
   │  └─ Transaction hash
   ├─ Convert to JSON
   ├─ Add CORS headers
   ├─ Send HTTP 200 response
   └─ Log request/response

8. FRONTEND - DISPLAY RESULTS
   ├─ Receive JSON response
   ├─ Parse and display results:
   │  ├─ Sentiment gauge
   │  ├─ Credibility percentage
   │  ├─ Key phrases as tags
   │  ├─ IPFS link (clickable)
   │  ├─ Etherscan link (clickable)
   │  └─ Copy buttons for hashes
   ├─ Store in component state
   └─ Offer export/share options
```

---

## 💾 Database Schema (Optional)

If using MongoDB or Cosmos DB:

```javascript
// Analysis Records Collection
{
  _id: ObjectId,
  userId: "0x...",
  contentHash: "0x...",
  ipfsCID: "Qm...",
  transactionHash: "0x...",
  blockNumber: 12345678,
  analysis: {
    sentiment: {
      score: 0.75,
      label: "positive"
    },
    keyPhrases: ["phrase1", "phrase2"],
    credibilityScore: 85
  },
  metadata: {
    source: "text|url",
    originalUrl: "http://...",
    timestamp: ISODate(),
    userAgent: "..."
  },
  status: "completed|failed|pending",
  createdAt: ISODate(),
  updatedAt: ISODate()
}

// Users Collection (Optional)
{
  _id: ObjectId,
  walletAddress: "0x...",
  analysisCount: 42,
  totalCredibility: 3570,
  joined: ISODate(),
  preferences: {
    notifications: true,
    theme: "dark"
  }
}
```

---

## ⚡ Performance Optimization

### Caching Strategy

```
Cache Layer 1 (Browser)
├─ Asset caching (CSS, JS, images)
├─ Service Worker for offline mode
└─ LocalStorage for UI state

Cache Layer 2 (Backend Memory)
├─ Recent analysis results (Redis optional)
├─ Configuration data
└─ Service connectivity status

Cache Layer 3 (CDN)
├─ Frontend static assets
├─ API responses (if cacheable)
└─ IPFS gateway cache
```

### Optimization Techniques

```
Frontend
├─ Code splitting (lazy loading)
├─ Image optimization
├─ CSS-in-JS minification
├─ Tree shaking unused code
└─ Async/await for parallelism

Backend
├─ Connection pooling for databases
├─ Response pagination (10-50 items)
├─ Database query optimization
├─ Async processing for slow operations
├─ Microservice horizontal scaling
└─ Load balancing across instances
```

---

## 🧪 Testing Strategy

```
Unit Tests
├─ Service layer functions
├─ Utility functions
└─ Component rendering

Integration Tests
├─ API endpoint to database
├─ Service-to-service communication
└─ Smart contract interactions

End-to-End Tests
├─ Complete user workflows
├─ Multi-service integration
└─ Error scenarios

Load Testing
├─ Max concurrent connections
├─ Response time under load
├─ Rate limiting effectiveness
└─ Failover scenarios
```

---

**Last Updated**: 2024
**Version**: 1.0.0
