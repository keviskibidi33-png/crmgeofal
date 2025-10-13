const pool = require('../config/db');

async function cleanDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Iniciando limpieza de la base de datos...\n');
    
    // 1. Limpiar datos relacionados con cotizaciones
    console.log('📋 Limpiando datos de cotizaciones...');
    await client.query('DELETE FROM quote_items');
    console.log('   ✅ quote_items limpiada');
    
    await client.query('DELETE FROM quote_versions');
    console.log('   ✅ quote_versions limpiada');
    
    await client.query('DELETE FROM quotes');
    console.log('   ✅ quotes limpiada');
    
    // Limpiar todas las tablas de auditoría antes de eliminar usuarios
    console.log('📝 Limpiando logs de auditoría...');
    
    const auditTables = ['audit_log', 'audit_quotes', 'audit_companies', 'audit_projects', 'monthly_goals'];
    
    for (const table of auditTables) {
      try {
        await client.query(`DELETE FROM ${table}`);
        console.log(`   ✅ ${table} limpiada`);
      } catch (error) {
        if (error.code === '42P01') {
          console.log(`   ⚠️ ${table} no existe, omitiendo`);
        } else {
          throw error;
        }
      }
    }
    
    // 2. Limpiar proyectos
    console.log('\n🏗️ Limpiando proyectos...');
    await client.query('DELETE FROM projects');
    console.log('   ✅ projects limpiada');
    
    // 3. Limpiar clientes/empresas
    console.log('\n🏢 Limpiando empresas/clientes...');
    await client.query('DELETE FROM companies');
    console.log('   ✅ companies limpiada');
    
    // 4. Eliminar usuarios no admin
    console.log('\n👥 Eliminando usuarios no admin...');
    const usersResult = await client.query('SELECT id, name, email, role FROM users WHERE role != \'admin\'');
    console.log(`   📋 Usuarios a eliminar: ${usersResult.rows.length}`);
    
    usersResult.rows.forEach(user => {
      console.log(`      - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    await client.query('DELETE FROM users WHERE role != \'admin\'');
    console.log('   ✅ Usuarios no admin eliminados');
    
    // 5. Limpiar tabla de secuencias (mantener estructura)
    console.log('\n🔢 Limpiando secuencias de cotizaciones...');
    await client.query('DELETE FROM quote_sequences');
    console.log('   ✅ quote_sequences limpiada');
    
    // 6. Resetear secuencias auto-incrementales
    console.log('\n🔄 Reseteando secuencias auto-incrementales...');
    await client.query('ALTER SEQUENCE quotes_id_seq RESTART WITH 1');
    console.log('   ✅ quotes_id_seq reseteada');
    
    await client.query('ALTER SEQUENCE projects_id_seq RESTART WITH 1');
    console.log('   ✅ projects_id_seq reseteada');
    
    await client.query('ALTER SEQUENCE companies_id_seq RESTART WITH 1');
    console.log('   ✅ companies_id_seq reseteada');
    
    await client.query('ALTER SEQUENCE quote_items_id_seq RESTART WITH 1');
    console.log('   ✅ quote_items_id_seq reseteada');
    
    await client.query('ALTER SEQUENCE quote_versions_id_seq RESTART WITH 1');
    console.log('   ✅ quote_versions_id_seq reseteada');
    
    console.log('\n✅ Limpieza completada exitosamente');
    
    // Mostrar estado final
    console.log('\n📊 Estado final de la base de datos:');
    const finalStats = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM companies'),
      client.query('SELECT COUNT(*) as count FROM projects'),
      client.query('SELECT COUNT(*) as count FROM quotes'),
      client.query('SELECT COUNT(*) as count FROM quote_items'),
      client.query('SELECT COUNT(*) as count FROM quote_sequences')
    ]);
    
    console.log(`   - Usuarios: ${finalStats[0].rows[0].count}`);
    console.log(`   - Empresas: ${finalStats[1].rows[0].count}`);
    console.log(`   - Proyectos: ${finalStats[2].rows[0].count}`);
    console.log(`   - Cotizaciones: ${finalStats[3].rows[0].count}`);
    console.log(`   - Ítems de cotizaciones: ${finalStats[4].rows[0].count}`);
    console.log(`   - Secuencias: ${finalStats[5].rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanDatabase().then(() => {
    console.log('\n🎉 Limpieza de base de datos completada');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { cleanDatabase };
