# 📊 NewsAuth - Azure Services Architecture Diagram

## **System Architecture Overview**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      INTERNET / END USERS                                 │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                      HTTPS (TLS 1.2+)
                                 │
                    ┌────────────────────────┐
                    │  Azure Static Web Apps │
                    │  (Frontend - React)    │
                    │                        │
                    │  • Global CDN          │
                    │  • Auto HTTPS          │
                    │  • Build: Vite         │
                    │  • Framework: React    │
                    │  • Styling: Tailwind   │
                    └────────────┬───────────┘
                                 │
                          REST API Calls
                                 │
                    ┌────────────────────────────────┐
                    │   Azure App Service            │
                    │   (Backend - Node.js 18)       │
                    │                                │
                    │  Runtime: Node.js LTS         │
                    │  Framework: Express.js         │
                    │  Port: 8080 (Azure)           │
                    │  Status: Always On             │
                    │  Auto-Scale: Enabled           │
                    │                                │
                    │  Environment:                  │
                    │  - Linux Container            │
                    │  - 3.5GB Memory               │
                    │  - 250GB Storage              │
                    │                                │
                    │  Features:                     │
                    │  - CORS Enabled               │
                    │  - Rate Limiting: 100/min     │
                    │  - Error Handling             │
                    │  - Request Logging            │
                    └────┬──────────────┬────┬──────┘
                         │              │    │
          ┌──────────────┼──────────────┼────┼──────────────┐
          │              │              │    │              │
          ↓              ↓              ↓    ↓              ↓
  ┌──────────────┐ ┌───────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐
  │   AZURE      │ │  Pinata   │ │ Ethereum │ │ Azure  │ │  Azure     │
  │ COGNITIVE    │ │   IPFS    │ │ Sepolia  │ │  Key   │ │    App     │
  │  SERVICES    │ │           │ │ Blockchain│ │ Vault  │ │ Insights   │
  │              │ │           │ │          │ │        │ │            │
  │ Text         │ │ • Upload  │ │ • Smart  │ │ • API  │ │ • Logs     │
  │ Analytics    │ │ • Store   │ │   Contract│ │ Keys   │ │ • Metrics  │
  │              │ │ • Gateway │ │ • Records│ │ • Certs│ │ • Alerts   │
  │ • Sentiment  │ │ • CID     │ │ • Proof  │ │        │ │ • Traces   │
  │ • Key        │ │   Hashes  │ │ • TX Hash│ │        │ │            │
  │   Phrases    │ │           │ │          │ │        │ │            │
  │ • Analysis   │ │ Status:   │ │ Network: │ │ Status:│ │ Status:    │
  │              │ │ Active ✅ │ │ Sepolia ✅│ │Active ✅ │ │ Active ✅  │
  └──────────────┘ └───────────┘ └──────────┘ └────────┘ └────────────┘
```

---

## **Data Flow Diagram**

```
┌────────────────┐
│ User Submits   │
│ News Article   │
└────────┬───────┘
         │
         ↓ (HTTPS POST /api/analyze)
┌─────────────────────────────────────────────────┐
│  Azure App Service (Backend)                    │
│  ┌─────────────────────────────────────────────┤
│  │ Route Handler: POST /api/analyze             │
│  │ • Validate input                             │
│  │ • Sanitize content                           │
│  └─────────┬──────────────────────────────────┘
│            │
│            ├─────────────────────────────────────────┐
│            │                                         │
│            ↓                                         ↓
│    ┌───────────────────┐                ┌────────────────────┐
│    │ STEP 1: AI        │                │ STEP 2: STORAGE    │
│    │ ANALYSIS          │                │ (Parallel)         │
│    │                   │                │                    │
│    │ Call Azure        │                │ Call Pinata        │
│    │ Cognitive         │                │ IPFS API           │
│    │ Services API      │                │                    │
│    │                   │                │ Upload JSON:       │
│    │ Request:          │                │ {article,          │
│    │ POST sentiment    │                │  analysis,         │
│    │ POST keyPhrases   │                │  metadata}         │
│    │                   │                │                    │
│    │ Response:         │                │ Response:          │
│    │ {                 │                │ {                  │
│    │   sentiment,      │                │   IpfsHash: Qm..,  │
│    │   score,          │                │   timestamp        │
│    │   keyPhrases      │                │ }                  │
│    │ }                 │                │                    │
│    │                   │                │ Result: CID        │
│    │ Result:           │                │                    │
│    │ Credibility       │                └────────────────────┘
│    │ Score             │
│    └─────────┬─────────┘
│              │
│              └──────────────────┐
│                                 │
│                                 ↓
│    ┌────────────────────────────────────────┐
│    │ STEP 3: BLOCKCHAIN RECORDING           │
│    │                                        │
│    │ Call Ethereum Smart Contract           │
│    │ Network: Sepolia (Testnet)            │
│    │                                        │
│    │ Transaction:                           │
│    │ registerArticle(                       │
│    │   ipfsHash: "Qm...",                  │
│    │   walletAddress: "0x...",             │
│    │   timestamp: 1711859051               │
│    │ )                                      │
│    │                                        │
│    │ Response:                              │
│    │ {                                      │
│    │   txHash: "0x541c43c5...",            │
│    │   blockNumber: 10558378,              │
│    │   gasUsed: 85234                      │
│    │ }                                      │
│    │                                        │
│    │ Result: Blockchain Proof              │
│    └─────────┬────────────────────────────┘
│              │
└──────────────┼────────────────────────────┐
               │                            │
               ↓                            ↓
        ┌────────────────────────────────────────────┐
        │ STEP 4: GENERATE RESPONSE                  │
        │                                            │
        │ Return to Frontend:                        │
        │ {                                          │
        │   sentiment: "neutral",                    │
        │   credibilityScore: 65,                    │
        │   keyPhrases: ["phrase1", "phrase2"],     │
        │   ipfsHash: "bafkreigp26...",             │
        │   ipfsUrl: "https://gateway.pinata...",   │
        │   transactionHash: "0x541c43c5...",       │
        │   blockNumber: 10558378,                  │
        │   blockchainLink: "https://etherscan..."  │
        │ }                                          │
        └─────────┬──────────────────────────────┘
                  │
                  ↓ (HTTPS Response)
        ┌────────────────────────────┐
        │ Frontend Displays Results  │
        │                            │
        │ • Show credibility score   │
        │ • Show sentiment           │
        │ • Show key phrases         │
        │ • Display IPFS link        │
        │ • Display Blockchain link  │
        └────────────────────────────┘
```

---

## **Service Dependencies**

```
┌─────────────────────────────────────────────────────────┐
│           NewsAuth Application                          │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┬──────────────┬──────────────┐
        │                 │              │              │
        ↓                 ↓              ↓              ↓
┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────┐
│    Azure     │  │   Pinata     │  │ Ethereum │  │  Azure  │
│  Cognitive   │  │    IPFS      │  │ Sepolia  │  │ Key     │
│  Services    │  │              │  │          │  │ Vault   │
│              │  │              │  │          │  │         │
│ Required:    │  │ Required:    │  │ Required:│  │ Required│
│ • API Key    │  │ • API Key    │  │ • RPC    │  │ • Master│
│ • Endpoint   │  │ • Secret     │  │   URL    │  │  Key    │
│              │  │ • Gateway    │  │ • Private│  │         │
│ Fallback:    │  │              │  │   Key    │  │ Fallback│
│ • Simulated  │  │ Fallback:    │  │ • Contract│  │ • Hard­ │
│   Analysis   │  │ • Simulated  │  │   Addr   │  │  coded  │
│              │  │   Storage    │  │ Fallback:│  │ Keys    │
│              │  │              │  │ • Simulated│ │         │
│              │  │              │  │   TX     │  │         │
│ Status: ✅   │  │ Status: ✅    │  │ Status:✅ │ │Status:✅│
└──────────────┘  └──────────────┘  └──────────┘  └─────────┘
```

---

## **Security Layers**

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
├─────────────────────────────────────────────────────────┤
│                LAYER 1: HTTPS/TLS 1.2+                  │
│          (All traffic encrypted in transit)             │
├─────────────────────────────────────────────────────────┤
│            LAYER 2: CORS & ORIGIN VALIDATION            │
│       (Only requests from approved origins allowed)     │
├─────────────────────────────────────────────────────────┤
│              LAYER 3: API KEY AUTHENTICATION            │
│      (All external APIs require authentication)         │
├─────────────────────────────────────────────────────────┤
│            LAYER 4: RATE LIMITING (100 req/min)         │
│        (Prevents abuse and DDoS attacks)                │
├─────────────────────────────────────────────────────────┤
│         LAYER 5: INPUT VALIDATION & SANITIZATION       │
│      (Removes malicious content before processing)      │
├─────────────────────────────────────────────────────────┤
│          LAYER 6: SECRETS STORED IN AZURE KEY VAULT    │
│       (Encrypted at rest, access logged, rotatable)     │
├─────────────────────────────────────────────────────────┤
│             LAYER 7: ERROR HANDLING & LOGGING           │
│      (All actions logged to Application Insights)       │
└─────────────────────────────────────────────────────────┘
```

---

## **Deployment Architecture**

```
┌──────────────────────────────────────────────────────────────┐
│              AZURE SUBSCRIPTION                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Resource Group: newsauth-rg                           │ │
│  │                                                        │ │
│  │  ┌───────────────────────────────────────────────────┐│ │
│  │  │ Service: App Service                              ││ │
│  │  │ Name: newsauth-backend                            ││ │
│  │  │ Plan: B2 (Production)                             ││ │
│  │  │ Runtime: Node.js 18                               ││ │
│  │  │                                                    ││ │
│  │  │ Configuration:                                    ││ │
│  │  │ • Environment Variables                           ││ │
│  │  │ • Connection Strings                              ││ │
│  │  │ • Startup Command                                 ││ │
│  │  │ • Health Check Endpoint                           ││ │
│  │  │ • Auto-Scale Rules                                ││ │
│  │  └───────────────────────────────────────────────────┘│ │
│  │                                                        │ │
│  │  ┌───────────────────────────────────────────────────┐│ │
│  │  │ Service: Key Vault                                ││ │
│  │  │ Name: newsauth-kv                                 ││ │
│  │  │                                                    ││ │
│  │  │ Secrets:                                          ││ │
│  │  │ • azure-cognitive-key                             ││ │
│  │  │ • pinata-api-key                                  ││ │
│  │  │ • ethereum-private-key                            ││ │
│  │  │ • jwt-secret                                      ││ │
│  │  └───────────────────────────────────────────────────┘│ │
│  │                                                        │ │
│  │  ┌───────────────────────────────────────────────────┐│ │
│  │  │ Service: Application Insights                     ││ │
│  │  │ Name: newsauth-insights                           ││ │
│  │  │                                                    ││ │
│  │  │ Monitoring:                                       ││ │
│  │  │ • Request Tracking                                ││ │
│  │  │ • Exception Logging                               ││ │
│  │  │ • Performance Metrics                             ││ │
│  │  │ • Custom Events                                   ││ │
│  │  │ • Real-time Alerts                                ││ │
│  │  └───────────────────────────────────────────────────┘│ │
│  │                                                        │ │
│  │  ┌───────────────────────────────────────────────────┐│ │
│  │  │ Service: Static Web Apps (Optional)               ││ │
│  │  │ Name: newsauth-frontend                           ││ │
│  │  │                                                    ││ │
│  │  │ • Build: Vite (React)                             ││ │
│  │  │ • CDN: Global                                     ││ │
│  │  │ • HTTPS: Auto (Free)                              ││ │
│  │  │ • Custom Domain: Supported                        ││ │
│  │  └───────────────────────────────────────────────────┘│ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## **Monitoring & Observability**

```
Application Insights Dashboard
│
├─ Performance Metrics
│  ├─ Response Time: 200-500ms (target: <1s)
│  ├─ Throughput: Requests/sec
│  ├─ Server Response Time
│  └─ Page Load Time
│
├─ Availability Metrics
│  ├─ Uptime: 99.95% target
│  ├─ Health Check Status
│  └─ Availability Tests
│
├─ Exception Tracking
│  ├─ Error Rate
│  ├─ Error Types
│  ├─ Stack Traces
│  └─ Failed Requests
│
├─ Custom Events
│  ├─ API Calls
│  ├─ Analysis Success/Failure
│  ├─ IPFS Uploads
│  └─ Blockchain Transactions
│
└─ Alerts
   ├─ High error rate (>5%)
   ├─ Slow response time (>2s)
   ├─ Downtime detection
   └─ Resource utilization (>80%)
```

---

## **Scaling & High Availability**

```
┌────────────────────────────────────┐
│    Azure App Service Auto-Scale    │
├────────────────────────────────────┤
│                                    │
│  Rule 1: Scale Up                  │
│  Condition: CPU > 80%              │
│  Action: Add 1 instance            │
│  Cooldown: 5 minutes               │
│                                    │
│  Rule 2: Scale Down                │
│  Condition: CPU < 40%              │
│  Action: Remove 1 instance         │
│  Cooldown: 10 minutes              │
│                                    │
│  Maximum Instances: 5              │
│  Minimum Instances: 1              │
│                                    │
│  Load Distribution: Round Robin    │
│  Session Affinity: Disabled        │
│                                    │
└────────────────────────────────────┘
```

---

**This architecture document is ready for technical reviewers and stakeholders.**

*Last Updated: March 31, 2026*
