const pool = require('../config/db');

async function addImplementacionLaboratorioObraAdicionales() {
  try {
    console.log('💾 AGREGANDO SUBSERVICIOS ADICIONALES A IMPLEMENTACIÓN LABORATORIO EN OBRA...\n');
    
    // 1. Obtener ID de IMPLEMENTACIÓN LABORATORIO EN OBRA
    const implementacionResult = await pool.query("SELECT id FROM services WHERE name = 'IMPLEMENTACIÓN LABORATORIO EN OBRA'");
    const implementacionId = implementacionResult.rows[0].id;
    console.log(`✅ ID de IMPLEMENTACIÓN LABORATORIO EN OBRA: ${implementacionId}`);
    
    // 2. Datos adicionales de IMPLEMENTACIÓN LABORATORIO EN OBRA según tus datos
    const subservicesData = [
      { codigo: 'IL02', descripcion: 'Estudio de suelos con fines de cimentación superficial y profunda, edificaciones, puentes, plantas industriales.', norma: '-', precio: 0 },
      { codigo: 'IL03', descripcion: 'Estudio de suelos y diseño de pavimentación.', norma: '-', precio: 0 },
      { codigo: 'IL04', descripcion: 'Estudio de suelos con fines de estabilidad de taludes.', norma: '-', precio: 0 },
      { codigo: 'IL05', descripcion: 'Estudio de suelos confines de diseño de instalaciones sanitarias de agua y alcantarillado.', norma: '-', precio: 0 },
      { codigo: 'IL06', descripcion: 'Estudio de Potencial de licuación de suelos.', norma: '-', precio: 0 },
      { codigo: 'IL07', descripcion: 'Evaluación y caracterización del maciso rocoso.', norma: '-', precio: 0 },
      { codigo: 'IL08', descripcion: 'Evaluación de canteras.', norma: '-', precio: 0 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios adicionales a IMPLEMENTACIÓN LABORATORIO EN OBRA...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, implementacionId]
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
          implementacionId,
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
      WHERE s.name = 'IMPLEMENTACIÓN LABORATORIO EN OBRA'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 IMPLEMENTACIÓN LABORATORIO EN OBRA: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 SUBSERVICIOS ADICIONALES AGREGADOS');
    console.log('✅ 7 subservicios adicionales con códigos IL* agregados');
    console.log('✅ IMPLEMENTACIÓN LABORATORIO EN OBRA ahora tiene 8 subservicios totales');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addImplementacionLaboratorioObraAdicionales();
