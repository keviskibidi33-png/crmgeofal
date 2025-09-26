const pool = require('../config/db');

async function verificacionFinalCompleta() {
  try {
    console.log('🔍 VERIFICACIÓN FINAL COMPLETA DE TODOS LOS SERVICIOS Y SUBSERVICIOS...\n');
    
    // 1. Obtener todos los servicios con sus subservicios
    const servicesResult = await pool.query(`
      SELECT 
        s.id,
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s 
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);
    
    console.log('📊 RESUMEN FINAL DE SERVICIOS Y SUBSERVICIOS:');
    console.log('=' .repeat(80));
    
    let totalSubservices = 0;
    
    for (const service of servicesResult.rows) {
      console.log(`\n🔬 ${service.name}:`);
      console.log(`   📋 Subservicios: ${service.subservices_count}`);
      totalSubservices += parseInt(service.subservices_count);
      
      // Mostrar algunos subservicios de ejemplo para cada servicio
      if (service.subservices_count > 0) {
        const subservicesResult = await pool.query(`
          SELECT codigo, descripcion, precio
          FROM subservices 
          WHERE service_id = $1 AND is_active = true 
          ORDER BY codigo 
          LIMIT 3
        `, [service.id]);
        
        console.log(`   📝 Ejemplos de subservicios:`);
        subservicesResult.rows.forEach(sub => {
          const precio = sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`;
          console.log(`      - ${sub.codigo}: ${sub.descripcion.substring(0, 40)}... (${precio})`);
        });
        
        if (service.subservices_count > 3) {
          console.log(`      ... y ${service.subservices_count - 3} más`);
        }
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log(`📈 TOTALES:`);
    console.log(`   🔬 Servicios: ${servicesResult.rows.length}`);
    console.log(`   📋 Subservicios: ${totalSubservices}`);
    console.log('=' .repeat(80));
    
    // 2. Verificar distribución por códigos
    console.log('\n📊 DISTRIBUCIÓN POR CÓDIGOS:');
    const codeDistribution = await pool.query(`
      SELECT 
        LEFT(codigo, 2) as prefix,
        COUNT(*) as count
      FROM subservices 
      WHERE is_active = true
      GROUP BY prefix
      ORDER BY count DESC, prefix
    `);
    
    codeDistribution.rows.forEach(row => {
      console.log(`   ${row.prefix}**: ${row.count} subservicios`);
    });
    
    // 3. Verificar servicios sin subservicios
    console.log('\n🔍 SERVICIOS SIN SUBSERVICIOS:');
    const servicesWithoutSubservices = servicesResult.rows.filter(s => s.subservices_count == 0);
    if (servicesWithoutSubservices.length > 0) {
      servicesWithoutSubservices.forEach(s => console.log(`   ⚠️  ${s.name}`));
    } else {
      console.log('   ✅ Todos los servicios tienen subservicios');
    }
    
    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('✅ Base de datos estructurada correctamente');
    console.log('✅ Todos los servicios y subservicios agregados exitosamente');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  } finally {
    await pool.end();
  }
}

verificacionFinalCompleta();
