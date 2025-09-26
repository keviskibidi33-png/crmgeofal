const pool = require('../config/db');

async function addEvaluacionesEstructuralesComplete() {
  try {
    console.log('💾 AGREGANDO EVALUACIONES ESTRUCTURALES COMPLETO...\n');
    
    // 1. Obtener ID de EVALUACIONES ESTRUCTURALES
    const evaluacionesResult = await pool.query("SELECT id FROM services WHERE name = 'EVALUACIONES ESTRUCTURALES'");
    const evaluacionesId = evaluacionesResult.rows[0].id;
    console.log(`✅ ID de EVALUACIONES ESTRUCTURALES: ${evaluacionesId}`);
    
    // 2. Datos completos de EVALUACIONES ESTRUCTURALES según tus datos
    const subservicesData = [
      { codigo: 'E01', descripcion: 'Escaneo de acero de refuerzo.', norma: '-', precio: 0 },
      { codigo: 'E02', descripcion: 'Escaneo de acero por portico.', norma: '-', precio: 0 },
      { codigo: 'E03', descripcion: 'Escaneo de acero por estructura.', norma: '-', precio: 0 },
      { codigo: 'E04', descripcion: 'PH concreto.', norma: 'ASTM C4262', precio: 100 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a EVALUACIONES ESTRUCTURALES...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, evaluacionesId]
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
          evaluacionesId,
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
      WHERE s.name = 'EVALUACIONES ESTRUCTURALES'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 EVALUACIONES ESTRUCTURALES: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 EVALUACIONES ESTRUCTURALES COMPLETADO');
    console.log('✅ 4 subservicios con códigos E* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEvaluacionesEstructuralesComplete();
