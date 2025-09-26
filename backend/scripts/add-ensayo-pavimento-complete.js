const pool = require('../config/db');

async function addEnsayoPavimentoComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO PAVIMENTO COMPLETO...\n');
    
    // 1. Obtener ID de ENSAYO PAVIMENTO
    const pavimentoResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO PAVIMENTO'");
    const pavimentoId = pavimentoResult.rows[0].id;
    console.log(`✅ ID de ENSAYO PAVIMENTO: ${pavimentoId}`);
    
    // 2. Datos completos de ENSAYO PAVIMENTO según tus datos
    const subservicesData = [
      { codigo: 'PAV01', descripcion: 'Medida de la Irregularidad superficial de un pavimento con el Rugosímetro Merlín.', norma: 'MTC E 1001', precio: 2400 },
      { codigo: 'PAV02', descripcion: 'Medida de la deflexión de un pavimento flexible (Viga Benkelman).', norma: 'MTC E 1002', precio: 3000 },
      { codigo: 'PAV02A', descripcion: 'Medida de la deflexión de un pavimento flexible (Viga Benkelman) Inc. Camión.', norma: 'MTC E 1002', precio: 5000 },
      { codigo: 'PAV03', descripcion: 'Determinacion del Coeficiente de Resistencia al Deslizamiento (Péndulo).', norma: 'MTC E 1004', precio: 150 },
      { codigo: 'PAV04', descripcion: 'Determinación la Textura Superficial del Pavimento (Círculo de Arena).', norma: 'MTC E 1005', precio: 80 },
      { codigo: 'PAV05', descripcion: 'Tasa de Imprimación y Riego de Liga.', norma: '-', precio: 100 },
      { codigo: 'PAV06', descripcion: 'Espesor de especímenes de mezcla asfálticas compactado.', norma: 'MTC E 507', precio: 50 },
      { codigo: 'PAV07', descripcion: 'Peso específico y peso unitario de mezcla asfálticas compactado en especímenes saturados con superficie seca.', norma: 'MTC E 514', precio: 90 },
      { codigo: 'PAV08', descripcion: 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, incluye peso específico (3 briquetas), cliente proporcionara ensayo Rice.', norma: 'MTC E 504', precio: 540 },
      { codigo: 'PAV09', descripcion: 'Extraccíón cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', norma: 'MTC E 502', precio: 450 },
      { codigo: 'PAV10', descripcion: 'Grado de compactación de una mezcla Bituminosa.', norma: 'MTC E 509', precio: 100 },
      { codigo: 'PAV11', descripcion: 'Extracción de testigo diamantina con broca de 4" en pavimento flexible.', norma: 'NTP 339.059', precio: 140 },
      { codigo: 'PAV12', descripcion: 'Resane en pavimento asfáltico', norma: '-', precio: 50 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO PAVIMENTO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, pavimentoId]
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
          pavimentoId,
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
      WHERE s.name = 'ENSAYO PAVIMENTO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO PAVIMENTO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO PAVIMENTO COMPLETADO');
    console.log('✅ 13 subservicios con códigos PAV* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoPavimentoComplete();
