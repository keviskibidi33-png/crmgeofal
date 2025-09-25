const pool = require('../config/db');

async function testCleanup() {
  try {
    console.log('🧪 Probando sistema de limpieza...');
    
    // Verificar estadísticas antes
    const beforeStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at < NOW() - INTERVAL '24 hours' THEN 1 END) as old_records
      FROM audit_log
    `);
    
    console.log('📊 Estadísticas antes de la limpieza:');
    console.log(`   Total registros: ${beforeStats.rows[0].total}`);
    console.log(`   Registros antiguos (>24h): ${beforeStats.rows[0].old_records}`);
    
    // Verificar última limpieza
    const lastCleanup = await pool.query(`
      SELECT cleanup_date, deleted_count, hours_threshold
      FROM audit_cleanup_log 
      ORDER BY cleanup_date DESC 
      LIMIT 1
    `);
    
    if (lastCleanup.rows.length > 0) {
      console.log('🕒 Última limpieza:');
      console.log(`   Fecha: ${lastCleanup.rows[0].cleanup_date}`);
      console.log(`   Registros eliminados: ${lastCleanup.rows[0].deleted_count}`);
      console.log(`   Umbral: ${lastCleanup.rows[0].hours_threshold} horas`);
    } else {
      console.log('🕒 No hay registros de limpieza previa');
    }
    
    // Simular una limpieza
    console.log('\n🧹 Simulando limpieza de registros >24h...');
    
    const beforeCount = await pool.query('SELECT COUNT(*) as total FROM audit_log');
    const totalBefore = parseInt(beforeCount.rows[0].total);
    
    // Ejecutar limpieza
    const result = await pool.query(`
      DELETE FROM audit_log 
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `);
    const deletedCount = result.rowCount;
    
    const afterCount = await pool.query('SELECT COUNT(*) as total FROM audit_log');
    const totalAfter = parseInt(afterCount.rows[0].total);
    
    // Registrar la limpieza
    await pool.query(`
      INSERT INTO audit_cleanup_log (hours_threshold, deleted_count, total_before, total_after, executed_by, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      24,
      deletedCount,
      totalBefore,
      totalAfter,
      null,
      'Limpieza de prueba ejecutada'
    ]);
    
    console.log('✅ Limpieza completada:');
    console.log(`   Registros eliminados: ${deletedCount}`);
    console.log(`   Total antes: ${totalBefore}`);
    console.log(`   Total después: ${totalAfter}`);
    
    // Verificar estadísticas después
    const afterStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at < NOW() - INTERVAL '24 hours' THEN 1 END) as old_records
      FROM audit_log
    `);
    
    console.log('\n📊 Estadísticas después de la limpieza:');
    console.log(`   Total registros: ${afterStats.rows[0].total}`);
    console.log(`   Registros antiguos (>24h): ${afterStats.rows[0].old_records}`);
    
    // Verificar nueva última limpieza
    const newLastCleanup = await pool.query(`
      SELECT cleanup_date, deleted_count, hours_threshold
      FROM audit_cleanup_log 
      ORDER BY cleanup_date DESC 
      LIMIT 1
    `);
    
    console.log('\n🕒 Nueva última limpieza:');
    console.log(`   Fecha: ${newLastCleanup.rows[0].cleanup_date}`);
    console.log(`   Registros eliminados: ${newLastCleanup.rows[0].deleted_count}`);
    console.log(`   Umbral: ${newLastCleanup.rows[0].hours_threshold} horas`);
    
  } catch (error) {
    console.error('❌ Error en prueba de limpieza:', error);
  } finally {
    await pool.end();
  }
}

testCleanup();
