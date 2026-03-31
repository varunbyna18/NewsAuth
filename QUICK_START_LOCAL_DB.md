# ⚡ Quick Start: Local Database Setup (5 Steps - 30 Minutes)

## Problem
Azure Student account has policy restrictions. **Solution:** Use local SQL Server.

## 5-Step Quick Start

### Step 1: Install SQL Server Express (10 min)

1. **Download** SQL Server 2022 Express:
   - Go to: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Click "Download now" under Express

2. **Run installer:**
   ```
   C:\sqlexpress-setup.exe
   ```

3. **Choose installation type:**
   - Select: **Express** (free, includes LocalDB)

4. **During installation, select:**
   - ✅ LocalDB
   - ✅ SQL Server Management Tools
   - ✅ Add to PATH (important!)

5. **Complete installation**

**Verify:**
```powershell
sqlcmd -S "(localdb)\mssqllocaldb" -E -Q "SELECT @@VERSION"
# Should show SQL Server version
```

---

### Step 2: Initialize NewsAuth Database (5 min)

```powershell
cd D:\News

# Run the database initialization script
.\initialize-database.ps1 `
    -ServerName "localhost" `
    -DatabaseName "newsauth" `
    -Username "sa" `
    -Password "NewsAuth@2024"

# Expected output:
# [OK] Database connected successfully
# ✓ All tables created successfully
# DATABASE INITIALIZED AND READY FOR USE
```

**Verify:**
```powershell
sqlcmd -S "localhost" -U sa -P "NewsAuth@2024" `
       -d newsauth `
       -Q "SELECT COUNT(*) as TableCount FROM INFORMATION_SCHEMA.TABLES"
# Should show: 6 (for 6 tables created)
```

---

### Step 3: Update Backend Environment (2 min)

Edit `D:\News\backend\.env`:

**Change from:**
```env
SQL_SERVER=newsauth-sql-server.database.windows.net
SQL_DATABASE=newsauth-db
SQL_USERNAME=azureuser
SQL_PASSWORD=<AZURE_PASSWORD>
```

**Change to:**
```env
SQL_SERVER=localhost
SQL_DATABASE=newsauth
SQL_USERNAME=sa
SQL_PASSWORD=NewsAuth@2024
```

---

### Step 4: Install mssql Package (1 min)

```powershell
cd D:\News\backend
npm install mssql
```

---

### Step 5: Add Database Integration to API (5 min)

Edit `D:\News\backend\routes\api.js`

**At the top of the file, add:**
```javascript
const db = require('../services/databaseService');
```

**In the `POST /api/analyze` route, after getting analysis results, add:**

```javascript
try {
    // Store analysis record in database
    const recordId = await db.storeAnalysis({
        ipfsHash: ipfsResult.IpfsHash,
        articleText: newsText,
        sentimentLabel: analysisResult.documents[0].sentiment,
        sentimentScore: analysisResult.documents[0].confidenceScores.positive,
        credibilityScore: credibilityScore,
        keyPhrases: analysisResult.keyPhrases.join(', '),
        walletAddress: walletAddress,
        txHash: transactionResult.hash || null
    });

    // Store performance metrics
    await db.storeMetrics(recordId, {
        requestTime: Date.now() - startTime,
        azureTime: azureEndTime - azureStartTime,
        ipfsTime: ipfsEndTime - ipfsStartTime,
        blockchainTime: blockchainEndTime - blockchainStartTime,
        totalTime: Date.now() - startTime
    });

    // Log user activity
    await db.logUserActivity({
        wallet: walletAddress,
        action: 'SUBMIT_NEWS',
        details: { ipfsHash: ipfsResult.IpfsHash },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS',
        responseTime: Date.now() - startTime
    });

} catch (dbError) {
    logger.warn('Database save failed (non-critical): ' + dbError.message);
    // Continue - don't break the response if DB fails
}
```

---

## ✅ Test It Works

### Terminal 1: Start Backend
```powershell
cd D:\News\backend
npm start
# Should show: Backend server running on port 5000
```

### Terminal 2: Send Test Request
```powershell
$body = @{
    type = "text"
    content = "Bitcoin price surges to new record high amid positive market sentiment"
    walletAddress = "0x917EC2990193714faf62AbF081D9bD694416F8fE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Should return JSON with sentiment, credibility score, IPFS hash, blockchain tx
```

### Terminal 3: Verify Database Was Updated
```powershell
sqlcmd -S "localhost" -U sa -P "NewsAuth@2024" `
       -d newsauth `
       -Q "SELECT TOP 1 id, ipfsHash, sentiment_label, credibility_score, wallet_address, created_at FROM AnalysisRecords ORDER BY created_at DESC"

# Should show your just-submitted analysis!
```

---

## 🎉 Success Indicators

You're done when:
- ✅ Backend starts without errors
- ✅ Database query shows new records
- ✅ IPFS hash present in database
- ✅ Blockchain TX hash present in database
- ✅ Sentiment and credibility scores saved

---

## 🚨 Troubleshooting

### "Cannot connect to localhost"
```powershell
# Check if LocalDB is running
sqllocaldb query

# Start it
sqllocaldb start mssqllocaldb
```

### "Module mssql not found"
```powershell
cd D:\News\backend
npm install mssql
node server.js
```

### "Port 5000 already in use"
```powershell
# Kill other node process
Get-Process node | Stop-Process -Force

# Retry
npm start
```

### "Database file locked"
```powershell
# Restart LocalDB
sqllocaldb stop mssqllocaldb
sqllocaldb start mssqllocaldb
```

---

## 📊 After Completion

### What's Now Working
✅ Backend API with database persistence  
✅ All analysis records saved to local database  
✅ Metrics tracked for performance monitoring  
✅ User activity logged for analytics  
✅ IPFS integration working  
✅ Blockchain verification working  
✅ Azure AI integration working  

### What You Can Do Now
📊 Query analysis history: `SELECT * FROM AnalysisRecords`  
📈 Get statistics: `EXECUTE sp_GetAnalysisStats`  
🐛 Check errors: `SELECT * FROM ErrorLogs`  
👥 View activities: `SELECT * FROM UserActivity`  

---

## 🎓 Key SQLueries for Dashboard

```sql
-- Total news analyzed
SELECT COUNT(*) as Total FROM AnalysisRecords;

-- Average credibility score
SELECT AVG(credibility_score) as AvgCredibility FROM AnalysisRecords;

-- Recent analyses
SELECT TOP 10 id, sentiment_label, credibility_score, created_at 
FROM AnalysisRecords 
ORDER BY created_at DESC;

-- Blockchain confirmed items
SELECT COUNT(*) as ConfirmedOnBlockchain 
FROM AnalysisRecords 
WHERE blockchain_confirmed = 1;
```

---

## 📝 Files Modified/Created

- ✅ `backend\.env` - Updated with local credentials
- ✅ `backend\routes\api.js` - Added database integration
- ✅ Database schema - Initialized via script
- ✅ `backend\services\databaseService.js` - Already exists and ready

---

**Time to Complete:** ~30 minutes  
**Difficulty:** Easy  
**Result:** Fully operational News Analysis system with database persistence

**You're ready to start! Begin with Step 1 above.** 🚀
