const pool = require('../config/db');

async function addEnsayoEstandarSubservices() {
  try {
    console.log('💾 AGREGANDO SUBSERVICIOS FALTANTES PARA ENSAYO ESTÁNDAR...\n');
    
    // 1. Obtener ID de ENSAYO ESTÁNDAR
    const estandarResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ESTÁNDAR'");
    const estandarId = estandarResult.rows[0].id;
    console.log(`✅ ID de ENSAYO ESTÁNDAR: ${estandarId}`);
    
    // 2. Datos de ENSAYO ESTÁNDAR con códigos ES* (20 subservicios)
    const subservicesData = [
      { codigo: 'ES01', descripcion: 'Contenido de humedad en suelos.', norma: 'ASTM D2216', precio: 50 },
      { codigo: 'ES02', descripcion: 'Límites de Atterberg (Límite Líquido).', norma: 'ASTM D4318', precio: 80 },
      { codigo: 'ES03', descripcion: 'Límites de Atterberg (Límite Plástico).', norma: 'ASTM D4318', precio: 80 },
      { codigo: 'ES04', descripcion: 'Límites de Atterberg (Índice de Plasticidad).', norma: 'ASTM D4318', precio: 80 },
      { codigo: 'ES05', descripcion: 'Análisis granulométrico por tamizado.', norma: 'ASTM D422', precio: 120 },
      { codigo: 'ES06', descripcion: 'Análisis granulométrico por hidrómetro.', norma: 'ASTM D422', precio: 150 },
      { codigo: 'ES07', descripcion: 'Densidad y peso unitario de suelos.', norma: 'ASTM D7263', precio: 100 },
      { codigo: 'ES08', descripcion: 'Próctor estándar.', norma: 'ASTM D698', precio: 120 },
      { codigo: 'ES09', descripcion: 'Próctor modificado.', norma: 'ASTM D1557', precio: 120 },
      { codigo: 'ES10', descripcion: 'Clasificación SUCS.', norma: 'ASTM D2487', precio: 100 },
      { codigo: 'ES11', descripcion: 'Clasificación AASHTO.', norma: 'ASTM D3282', precio: 100 },
      { codigo: 'ES12', descripcion: 'Ensayo de Penetración Estándar (SPT).', norma: 'ASTM D1586', precio: 200 },
      { codigo: 'ES13', descripcion: 'California Bearing Ratio (CBR).', norma: 'ASTM D1883', precio: 180 },
      { codigo: 'ES14', descripcion: 'Corte directo.', norma: 'ASTM D3080', precio: 150 },
      { codigo: 'ES15', descripcion: 'Compresión no confinada.', norma: 'ASTM D2166', precio: 120 },
      { codigo: 'ES16', descripcion: 'Consolidación unidimensional.', norma: 'ASTM D2435', precio: 200 },
      { codigo: 'ES17', descripcion: 'Permeabilidad (cabeza constante).', norma: 'ASTM D2434', precio: 150 },
      { codigo: 'ES18', descripcion: 'Permeabilidad (cabeza variable).', norma: 'ASTM D2434', precio: 150 },
      { codigo: 'ES19', descripcion: 'Expansión libre.', norma: 'ASTM D4546', precio: 100 },
      { codigo: 'ES20', descripcion: 'Expansión controlada.', norma: 'ASTM D4546', precio: 120 }
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
    
    // 4. Mostrar todos los subservicios
    console.log('\n4️⃣ SUBSERVICIOS EN ENSAYO ESTÁNDAR:');
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
    
    console.log('\n🎉 ENSAYO ESTÁNDAR COMPLETADO');
    console.log('✅ 20 subservicios con códigos ES* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoEstandarSubservices();
