[Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.Smo") | Out-Null

Write-Host "Creating NewsAuth Database..." -ForegroundColor Cyan

try {
    $server = New-Object Microsoft.SqlServer.Management.Smo.Server(".\SQLEXPRESS")
    Write-Host "Connected to SQL Server" -ForegroundColor Green
    
    if ($server.Databases["newsauth"] -eq $null) {
        $db = New-Object Microsoft.SqlServer.Management.Smo.Database($server, "newsauth")
        $db.Create()
        Write-Host "Database created" -ForegroundColor Green
    }
    
    $db = $server.Databases["newsauth"]
    
    if ($db.Tables["AnalysisRecords"] -eq $null) {
        $sql = "CREATE TABLE AnalysisRecords (id BIGINT PRIMARY KEY IDENTITY(1,1), ipfsHash VARCHAR(100) UNIQUE NOT NULL, article_text NVARCHAR(MAX) NOT NULL, sentiment_label VARCHAR(20), sentiment_score FLOAT, credibility_score INT, key_phrases NVARCHAR(MAX), wallet_address VARCHAR(100), tx_hash VARCHAR(100), blockchain_confirmed BIT DEFAULT 0, created_at DATETIME2 DEFAULT GETUTCDATE(), updated_at DATETIME2)"
        $db.ExecuteNonQuery($sql)
        Write-Host "Table created: AnalysisRecords" -ForegroundColor Green
    }
    
    if ($db.Tables["AnalysisMetrics"] -eq $null) {
        $sql = "CREATE TABLE AnalysisMetrics (id BIGINT PRIMARY KEY IDENTITY(1,1), analysis_id BIGINT, response_time_ms INT, azure_latency_ms INT, ipfs_latency_ms INT, blockchain_latency_ms INT, timestamp DATETIME2 DEFAULT GETUTCDATE())"
        $db.ExecuteNonQuery($sql)
        Write-Host "Table created: AnalysisMetrics" -ForegroundColor Green
    }
    
    if ($db.Tables["ErrorLogs"] -eq $null) {
        $sql = "CREATE TABLE ErrorLogs (id BIGINT PRIMARY KEY IDENTITY(1,1), error_message NVARCHAR(MAX), error_stack NVARCHAR(MAX), service_name VARCHAR(100), severity VARCHAR(20), timestamp DATETIME2 DEFAULT GETUTCDATE())"
        $db.ExecuteNonQuery($sql)
        Write-Host "Table created: ErrorLogs" -ForegroundColor Green
    }
    
    if ($db.Tables["UserActivity"] -eq $null) {
        $sql = "CREATE TABLE UserActivity (id BIGINT PRIMARY KEY IDENTITY(1,1), wallet_address VARCHAR(100), action VARCHAR(100), details NVARCHAR(MAX), ip_address VARCHAR(50), timestamp DATETIME2 DEFAULT GETUTCDATE())"
        $db.ExecuteNonQuery($sql)
        Write-Host "Table created: UserActivity" -ForegroundColor Green
    }
    
    if ($db.Tables["SystemConfig"] -eq $null) {
        $sql = "CREATE TABLE SystemConfig (id INT PRIMARY KEY IDENTITY(1,1), config_key VARCHAR(100) UNIQUE NOT NULL, config_value NVARCHAR(MAX), updated_by VARCHAR(100), updated_at DATETIME2 DEFAULT GETUTCDATE())"
        $db.ExecuteNonQuery($sql)
        Write-Host "Table created: SystemConfig" -ForegroundColor Green
    }
    
    if ($db.Tables["BackupLog"] -eq $null) {
        $sql = "CREATE TABLE BackupLog (id BIGINT PRIMARY KEY IDENTITY(1,1), backup_type VARCHAR(50), backup_path VARCHAR(255), backup_size INT, status VARCHAR(50), start_time DATETIME2, end_time DATETIME2)"
        $db.ExecuteNonQuery($sql)
        Write-Host "Table created: BackupLog" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "SUCCESS: Database initialization complete!" -ForegroundColor Green
    Write-Host "Database: newsauth on .\SQLEXPRESS" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
