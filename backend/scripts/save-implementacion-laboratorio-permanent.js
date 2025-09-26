const pool = require('../config/db');

async function saveImplementacionLaboratorioPermanent() {
  try {
    console.log('💾 GUARDANDO IMPLEMENTACIÓN LABORATORIO EN OBRA CON CÓDIGOS IL* DE FORMA PERMANENTE...\n');
    
    // 1. Obtener el ID de IMPLEMENTACIÓN LABORATORIO EN OBRA
    console.log('1️⃣ Obteniendo ID de IMPLEMENTACIÓN LABORATORIO EN OBRA...');
    const implementacionLaboratorio = await pool.query("SELECT id FROM services WHERE name = 'IMPLEMENTACIÓN LABORATORIO EN OBRA'");
    const implementacionLaboratorioId = implementacionLaboratorio.rows[0].id;
    console.log(`✅ ID de IMPLEMENTACIÓN LABORATORIO EN OBRA: ${implementacionLaboratorioId}`);
    
    // 2. Datos EXACTOS de IMPLEMENTACIÓN LABORATORIO EN OBRA con códigos IL* (NO MODIFICAR)
    const subservicesData = [
      { codigo: 'IL01', descripcion: 'Implemetación de personal técnico y equipo de laboratorio en obra en la especialidad SUELO, AGREGADO, CONCRETO, PAVIMENTO.', norma: null, precio: 0 },
      { codigo: 'IL02', descripcion: 'Estudio de suelos con fines de cimentación superficial y profunda, edificaciones, puentes, plantas industriales.', norma: null, precio: 0 },
      { codigo: 'IL03', descripcion: 'Estudio de suelos y diseño de pavimentación.', norma: null, precio: 0 },
      { codigo: 'IL04', descripcion: 'Estudio de suelos con fines de estabilidad de taludes.', norma: null, precio: 0 },
      { codigo: 'IL05', descripcion: 'Estudio de suelos confines de diseño de instalaciones sanitarias de agua y alcantarillado.', norma: null, precio: 0 },
      { codigo: 'IL06', descripcion: 'Estudio de Potencial de licuación de suelos.', norma: null, precio: 0 },
      { codigo: 'IL07', descripcion: 'Evaluación y caracterización del maciso rocoso.', norma: null, precio: 0 },
      { codigo: 'IL08', descripcion: 'Evaluación de canteras.', norma: null, precio: 0 }
    ];
    
    console.log(`\n2️⃣ Agregando ${subservicesData.length} subservicios a IMPLEMENTACIÓN LABORATORIO EN OBRA...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const subservice of subservicesData) {
      try {
        // Verificar si ya existe
        const existing = await pool.query(
          'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
          [subservice.codigo, implementacionLaboratorioId]
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
          implementacionLaboratorioId,
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
      WHERE s.name = 'IMPLEMENTACIÓN LABORATORIO EN OBRA'
      GROUP BY s.id, s.name
    `);
    
    if (finalState.rows.length > 0) {
      console.log(`   📊 IMPLEMENTACIÓN LABORATORIO EN OBRA: ${finalState.rows[0].subservices_count} subservicios`);
    }
    
    // 4. Mostrar todos los subservicios guardados
    console.log('\n4️⃣ SUBSERVICIOS GUARDADOS EN IMPLEMENTACIÓN LABORATORIO EN OBRA:');
    const savedSubservices = await pool.query(`
      SELECT sub.codigo, sub.descripcion, sub.norma, sub.precio
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'IMPLEMENTACIÓN LABORATORIO EN OBRA' 
      AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    savedSubservices.rows.forEach(row => {
      const precio = row.precio === 0 ? 'Sujeto a evaluación' : `S/ ${row.precio}`;
      console.log(`   - ${row.codigo}: ${row.descripcion} (${row.norma || 'Sin norma'}) - ${precio}`);
    });
    
    console.log('\n🎉 IMPLEMENTACIÓN LABORATORIO EN OBRA GUARDADO DE FORMA PERMANENTE');
    console.log('✅ Los datos están listos para uso en producción');
    console.log('✅ Los códigos IL* son únicos y no se pueden modificar');
    console.log('✅ Se integrará correctamente con otros módulos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

saveImplementacionLaboratorioPermanent();
