const pool = require('../config/db');

async function fixEnsayosCampoCorrect() {
  try {
    console.log('🔧 CORRIGIENDO ENSAYOS DE CAMPO CON DATOS CORRECTOS...\n');
    
    // 1. Obtener ID de ENSAYOS DE CAMPO
    const campoResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYOS DE CAMPO'");
    const campoId = campoResult.rows[0].id;
    console.log(`✅ ID de ENSAYOS DE CAMPO: ${campoId}`);
    
    // 2. Eliminar todos los subservicios actuales
    console.log('\n2️⃣ Eliminando subservicios incorrectos...');
    const deleteResult = await pool.query(
      'DELETE FROM subservices WHERE service_id = $1',
      [campoId]
    );
    console.log(`   ✅ Eliminados ${deleteResult.rowCount} subservicios incorrectos`);
    
    // 3. Agregar los subservicios correctos según tus datos
    console.log('\n3️⃣ Agregando subservicios correctos...');
    
    const subservicesData = [
      { codigo: 'SU02', descripcion: 'Ensayo de penetración dinámica DPL.', norma: 'NTP 339.159', precio: 0 },
      { codigo: 'SU29', descripcion: 'Infiltración de suelos en campo.', norma: 'ASTM D3385', precio: 3500 },
      { codigo: 'SU40', descripcion: 'Métodos de prueba estándar para el análisis del tamaño de partículas de materiales de escollera naturales y artificiales.', norma: 'ASTM D5519-07', precio: 250 },
      { codigo: 'SU41', descripcion: 'Determinación de la densidad de suelo en terreno (Método Densímetro Nuclear).', norma: 'ASTM D2922', precio: 90 },
      { codigo: 'SU06A', descripcion: 'Densidad del suelo IN-SITU, Cono de Arena 6" (*).', norma: 'NTP 339.143:1999 (revisada el 2019)', precio: 50 },
      { codigo: 'SU06B', descripcion: 'Densidad del suelo IN-SITU, Cono de Arena 12".', norma: 'NTP 339.143:1999 (revisada el 2019)', precio: 80 },
      { codigo: 'SU06C', descripcion: 'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal tecnico, por día.', norma: 'NTP 339.143:1999 (revisada el 2019)', precio: 400 },
      { codigo: 'SU28', descripcion: 'Densidad del suelo y roca IN SITU por reemplazo de agua.', norma: 'ASTM D5030', precio: 0 }
    ];
    
    let addedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Insertar subservicio
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [
          subservice.codigo,
          subservice.descripcion,
          subservice.norma,
          subservice.precio,
          campoId,
          subservice.descripcion
        ]);
        
        const precio = subservice.precio === 0 ? 'Sujeto a evaluación' : `S/ ${subservice.precio}`;
        console.log(`   ✅ ${subservice.codigo}: ${subservice.descripcion.substring(0, 50)}... (${subservice.norma}) - ${precio}`);
        addedCount++;
        
      } catch (error) {
        console.error(`   ❌ Error agregando ${subservice.codigo}:`, error.message);
      }
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   ✅ Agregados: ${addedCount}`);
    console.log(`   📋 Total procesados: ${subservicesData.length}`);
    
    // 4. Verificar estado final
    console.log('\n4️⃣ Verificando estado final...');
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
    
    console.log('\n🎉 ENSAYOS DE CAMPO CORREGIDO');
    console.log('✅ Subservicios corregidos con datos exactos');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixEnsayosCampoCorrect();
