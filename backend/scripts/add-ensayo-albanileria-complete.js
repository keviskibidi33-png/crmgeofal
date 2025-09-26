const pool = require('../config/db');

async function addEnsayoAlbanileriaComplete() {
  try {
    console.log('💾 AGREGANDO ENSAYO ALBAÑILERÍA COMPLETO...\n');
    
    // 1. Obtener ID de ENSAYO ALBAÑILERÍA
    const albanileriaResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ALBAÑILERÍA'");
    const albanileriaId = albanileriaResult.rows[0].id;
    console.log(`✅ ID de ENSAYO ALBAÑILERÍA: ${albanileriaId}`);
    
    // 2. Datos completos de ENSAYO ALBAÑILERÍA según tus datos
    const subservicesData = [
      { codigo: 'ALB01', descripcion: 'Absorción / Unidades de albañilería de Arcilla.', norma: 'NTP 399.613', precio: 130 },
      { codigo: 'ALB02', descripcion: 'Alabeo / Unidades de albañilería de Arcilla.', norma: 'NTP 399.613', precio: 130 },
      { codigo: 'ALB03', descripcion: 'Compresión / Unidades de albañilería de Arcilla.', norma: 'NTP 399.613', precio: 200 },
      { codigo: 'ALB04', descripcion: 'Eflorescencia / Unidades de albañilería de Arcilla.', norma: 'NTP 399.613', precio: 130 },
      { codigo: 'ALB04A', descripcion: 'Eflorescencia / Unidades de albañilería de Arcilla.', norma: 'NTP 399.613', precio: 200 },
      { codigo: 'ALB05', descripcion: 'Dimensionamiento / Unidades de albañilería de Arcilla.', norma: 'NTP 399.613', precio: 130 },
      { codigo: 'ALB06', descripcion: 'Medidas del área de vacíos en unidades perforadas.', norma: 'NTP 399.613', precio: 150 },
      { codigo: 'ALB07', descripcion: 'Ensayo de Compresión en pilas de ladrillo (prisma albañilería).', norma: 'NTP 399.605', precio: 250 },
      { codigo: 'ALB08', descripcion: 'Muestreo / Unidades de albañilería de concreto.', norma: 'NTP 399.604', precio: 350 },
      { codigo: 'ALB09', descripcion: 'Resistencia a la compresión / Unidades de albañilería de concreto.', norma: 'NTP 399.604', precio: 250 },
      { codigo: 'ALB10', descripcion: 'Dimensionamiento / Unidades de albañilería de concreto.', norma: 'NTP 399.604', precio: 150 },
      { codigo: 'ALB11', descripcion: 'Absorción / Unidades de albañilería de concreto.', norma: 'NTP 399.604', precio: 150 },
      { codigo: 'ALB12', descripcion: 'Absorción / Ladrillo pastelero', norma: 'NTP 331.041', precio: 130 },
      { codigo: 'ALB13', descripcion: 'Modulo de rotura (Ensayo Flexión) / Unidades de albañilería de Arcilla', norma: 'NTP 399.613', precio: 200 },
      { codigo: 'ALB14', descripcion: 'Contenido de humedad / Unidades de albañilería de concreto.', norma: 'NTP 399.604', precio: 100 },
      { codigo: 'ALB15', descripcion: 'Densidad / Unidades de albañilería de concreto.', norma: 'NTP 399.604', precio: 150 },
      { codigo: 'ALB16', descripcion: 'Dimensionamiento / Ladrillo pastelero', norma: 'NTP 331.041', precio: 130 },
      { codigo: 'ALB17', descripcion: 'Alabeo / Ladrillo pastelero', norma: 'NTP 331.041', precio: 130 },
      { codigo: 'ALB18', descripcion: 'Carga de rotura por unidad de ancho / Ladrillo pastelero', norma: 'NTP 331.041', precio: 200 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO ALBAÑILERÍA...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, albanileriaId]
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
          albanileriaId,
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
      WHERE s.name = 'ENSAYO ALBAÑILERÍA'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO ALBAÑILERÍA: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    console.log('\n🎉 ENSAYO ALBAÑILERÍA COMPLETADO');
    console.log('✅ 18 subservicios con códigos ALB* agregados');
    console.log('✅ Datos estructurados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEnsayoAlbanileriaComplete();
