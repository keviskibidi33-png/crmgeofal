const pool = require('../config/db');

async function addAS26Missing() {
  try {
    console.log('💾 AGREGANDO AS26 FALTANTE EN ENSAYO ASFALTO...\n');
    
    // 1. Obtener ID de ENSAYO ASFALTO
    const asfaltoResult = await pool.query("SELECT id FROM services WHERE name = 'ENSAYO ASFALTO'");
    const asfaltoId = asfaltoResult.rows[0].id;
    console.log(`✅ ID de ENSAYO ASFALTO: ${asfaltoId}`);
    
    // 2. Agregar AS26 faltante
    const subserviceData = {
      codigo: 'AS26',
      descripcion: 'Recuperación de asfalto por el método de abson.',
      norma: '-',
      precio: 1200
    };
    
    console.log(`\n2️⃣ Agregando AS26 a ENSAYO ASFALTO...`);
    
    try {
      // Verificar si ya existe
      const existing = await pool.query(
        'SELECT id FROM subservices WHERE codigo = $1 AND service_id = $2', 
        [subserviceData.codigo, asfaltoId]
      );
      
      if (existing.rows.length > 0) {
        console.log(`   ⚠️  AS26: Ya existe (omitido)`);
        return;
      }
      
      // Insertar subservicio
      await pool.query(`
        INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [
        subserviceData.codigo,
        subserviceData.descripcion,
        subserviceData.norma,
        subserviceData.precio,
        asfaltoId,
        subserviceData.descripcion
      ]);
      
      console.log(`   ✅ AS26: ${subserviceData.descripcion} (${subserviceData.norma}) - S/ ${subserviceData.precio}`);
      
    } catch (error) {
      if (error.code === '23505') { // Código duplicado
        console.log(`   ⚠️  AS26: Ya existe (omitido)`);
      } else {
        console.error(`   ❌ Error agregando AS26:`, error.message);
      }
    }
    
    // 3. Verificar estado final
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
    
    console.log('\n🎉 AS26 AGREGADO');
    console.log('✅ Subservicio AS26 agregado a ENSAYO ASFALTO');
    console.log('✅ ENSAYO ASFALTO ahora tiene 26 subservicios');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addAS26Missing();
