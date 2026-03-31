#!/usr/bin/env powershell
# ============================================
# NewsAuth - Database Initialization Script
# Creates all tables and indexes in Azure SQL
# ============================================

param(
    [string]$ServerName = "newsauth-sql-server",
    [string]$DatabaseName = "newsauth-db",
    [string]$Username = "azureuser",
    [string]$Password = "",
    [string]$Location = "eastus"
)

$ErrorActionPreference = "Stop"

Write-Host "🗄️  NewsAuth Database Initialization" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($Password)) {
    Write-Host "Error: Password is required" -ForegroundColor Red
    exit 1
}

# Connection String
$ConnectionString = "Server=tcp:$ServerName.database.windows.net,1433;Initial Catalog=$DatabaseName;Persist Security Info=False;User ID=$Username;Password=$Password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

Write-Host "Connecting to: $ServerName / $DatabaseName`n" -ForegroundColor Yellow

# SQL Script
$SqlScript = @"
-- ============================================
-- NewsAuth Database Schema
-- ============================================

-- Table 1: AnalysisRecords (Main table for storing analyses)
CREATE TABLE AnalysisRecords (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    ipfsHash VARCHAR(100) UNIQUE NOT NULL,
    article_text NVARCHAR(MAX) NOT NULL,
    sentiment_label VARCHAR(20),
    sentiment_score FLOAT,
    credibility_score INT,
    key_phrases NVARCHAR(MAX),
    wallet_address VARCHAR(100),
    tx_hash VARCHAR(100),
    blockchain_confirmed BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2,
    
    INDEX idx_wallet ON AnalysisRecords(wallet_address),
    INDEX idx_created ON AnalysisRecords(created_at DESC),
    INDEX idx_blockchain ON AnalysisRecords(blockchain_confirmed),
    INDEX idx_ipfs ON AnalysisRecords(ipfsHash),
    FULLTEXT INDEX ON article_text LANGUAGE 1033
);

-- Table 2: AnalysisMetrics (Performance tracking)
CREATE TABLE AnalysisMetrics (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    analysis_id BIGINT NOT NULL FOREIGN KEY REFERENCES AnalysisRecords(id),
    request_time_ms INT,
    azure_request_time_ms INT,
    ipfs_request_time_ms INT,
    blockchain_request_time_ms INT,
    total_time_ms INT,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX idx_analysis ON AnalysisMetrics(analysis_id),
    INDEX idx_created ON AnalysisMetrics(created_at DESC)
);

-- Table 3: ErrorLogs (Error tracking and debugging)
CREATE TABLE ErrorLogs (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    error_message NVARCHAR(MAX) NOT NULL,
    error_stack NVARCHAR(MAX),
    service_name VARCHAR(100),
    severity VARCHAR(20),
    status_code INT,
    request_id VARCHAR(100),
    api_endpoint VARCHAR(255),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX idx_severity ON ErrorLogs(severity),
    INDEX idx_created ON ErrorLogs(created_at DESC),
    INDEX idx_service ON ErrorLogs(service_name),
    INDEX idx_request ON ErrorLogs(request_id)
);

-- Table 4: UserActivity (User action logging)
CREATE TABLE UserActivity (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    wallet_address VARCHAR(100),
    action_type VARCHAR(100),
    action_details NVARCHAR(MAX),
    ip_address VARCHAR(45),
    user_agent NVARCHAR(MAX),
    status VARCHAR(50),
    response_time_ms INT,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX idx_wallet ON UserActivity(wallet_address),
    INDEX idx_action ON UserActivity(action_type),
    INDEX idx_created ON UserActivity(created_at DESC),
    INDEX idx_ip ON UserActivity(ip_address)
);

-- Table 5: SystemConfig (Configuration and settings)
CREATE TABLE SystemConfig (
    id INT PRIMARY KEY IDENTITY(1,1),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value NVARCHAR(MAX) NOT NULL,
    description VARCHAR(500),
    is_encrypted BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2,
    updated_by VARCHAR(100)
);

-- Table 6: BackupLog (Backup tracking)
CREATE TABLE BackupLog (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    backup_type VARCHAR(50),
    backup_location VARCHAR(255),
    backup_size_mb BIGINT,
    status VARCHAR(50),
    message NVARCHAR(MAX),
    started_at DATETIME2,
    completed_at DATETIME2,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Proc 1: Get analysis statistics
CREATE PROCEDURE sp_GetAnalysisStats
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL
AS
BEGIN
    SELECT
        COUNT(*) as total_analyses,
        COUNT(DISTINCT wallet_address) as unique_wallets,
        AVG(credibility_score) as avg_credibility,
        COUNT(CASE WHEN blockchain_confirmed = 1 THEN 1 END) as confirmed_on_blockchain,
        MIN(created_at) as oldest_analysis,
        MAX(created_at) as newest_analysis
    FROM AnalysisRecords
    WHERE (@DateFrom IS NULL OR created_at >= @DateFrom)
        AND (@DateTo IS NULL OR created_at <= @DateTo);
END;

-- Proc 2: Get error summary
CREATE PROCEDURE sp_GetErrorSummary
    @Hours INT = 24
AS
BEGIN
    SELECT
        service_name,
        severity,
        COUNT(*) as error_count,
        COUNT(DISTINCT request_id) as affected_requests,
        MAX(created_at) as last_error
    FROM ErrorLogs
    WHERE created_at >= DATEADD(HOUR, -@Hours, GETUTCDATE())
    GROUP BY service_name, severity
    ORDER BY error_count DESC;
END;

-- Proc 3: Archive old records
CREATE PROCEDURE sp_ArchiveOldRecords
    @DaysOld INT = 90
AS
BEGIN
    DELETE FROM AnalysisMetrics
    WHERE analysis_id IN (
        SELECT id FROM AnalysisRecords
        WHERE created_at < DATEADD(DAY, -@DaysOld, GETUTCDATE())
    );
    
    DELETE FROM AnalysisRecords
    WHERE created_at < DATEADD(DAY, -@DaysOld, GETUTCDATE());
    
    DELETE FROM ErrorLogs
    WHERE created_at < DATEADD(DAY, -@DaysOld, GETUTCDATE());
END;

-- ============================================
-- VIEWS
-- ============================================

-- View 1: Recent analyses
CREATE VIEW vw_RecentAnalyses AS
SELECT TOP 1000
    id,
    ipfsHash,
    LEFT(article_text, 100) as article_preview,
    sentiment_label,
    sentiment_score,
    credibility_score,
    wallet_address,
    blockchain_confirmed,
    created_at
FROM AnalysisRecords
ORDER BY created_at DESC;

-- View 2: Performance metrics summary
CREATE VIEW vw_PerformanceMetrics AS
SELECT
    COUNT(*) as total_analyses,
    AVG(request_time_ms) as avg_request_time,
    MAX(request_time_ms) as max_request_time,
    MIN(request_time_ms) as min_request_time,
    AVG(azure_request_time_ms) as avg_azure_time,
    AVG(ipfs_request_time_ms) as avg_ipfs_time,
    AVG(blockchain_request_time_ms) as avg_blockchain_time
FROM AnalysisMetrics;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_analysis_date ON AnalysisRecords(created_at DESC);
CREATE INDEX idx_credibility ON AnalysisRecords(credibility_score);
CREATE INDEX idx_sentiment ON AnalysisRecords(sentiment_label);

CREATE INDEX idx_error_timestamp ON ErrorLogs(created_at DESC);
CREATE INDEX idx_error_severity ON ErrorLogs(severity);

CREATE INDEX idx_activity_wallet ON UserActivity(wallet_address);
CREATE INDEX idx_activity_timestamp ON UserActivity(created_at DESC);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

INSERT INTO SystemConfig (config_key, config_value, description)
VALUES 
    ('version', '1.0.0', 'Application version'),
    ('last_backup', GETUTCDATE(), 'Last backup timestamp'),
    ('maintenance_mode', 'false', 'Maintenance mode flag'),
    ('max_article_length', '50000', 'Maximum article text length');

-- ============================================
-- ENABLE SECURITY FEATURES
-- ============================================

-- Enable Row-Level Security
ALTER TABLE AnalysisRecords ENABLE CHANGE_TRACKING;
ALTER TABLE ErrorLogs ENABLE CHANGE_TRACKING;

-- Create audit table
CREATE TABLE AuditLog (
    audit_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    table_name VARCHAR(100),
    operation_type VARCHAR(10),
    record_id BIGINT,
    changed_by VARCHAR(100),
    changed_at DATETIME2 DEFAULT GETUTCDATE(),
    old_values NVARCHAR(MAX),
    new_values NVARCHAR(MAX)
);

-- ============================================
-- BACKUP SCHEDULE INFO
-- ============================================

INSERT INTO BackupLog (backup_type, status, message, started_at, completed_at)
VALUES 
    ('Initial', 'Completed', 'Database initialized', GETUTCDATE(), GETUTCDATE());

PRINT 'Database initialization completed successfully!';
"@

try {
    Write-Host "Connecting to database..." -ForegroundColor Yellow
    
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $ConnectionString
    $connection.Open()
    
    Write-Host "✓ Connection successful`n" -ForegroundColor Green
    
    Write-Host "Creating tables and objects..." -ForegroundColor Yellow
    $command = $connection.CreateCommand()
    $command.CommandText = $SqlScript
    $command.CommandTimeout = 300
    $command.ExecuteNonQuery()
    
    Write-Host "✓ All tables created successfully" -ForegroundColor Green
    
    # List created objects
    Write-Host "`n📊 Created Database Objects:`n" -ForegroundColor Cyan
    
    $listCommand = $connection.CreateCommand()
    $listCommand.CommandText = @"
SELECT 
    sys.tables.name as [Table Name],
    COUNT(*) as [Column Count]
FROM sys.tables
LEFT JOIN sys.columns ON sys.tables.object_id = sys.columns.object_id
GROUP BY sys.tables.name
ORDER BY sys.tables.name;
"@
    
    $reader = $listCommand.ExecuteReader()
    while ($reader.Read()) {
        Write-Host "  • $($reader[0]) ($($reader[1]) columns)" -ForegroundColor Green
    }
    $reader.Close()
    
    Write-Host "`n✓ Database schema applied successfully!`n" -ForegroundColor Green
    
    $connection.Close()
    
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     DATABASE INITIALIZED AND READY FOR USE           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
