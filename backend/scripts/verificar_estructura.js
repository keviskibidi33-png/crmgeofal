const pool = require('../config/db');

async function verificarEstructura() {
  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA SUBSERVICES...\n');
    
    // Verificar columnas de subservices
    const columnas = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'subservices' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 COLUMNAS DE SUBSERVICES:');
    columnas.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar si la tabla existe
    const existe = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'subservices'
      )
    `);
    
    console.log(`\n📊 TABLA SUBSERVICES EXISTE: ${existe.rows[0].exists}`);
    
    // Contar registros
    const count = await pool.query('SELECT COUNT(*) FROM subservices');
    console.log(`📈 TOTAL DE REGISTROS: ${count.rows[0].count}`);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstructura();
