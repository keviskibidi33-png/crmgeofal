const pool = require('./config/db');

async function analizarServiciosCompleto() {
  try {
    console.log('🔍 ANALIZANDO SERVICIOS Y SUBSERVICIOS COMPLETO...\n');
    
    // 1. Servicios principales
    console.log('📊 SERVICIOS PRINCIPALES:');
    const servicios = await pool.query('SELECT id, name, area FROM services ORDER BY area, name');
    servicios.rows.forEach(s => {
      console.log(`   ${s.id}: ${s.name} (${s.area})`);
    });
    
    console.log('\n📋 SUBSERVICIOS POR SERVICIO:');
    let totalSubservicios = 0;
    
    for (const servicio of servicios.rows) {
      const subservicios = await pool.query(
        'SELECT codigo, descripcion, norma, precio FROM subservices WHERE service_id = $1 AND is_active = true ORDER BY codigo',
        [servicio.id]
      );
      
      console.log(`\n   🧪 ${servicio.name} (${subservicios.rows.length} subservicios):`);
      subservicios.rows.forEach(sub => {
        const precio = sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`;
        console.log(`      ${sub.codigo}: ${sub.descripcion} (${sub.norma}) - ${precio}`);
      });
      
      totalSubservicios += subservicios.rows.length;
    }
    
    console.log('\n📈 RESUMEN:');
    console.log(`   Total servicios: ${servicios.rows.length}`);
    console.log(`   Total subservicios: ${totalSubservicios}`);
    
    // 2. Análisis por área
    console.log('\n🏷️ ANÁLISIS POR ÁREA:');
    const areas = await pool.query(`
      SELECT 
        s.area,
        COUNT(DISTINCT s.id) as servicios_count,
        COUNT(sub.id) as subservicios_count
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      GROUP BY s.area
      ORDER BY s.area
    `);
    
    areas.rows.forEach(area => {
      console.log(`   ${area.area}: ${area.servicios_count} servicios, ${area.subservicios_count} subservicios`);
    });
    
    // 3. Ejemplos de mapeo para categorización
    console.log('\n🎯 EJEMPLOS DE MAPEO PARA CATEGORIZACIÓN:');
    const ejemplos = await pool.query(`
      SELECT 
        s.name as servicio,
        s.area,
        sub.codigo,
        sub.descripcion,
        sub.norma
      FROM services s
      JOIN subservices sub ON s.id = sub.service_id
      WHERE sub.is_active = true
      ORDER BY s.area, s.name, sub.codigo
      LIMIT 20
    `);
    
    ejemplos.rows.forEach(ej => {
      console.log(`   ${ej.servicio} → ${ej.codigo}: ${ej.descripcion}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

analizarServiciosCompleto();
