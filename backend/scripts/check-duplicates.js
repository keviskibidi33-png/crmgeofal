const pool = require('../config/db');

async function checkDuplicates() {
  try {
    console.log('🔍 REVISANDO DUPLICADOS EN SUBSERVICIOS...\n');
    
    // 1. Buscar códigos duplicados
    console.log('1️⃣ Códigos duplicados:');
    const duplicates = await pool.query(`
      SELECT codigo, COUNT(*) as count 
      FROM subservices 
      WHERE is_active = true 
      GROUP BY codigo 
      HAVING COUNT(*) > 1 
      ORDER BY codigo
    `);
    
    if (duplicates.rows.length > 0) {
      duplicates.rows.forEach(row => {
        console.log(`   ❌ ${row.codigo}: ${row.count} veces`);
      });
    } else {
      console.log('   ✅ No hay códigos duplicados');
    }
    
    // 2. Buscar nombres duplicados (restricción uq_subservices_service_name)
    console.log('\n2️⃣ Nombres duplicados (restricción uq_subservices_service_name):');
    const nameDuplicates = await pool.query(`
      SELECT name, service_id, COUNT(*) as count 
      FROM subservices 
      WHERE is_active = true 
      GROUP BY name, service_id 
      HAVING COUNT(*) > 1 
      ORDER BY name
    `);
    
    if (nameDuplicates.rows.length > 0) {
      nameDuplicates.rows.forEach(row => {
        console.log(`   ❌ "${row.name}" en servicio ${row.service_id}: ${row.count} veces`);
      });
    } else {
      console.log('   ✅ No hay nombres duplicados');
    }
    
    // 3. Buscar códigos con "-" (problema específico)
    console.log('\n3️⃣ Códigos con "-":');
    const dashCodes = await pool.query(`
      SELECT codigo, descripcion, name 
      FROM subservices 
      WHERE is_active = true AND codigo = '-'
      ORDER BY id
    `);
    
    if (dashCodes.rows.length > 0) {
      console.log(`   ⚠️  Encontrados ${dashCodes.rows.length} códigos con "-":`);
      dashCodes.rows.forEach(row => {
        console.log(`      "${row.descripcion}" (${row.name})`);
      });
    } else {
      console.log('   ✅ No hay códigos con "-"');
    }
    
    // 4. Total de subservicios
    console.log('\n4️⃣ Total de subservicios:');
    const total = await pool.query(`
      SELECT COUNT(*) as total 
      FROM subservices 
      WHERE is_active = true
    `);
    console.log(`   📊 Total: ${total.rows[0].total} subservicios`);
    
    // 5. Verificar subservicios faltantes según la imagen
    console.log('\n5️⃣ Verificando subservicios de IMPLEMENTACIÓN LABORATORIO:');
    const implementacion = await pool.query(`
      SELECT codigo, descripcion 
      FROM subservices 
      WHERE is_active = true 
      AND (descripcion ILIKE '%implementación%' OR descripcion ILIKE '%estudio de suelos%' OR descripcion ILIKE '%evaluación%')
      ORDER BY codigo
    `);
    
    console.log(`   📋 Encontrados ${implementacion.rows.length} subservicios relacionados:`);
    implementacion.rows.forEach(row => {
      console.log(`      ${row.codigo}: ${row.descripcion.substring(0, 60)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDuplicates();
