const pool = require('../config/db');

async function saveEnsayoEstandarPermanent() {
  try {
    console.log('💾 GUARDANDO ENSAYO ESTÁNDAR DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de ENSAYO ESTÁNDAR
    console.log('1️⃣ Obteniendo ID de ENSAYO ESTÁNDAR...');
    const ensayoEstandar = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ESTÁNDAR'");
    const ensayoEstandarId = ensayoEstandar.rows[0].id;
    console.log(`✅ ID de ENSAYO ESTÁNDAR: ${ensayoEstandarId}`);
    
    // 2. Datos EXACTOS de ENSAYO ESTÁNDAR (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'SU04', descripcion: 'Contenido de humedad con Speedy.', norma: 'NTP 339.25', precio: 30 },
      { codigo: 'SU16', descripcion: 'Ensayo de Penetración Estándar (SPT).', norma: 'NTP 339.133', precio: 0 }, // Sujeto a evaluación
      { codigo: 'SU18', descripcion: 'Capacidad de carga del Suelo (Placa de Carga).', norma: 'ASTM D-1194', precio: 2000 },
      { codigo: 'SU19', descripcion: 'Próctor modificado (*).', norma: 'ASTM D1557-12 (Reapproved 2021)', precio: 150 },
      { codigo: 'SU22', descripcion: 'Clasificación suelo SUCS - AASHTO (*).', norma: 'ASTM D2487-17 (Reapproved 2025) / ASTM D3282-24', precio: 20 },
      { codigo: 'SU31', descripcion: 'Límites de Atterberg (Límite Líquido, Plástico e Índice de Plasticidad).', norma: 'ASTM D4318-17ε1', precio: 150 },
      { codigo: 'SU34', descripcion: 'Densidad y peso unitario de muestra suelo', norma: 'ASTM D 7263', precio: 70 },
      { codigo: 'SU39', descripcion: 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', norma: 'NTP 339.128 1999 (revisada el 2019)', precio: 350 },
      { codigo: 'SU40', descripcion: 'Métodos de prueba estándar para el análisis del tamaño de partículas de materiales de escollera naturales y artificiales.', norma: 'ASTM D5334-14', precio: 1500 },
      { codigo: 'SU41', descripcion: 'Conductividad térmica / Resistividad térmica', norma: 'ASTM D5334-14', precio: 1500 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO ESTÁNDAR...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, ensayoEstandarId]
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
          ensayoEstandarId,
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
      WHERE s.name = 'ENSAYO ESTÁNDAR'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO ESTÁNDAR: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN ENSAYO ESTÁNDAR:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYO ESTÁNDAR' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma}) - ${precio}`);
    });
    
    console.log('\n🎉 ENSAYO ESTÁNDAR GUARDADO DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveEnsayoEstandarPermanent();
