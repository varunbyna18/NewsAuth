#!/usr/bin/env powershell
# ============================================
# NewsAuth - Backend Database Integration Setup
# Configures services to use Azure SQL Database
# ============================================

param(
    [string]$EnvironmentFile = "d:\News\backend\.env",
    [string]$ServiceFile = "d:\News\backend\services\databaseService.js"
)

Write-Host "🔧 Configuring Backend for Database Integration" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Step 1: Create Database Service
Write-Host "Creating database service layer..." -ForegroundColor Yellow

$DatabaseServiceCode = @'
// databaseService.js - Azure SQL Database integration
const sql = require('mssql');
const logger = require('../utils/logger');

class DatabaseService {
    constructor() {
        this.pool = null;
        this.config = {
            server: process.env.SQL_SERVER,
            database: process.env.SQL_DATABASE,
            authentication: {
                type: 'default',
                options: {
                    userName: process.env.SQL_USERNAME,
                    password: process.env.SQL_PASSWORD
                }
            },
            options: {
                encrypt: true,
                trustServerCertificate: false,
                connectTimeout: 30000,
                requestTimeout: 30000,
                enableKeepAlive: true,
                keepAliveInitialDelayMs: 30000
            }
        };
    }

    async connect() {
        try {
            if (this.pool && this.pool.connected) {
                return this.pool;
            }

            this.pool = new sql.ConnectionPool(this.config);
            await this.pool.connect();
            logger.info('🗄️  Database connected successfully');
            return this.pool;
        } catch (error) {
            logger.error('Database connection failed: ' + error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close();
                logger.info('Database connection closed');
            }
        } catch (error) {
            logger.error('Error closing database connection: ' + error.message);
        }
    }

    async storeAnalysis(analysisData) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            const result = await request
                .input('ipfsHash', sql.VarChar(100), analysisData.ipfsHash)
                .input('articleText', sql.NVarChar(sql.MAX), analysisData.articleText)
                .input('sentimentLabel', sql.VarChar(20), analysisData.sentimentLabel)
                .input('sentimentScore', sql.Float, analysisData.sentimentScore)
                .input('credibilityScore', sql.Int, analysisData.credibilityScore)
                .input('keyPhrases', sql.NVarChar(sql.MAX), JSON.stringify(analysisData.keyPhrases))
                .input('walletAddress', sql.VarChar(100), analysisData.walletAddress)
                .input('txHash', sql.VarChar(100), analysisData.txHash || null)
                .query(\`
                    INSERT INTO AnalysisRecords 
                    (ipfsHash, article_text, sentiment_label, sentiment_score, 
                     credibility_score, key_phrases, wallet_address, tx_hash)
                    VALUES 
                    (@ipfsHash, @articleText, @sentimentLabel, @sentimentScore,
                     @credibilityScore, @keyPhrases, @walletAddress, @txHash);
                    SELECT SCOPE_IDENTITY() as id;
                \`);
            
            const recordId = result.recordset[0].id;
            logger.info(\`Analysis stored in database with ID: \${recordId}\`);
            return recordId;
        } catch (error) {
            logger.error('Error storing analysis: ' + error.message);
            throw error;
        }
    }

    async storeMetrics(analysisId, metricsData) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            await request
                .input('analysisId', sql.BigInt, analysisId)
                .input('requestTime', sql.Int, metricsData.requestTime)
                .input('azureTime', sql.Int, metricsData.azureTime)
                .input('ipfsTime', sql.Int, metricsData.ipfsTime)
                .input('blockchainTime', sql.Int, metricsData.blockchainTime)
                .input('totalTime', sql.Int, metricsData.totalTime)
                .query(\`
                    INSERT INTO AnalysisMetrics 
                    (analysis_id, request_time_ms, azure_request_time_ms, 
                     ipfs_request_time_ms, blockchain_request_time_ms, total_time_ms)
                    VALUES 
                    (@analysisId, @requestTime, @azureTime, @ipfsTime, @blockchainTime, @totalTime);
                \`);
            
            logger.info(\`Metrics stored for analysis ID: \${analysisId}\`);
        } catch (error) {
            logger.error('Error storing metrics: ' + error.message);
            throw error;
        }
    }

    async logError(errorData) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            await request
                .input('errorMessage', sql.NVarChar(sql.MAX), errorData.message)
                .input('errorStack', sql.NVarChar(sql.MAX), errorData.stack || null)
                .input('serviceName', sql.VarChar(100), errorData.service)
                .input('severity', sql.VarChar(20), errorData.severity)
                .input('statusCode', sql.Int, errorData.statusCode || null)
                .input('requestId', sql.VarChar(100), errorData.requestId || null)
                .input('apiEndpoint', sql.VarChar(255), errorData.endpoint || null)
                .query(\`
                    INSERT INTO ErrorLogs 
                    (error_message, error_stack, service_name, severity, 
                     status_code, request_id, api_endpoint)
                    VALUES 
                    (@errorMessage, @errorStack, @serviceName, @severity,
                     @statusCode, @requestId, @apiEndpoint);
                \`);
            
            logger.info(\`Error logged for service: \${errorData.service}\`);
        } catch (error) {
            logger.error('Error logging error: ' + error.message);
        }
    }

    async getAnalysisStats(days = 7) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            const result = await request
                .input('days', sql.Int, days)
                .query(\`
                    EXECUTE sp_GetAnalysisStats 
                        @DateFrom = DATEADD(DAY, -@days, GETUTCDATE());
                \`);
            
            return result.recordset[0];
        } catch (error) {
            logger.error('Error retrieving analysis stats: ' + error.message);
            throw error;
        }
    }

    async getRecentAnalyses(limit = 10) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            const result = await request
                .input('limit', sql.Int, limit)
                .query(\`
                    SELECT TOP @limit
                        id, ipfsHash, sentiment_label, sentiment_score,
                        credibility_score, wallet_address, blockchain_confirmed,
                        created_at
                    FROM AnalysisRecords
                    ORDER BY created_at DESC;
                \`);
            
            return result.recordset;
        } catch (error) {
            logger.error('Error retrieving recent analyses: ' + error.message);
            throw error;
        }
    }

    async logUserActivity(activityData) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            await request
                .input('walletAddress', sql.VarChar(100), activityData.wallet)
                .input('actionType', sql.VarChar(100), activityData.action)
                .input('actionDetails', sql.NVarChar(sql.MAX), JSON.stringify(activityData.details))
                .input('ipAddress', sql.VarChar(45), activityData.ip || null)
                .input('userAgent', sql.NVarChar(sql.MAX), activityData.userAgent || null)
                .input('status', sql.VarChar(50), activityData.status)
                .input('responseTime', sql.Int, activityData.responseTime || null)
                .query(\`
                    INSERT INTO UserActivity 
                    (wallet_address, action_type, action_details, ip_address, 
                     user_agent, status, response_time_ms)
                    VALUES 
                    (@walletAddress, @actionType, @actionDetails, @ipAddress,
                     @userAgent, @status, @responseTime);
                \`);
            
            logger.info(\`Activity logged for wallet: \${activityData.wallet}\`);
        } catch (error) {
            logger.error('Error logging activity: ' + error.message);
        }
    }

    async getErrorSummary(hours = 24) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            const result = await request
                .input('hours', sql.Int, hours)
                .query(\`EXECUTE sp_GetErrorSummary @Hours = @hours;\`);
            
            return result.recordset;
        } catch (error) {
            logger.error('Error retrieving error summary: ' + error.message);
            throw error;
        }
    }

    async confirmBlockchainTx(ipfsHash, txHash) {
        try {
            const pool = await this.connect();
            
            const request = pool.request();
            
            await request
                .input('ipfsHash', sql.VarChar(100), ipfsHash)
                .input('txHash', sql.VarChar(100), txHash)
                .input('confirmed', sql.Bit, 1)
                .query(\`
                    UPDATE AnalysisRecords
                    SET tx_hash = @txHash, blockchain_confirmed = @confirmed
                    WHERE ipfsHash = @ipfsHash;
                \`);
            
            logger.info(\`Blockchain confirmation recorded for: \${ipfsHash}\`);
        } catch (error) {
            logger.error('Error confirming blockchain tx: ' + error.message);
            throw error;
        }
    }
}

module.exports = new DatabaseService();
'@

try {
    # Create the database service file
    $DatabaseServiceCode | Out-File -FilePath $ServiceFile -Encoding UTF8
    Write-Host "✓ Database service created at: $ServiceFile`n" -ForegroundColor Green
} catch {
    Write-Host "Error creating database service: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create environment template
Write-Host "Creating environment configuration template..." -ForegroundColor Yellow

$EnvTemplate = @'
# ============================================
# NewsAuth - Backend Environment Variables
# For Azure Deployment
# ============================================

# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# ============================================
# AZURE SQL DATABASE
# ============================================
SQL_SERVER=newsauth-sql-server.database.windows.net
SQL_DATABASE=newsauth-db
SQL_USERNAME=azureuser
SQL_PASSWORD=<REPLACE_WITH_YOUR_PASSWORD>

# ============================================
# AZURE COGNITIVE SERVICES (Text Analytics)
# ============================================
AZURE_AI_ENDPOINT=https://news-ai-service.cognitiveservices.azure.com/
AZURE_AI_KEY=<REPLACE_WITH_YOUR_AZURE_TEXT_ANALYTICS_KEY>

# ============================================
# PINATA IPFS (Decentralized Storage)
# ============================================
PINATA_API_KEY=<REPLACE_WITH_YOUR_PINATA_API_KEY>
PINATA_SECRET_KEY=<REPLACE_WITH_YOUR_PINATA_SECRET_KEY>
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/

# ============================================
# ETHEREUM BLOCKCHAIN (Sepolia Testnet)
# ============================================
ETHEREUM_RPC_URL=<REPLACE_WITH_YOUR_ETHEREUM_RPC_URL>
ETHEREUM_PRIVATE_KEY=<REPLACE_WITH_YOUR_ETHEREUM_PRIVATE_KEY>
ETHEREUM_CONTRACT_ADDRESS=0x5c768266b894e8160C9304FE2539C59e4E80c2A1
ETHEREUM_WALLET=0x917EC2990193714faf62AbF081D9bD694416F8fE

# ============================================
# AZURE APPLICATION INSIGHTS (Monitoring)
# ============================================
APPINSIGHTS_INSTRUMENTATION_KEY=

# ============================================
# AZURE STORAGE ACCOUNT (Backups)
# ============================================
AZURE_STORAGE_ACCOUNT_NAME=newsauthstorage
AZURE_STORAGE_ACCOUNT_KEY=

# ============================================
# SECURITY
# ============================================
CORS_ORIGIN=*
API_RATE_LIMIT=100
SESSION_SECRET=newsauth-secret-key-change-in-production

# ============================================
# DEBUG
# ============================================
DEBUG=newsauth:*
'@

try {
    # Create a template file for reference
    $EnvTemplate | Out-File -FilePath "d:\News\.env.template" -Encoding UTF8
    Write-Host "✓ Environment template created at: d:\News\.env.template`n" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not create .env template: $_" -ForegroundColor Yellow
}

# Step 3: Display integration instructions
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BACKEND DATABASE INTEGRATION SETUP COMPLETE        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:`n" -ForegroundColor Yellow

Write-Host "1️⃣  Update backend api.js to use database service:" -ForegroundColor Cyan
Write-Host "    Add at top of file:" -ForegroundColor Gray
Write-Host "    const db = require('./services/databaseService');" -ForegroundColor Gray
Write-Host "    " -ForegroundColor Gray
Write-Host "2️⃣  In POST /api/analyze route, add database calls:" -ForegroundColor Cyan
Write-Host "    // Store analysis results" -ForegroundColor Gray
Write-Host "    const recordId = await db.storeAnalysis({" -ForegroundColor Gray
Write-Host "        ipfsHash: ipfsResult.IpfsHash," -ForegroundColor Gray
Write-Host "        articleText: newsText," -ForegroundColor Gray
Write-Host "        sentimentLabel: azureResult.sentiment.label," -ForegroundColor Gray
Write-Host "        // ... other fields" -ForegroundColor Gray
Write-Host "    });" -ForegroundColor Gray
Write-Host "    " -ForegroundColor Gray
Write-Host "3️⃣  Install mssql package in backend:" -ForegroundColor Cyan
Write-Host "    cd backend && npm install mssql" -ForegroundColor Gray
Write-Host "    " -ForegroundColor Gray
Write-Host "4️⃣  Run database initialization:" -ForegroundColor Cyan
Write-Host "    powershell -ExecutionPolicy Bypass -File initialize-database.ps1" -ForegroundColor Gray
Write-Host "    " -ForegroundColor Gray
Write-Host "5️⃣  Update .env with Azure SQL credentials from deployment" -ForegroundColor Cyan

Write-Host "`n📁 Created Files:`n" -ForegroundColor Green
Write-Host "  ✓ d:\News\backend\services\databaseService.js" -ForegroundColor Green
Write-Host "  ✓ d:\News\.env.template" -ForegroundColor Green

Write-Host "`n🗄️  Database Schema Includes:`n" -ForegroundColor Cyan
Write-Host "  • AnalysisRecords - Main analysis storage" -ForegroundColor Gray
Write-Host "  • AnalysisMetrics - Performance tracking" -ForegroundColor Gray
Write-Host "  • ErrorLogs - Error tracking" -ForegroundColor Gray
Write-Host "  • UserActivity - Activity logging" -ForegroundColor Gray
Write-Host "  • SystemConfig - Configuration storage" -ForegroundColor Gray
Write-Host "  • BackupLog - Backup tracking" -ForegroundColor Gray

Write-Host "`nReady for Azure deployment! 🚀`n" -ForegroundColor Green
