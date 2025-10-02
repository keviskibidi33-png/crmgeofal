const pool = require('../config/db');

async function fixQuoteItemsTable() {
  try {
    console.log('🔍 Verificando estructura de tabla quote_items...');
    
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
    
    // Verificar si existe la columna name
    const hasNameColumn = result.rows.some(row => row.column_name === 'name');
    console.log(`\n✅ Columna 'name' existe: ${hasNameColumn}`);
    
    if (!hasNameColumn) {
      console.log('\n🔧 Agregando columna name a quote_items...');
      await pool.query(`
        ALTER TABLE quote_items ADD COLUMN name VARCHAR(200)
      `);
      console.log('✅ Columna name agregada exitosamente');
    } else {
      console.log('✅ La columna name ya existe');
    }
    
    // Verificar si existe la columna description
    const hasDescriptionColumn = result.rows.some(row => row.column_name === 'description');
    console.log(`\n✅ Columna 'description' existe: ${hasDescriptionColumn}`);
    
    if (!hasDescriptionColumn) {
      console.log('\n🔧 Agregando columna description a quote_items...');
      await pool.query(`
        ALTER TABLE quote_items ADD COLUMN description VARCHAR(500)
      `);
      console.log('✅ Columna description agregada exitosamente');
    } else {
      console.log('✅ La columna description ya existe');
    }
    
    console.log('\n🎉 Tabla quote_items configurada correctamente');
    
  } catch (error) {
    console.error('❌ Error configurando tabla quote_items:', error.message);
  } finally {
    await pool.end();
  }
}

fixQuoteItemsTable();
