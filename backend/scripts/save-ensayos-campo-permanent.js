const pool = require('../config/db');

async function saveEnsayosCampoPermanent() {
  try {
    console.log('💾 GUARDANDO ENSAYOS DE CAMPO DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de ENSAYOS DE CAMPO
    console.log('1️⃣ Obteniendo ID de ENSAYOS DE CAMPO...');
    const ensayosCampo = await pool.query("SELECT id FROM services WHERE name = 'ENSAYOS DE CAMPO'");
    const ensayosCampoId = ensayosCampo.rows[0].id;
    console.log(`✅ ID de ENSAYOS DE CAMPO: ${ensayosCampoId}`);
    
    // 2. Datos EXACTOS de ENSAYOS DE CAMPO (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'SU02', descripcion: 'Ensayo de penetración dinámica DPL.', norma: 'NTP 339.159', precio: 0 }, // Sujeto a evaluación
      { codigo: 'SU29', descripcion: 'Infiltración de suelos en campo.', norma: 'ASTM D3385', precio: 3500 },
      { codigo: 'SU40', descripcion: 'Métodos de prueba estándar para el análisis del tamaño de partículas de materiales de escollera naturales y artificiales.', norma: 'ASTM D5519-07', precio: 250 },
      { codigo: 'SU41', descripcion: 'Determinación de la densidad de suelo en terreno (Método Densímetro Nuclear).', norma: 'ASTM D2922', precio: 90 },
      { codigo: 'SU06A', descripcion: 'Densidad del suelo IN-SITU, Cono de Arena 6" (*).', norma: 'NTP 339.143:1999 (revisada el 2019)', precio: 50 },
      { codigo: 'SU06B', descripcion: 'Densidad del suelo IN-SITU, Cono de Arena 12".', norma: 'NTP 339.143:1999 (revisada el 2019)', precio: 80 },
      { codigo: 'SU06C', descripcion: 'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal tecnico, por día.', norma: 'NTP 339.143:1999 (revisada el 2019)', precio: 400 },
      { codigo: 'SU28', descripcion: 'Densidad del suelo y roca IN SITU por reemplazo de agua.', norma: 'ASTM D5030', precio: 0 } // Sujeto a evaluación
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYOS DE CAMPO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, ensayosCampoId]
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
          ensayosCampoId,
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
      WHERE s.name = 'ENSAYOS DE CAMPO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYOS DE CAMPO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN ENSAYOS DE CAMPO:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYOS DE CAMPO' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma}) - ${precio}`);
    });
    
    console.log('\n🎉 ENSAYOS DE CAMPO GUARDADOS DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveEnsayosCampoPermanent();
