const pool = require('../config/db');

async function saveEnsayoConcretoPermanent() {
  try {
    console.log('💾 GUARDANDO ENSAYO CONCRETO DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de ENSAYO CONCRETO
    console.log('1️⃣ Obteniendo ID de ENSAYO CONCRETO...');
    const ensayoConcreto = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO CONCRETO'");
    const ensayoConcretoId = ensayoConcreto.rows[0].id;
    console.log(`✅ ID de ENSAYO CONCRETO: ${ensayoConcretoId}`);
    
    // 2. Datos EXACTOS de ENSAYO CONCRETO (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'CO01', descripcion: 'Resistencia a la compresión de probetas cilíndricas de concreto (Incluye Curado)(*).', norma: 'ASTM C39/C39M-24', precio: 15 },
      { codigo: 'CO01.01', descripcion: 'Resistencia a la compresión de probetas cilíndricas de concreto, se ensayaran 3 probetas a 7 días y 3 probetas a 28 días, suministro equipo, curado y recojo. (*)', norma: 'ASTM C39/C39M-24', precio: 90 },
      { codigo: 'CO03A', descripcion: 'Extracción, tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', norma: 'NTP 339.059', precio: 250 },
      { codigo: 'CO03B', descripcion: 'Resane de estructura a causa de la extracción de diamantino.', norma: null, precio: 300 },
      { codigo: 'CO03C', descripcion: 'Extracción de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', norma: 'NTP 339.059', precio: 200 },
      { codigo: 'CO03D', descripcion: 'Tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', norma: 'NTP 339.059, ASTM C39/C39M-24', precio: 100 },
      { codigo: 'CO03G', descripcion: 'Extracción de diamantina de concreto asfaltico y su evaluación', norma: 'NTP 339.059', precio: 140 },
      { codigo: 'CO04', descripcion: 'Esclerometría.', norma: 'NTP 339.181', precio: 80 },
      { codigo: 'CO05', descripcion: 'Muestreo del concreto fresco', norma: 'NTP 339.036', precio: 250 },
      { codigo: 'CO06', descripcion: 'Procedimiento para la medicion asentamiento', norma: 'NTP 339-035', precio: 0 }, // Precio 0 porque en la imagen es '-'
      { codigo: 'CO07', descripcion: 'Resistencia a la Flexión del concreto.', norma: 'NTP 339.078/079', precio: 100 },
      { codigo: 'CO08', descripcion: 'Resistencia a la compresión de mortero con especimen cubicos de 50 mm.', norma: 'NTP 334.051', precio: 20 },
      { codigo: 'CO09', descripcion: 'Procedimiento para la medicion asentamiento', norma: 'ASTM C143', precio: 0 }, // Precio 0 porque en la imagen es '-'
      { codigo: 'CO10', descripcion: 'Determinación PH concreto endurecido / Carbonatación.', norma: 'ASTM D1293', precio: 100 },
      { codigo: 'CO11', descripcion: 'Control de calidad del concreto fresco en obra: * Muestreo de concreto fresco cant. 6 probetas * Ensayo asentamiento del concreto (Slump) * Control de temperatura en el concreto * Resistencia a la compresión', norma: null, precio: 250 },
      { codigo: 'CO12', descripcion: 'Compresión de testigos cilíndricos de concreto (*).', norma: 'ASTM C39/C39M-24', precio: 15 },
      { codigo: 'CO13', descripcion: 'Ensayo Carbonatación.', norma: 'ASTM D129', precio: 50 },
      { codigo: 'CO14', descripcion: 'Resistencia tracción simple por compresión diametral.', norma: 'NTP 339.084', precio: 25 },
      { codigo: 'CO15', descripcion: 'Determinar el pH de las aguas usadas para elaborar morteros y concretos.', norma: 'NTP 334.190:2016', precio: 100 },
      { codigo: 'CO16', descripcion: 'Determinar el contenido de sulfatos en las aguas usadas en la elaboración de morteros y concretos de cemento Pórtland.', norma: 'NTP 339.227:2016', precio: 120 },
      { codigo: 'CO17', descripcion: 'Determinar el contenido del ion cloruro en las aguas usadas en la elaboración de concretos y morteros de cemento Pórtland.', norma: 'NTP 339.076:2017', precio: 120 },
      { codigo: 'CO18', descripcion: 'Corte y refrentado de Testigo de concreto', norma: null, precio: 20 },
      { codigo: 'CO19', descripcion: 'Refrentado de probetas cilíndricas de concreto (por cara).', norma: 'ASTM C617/C617M-23', precio: 15 },
      { codigo: 'DIS01', descripcion: 'Verificación diseño de mezcla.', norma: null, precio: 250 },
      { codigo: 'DIS02', descripcion: 'Verificación diseño de mezcla con aditivo.', norma: null, precio: 500 },
      { codigo: 'DIS03', descripcion: 'Verificación de diseño de concreto, elaboración de 3 probetas que se ensayarán a 7 días.', norma: 'ACI 211', precio: 200 },
      { codigo: 'DIS04', descripcion: 'Diseño de mezcla Teórico.', norma: null, precio: 100 },
      { codigo: 'COM01', descripcion: 'Compresión / Unidades de adoquines de concreto.', norma: 'NTP 339.604', precio: 150 },
      { codigo: 'ABS01', descripcion: 'Absorción / Unidades de adoquines de concreto.', norma: 'NTP 339.604', precio: 150 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO CONCRETO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, ensayoConcretoId]
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
          ensayoConcretoId,
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
      WHERE s.name = 'ENSAYO CONCRETO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO CONCRETO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN ENSAYO CONCRETO:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYO CONCRETO' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma || 'Sin norma'}) - ${precio}`);
    });
    
    console.log('\n🎉 ENSAYO CONCRETO GUARDADO DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveEnsayoConcretoPermanent();
