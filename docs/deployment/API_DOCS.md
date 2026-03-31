# API Documentation

## Base URL

- **Local**: `http://localhost:5000`
- **Production**: `https://newsauth-api.azurewebsites.net`

## Authentication

Currently, the API uses basic authentication via request headers. JWT support is optional.

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if backend services are running and configured.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-03-27T10:30:00.000Z",
  "environment": {
    "AZURE_ENDPOINT": true,
    "AZURE_KEY": true,
    "PINATA_API_KEY": true,
    "PINATA_SECRET": true,
    "SEPOLIA_RPC_URL": true,
    "PRIVATE_KEY": true,
    "CONTRACT_ADDRESS": true
  }
}
```

---

### 2. Analyze News

**POST** `/api/analyze`

Analyze a news article for sentiment, credibility, and store on blockchain.

**Request:**
```json
{
  "type": "text|url",
  "content": "Your news article text or URL",
  "walletAddress": "0x... (optional)"
}
```

**Parameters:**
- `type` (string, required): Either `"text"` or `"url"`
- `content` (string, required): Article text (min 50 chars) or valid URL
- `walletAddress` (string, optional): Ethereum wallet address for tracking

**Response:**
```json
{
  "sentiment": {
    "score": 0.75,
    "label": "positive"
  },
  "keyPhrases": [
    "artificial intelligence",
    "news verification",
    "blockchain"
  ],
  "credibilityScore": 85,
  "ipfsHash": "QmXxxx...",
  "transactionHash": "0xabc123...",
  "blockNumber": 6000000,
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
  "blockchainLink": "https://sepolia.etherscan.io/tx/0xabc123...",
  "warnings": []
}
```

**Error Response:**
```json
{
  "error": {
    "message": "Invalid type. Must be 'text' or 'url'",
    "status": 400
  }
}
```

**Example Usage:**

```bash
# Analyze text article
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Breaking news: AI helps verify news articles using blockchain technology...",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc19e1d7d00d12"
  }'

# Analyze from URL
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "url",
    "content": "https://example.com/article"
  }'
```

---

### 3. Get Records

**GET** `/api/records`

Retrieve all analysis records and statistics.

**Query Parameters:**
- `skip` (number, optional): Number of records to skip (default: 0)
- `limit` (number, optional): Number of records to return (default: 50)
- `author` (string, optional): Filter by wallet address

**Response:**
```json
{
  "records": [
    {
      "id": "1",
      "timestamp": "2024-03-27T10:30:00.000Z",
      "sentiment": 0.75,
      "credibility": 85,
      "ipfsHash": "QmExample1",
      "txHash": "0x123abc",
      "status": "completed"
    },
    {
      "id": "2",
      "timestamp": "2024-03-27T10:25:00.000Z",
      "sentiment": 0.45,
      "credibility": 62,
      "ipfsHash": "QmExample2",
      "txHash": "0x456def",
      "status": "completed"
    }
  ],
  "stats": {
    "totalAnalyzed": 2,
    "avgCredibility": 73.5,
    "blockchainRecords": 2
  }
}
```

**Example Usage:**

```bash
curl http://localhost:5000/api/records
curl 'http://localhost:5000/api/records?limit=10&skip=0'
curl 'http://localhost:5000/api/records?author=0x742d35Cc6634C0532925a3b844Bc19e1d7d00d12'
```

---

### 4. Verify Article

**POST** `/api/verify`

Verify an article previously stored on blockchain.

**Request:**
```json
{
  "ipfsHash": "QmXxxx..."
}
```

**Response:**
```json
{
  "ipfsHash": "QmXxxx...",
  "verified": true,
  "timestamp": "2024-03-27T10:30:00.000Z",
  "message": "Article verification completed"
}
```

**Example Usage:**

```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"ipfsHash": "QmExample1"}'
```

---

### 5. Configuration

**GET** `/api/config`

Get frontend configuration (contract address, chain ID, etc.)

**Response:**
```json
{
  "API_URL": "http://localhost:5000",
  "CONTRACT_ADDRESS": "0x...",
  "SEPOLIA_CHAIN_ID": 11155111
}
```

---

### 6. System Info

**GET** `/`

Get system information and status.

**Response:**
```json
{
  "name": "NewsAuth Backend",
  "version": "1.0.0",
  "description": "AI-Powered News Verification & Blockchain Storage System",
  "status": "running"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "status": 400,
    "message": "Descriptive error message",
    "timestamp": "2024-03-27T10:30:00.000Z"
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

- Default: **100 requests per minute** per IP
- Configurable via `RATE_LIMIT` env variable
- Returns `429` when exceeded

---

## CORS

CORS is enabled for origins specified in `CORS_ORIGIN` env variable (default: all origins `*`).

**Headers included:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Content Limits

- **Text Content**: Max 50,000 characters
- **URL**: Valid HTTP/HTTPS URL required
- **IPFS Hash**: Required for verification
- **Credibility Score**: 0-100 range

---

## Response Times

- Text analysis: 1-3 seconds
- IPFS upload: 2-5 seconds
- Blockchain storage: 10-30 seconds (depends on network)
- **Total**: 20-40 seconds average

---

## Examples

### Complete Workflow

```bash
#!/bin/bash

# 1. Analyze article
RESPONSE=$(curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "AI and blockchain are revolutionizing news verification..."
  }')

# Extract values
IPFS_HASH=$(echo $RESPONSE | jq -r '.ipfsHash')
TX_HASH=$(echo $RESPONSE | jq -r '.transactionHash')
CREDIBILITY=$(echo $RESPONSE | jq -r '.credibilityScore')

echo "✅ Article analyzed!"
echo "📊 Credibility: $CREDIBILITY%"
echo "🔗 IPFS: $IPFS_HASH"
echo "⛓  TX: $TX_HASH"

# 2. Verify article
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d "{\"ipfsHash\": \"$IPFS_HASH\"}"

# 3. Get all records
curl http://localhost:5000/api/records
```

---

## Testing with Postman

1. Open [Postman](https://www.postman.com/downloads/)
2. Create new collection "NewsAuth"
3. Add requests with URLs above
4. Use pre-request scripts for dynamic data
5. Save responses as examples

---

## API Client Libraries

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function analyzeNews(content: string) {
  const response = await axios.post(`${API_URL}/api/analyze`, {
    type: 'text',
    content
  });
  return response.data;
}

async function getRecords() {
  const response = await axios.get(`${API_URL}/api/records`);
  return response.data;
}
```

### Python

```python
import requests

API_URL = 'http://localhost:5000'

def analyze_news(content):
    response = requests.post(
        f'{API_URL}/api/analyze',
        json={'type': 'text', 'content': content}
    )
    return response.json()

def get_records():
    response = requests.get(f'{API_URL}/api/records')
    return response.json()
```

---

## Webhooks (Optional Future Feature)

```
POST /api/webhooks/analysis-complete
```

Configure to receive notifications when analysis completes.

---

## Rate Limiting Headers

Every response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1711510800
```

---

**Last Updated**: 2024
**API Version**: v1.0.0
