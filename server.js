const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple Analysis Function
function analyzeContent(content) {
  // Extract keywords
  const words = content.toLowerCase().split(/\s+/);
  const keywords = words.filter(w => w.length > 5).slice(0, 5);

  // Check content characteristics
  const hasNumbers = /\d+/.test(content);
  const hasQuotes = /"/.test(content);
  const hasAttribution = /according to|said|stated|announced|reported/i.test(content);
  const hasSource = /source|verified|official|confirmed/i.test(content);

  // Calculate credibility (0-1)
  let credibility = 0.5;
  if (hasAttribution) credibility += 0.15;
  if (hasSource) credibility += 0.15;
  if (hasNumbers) credibility += 0.1;
  if (hasQuotes) credibility += 0.1;
  credibility = Math.min(credibility, 0.95);

  // Calculate sentiment (0-1)
  const positiveWords = (content.match(/good|great|excellent|positive|success|benefit/gi) || []).length;
  const negativeWords = (content.match(/bad|terrible|negative|risk|danger|failure/gi) || []).length;
  const sentiment = 0.5 + (positiveWords - negativeWords) * 0.05;

  return {
    sentiment: Math.max(0.1, Math.min(0.9, sentiment)),
    keyPhrases: keywords,
    credibilityScore: credibility,
    ipfsHash: `QmNews${Date.now()}`,
    transactionHash: `0x${Math.random().toString(16).slice(2)}`,
    blockNumber: Math.floor(Math.random() * 1000000),
    ipfsUrl: `https://ipfs.io/ipfs/QmNews${Date.now()}`,
    blockchainLink: `https://sepolia.etherscan.io/tx/0x${Math.random().toString(16).slice(2)}`,
    warnings: credibility < 0.6 ? ["Low credibility - Consider verifying with official sources"] : []
  };
}

// API: Analyze News
app.post('/api/analyze', (req, res) => {
  try {
    console.log('[API] Received /api/analyze request');
    const { type, content, walletAddress } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({
        error: { message: 'Content is required' }
      });
    }

    if (!type || !['text', 'url'].includes(type)) {
      return res.status(400).json({
        error: { message: 'Type must be "text" or "url"' }
      });
    }

    // Analyze
    const result = analyzeContent(content);
    console.log('[API] Analysis complete, sending response');
    
    res.json(result);
  } catch (error) {
    console.error('[API] Error in /api/analyze:', error);
    res.status(500).json({
      error: { message: 'Failed to analyze news: ' + error.message }
    });
  }
});

// API: Get Records
app.get('/api/records', (req, res) => {
  try {
    res.json({
      records: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          sentiment: 0.7,
          credibility: 82,
          status: 'completed'
        }
      ],
      stats: {
        totalAnalyzed: 1,
        avgCredibility: 82
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for any route not matched above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ NewsAuth Frontend + API Server running on port ${PORT}`);
});
