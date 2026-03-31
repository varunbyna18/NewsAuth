const sql = require('mssql');

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'newsauth',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'NewsAuth@2024'
        }
    },
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
};

async function queryDatabase() {
    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('Connected to database');
        
        const result = await pool.request().query(
            'SELECT TOP 10 id, ipfsHash, sentiment_label, credibility_score, wallet_address, created_at FROM AnalysisRecords ORDER BY created_at DESC'
        );
        
        console.log('\n✅ DATABASE RECORDS:');
        console.log('===============================================');
        result.recordset.forEach(record => {
            console.log(`ID: ${record.id}`);
            console.log(`IPFS Hash: ${record.ipfsHash}`);
            console.log(`Sentiment: ${record.sentiment_label}`);
            console.log(`Credibility: ${record.credibility_score}`);
            console.log(`Wallet: ${record.wallet_address}`);
            console.log(`Created: ${record.created_at}`);
            console.log('---');
        });
        
        console.log(`\nTotal records: ${result.recordset.length}`);
        
        await pool.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

queryDatabase();
