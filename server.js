const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 [SERVER] Starting NewsAuth application...');
console.log('🚀 [SERVER] Node.js version:', process.version);
console.log('🚀 [SERVER] Working directory:', process.cwd());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📨 [REQUEST] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ [HEALTH] Health check');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple Analysis Function
function analyzeContent(content) {
  console.log('📊 [ANALYZE] Processing', content.length, 'characters');
  
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
  const positiveWords = (content.match(/good|great|excellent|positive|success|benefit|rose|increased/gi) || []).length;
  const negativeWords = (content.match(/bad|terrible|negative|risk|danger|failure|threat/gi) || []).length;
  const sentiment = 0.5 + (positiveWords - negativeWords) * 0.05;

  const result = {
    sentiment: Math.max(0.1, Math.min(0.9, sentiment)),
    keyPhrases: keywords.length > 0 ? keywords : ['analysis', 'content'],
    credibilityScore: credibility,
    ipfsHash: `QmNews${Date.now()}`,
    transactionHash: `0x${Math.random().toString(16).slice(2)}`,
    blockNumber: Math.floor(Math.random() * 1000000),
    ipfsUrl: `https://ipfs.io/ipfs/QmNews${Date.now()}`,
    blockchainLink: `https://sepolia.etherscan.io/tx/0x${Math.random().toString(16).slice(2)}`,
    warnings: credibility < 0.6 ? ["Low credibility - Please verify with official sources"] : []
  };

  console.log('✅ [ANALYZE] Result ready - credibility:', credibility);
  return result;
}

// API: Analyze News - MUST BE BEFORE STATIC FILES
app.post('/api/analyze', (req, res) => {
  try {
    console.log('📥 [API] POST /api/analyze - Received request');
    const { type, content, walletAddress } = req.body;

    console.log('📋 [API] Type:', type, 'Content length:', content?.length);

    // Validation
    if (!content) {
      console.warn('⚠️ [API] Missing content');
      return res.status(400).json({
        error: { message: 'Content is required' }
      });
    }

    if (!type || !['text', 'url'].includes(type)) {
      console.warn('⚠️ [API] Invalid type:', type);
      return res.status(400).json({
        error: { message: 'Type must be "text" or "url"' }
      });
    }

    // Analyze
    const result = analyzeContent(content);
    console.log('✅ [API] Analysis complete, sending response');
    
    res.json(result);
  } catch (error) {
    console.error('❌ [API] Error in /api/analyze:', error.message);
    res.status(500).json({
      error: { message: 'Failed to analyze news: ' + error.message }
    });
  }
});

// API: Get Records
app.get('/api/records', (req, res) => {
  try {
    console.log('📥 [API] GET /api/records');
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
    console.error('❌ [API] Error in /api/records:', error.message);
    res.status(500).json({ error: error.message });
  }
});

console.log('✅ [SERVER] API routes registered');

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
console.log('📁 [SERVER] Serving static files from:', distPath);
app.use(express.static(distPath, { maxAge: '1h' }));

// SPA fallback - serve index.html for any route not matched above
app.get('*', (req, res) => {
  console.log('🌐 [SPA] Fallback route:', req.path, '-> /index.html');
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ [ERROR]', err);
  res.status(500).json({ error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`✅ [SERVER] 🚀 NewsAuth Frontend + API Server running on port ${PORT}`);
  console.log(`✅ [SERVER] Frontend URL: http://localhost:${PORT}`);
  console.log(`✅ [SERVER] API endpoint: http://localhost:${PORT}/api/analyze`);
});
