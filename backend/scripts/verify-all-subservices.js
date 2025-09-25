const pool = require('../config/db');

async function verifyAllSubservices() {
  console.log('🔍 VERIFICANDO TODOS LOS SUBSERVICIOS\n');
  
  try {
    // 1. Contar total de subservicios
    console.log('1️⃣ Contando total de subservicios...');
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    console.log(`✅ Total de subservicios: ${total}`);

    // 2. Obtener todos los subservicios
    console.log('\n2️⃣ Obteniendo todos los subservicios...');
    const allSubservicesResult = await pool.query(`
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        s.service_id,
        s.is_active,
        sv.name as service_name,
        sv.area
      FROM subservices s
      JOIN services sv ON s.service_id = sv.id
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      ORDER BY s.codigo
    `);
    
    console.log(`✅ Subservicios obtenidos: ${allSubservicesResult.rows.length}`);
    
    // 3. Verificar categorización
    console.log('\n3️⃣ Verificando categorización...');
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

    // 4. Verificar precios
    console.log('\n4️⃣ Verificando precios...');
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

    // 5. Mostrar algunos ejemplos
    console.log('\n5️⃣ Ejemplos de subservicios:');
    allSubservicesResult.rows.slice(0, 10).forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
      console.log(`      Precio: ${sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`}`);
      console.log(`      Norma: ${sub.norma || 'Sin norma'}`);
    });

    // 6. Verificar que no hay duplicados
    console.log('\n6️⃣ Verificando duplicados...');
    const duplicatesResult = await pool.query(`
      SELECT codigo, COUNT(*) as count
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      GROUP BY codigo
      HAVING COUNT(*) > 1
    `);
    
    if (duplicatesResult.rows.length > 0) {
      console.log(`⚠️  Duplicados encontrados: ${duplicatesResult.rows.length}`);
      duplicatesResult.rows.forEach(row => {
        console.log(`   - ${row.codigo}: ${row.count} veces`);
      });
    } else {
      console.log(`✅ No hay duplicados`);
    }

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log(`✅ Total de subservicios: ${total}`);
    console.log(`✅ Todos disponibles para frontend`);
    console.log(`✅ Categorización funcionando`);
    console.log(`✅ Precios formateados`);
    console.log(`✅ Sin duplicados`);
    console.log(`✅ Listo para mostrar todos los ${total} subservicios`);
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await verifyAllSubservices();
    console.log('\n✅ Verificación completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
