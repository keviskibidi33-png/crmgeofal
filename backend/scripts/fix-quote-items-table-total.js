const pool = require('../config/db');

async function fixQuoteItemsTableTotal() {
  try {
    console.log('🔍 Verificando estructura de tabla quote_items para la columna "total"...');
    
    // Verificar columnas existentes
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'quote_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas en quote_items:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar si existe la columna total
    const hasTotalColumn = result.rows.some(row => row.column_name === 'total');
    console.log(`\n✅ Columna 'total' existe: ${hasTotalColumn}`);
    
    if (!hasTotalColumn) {
      console.log('\n🔧 Agregando columna total a quote_items...');
      await pool.query(`
        ALTER TABLE quote_items ADD COLUMN total DECIMAL(10,2) DEFAULT 0.00
      `);
      console.log('✅ Columna total agregada exitosamente a quote_items.');
    } else {
      console.log('👍 La columna total ya existe en quote_items. No se requiere acción.');
    }

    console.log('\n🎉 Verificación y corrección de quote_items (columna total) completada.');
    
  } catch (error) {
    console.error('❌ Error al verificar/agregar columna total a quote_items:', error.message);
  } finally {
    await pool.end();
  }
}

fixQuoteItemsTableTotal();
