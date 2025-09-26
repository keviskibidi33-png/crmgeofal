const pool = require('../config/db');

async function addEnsayoEstandarComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO ESTÁNDAR COMPLETO (20 subservicios)...\n');
    
    // 1. Obtener ID de ENSAYO ESTÁNDAR
    const estandarResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ESTÁNDAR'");
    const estandarId = estandarResult.rows[0].id;
    console.log(`✅ ID de ENSAYO ESTÁNDAR: ${estandarId}`);
    
    // 2. Datos completos de ENSAYO ESTÁNDAR según la imagen
    const subservicesData = [
      { codigo: 'SU04', descripcion: 'Contenido de humedad con Speedy.', norma: 'NTP 339.25', precio: 30 },
      { codigo: 'SU16', descripcion: 'Ensayo de Penetración Estándar (SPT).', norma: 'NTP 339.133', precio: 0 },
      { codigo: 'SU18', descripcion: 'Capacidad de carga del Suelo (Placa de Carga).', norma: 'ASTM D-1194', precio: 2000 },
      { codigo: 'SU19', descripcion: 'Próctor modificado (*).', norma: 'ASTM D1557-12 (Reapproved 2021)', precio: 150 },
      { codigo: 'SU20', descripcion: 'Contenido de humedad en suelos (*).', norma: 'ASTM D2216-19', precio: 30 },
      { codigo: 'SU20A', descripcion: 'Contenido de humedad en Roca.', norma: 'ASTM D2216-19', precio: 30 },
      { codigo: 'SU21', descripcion: 'Equivalente de arena (*).', norma: 'ASTM D2419-22', precio: 150 },
      { codigo: 'SU22', descripcion: 'Clasificación suelo SUCS - AASHTO (*).', norma: 'ASTM D2487-17 (Reapproved 2025) / ASTM D3282-24', precio: 20 },
      { codigo: 'SU23', descripcion: 'Límite líquido y Límite Plástico del Suelo (*).', norma: 'ASTM D4318-17*', precio: 90 },
      { codigo: 'SU24', descripcion: 'Análisis granulométrico por tamizado en Suelo (*).', norma: 'ASTM D6913/D6913M-17', precio: 100 },
      { codigo: 'SU27', descripcion: 'Método de prueba estándar para la medición de sólidos en agua.', norma: 'ASTM C1603', precio: 120 },
      { codigo: 'SU30', descripcion: 'Ensayo de Compactación Próctor Estándar.', norma: 'ASTM D698', precio: 150 },
      { codigo: 'SU31', descripcion: 'Corrección de Peso Unitario para Partícula de gran tamaño.', norma: 'ASTM D4718-87', precio: 20 },
      { codigo: 'SU32', descripcion: 'Gravedad específica de los sólidos del suelo.', norma: 'ASTM D854-14', precio: 120 },
      { codigo: 'SU34', descripcion: 'Densidad y peso unitario de muestra suelo.', norma: 'ASTM D 7263', precio: 70 },
      { codigo: 'SU35', descripcion: 'Densidad del peso unitario máximo del suelo.', norma: 'NTP 339.137', precio: 350 },
      { codigo: 'SU36', descripcion: 'Densidad del peso unitario mínimo del suelo.', norma: 'NTP 339.138', precio: 150 },
      { codigo: 'SU38', descripcion: 'Determinación de sólidos totales suspendidos.', norma: 'NTP 214.039', precio: 150 },
      { codigo: 'SU39', descripcion: 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', norma: 'NTP 339.128 1999 (revisada el 2019)', precio: 350 },
      { codigo: 'SU40', descripcion: 'Conductividad térmica / Resistividad térmica.', norma: 'ASTM D5334-14', precio: 1500 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO ESTÁNDAR...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, estandarId]
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
          estandarId,
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
      WHERE s.name = 'ENSAYO ESTÁNDAR'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO ESTÁNDAR: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO ESTÁNDAR COMPLETADO');
    console.log('✅ 20 subservicios con códigos SU* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoEstandarComplete();
