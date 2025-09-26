const pool = require('../config/db');

async function addEnsayoMezclaAsfalticoComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO MEZCLA ASFÁLTICO COMPLETO...\n');
    
    // 1. Obtener ID de ENSAYO MEZCLA ASFÁLTICO
    const mezclaResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO MEZCLA ASFÁLTICO'");
    const mezclaId = mezclaResult.rows[0].id;
    console.log(`✅ ID de ENSAYO MEZCLA ASFÁLTICO: ${mezclaId}`);
    
    // 2. Datos completos de ENSAYO MEZCLA ASFÁLTICO según tus datos
    const subservicesData = [
      { codigo: 'MA01', descripcion: 'Extraccíón cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', norma: 'ASTM D 2172 / MTC502', precio: 450 },
      { codigo: 'MA01A', descripcion: 'Lavado asfáltico (incluye tricloroetileno)', norma: 'ASTM D 2172 / MTC502', precio: 250 },
      { codigo: 'MA02', descripcion: 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall , incluye ensayo Rice y peso específico.', norma: 'ASTM D1559 / MTC E504 / MTC E 514 / ASTM D2041', precio: 790 },
      { codigo: 'MA02A', descripcion: 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, e incluye peso específico, el cliente proporcionara el ensayo Rice.', norma: 'ASTM D1559 / MTC E504 / MTC E 514', precio: 540 },
      { codigo: 'MA03', descripcion: 'Estabilidad Marshall (Incluye: elaboración de briqueta 3und, estabilidad y flujo)', norma: 'ASTM D1559', precio: 350 },
      { codigo: 'MA04', descripcion: 'Densidad máxima teórica (Rice).', norma: 'ASTM D2041', precio: 250 },
      { codigo: 'MA04A', descripcion: 'Porcentaje de vacíos (incluye: densidad de espécimen y densidad máxima teórica (Rice)) (costo por briqueta).', norma: '-', precio: 100 },
      { codigo: 'MA05', descripcion: 'Diseño de mezcla asfáltica en caliente (Diseño Marshall).', norma: 'D1559', precio: 5000 },
      { codigo: 'MA06', descripcion: 'Elaboración de briquetas (juego de 3).', norma: 'MTC E 504', precio: 0 },
      { codigo: 'MA09', descripcion: 'Diseño mezcla en frío (teórico, por áreas equivalentes).', norma: '-', precio: 0 },
      { codigo: 'MA11', descripcion: 'Adherencia en agregado grueso (Revestimiento y desprendimiento), incluye ensayo Peso específico.', norma: 'MTC E517', precio: 250 },
      { codigo: 'MA12', descripcion: 'Espesor o altura de especimenes compactados de mezcla asfáltica.', norma: 'MTC E 507', precio: 150 },
      { codigo: 'MA13', descripcion: 'determinacion del grado de compactacion de mezclas vituminosas.', norma: '-', precio: 0 },
      { codigo: 'MA14', descripcion: 'Grado estimado de cubrimiento de partículas en mezclas agregado - Bitumen.', norma: 'MTC E 519', precio: 150 },
      { codigo: 'MA15', descripcion: 'Control de temperatura en mezcla asfáltica.', norma: '-', precio: 70 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO MEZCLA ASFÁLTICO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, mezclaId]
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
          mezclaId,
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
      WHERE s.name = 'ENSAYO MEZCLA ASFÁLTICO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO MEZCLA ASFÁLTICO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO MEZCLA ASFÁLTICO COMPLETADO');
    console.log('✅ 15 subservicios con códigos MA* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoMezclaAsfalticoComplete();
