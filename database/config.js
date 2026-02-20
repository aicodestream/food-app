// MySQL Database Configuration
const mysql = require('mysql2/promise');

const dbConfig = {
    host: '127.0.0.1',
    user: 'foodapp',
    password: 'foodapp123',
    database: 'food_ordering',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
