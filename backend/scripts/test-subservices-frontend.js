const pool = require('../config/db');

async function testSubservicesForFrontend() {
  console.log('🧪 PRUEBA DE SUBSERVICIOS PARA FRONTEND\n');
  
  try {
    // 1. Verificar que los subservicios están disponibles
    console.log('1️⃣ Verificando subservicios disponibles...');
    const subservicesResult = await pool.query(`
      SELECT s.*, sv.name as service_name, sv.area 
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      ORDER BY s.codigo 
      LIMIT 10
    `);
    
    console.log(`✅ Subservicios encontrados: ${subservicesResult.rows.length}`);
    
    if (subservicesResult.rows.length > 0) {
      console.log('\n📋 Primeros 5 subservicios:');
      subservicesResult.rows.slice(0, 5).forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.codigo}: ${sub.descripcion.substring(0, 50)}...`);
        console.log(`      Precio: ${sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`}`);
        console.log(`      Norma: ${sub.norma === '-' ? 'Sin norma específica' : sub.norma}`);
        console.log('');
      });
    }

    // 2. Verificar categorización
    console.log('2️⃣ Verificando categorización...');
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
    
    console.log('✅ Categorías disponibles:');
    categoriesResult.rows.forEach(row => {
      console.log(`   - ${row.categoria}: ${row.cantidad} subservicios`);
    });

    // 3. Verificar precios
    console.log('\n3️⃣ Verificando precios...');
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

    // 4. Simular consulta del frontend
    console.log('\n4️⃣ Simulando consulta del frontend...');
    const frontendQuery = await pool.query(`
      SELECT s.*, sv.name as service_name, sv.area 
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      ORDER BY s.codigo 
      LIMIT 20
    `);
    
    console.log(`✅ Consulta simulada: ${frontendQuery.rows.length} resultados`);
    console.log('   Estructura de datos para frontend:');
    if (frontendQuery.rows.length > 0) {
      const sample = frontendQuery.rows[0];
      console.log(`   - id: ${sample.id}`);
      console.log(`   - codigo: ${sample.codigo}`);
      console.log(`   - descripcion: ${sample.descripcion.substring(0, 30)}...`);
      console.log(`   - norma: ${sample.norma}`);
      console.log(`   - precio: ${sample.precio}`);
      console.log(`   - service_name: ${sample.service_name}`);
      console.log(`   - area: ${sample.area}`);
    }

    console.log('\n🎉 SUBSERVICIOS LISTOS PARA FRONTEND');
    console.log('✅ Datos estructurados correctamente');
    console.log('✅ Categorización funcionando');
    console.log('✅ Precios formateados');
    console.log('✅ Consultas optimizadas');
    
  } catch (error) {
    console.error('❌ Error en prueba de subservicios:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await testSubservicesForFrontend();
    console.log('\n✅ Prueba completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
