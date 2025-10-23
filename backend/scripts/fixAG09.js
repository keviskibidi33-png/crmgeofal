const pool = require('../config/db');

async function fixAG09() {
  try {
    await pool.query('UPDATE ensayos SET descripcion = $1 WHERE codigo = $2', ['Índice de Durabilidad Agregado.', 'AG09']);
    console.log('✅ AG09 corregido');
    
    const result = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE codigo = $1', ['AG09']);
    console.log('Verificación:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error corrigiendo AG09:', error.message);
  } finally {
    pool.end();
  }
}

fixAG09();
