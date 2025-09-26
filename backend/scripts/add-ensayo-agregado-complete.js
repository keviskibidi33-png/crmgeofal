const pool = require('../config/db');

async function addEnsayoAgregadoComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO AGREGADO COMPLETO...\n');
    
    // 1. Obtener ID de ENSAYO AGREGADO
    const agregadoResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO AGREGADO'");
    const agregadoId = agregadoResult.rows[0].id;
    console.log(`✅ ID de ENSAYO AGREGADO: ${agregadoId}`);
    
    // 2. Datos completos de ENSAYO AGREGADO según tus datos
    const subservicesData = [
      { codigo: 'AG08A', descripcion: 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.', norma: 'NTP 400.016', precio: 350 },
      { codigo: 'AG08B', descripcion: 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.', norma: 'NTP 400.016', precio: 350 },
      { codigo: 'AG09', descripcion: 'Índice de Durabilidad Agregado.', norma: 'MTC E-214', precio: 350 },
      { codigo: 'AG18', descripcion: 'Gravedad específica y absorción del agregado fino (*).', norma: 'ASTM C128-22', precio: 150 },
      { codigo: 'AG19', descripcion: 'Análisis granulométrico por tamizado en agregado (*).', norma: 'ASTM C136/C136M-19', precio: 100 },
      { codigo: 'AG20', descripcion: 'Contenido de humedad en agregado (*).', norma: 'ASTM C566-19', precio: 30 },
      { codigo: 'AG22', descripcion: 'Peso Unitario y Vacío de agregados (*).', norma: 'ASTM C29/C29M-23', precio: 120 },
      { codigo: 'AG23', descripcion: 'Pasante de la malla No.200 (*).', norma: 'ASTM C117-23', precio: 120 },
      { codigo: 'AG26', descripcion: 'Abrasión los Ángeles de agregado grueso de gran tamaño (*).', norma: 'ASTM C535-16 (Reapproved 2024)', precio: 350 },
      { codigo: 'AG28', descripcion: 'Gravedad especifica y absorción de agregado grueso (*).', norma: 'ASTM C127-24', precio: 120 },
      { codigo: 'AG31', descripcion: 'Índice de espesor del agregado grueso.', norma: 'NTP 400.041', precio: 90 },
      { codigo: 'AG32', descripcion: 'Carbón y Lignito en agregado fino (OBSOLETO)', norma: 'MTC E215', precio: 120 },
      { codigo: 'AG33', descripcion: 'Angularidad del agregado fino.', norma: 'MTC E222', precio: 120 },
      { codigo: 'AG34', descripcion: 'Partículas planas y alargadas en agregado grueso (*).', norma: 'ASTM D4791-19 (Reapproved 2023)', precio: 120 },
      { codigo: 'AG35', descripcion: 'Porcentaje de Caras fracturadas en agregado grueso (*).', norma: 'ASTM D5821-13 (Reapproved 2017)', precio: 120 },
      { codigo: 'AG36', descripcion: 'Abrasión los Ángeles de agregado grueso de tamaño pequeño (*).', norma: 'ASTM C131/C131M-20', precio: 250 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO AGREGADO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, agregadoId]
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
          agregadoId,
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
      WHERE s.name = 'ENSAYO AGREGADO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO AGREGADO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO AGREGADO COMPLETADO');
    console.log('✅ 16 subservicios con códigos AG* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoAgregadoComplete();
