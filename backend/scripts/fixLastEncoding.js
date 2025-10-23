const pool = require('../config/db');

async function fixLastEncoding() {
  try {
    await pool.query(`UPDATE ensayos SET descripcion = 'Índice de Durabilidad Agregado.' WHERE codigo = 'AG09'`);
    console.log('✅ AG09 corregido');
    
    // Verificar
    const result = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE codigo = $1', ['AG09']);
    console.log('Verificación:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

fixLastEncoding();
