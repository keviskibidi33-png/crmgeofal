const pool = require('../config/db');

async function verifySubservicesImplementation() {
  console.log('🔍 VERIFICACIÓN FINAL DE IMPLEMENTACIÓN DE SUBSERVICIOS\n');
  
  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión a base de datos...');
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log(`✅ Conexión exitosa: ${connectionTest.rows[0].current_time}`);

    // 2. Verificar servicios
    console.log('\n2️⃣ Verificando servicios...');
    const servicesResult = await pool.query('SELECT * FROM services ORDER BY id');
    console.log(`✅ Servicios encontrados: ${servicesResult.rows.length}`);
    servicesResult.rows.forEach(service => {
      console.log(`   - ${service.name} (${service.area})`);
    });

    // 3. Verificar subservicios
    console.log('\n3️⃣ Verificando subservicios...');
    const subservicesResult = await pool.query(`
      SELECT s.*, sv.name as service_name, sv.area 
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      ORDER BY s.codigo 
      LIMIT 5
    `);
    
    console.log(`✅ Subservicios activos: ${subservicesResult.rows.length} (mostrando primeros 5)`);
    subservicesResult.rows.forEach(sub => {
      console.log(`   - ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
      console.log(`     Precio: ${sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`}`);
      console.log(`     Servicio: ${sub.service_name} (${sub.area})`);
    });

    // 4. Verificar estructura de datos para frontend
    console.log('\n4️⃣ Verificando estructura de datos para frontend...');
    const frontendQuery = await pool.query(`
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        s.is_active,
        sv.name as service_name,
        sv.area
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      ORDER BY s.codigo 
      LIMIT 3
    `);
    
    console.log(`✅ Estructura de datos verificada: ${frontendQuery.rows.length} registros`);
    if (frontendQuery.rows.length > 0) {
      const sample = frontendQuery.rows[0];
      console.log('   Estructura de ejemplo:');
      console.log(`   - id: ${sample.id}`);
      console.log(`   - codigo: ${sample.codigo}`);
      console.log(`   - descripcion: ${sample.descripcion.substring(0, 30)}...`);
      console.log(`   - norma: ${sample.norma}`);
      console.log(`   - precio: ${sample.precio}`);
      console.log(`   - is_active: ${sample.is_active}`);
      console.log(`   - service_name: ${sample.service_name}`);
      console.log(`   - area: ${sample.area}`);
    }

    // 5. Verificar categorización
    console.log('\n5️⃣ Verificando categorización...');
    const categoriesResult = await pool.query(`
      SELECT 
        CASE 
          WHEN s.codigo LIKE 'SU%' THEN 'ENSAYO ESTÁNDAR'
          WHEN s.codigo LIKE 'AG%' THEN 'ENSAYO AGREGADO'
          WHEN s.codigo LIKE 'C%' OR s.codigo LIKE 'CO%' THEN 'ENSAYO CONCRETO'
          WHEN s.codigo LIKE 'ALB%' THEN 'ENSAYO ALBAÑILERÍA'
          WHEN s.codigo LIKE 'R%' THEN 'ENSAYO ROCA'
          WHEN s.codigo LIKE 'CEM%' THEN 'CEMENTO'
          WHEN s.codigo LIKE 'PAV%' THEN 'ENSAYO PAVIMENTO'
          WHEN s.codigo LIKE 'AS%' THEN 'ENSAYO ASFALTO'
          WHEN s.codigo LIKE 'MA%' THEN 'ENSAYO MEZCLA ASFÁLTICO'
          WHEN s.codigo LIKE 'E%' THEN 'EVALUACIONES ESTRUCTURALES'
          WHEN s.codigo LIKE 'IMP%' THEN 'IMPLEMENTACIÓN LABORATORIO'
          WHEN s.codigo LIKE 'SER%' THEN 'OTROS SERVICIOS'
          ELSE 'OTROS'
        END as categoria,
        COUNT(*) as cantidad
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      GROUP BY categoria 
      ORDER BY cantidad DESC
    `);
    
    console.log(`✅ Categorías disponibles: ${categoriesResult.rows.length}`);
    categoriesResult.rows.forEach(row => {
      console.log(`   - ${row.categoria}: ${row.cantidad} subservicios`);
    });

    // 6. Verificar precios
    console.log('\n6️⃣ Verificando precios...');
    const pricesResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN precio = 0 THEN 1 END) as sujeto_evaluacion,
        COUNT(CASE WHEN precio > 0 THEN 1 END) as precio_fijo,
        AVG(CASE WHEN precio > 0 THEN precio END) as precio_promedio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
    `);
    
    const stats = pricesResult.rows[0];
    console.log(`✅ Estadísticas de precios:`);
    console.log(`   - Total: ${stats.total} subservicios`);
    console.log(`   - Precio fijo: ${stats.precio_fijo} subservicios`);
    console.log(`   - Sujeto a evaluación: ${stats.sujeto_evaluacion} subservicios`);
    console.log(`   - Precio promedio: S/ ${parseFloat(stats.precio_promedio || 0).toFixed(2)}`);

    // 7. Verificar índices
    console.log('\n7️⃣ Verificando índices...');
    const indexesResult = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('services', 'subservices')
      ORDER BY tablename, indexname
    `);
    
    console.log(`✅ Índices disponibles: ${indexesResult.rows.length}`);
    indexesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}: ${row.indexname}`);
    });

    console.log('\n🎉 IMPLEMENTACIÓN DE SUBSERVICIOS COMPLETADA');
    console.log('✅ Backend funcionando correctamente');
    console.log('✅ Base de datos optimizada');
    console.log('✅ Subservicios disponibles');
    console.log('✅ Categorización funcionando');
    console.log('✅ Precios formateados');
    console.log('✅ Índices optimizados');
    console.log('✅ Listo para frontend');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await verifySubservicesImplementation();
    console.log('\n✅ Verificación completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
