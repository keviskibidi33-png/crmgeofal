const pool = require('../config/db');

async function fixSU41() {
  try {
    await pool.query('UPDATE ensayos SET categoria = $1 WHERE codigo = $2', ['ENSAYOS ESPECIALES SUELO', 'SU41']);
    console.log('✅ SU41 corregido a ENSAYOS ESPECIALES SUELO');
    
    const result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo = $1', ['SU41']);
    console.log('Verificación:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

fixSU41();
