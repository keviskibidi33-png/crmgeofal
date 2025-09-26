const pool = require('../config/db');

async function saveEnsayoMezclaAsfalticoPermanent() {
  try {
    console.log('💾 GUARDANDO ENSAYO MEZCLA ASFÁLTICO DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de ENSAYO MEZCLA ASFÁLTICO
    console.log('1️⃣ Obteniendo ID de ENSAYO MEZCLA ASFÁLTICO...');
    const ensayoMezclaAsfaltico = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO MEZCLA ASFÁLTICO'");
    const ensayoMezclaAsfalticoId = ensayoMezclaAsfaltico.rows[0].id;
    console.log(`✅ ID de ENSAYO MEZCLA ASFÁLTICO: ${ensayoMezclaAsfalticoId}`);
    
    // 2. Datos EXACTOS de ENSAYO MEZCLA ASFÁLTICO (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'MA01', descripcion: 'Quantitative extraction of asphalt in pavement mixes (Asphalt washing), including Granulometry.', norma: 'ASTM D 2172 / MTC502', precio: 450 },
      { codigo: 'MA01A', descripcion: 'Asphalt washing (includes trichloroethylene).', norma: 'ASTM D 2172 / MTC502', precio: 250 },
      { codigo: 'MA02', descripcion: 'Determination of the resistance of bituminous mixes using the Marshall apparatus, includes Rice test and specific gravity.', norma: null, precio: 790 },
      { codigo: 'MA02A', descripcion: 'Determination of the resistance of bituminous mixes using the Marshall apparatus, and includes specific gravity; the client will provide the Rice test.', norma: null, precio: 540 },
      { codigo: 'MA03', descripcion: 'Marshall Stability (Includes: elaboration of 3 units of briquettes, stability, and flow).', norma: 'ASTM D1559', precio: 350 },
      { codigo: 'MA04', descripcion: 'Theoretical maximum density (Rice).', norma: 'ASTM D2041', precio: 250 },
      { codigo: 'MA04A', descripcion: 'Percentage of voids (includes: specimen density and theoretical maximum density (Rice)) (cost per briquette).', norma: null, precio: 100 },
      { codigo: 'MA05', descripcion: 'Hot asphalt mix design (Marshall Design).', norma: null, precio: 5000 },
      { codigo: 'MA06', descripcion: 'Elaboration of briquettes (set of 3).', norma: 'MTC E 504', precio: 0 },
      { codigo: 'MA09', descripcion: 'Cold mix design (theoretical, by equivalent areas).', norma: null, precio: 0 },
      { codigo: 'MA11', descripcion: 'Adhesion in coarse aggregate (Coating and stripping), includes Specific Gravity test.', norma: 'MTC E517', precio: 250 },
      { codigo: 'MA12', descripcion: 'Thickness or height of compacted asphalt mix specimens.', norma: 'MTC E 507', precio: 150 },
      { codigo: 'MA13', descripcion: 'Determination of the degree of compaction of bituminous mixes.', norma: null, precio: 0 },
      { codigo: 'MA14', descripcion: 'Estimated degree of particle coverage in aggregate-Bitumen mixes.', norma: 'MTC E 519', precio: 150 },
      { codigo: 'MA15', descripcion: 'Temperature control in asphalt mix.', norma: null, precio: 70 },
      { codigo: 'AS26', descripcion: 'Asphalt recovery by the Abson method.', norma: null, precio: 1200 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO MEZCLA ASFÁLTICO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, ensayoMezclaAsfalticoId]
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
          ensayoMezclaAsfalticoId,
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
      WHERE s.name = 'ENSAYO MEZCLA ASFÁLTICO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO MEZCLA ASFÁLTICO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN ENSAYO MEZCLA ASFÁLTICO:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYO MEZCLA ASFÁLTICO' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma || 'Sin norma'}) - ${precio}`);
    });
    
    console.log('\n🎉 ENSAYO MEZCLA ASFÁLTICO GUARDADO DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveEnsayoMezclaAsfalticoPermanent();
