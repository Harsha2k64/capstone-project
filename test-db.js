require('dotenv').config();

const sql = require('mssql');

console.log('=== DEBUG ENV ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function testDB() {
  try {
    const pool = await sql.connect(config);

    console.log('✅ DB CONNECTED SUCCESSFULLY');

    const result = await pool.request().query('SELECT * FROM products');

    console.log('📦 PRODUCTS:');
    console.log(result.recordset);

  } catch (err) {
    console.error('❌ CONNECTION FAILED');
    console.error(err);
  }
}

testDB();