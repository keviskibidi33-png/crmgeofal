const pool = require('../config/db');

async function checkSU38SU40() {
  try {
    // Verificar SU38 y SU40 en BD
    const result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo IN ($1, $2)', ['SU38', 'SU40']);
    console.log('SU38 y SU40 en BD:');
    if (result.rows.length === 0) {
      console.log('  No encontrados en BD');
    } else {
      result.rows.forEach(row => {
        console.log(`  ${row.codigo}: ${row.descripcion} (${row.categoria})`);
      });
    }
    
    // Verificar si hay otro SU38
    const su38Result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo = $1', ['SU38']);
    console.log('\nTodos los SU38 en BD:');
    su38Result.rows.forEach(row => {
      console.log(`  ${row.codigo}: ${row.descripcion} (${row.categoria})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

checkSU38SU40();
