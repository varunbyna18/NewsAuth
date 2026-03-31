const sql = require('mssql');

const config = {
    server: 'localhost',
    instance: 'SQLEXPRESS', 
    database: 'master',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'NewsAuth@2024'
        }
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function initDatabase() {
    try {
        console.log('Connecting to SQL Server...');
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        
        console.log('✓ Connected to SQL Server');
        
        // Create database
        console.log('Creating newsauth database...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'newsauth')
            BEGIN
                CREATE DATABASE newsauth
            END
        `);
        console.log('✓ Database created');
        
        // Close master connection and connect to newsauth
        await pool.close();
        
        const configNewsAuth = {...config};
        configNewsAuth.database = 'newsauth';
        const newsAuthPool = new sql.ConnectionPool(configNewsAuth);
        await newsAuthPool.connect();
        
        console.log('✓ Connected to newsauth database');
        
        // Create tables
        console.log('Creating tables...');
        
        await newsAuthPool.request().query(`
            IF OBJECT_ID('AnalysisRecords', 'U') IS NULL
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
                updated_at DATETIME2
            )
        `);
        
        await newsAuthPool.request().query(`
            IF OBJECT_ID('AnalysisMetrics', 'U') IS NULL
            CREATE TABLE AnalysisMetrics (
                id BIGINT PRIMARY KEY IDENTITY(1,1),
                analysis_id BIGINT REFERENCES AnalysisRecords(id),
                response_time_ms INT,
                azure_latency_ms INT,
                ipfs_latency_ms INT,
                blockchain_latency_ms INT,
                timestamp DATETIME2 DEFAULT GETUTCDATE()
            )
        `);
        
        await newsAuthPool.request().query(`
            IF OBJECT_ID('ErrorLogs', 'U') IS NULL
            CREATE TABLE ErrorLogs (
                id BIGINT PRIMARY KEY IDENTITY(1,1),
                error_message NVARCHAR(MAX),
                error_stack NVARCHAR(MAX),
                service_name VARCHAR(100),
                severity VARCHAR(20),
                timestamp DATETIME2 DEFAULT GETUTCDATE()
            )
        `);
        
        await newsAuthPool.request().query(`
            IF OBJECT_ID('UserActivity', 'U') IS NULL
            CREATE TABLE UserActivity (
                id BIGINT PRIMARY KEY IDENTITY(1,1),
                wallet_address VARCHAR(100),
                action VARCHAR(100),
                details NVARCHAR(MAX),
                ip_address VARCHAR(50),
                timestamp DATETIME2 DEFAULT GETUTCDATE()
            )
        `);
        
        await newsAuthPool.request().query(`
            IF OBJECT_ID('SystemConfig', 'U') IS NULL
            CREATE TABLE SystemConfig (
                id INT PRIMARY KEY IDENTITY(1,1),
                config_key VARCHAR(100) UNIQUE NOT NULL,
                config_value NVARCHAR(MAX),
                updated_by VARCHAR(100),
                updated_at DATETIME2 DEFAULT GETUTCDATE()
            )
        `);
        
        await newsAuthPool.request().query(`
            IF OBJECT_ID('BackupLog', 'U') IS NULL
            CREATE TABLE BackupLog (
                id BIGINT PRIMARY KEY IDENTITY(1,1),
                backup_type VARCHAR(50),
                backup_path VARCHAR(255),
                backup_size INT,
                status VARCHAR(50),
                start_time DATETIME2,
                end_time DATETIME2
            )
        `);

        console.log('✓ Tables created');
        
        // Create indexes
        console.log('Creating indexes...');
        
        await newsAuthPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_wallet' AND object_id = OBJECT_ID('AnalysisRecords'))
            CREATE INDEX idx_wallet ON AnalysisRecords(wallet_address)
        `);
        
        await newsAuthPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_created' AND object_id = OBJECT_ID('AnalysisRecords'))
            CREATE INDEX idx_created ON AnalysisRecords(created_at DESC)
        `);
        
        console.log('✓ Indexes created');
        
        console.log('\n✅ Database initialization complete!');
        console.log('Database: newsauth');
        console.log('Server: localhost\\SQLEXPRESS');
        console.log('Username: sa');
        
        await newsAuthPool.close();
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

initDatabase();
