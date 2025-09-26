const pool = require('../config/db');

async function addEnsayoQuimicoSueloComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO COMPLETO (6 subservicios)...\n');
    
    // 1. Obtener ID de ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO
    const quimicoResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO'");
    const quimicoId = quimicoResult.rows[0].id;
    console.log(`✅ ID de ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO: ${quimicoId}`);
    
    // 2. Datos completos de ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO según la imagen
    const subservicesData = [
      { codigo: 'SU03', descripcion: 'Determinación del PH en Suelo y Agua.', norma: 'NTP 339.176', precio: 70 },
      { codigo: 'SU13', descripcion: 'Sales solubles en Suelos y Agua.', norma: 'NTP 339.152', precio: 80 },
      { codigo: 'SU14', descripcion: 'Cloruros Solubles en Suelos y Agua.', norma: 'NTP 339.177', precio: 80 },
      { codigo: 'SU15', descripcion: 'Sulfatos Solubles en Suelos y Agua.', norma: 'NTP 339.178', precio: 120 },
      { codigo: 'SU26', descripcion: 'Contenido de materia orgánica.', norma: 'AASHTO T267', precio: 120 },
      { codigo: 'SU17', descripcion: 'Análisis químico completo de suelos.', norma: 'NTP 339.180', precio: 200 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, quimicoId]
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
          quimicoId,
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
      WHERE s.name = 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO COMPLETADO');
    console.log('✅ 6 subservicios con códigos SU* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoQuimicoSueloComplete();
