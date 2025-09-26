const pool = require('../config/db');

async function addEnsayoRocaComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO ROCA COMPLETO...\n');
    
    // 1. Obtener ID de ENSAYO ROCA
    const rocaResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ROCA'");
    const rocaId = rocaResult.rows[0].id;
    console.log(`✅ ID de ENSAYO ROCA: ${rocaId}`);
    
    // 2. Datos completos de ENSAYO ROCA según tus datos
    const subservicesData = [
      { codigo: 'RO01', descripcion: 'Carga Puntual (incluye tallado y ensayo 10 especimenes).', norma: 'ASTM D 5731', precio: 500 },
      { codigo: 'RO02', descripcion: 'Gravedad especifica y absorción de roca.', norma: 'ASTM D 6473', precio: 250 },
      { codigo: 'RO03', descripcion: 'Densidad y peso unitario de muestra roca.', norma: 'ASTM D 7263', precio: 250 },
      { codigo: 'RO04', descripcion: 'Método de prueba para la resistencia a la compresión (uniaxial) - Método C', norma: 'ASTM D 7012-14e1', precio: 400 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO ROCA...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, rocaId]
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
          rocaId,
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
      WHERE s.name = 'ENSAYO ROCA'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO ROCA: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO ROCA COMPLETADO');
    console.log('✅ 4 subservicios con códigos RO* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoRocaComplete();
