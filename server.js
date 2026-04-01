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

// Backend API Routes
try {
  const apiRoutes = require('./backend/routes/api');
  app.post('/api/analyze', apiRoutes.analyzeNews);
  app.get('/api/records', apiRoutes.getRecords);
  console.log('✅ Backend API routes registered');
} catch (error) {
  console.warn('⚠️ Could not load backend API routes:', error.message);
  
  // Fallback mock API
  app.post('/api/analyze', (req, res) => {
    const { generateMockAnalysis } = require('./backend/services/mockService');
    const analysis = generateMockAnalysis(req.body.content || '');
    res.json(analysis);
  });
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for any route not matched above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ NewsAuth Frontend + API Server running on port ${PORT}`);
});
