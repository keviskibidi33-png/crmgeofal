const pool = require('../config/db');

async function checkTicketsTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla tickets...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tickets' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas actuales en la tabla tickets:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar si faltan columnas
    const requiredColumns = [
      'id', 'user_id', 'title', 'description', 'priority', 'status',
      'module', 'category', 'type', 'assigned_to', 'estimated_time', 
      'tags', 'additional_notes', 'attachment_url', 'created_at', 'updated_at'
    ];
    
    const existingColumns = result.rows.map(row => row.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Faltan las siguientes columnas:');
      missingColumns.forEach(col => console.log(`  - ${col}`));
      
      console.log('\n🔧 Ejecutando ALTER TABLE para agregar columnas faltantes...');
      
      for (const column of missingColumns) {
        let alterQuery = '';
        switch (column) {
          case 'module':
            alterQuery = "ALTER TABLE tickets ADD COLUMN module VARCHAR(50)";
            break;
          case 'category':
            alterQuery = "ALTER TABLE tickets ADD COLUMN category VARCHAR(50)";
            break;
          case 'type':
            alterQuery = "ALTER TABLE tickets ADD COLUMN type VARCHAR(50)";
            break;
          case 'assigned_to':
            alterQuery = "ALTER TABLE tickets ADD COLUMN assigned_to INTEGER";
            break;
          case 'estimated_time':
            alterQuery = "ALTER TABLE tickets ADD COLUMN estimated_time VARCHAR(100)";
            break;
          case 'tags':
            alterQuery = "ALTER TABLE tickets ADD COLUMN tags TEXT";
            break;
          case 'additional_notes':
            alterQuery = "ALTER TABLE tickets ADD COLUMN additional_notes TEXT";
            break;
        }
        
        if (alterQuery) {
          try {
            await pool.query(alterQuery);
            console.log(`  ✅ Agregada columna: ${column}`);
          } catch (error) {
            console.log(`  ⚠️ Error agregando columna ${column}:`, error.message);
          }
        }
      }
    } else {
      console.log('\n✅ Todas las columnas necesarias están presentes');
    }
    
    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando tabla tickets:', error);
  } finally {
    process.exit(0);
  }
}

checkTicketsTable();
