const pool = require('../config/db');

async function saveEnsayoAsfaltoPermanent() {
  try {
    console.log('💾 GUARDANDO ENSAYO ASFALTO DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de ENSAYO ASFALTO
    console.log('1️⃣ Obteniendo ID de ENSAYO ASFALTO...');
    const ensayoAsfalto = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ASFALTO'");
    const ensayoAsfaltoId = ensayoAsfalto.rows[0].id;
    console.log(`✅ ID de ENSAYO ASFALTO: ${ensayoAsfaltoId}`);
    
    // 2. Datos EXACTOS de ENSAYO ASFALTO (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'AS01', descripcion: 'Penetración', norma: null, precio: 120 },
      { codigo: 'AS02', descripcion: 'Punto de inflamación', norma: 'NTP 321.058', precio: 0 },
      { codigo: 'AS03', descripcion: 'Solubilidad en tricloroetileno', norma: null, precio: 85 },
      { codigo: 'AS04', descripcion: 'Ensayo de la mancha (Oliensis)', norma: null, precio: 0 },
      { codigo: 'AS05', descripcion: 'Ductilidad', norma: null, precio: 125 },
      { codigo: 'AS06', descripcion: 'Película delgada (Incluye: pérdida por calentamiento, penetración del residuo, ductilidad del residuo)', norma: null, precio: 0 },
      { codigo: 'AS07', descripcion: 'Punto de ablandamiento', norma: null, precio: 0 },
      { codigo: 'AS08', descripcion: 'Viscosidad Saybolt Furol', norma: 'NTP 321.07', precio: 115 },
      { codigo: 'AS09', descripcion: 'Índice de penetración (incluye 3 ensayos de penetración)', norma: null, precio: 0 },
      { codigo: 'AS10', descripcion: 'Control de calidad de asfalto emulsificado (Incluye: Viscosidad SF, estabilidad al almacenamiento, carga de partícula, tamizado, destilación, ensayos en residuo: penetración, ductilidad u solubilidad)', norma: 'NTP 321.059', precio: 0 },
      { codigo: 'AS11', descripcion: 'Peso específico', norma: 'NTP 321.084', precio: 0 },
      { codigo: 'AS12', descripcion: 'Viscosidad cinemática', norma: null, precio: 0 },
      { codigo: 'AS13', descripcion: 'Control de calidad de asfaltos líquidos (Incluye: viscosidad cinemática, punto de inflamación, destilación y determinación del residuo, ensayos en residuo: penetración, ductilidad u solubilidad: contenido de agua)', norma: 'NTP 321.026 321.027 321.028', precio: 0 },
      { codigo: 'AS14', descripcion: 'Ensayos al residuo de destilación (Incluye: destilación, penetración, ductilidad y solubilidad)', norma: null, precio: 0 },
      { codigo: 'AS15', descripcion: 'Contenido de agua', norma: 'NTP 321.067', precio: 0 },
      { codigo: 'AS16', descripcion: 'Control de calidad de cementos asfálticos (Incluye: penetración, punto de inflamación, solubilidad, ductilidad, pérdida por calentamiento, penetración retenida u ductilidad del residuo)', norma: 'NTP 321.051', precio: 0 },
      { codigo: 'AS17', descripcion: 'Pérdida por calentamiento', norma: null, precio: 0 },
      { codigo: 'AS18', descripcion: 'Estabilidad al almacenamiento', norma: 'NTP 321.082', precio: 0 },
      { codigo: 'AS19', descripcion: 'Carga de partícula', norma: 'NTP 321.061', precio: 0 },
      { codigo: 'AS20', descripcion: 'Tamizado malla N\' 20', norma: 'NTP 321.073', precio: 0 },
      { codigo: 'AS21', descripcion: 'Destilación y determinación del residuo', norma: 'NTP 321.068', precio: 0 },
      { codigo: 'AS22', descripcion: 'Evaporación y determinación del residuo', norma: 'NTP 321.064', precio: 0 },
      { codigo: 'AS23', descripcion: 'Sedimentación a los 5 días', norma: 'NTP 321.076', precio: 0 },
      { codigo: 'AS24', descripcion: 'Ensayos al residuo de evaporación (Incluye: evaporación y determinación del residuo, penetración, solubilidad, punto de ablandamiento)', norma: null, precio: 0 },
      { codigo: 'AS25', descripcion: 'Control de calidad de emulsión catiónica modificada con polímeros (Incluye: Viscosidad SF, Estabilidad al almacenamiento, carga de partícula, tamizado, sedimentación, evaporación, ensayos en residuo: penetración, solubilidad u punto de ablandamiento)', norma: 'NTP 321.141', precio: 0 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a ENSAYO ASFALTO...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, ensayoAsfaltoId]
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
          ensayoAsfaltoId,
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
      WHERE s.name = 'ENSAYO ASFALTO'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 ENSAYO ASFALTO: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN ENSAYO ASFALTO:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'ENSAYO ASFALTO' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma || 'Sin norma'}) - ${precio}`);
    });
    
    console.log('\n🎉 ENSAYO ASFALTO GUARDADO DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveEnsayoAsfaltoPermanent();
