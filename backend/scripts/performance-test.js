const pool = require('../config/db');

async function performanceTest() {
  console.log('🚀 PRUEBA DE RENDIMIENTO DEL SISTEMA\n');
  
  try {
    // 1. Prueba de carga de servicios
    console.log('1️⃣ Probando carga de servicios...');
    const startServices = Date.now();
    const servicesResult = await pool.query('SELECT * FROM services');
    const servicesTime = Date.now() - startServices;
    console.log(`✅ Servicios: ${servicesResult.rows.length} registros en ${servicesTime}ms`);

    // 2. Prueba de carga de subservicios con paginación
    console.log('\n2️⃣ Probando carga de subservicios con paginación...');
    const startSubservices = Date.now();
    const subservicesResult = await pool.query(`
      SELECT s.*, sv.name as service_name, sv.area 
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      ORDER BY s.codigo 
      LIMIT 50 OFFSET 0
    `);
    const subservicesTime = Date.now() - startSubservices;
    console.log(`✅ Subservicios: ${subservicesResult.rows.length} registros en ${subservicesTime}ms`);

    // 3. Prueba de búsqueda inteligente
    console.log('\n3️⃣ Probando búsqueda inteligente...');
    const startSearch = Date.now();
    const searchResult = await pool.query(`
      SELECT s.*, sv.name as service_name, sv.area 
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE (LOWER(s.codigo) LIKE $1 OR LOWER(s.descripcion) LIKE $1)
      AND s.is_active = true 
      ORDER BY s.codigo 
      LIMIT 20
    `, ['%SU%']);
    const searchTime = Date.now() - startSearch;
    console.log(`✅ Búsqueda: ${searchResult.rows.length} resultados en ${searchTime}ms`);

    // 4. Prueba de conteo total
    console.log('\n4️⃣ Probando conteo total...');
    const startCount = Date.now();
    const countResult = await pool.query('SELECT COUNT(*) as total FROM subservices WHERE is_active = true');
    const countTime = Date.now() - startCount;
    console.log(`✅ Conteo: ${countResult.rows[0].total} registros en ${countTime}ms`);

    // 5. Prueba de categorización
    console.log('\n5️⃣ Probando categorización...');
    const startCategory = Date.now();
    const categoryResult = await pool.query(`
      SELECT 
        CASE 
          WHEN s.codigo LIKE 'SU%' THEN 'ENSAYO ESTÁNDAR'
          WHEN s.codigo LIKE 'AG%' THEN 'ENSAYO AGREGADO'
          WHEN s.codigo LIKE 'C%' OR s.codigo LIKE 'CO%' THEN 'ENSAYO CONCRETO'
          WHEN s.codigo LIKE 'ALB%' THEN 'ENSAYO ALBAÑILERÍA'
          WHEN s.codigo LIKE 'AS%' THEN 'ENSAYO ASFALTO'
          WHEN s.codigo LIKE 'PAV%' THEN 'ENSAYO PAVIMENTO'
          WHEN s.codigo LIKE 'MA%' THEN 'ENSAYO MEZCLA ASFÁLTICO'
          WHEN s.codigo LIKE 'E%' THEN 'EVALUACIONES ESTRUCTURALES'
          WHEN s.codigo LIKE 'IMP%' THEN 'IMPLEMENTACIÓN LABORATORIO'
          ELSE 'OTROS'
        END as categoria,
        COUNT(*) as cantidad
      FROM subservices s 
      WHERE s.is_active = true 
      GROUP BY categoria 
      ORDER BY cantidad DESC
    `);
    const categoryTime = Date.now() - startCategory;
    console.log(`✅ Categorización: ${categoryResult.rows.length} categorías en ${categoryTime}ms`);

    // 6. Prueba de índices
    console.log('\n6️⃣ Verificando índices...');
    const indexResult = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('services', 'subservices')
      ORDER BY tablename, indexname
    `);
    console.log(`✅ Índices disponibles: ${indexResult.rows.length}`);

    // 7. Prueba de memoria y conexiones
    console.log('\n7️⃣ Verificando estado de conexiones...');
    const connectionResult = await pool.query(`
      SELECT 
        count(*) as total_connections,
        state,
        count(*) as connections_by_state
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    `);
    console.log('✅ Estado de conexiones:');
    connectionResult.rows.forEach(row => {
      console.log(`   - ${row.state}: ${row.connections_by_state} conexiones`);
    });

    // Resumen de rendimiento
    console.log('\n📊 RESUMEN DE RENDIMIENTO:');
    console.log(`   - Servicios: ${servicesTime}ms`);
    console.log(`   - Subservicios: ${subservicesTime}ms`);
    console.log(`   - Búsqueda: ${searchTime}ms`);
    console.log(`   - Conteo: ${countTime}ms`);
    console.log(`   - Categorización: ${categoryTime}ms`);
    console.log(`   - Índices: ${indexResult.rows.length} disponibles`);

    // Evaluación de rendimiento
    const totalTime = servicesTime + subservicesTime + searchTime + countTime + categoryTime;
    console.log(`\n🎯 TIEMPO TOTAL: ${totalTime}ms`);
    
    if (totalTime < 1000) {
      console.log('✅ RENDIMIENTO EXCELENTE (< 1s)');
    } else if (totalTime < 3000) {
      console.log('✅ RENDIMIENTO BUENO (< 3s)');
    } else {
      console.log('⚠️ RENDIMIENTO ACEPTABLE (> 3s)');
    }

    console.log('\n🎉 PRUEBA DE RENDIMIENTO COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error en prueba de rendimiento:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await performanceTest();
    console.log('\n✅ Sistema listo para producción');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
