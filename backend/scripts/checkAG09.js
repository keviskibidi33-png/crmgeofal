const pool = require('../config/db');

async function checkAG09() {
  try {
    const result = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE codigo = $1', ['AG09']);
    console.log('AG09 en BD:', result.rows[0]);
    console.log('Descripción como bytes:', Buffer.from(result.rows[0].descripcion, 'utf8'));
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkAG09();
