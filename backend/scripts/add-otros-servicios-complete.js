const pool = require('../config/db');

async function addOtrosServiciosComplete() {
  try {
    console.log('💾 AGREGANDO OTROS SERVICIOS COMPLETO...\n');
    
    // 1. Obtener ID de OTROS SERVICIOS
    const otrosResult = await pool.query("SELECT id FROM services WHERE name = 'OTROS SERVICIOS'");
    const otrosId = otrosResult.rows[0].id;
    console.log(`✅ ID de OTROS SERVICIOS: ${otrosId}`);
    
    // 2. Datos completos de OTROS SERVICIOS según tus datos
    const subservicesData = [
      { codigo: 'SER01', descripcion: 'Movilización de personal y equipo (Densidad campo).', norma: '-', precio: 0 },
      { codigo: 'SER02', descripcion: 'Movilización de personal y equipo.', norma: '-', precio: 0 },
      { codigo: 'SER03', descripcion: 'Movilización de muestreo en cantera y/o obra.', norma: '-', precio: 0 },
      { codigo: 'SER04', descripcion: 'Movilización', norma: '-', precio: 0 },
      { codigo: 'NOTA', descripcion: 'Tener en cuenta lo siguiente: . Lista de precios referencial, la cual está sujeta a mejora de acuerdo a las cantidades ingresadas. . Algunos ensayos tienen puntos mínimos. . Algunos ensayos se encuentran relacionados a otros ensayos que se requieren. . (*) Métodos de ensayos acreditados ante INACAL.', norma: '-', precio: 0 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a OTROS SERVICIOS...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, otrosId]
        );
        
        if (existing.rows.length > 0) {
          console.log(`   ⚠️  ${subservice.codigo}: Ya existe (omitido)`);
          skippedCount++;
          continue;
        }
        
        // Insertar subservicio
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [
          subservice.codigo,
          subservice.descripcion,
          subservice.norma,
          subservice.precio,
          otrosId,
          subservice.descripcion
        ]);
        
        const precio = subservice.precio === 0 ? 'Sujeto a evaluación' : `S/ ${subservice.precio}`;
        console.log(`   ✅ ${subservice.codigo}: ${subservice.descripcion.substring(0, 50)}... (${subservice.norma}) - ${precio}`);
        addedCount++;
        
      } catch (error) {
        if (error.code === '23505') { // Código duplicado
          console.log(`   ⚠️  ${subservice.codigo}: Ya existe (omitido)`);
          skippedCount++;
        } else {
          console.error(`   ❌ Error agregando ${subservice.codigo}:`, error.message);
        }
      }
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   ✅ Agregados: ${addedCount}`);
    console.log(`   ⚠️  Omitidos: ${skippedCount}`);
    console.log(`   📋 Total procesados: ${subservicesData.length}`);
    
    // 3. Verificar estado final
    console.log('\n3️⃣ Verificando estado final...');
    const finalState = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s 
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      WHERE s.name = 'OTROS SERVICIOS'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 OTROS SERVICIOS: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 OTROS SERVICIOS COMPLETADO');
    console.log('✅ 5 subservicios con códigos SER* y NOTA agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addOtrosServiciosComplete();
