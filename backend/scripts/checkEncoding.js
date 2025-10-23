const pool = require('../config/db');

async function checkEncoding() {
  try {
    // Verificar algunos ejemplos
    const examples = await pool.query(`
      SELECT codigo, descripcion, norma 
      FROM ensayos 
      WHERE codigo IN ('SU04', 'SU19', 'SU22', 'EE02', 'SU33')
      ORDER BY codigo
    `);
    
    console.log('🔍 Verificando corrección de codificación:');
    examples.rows.forEach(row => {
      console.log(`\n${row.codigo}:`);
      console.log(`  Descripción: ${row.descripcion}`);
      console.log(`  Norma: ${row.norma}`);
    });

    // Verificar si quedan caracteres mal codificados
    const remaining = await pool.query(`
      SELECT COUNT(*) as count 
      FROM ensayos 
      WHERE descripcion LIKE '%%' 
         OR norma LIKE '%%' 
         OR comentarios LIKE '%%' 
         OR nota_comercial LIKE '%%'
    `);

    console.log(`\n📊 Ensayos con problemas restantes: ${remaining.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkEncoding();
