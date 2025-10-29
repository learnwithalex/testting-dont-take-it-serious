const { Client } = require('pg');

async function testConnection() {
  // Try connection without SSL first (for development)
  const connectionString = 'postgres://avnadmin:AVNS_P3lkwqCG4XogTSaw6rH@pg-2cdf1253-meta39059-ba8f.f.aivencloud.com:14352/defaultdb';
  
  console.log('🔄 Testing connection without SSL...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully without SSL!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('📊 Database info:');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].db_version);
    
    // Test if we can create a simple table
    await client.query('CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_data TEXT)');
    console.log('✅ Table creation test passed');
    
    // Clean up test table
    await client.query('DROP TABLE IF EXISTS connection_test');
    console.log('✅ Table cleanup completed');
    
    await client.end();
    console.log('🔌 Connection closed');
    console.log('\n🎉 SUCCESS! Database connection working without SSL');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('   Error code:', error.code);
    
    // If no SSL fails, try with SSL but ignore certificate errors
    console.log('\n🔄 Trying with SSL (ignore cert errors)...');
    
    const sslClient = new Client({
      connectionString: connectionString + '?sslmode=require',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    try {
      await sslClient.connect();
      console.log('✅ Connected with SSL (ignoring cert errors)!');
      await sslClient.end();
      console.log('🎉 SUCCESS! SSL connection working');
    } catch (sslError) {
      console.error('❌ SSL connection also failed:', sslError.message);
    }
  }
}

testConnection();