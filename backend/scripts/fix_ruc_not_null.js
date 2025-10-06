const pool = require('../config/db');

async function fixRucNotNull() {
  try {
    console.log('🔧 Iniciando corrección de restricción NOT NULL en columna RUC...');
    
    // Verificar la estructura actual de la tabla
    console.log('📋 Verificando estructura actual de la tabla companies...');
    const structureResult = await pool.query(`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name IN ('ruc', 'dni')
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura actual:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}, nullable: ${row.is_nullable}, default: ${row.column_default}`);
    });
    
    // Modificar la columna RUC para permitir NULL
    console.log('📝 Modificando columna RUC para permitir NULL...');
    await pool.query('ALTER TABLE companies ALTER COLUMN ruc DROP NOT NULL');
    
    // Verificar que el cambio se aplicó
    console.log('✅ Verificando cambios aplicados...');
    const verifyResult = await pool.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name = 'ruc'
    `);
    
    console.log('✅ Columna RUC ahora permite NULL:', verifyResult.rows[0].is_nullable === 'YES');
    
    console.log('✅ Corrección completada exitosamente!');
    console.log('✅ Ahora se pueden crear personas naturales sin RUC');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixRucNotNull();
