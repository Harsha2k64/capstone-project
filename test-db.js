const sql = require('mssql');
const config = require('./src/config/app-config');

async function testDB() {
  try {
    const pool = await sql.connect(config.sqlCon);

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