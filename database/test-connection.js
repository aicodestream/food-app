// Test MySQL Database Connection
const mysql = require('mysql2/promise');

async function testDatabase() {
    console.log('🔍 Testing MySQL connection...\n');
    
    try {
        // Create connection (try localhost IPv4)
        const connection = await mysql.createConnection({
            host: '127.0.0.1', // Use IPv4 instead of localhost
            user: 'foodapp',
            password: 'foodapp123'
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Check if database exists
        const [databases] = await connection.query('SHOW DATABASES LIKE "food_ordering"');
        
        if (databases.length > 0) {
            console.log('✅ Database "food_ordering" exists');
            
            // Use the database
            await connection.query('USE food_ordering');
            
            // Check tables
            const [tables] = await connection.query('SHOW TABLES');
            console.log('\n📋 Tables in database:');
            tables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
            
            // Check menu items count
            const [menuCount] = await connection.query('SELECT COUNT(*) as count FROM menu_items');
            console.log(`\n🍽️  Menu items: ${menuCount[0].count}`);
            
            // Check orders count
            const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
            console.log(`📦 Orders: ${orderCount[0].count}`);
            
            console.log('\n✅ Database is ready to use!');
            
        } else {
            console.log('❌ Database "food_ordering" not found');
            console.log('\n💡 Run this command in WSL:');
            console.log('   sudo mysql < schema.sql');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure MySQL is running:');
        console.log('   sudo systemctl status mysql');
    }
}

testDatabase();
