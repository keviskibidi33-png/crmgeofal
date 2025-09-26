const pool = require('../config/db');

async function fixEnsayosEspecialesCorrect() {
  try {
    console.log('🔧 CORRIGIENDO ENSAYOS ESPECIALES CON DATOS CORRECTOS...\n');
    
    // 1. Obtener ID de ENSAYOS ESPECIALES
    const especialesResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYOS ESPECIALES'");
    const especialesId = especialesResult.rows[0].id;
    console.log(`✅ ID de ENSAYOS ESPECIALES: ${especialesId}`);
    
    // 2. Eliminar todos los subservicios actuales
    console.log('\n2️⃣ Eliminando subservicios incorrectos...');
    const deleteResult = await pool.query(
      'DELETE FROM subservices WHERE service_id = $1',
      [especialesId]
    );
    console.log(`   ✅ Eliminados ${deleteResult.rowCount} subservicios incorrectos`);
    
    // 3. Agregar los subservicios correctos según tus datos
    console.log('\n3️⃣ Agregando subservicios correctos...');
    
    const subservicesData = [
      { codigo: 'SU33', descripcion: 'Compresión no confinada.', norma: 'NTP 339.167', precio: 250 },
      { codigo: 'SU37', descripcion: 'California Bearing Ratio (CBR) (*).', norma: 'ASTM D1883-21', precio: 300 },
      { codigo: 'SU05', descripcion: 'Corte Directo.', norma: 'NTP 339.171', precio: 350 },
      { codigo: 'EE01', descripcion: 'Conductividad eléctrica.', norma: '-', precio: 250 },
      { codigo: 'EE02', descripcion: 'Resistividad eléctrica.', norma: 'Electrodo', precio: 550 },
      { codigo: 'EE03', descripcion: 'Compresión inconfinada en suelos cohesivos.', norma: 'ASTM D2166', precio: 190 },
      { codigo: 'EE04', descripcion: 'Compresión triaxial no consolidado no drenado UU.', norma: 'ASTM D2850', precio: 1500 },
      { codigo: 'EE05', descripcion: 'Compresión triaxial consolidado no drenado CU.', norma: 'ASTM D4767', precio: 2000 },
      { codigo: 'EE06', descripcion: 'Compresión triaxial consolidado drenado CD.', norma: 'ASTM D7181', precio: 0 },
      { codigo: 'EE07', descripcion: 'Colapso.', norma: 'ASTM D5333', precio: 370 },
      { codigo: 'EE08', descripcion: 'Consolidación unidimensional.', norma: 'ASTM D2435', precio: 800 },
      { codigo: 'EE09', descripcion: 'Expansión libre.', norma: 'ASTM D4546', precio: 350 },
      { codigo: 'EE10', descripcion: 'Expansión controlada Método A.', norma: 'ASTM D4546', precio: 670 },
      { codigo: 'EE11', descripcion: 'Conductividad hidráulica en pared flexible (Permeabilidad).', norma: 'ASTM D5084', precio: 640 },
      { codigo: 'EE12', descripcion: 'Conductividad hidráulica en pared rígida (Permeabilidad).', norma: 'ASTM D2434', precio: 530 },
      { codigo: 'EE13', descripcion: 'Ensayo resistividad eléctrica (5 perfiles).', norma: '-', precio: 700 },
      { codigo: 'EE14', descripcion: 'Conductividad térmica / Resistividad térmica.', norma: 'ASTM D5334-14', precio: 1500 }
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
          especialesId,
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
      WHERE s.name = 'ENSAYOS ESPECIALES'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYOS ESPECIALES: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYOS ESPECIALES CORREGIDO');
    console.log('✅ Subservicios corregidos con datos exactos');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixEnsayosEspecialesCorrect();
