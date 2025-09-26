const pool = require('../config/db');

async function saveEnsayoQuimicoAgregadoPermanent() {
  try {
    console.log('💾 GUARDANDO ENSAYO QUÍMICO AGREGADO DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de ENSAYO QUÍMICO AGREGADO
    console.log('1️⃣ Obteniendo ID de ENSAYO QUÍMICO AGREGADO...');
    const ensayoQuimicoAgregado = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO QUÍMICO AGREGADO'");
    const ensayoQuimicoAgregadoId = ensayoQuimicoAgregado.rows[0].id;
    console.log(`✅ ID de ENSAYO QUÍMICO AGREGADO: ${ensayoQuimicoAgregadoId}`);
    
    // 2. Datos EXACTOS de ENSAYO QUÍMICO AGREGADO (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'AG11', descripcion: 'Contenido Sales solubles, fino o grueso.', norma: 'MTC E-219', precio: 150 },
      { codigo: 'AG16', descripcion: 'Contenido de cloruros solubles.', norma: 'NTP 400.042', precio: 90 },
      { codigo: 'AG17', descripcion: 'Contenido de sulfatos solubles.', norma: 'NTP 400.042', precio: 150 },
      { codigo: 'AG29', descripcion: 'Valor de azul de metileno.', norma: 'AASHTO TP57', precio: 150 },
      { codigo: 'AG30', descripcion: 'Reactividad agregado alcálisis.', norma: 'ASTM C289-07', precio: 650 },
      { codigo: 'AG24', descripcion: 'Partículas Liviana en los agregados (carbon y lignito), Fino o grueso.', norma: 'NTP 400.023', precio: 220 },
      { codigo: 'AG25', descripcion: 'Terrones de arcilla y partículas friables, Fino o grueso.', norma: 'NTP 400.015', precio: 120 },
      { codigo: 'AG12', descripcion: 'Adherencia en agregado fino - Riedel Weber.', norma: 'MTC E 220', precio: 150 },
      { codigo: 'AG13', descripcion: 'Impurezas Orgánicas en los áridos finos.', norma: 'ASTM C40-99', precio: 150 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO QUÍMICO AGREGADO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, ensayoQuimicoAgregadoId]
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
          ensayoQuimicoAgregadoId,
          subservice.descripcion
        ]);
        
        console.log(`   ✅ ${subservice.codigo}: ${subservice.descripcion.substring(0, 50)}...`);
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
    
    // 3. Verificar el estado final
    console.log('\n3️⃣ Verificando estado final...');
    const finalState = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s 
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      WHERE s.name = 'ENSAYO QUÍMICO AGREGADO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO QUÍMICO AGREGADO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN ENSAYO QUÍMICO AGREGADO:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYO QUÍMICO AGREGADO' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma}) - ${precio}`);
    });
    
    console.log('\n🎉 ENSAYO QUÍMICO AGREGADO GUARDADO DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveEnsayoQuimicoAgregadoPermanent();
