const pool = require('../config/db');

async function cleanupRedundantTables() {
  try {
    console.log('🧹 Iniciando limpieza de tablas redundantes...');
    
    // 1. Verificar qué tablas existen
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subservices', 'services', 'ensayos')
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:', tablesResult.rows.map(r => r.table_name));
    
    // 2. Verificar si subservices tiene datos
    if (tablesResult.rows.some(r => r.table_name === 'subservices')) {
      const subservicesCount = await pool.query('SELECT COUNT(*) as count FROM subservices');
      console.log(`📊 Subservices: ${subservicesCount.rows[0].count} registros`);
      
      if (parseInt(subservicesCount.rows[0].count) === 0) {
        console.log('🗑️ Eliminando tabla subservices (vacía)...');
        await pool.query('DROP TABLE IF EXISTS subservices CASCADE');
        console.log('✅ Tabla subservices eliminada');
      } else {
        console.log('⚠️ Tabla subservices tiene datos, no se eliminará automáticamente');
      }
    }
    
    // 3. Verificar si services tiene datos
    if (tablesResult.rows.some(r => r.table_name === 'services')) {
      const servicesCount = await pool.query('SELECT COUNT(*) as count FROM services');
      console.log(`📊 Services: ${servicesCount.rows[0].count} registros`);
      
      if (parseInt(servicesCount.rows[0].count) === 0) {
        console.log('🗑️ Eliminando tabla services (vacía)...');
        await pool.query('DROP TABLE IF EXISTS services CASCADE');
        console.log('✅ Tabla services eliminada');
      } else {
        console.log('⚠️ Tabla services tiene datos, no se eliminará automáticamente');
      }
    }
    
    // 4. Verificar ensayos
    const ensayosCount = await pool.query('SELECT COUNT(*) as count FROM ensayos');
    console.log(`📊 Ensayos: ${ensayosCount.rows[0].count} registros`);
    
    // 5. Verificar que ensayos tiene la columna comentarios
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ensayos' 
      AND column_name = 'comentarios'
    `);
    
    if (columnsResult.rows.length > 0) {
      console.log('✅ Tabla ensayos tiene columna comentarios');
    } else {
      console.log('❌ Tabla ensayos NO tiene columna comentarios');
    }
    
    console.log('🎉 Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupRedundantTables();
}

module.exports = cleanupRedundantTables;
