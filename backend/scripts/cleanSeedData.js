const pool = require('../config/db');

// Script para limpiar datos ficticios del seed y dejar solo datos reales del usuario
async function cleanSeedData() {
  try {
    console.log('🧹 Iniciando limpieza de datos ficticios...');

    // Limpiar datos del seed (mantener solo datos reales del usuario)
    console.log('🗑️ Eliminando datos ficticios...');
    
    // Eliminar tickets ficticios (mantener solo los reales del usuario)
    await pool.query("DELETE FROM tickets WHERE title LIKE '%sistema%' OR title LIKE '%capacitación%' OR title LIKE '%reportes%'");
    console.log('✅ Tickets ficticios eliminados');

    // Eliminar cotizaciones ficticias
    await pool.query("DELETE FROM quotes WHERE engineer_name LIKE 'Ing.%'");
    console.log('✅ Cotizaciones ficticias eliminadas');

    // Eliminar proyectos ficticios
    await pool.query("DELETE FROM projects WHERE name LIKE '%Residencial%' OR name LIKE '%Plaza%' OR name LIKE '%Torre%'");
    console.log('✅ Proyectos ficticios eliminados');

    // Eliminar empresas ficticias
    await pool.query("DELETE FROM companies WHERE name LIKE '%Constructora%' OR name LIKE '%Inmobiliaria%' OR name LIKE '%Desarrolladora%'");
    console.log('✅ Empresas ficticias eliminadas');

    // Mostrar resumen final
    const [
      usersResult,
      projectsResult,
      quotesResult,
      ticketsResult,
      companiesResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM quotes'),
      pool.query('SELECT COUNT(*) FROM tickets'),
      pool.query('SELECT COUNT(*) FROM companies')
    ]);

    console.log('\n📊 Resumen final (solo datos reales):');
    console.log('👥 Usuarios:', usersResult.rows[0].count);
    console.log('🏗️ Proyectos:', projectsResult.rows[0].count);
    console.log('📋 Cotizaciones:', quotesResult.rows[0].count);
    console.log('🎫 Tickets:', ticketsResult.rows[0].count);
    console.log('🏢 Empresas:', companiesResult.rows[0].count);

    console.log('\n✅ Limpieza completada. Ahora el dashboard mostrará solo tus datos reales.');

  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la limpieza
if (require.main === module) {
  cleanSeedData();
}

module.exports = { cleanSeedData };
