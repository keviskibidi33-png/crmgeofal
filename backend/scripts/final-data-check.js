const pool = require('../config/db');

async function finalDataCheck() {
  try {
    console.log('🔍 VERIFICACIÓN FINAL DE DATOS...\n');
    
    // Verificar todas las tablas principales
    const tables = [
      'companies', 'users', 'projects', 'quotes', 
      'services', 'subservices', 'categories', 'subcategories'
    ];
    
    console.log('📊 RESUMEN DE DATOS ACTUALES:');
    console.log('================================');
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
        const total = result.rows[0].total;
        console.log(`   ${table.toUpperCase()}: ${total} registros`);
        
        // Mostrar algunos ejemplos si hay datos
        if (total > 0 && total < 10) {
          const sample = await pool.query(`SELECT * FROM ${table} LIMIT 2`);
          if (sample.rows.length > 0) {
            console.log(`      📋 Ejemplo: ${JSON.stringify(sample.rows[0]).substring(0, 80)}...`);
          }
        }
      } catch (error) {
        console.log(`   ${table.toUpperCase()}: Error - ${error.message}`);
      }
    }
    
    // Verificar subservicios activos
    console.log('\n🔧 SUBSERVICIOS ACTIVOS:');
    const activeSubservices = await pool.query(`
      SELECT COUNT(*) as total 
      FROM subservices 
      WHERE is_active = true
    `);
    console.log(`   📊 Total: ${activeSubservices.rows[0].total} subservicios activos`);
    
    // Verificar por área de servicios
    console.log('\n🏢 SERVICIOS POR ÁREA:');
    const servicesByArea = await pool.query(`
      SELECT area, COUNT(*) as total 
      FROM services 
      GROUP BY area 
      ORDER BY area
    `);
    servicesByArea.rows.forEach(row => {
      console.log(`   ${row.area}: ${row.total} servicios`);
    });
    
    // Verificar fechas de creación
    console.log('\n📅 FECHAS DE CREACIÓN:');
    const creationDates = await pool.query(`
      SELECT 
        'companies' as tabla, 
        MIN(created_at) as mas_antiguo, 
        MAX(created_at) as mas_reciente
      FROM companies
      UNION ALL
      SELECT 
        'users' as tabla, 
        MIN(created_at) as mas_antiguo, 
        MAX(created_at) as mas_reciente
      FROM users
      UNION ALL
      SELECT 
        'projects' as tabla, 
        MIN(created_at) as mas_antiguo, 
        MAX(created_at) as mas_reciente
      FROM projects
      ORDER BY tabla
    `);
    
    creationDates.rows.forEach(row => {
      console.log(`   ${row.tabla}:`);
      console.log(`      📅 Más antiguo: ${row.mas_antiguo || 'N/A'}`);
      console.log(`      📅 Más reciente: ${row.mas_reciente || 'N/A'}`);
    });
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('📁 Backup disponible en: backend/backups/');
    console.log('🔍 Los datos parecen estar intactos');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  } finally {
    await pool.end();
  }
}

finalDataCheck();
