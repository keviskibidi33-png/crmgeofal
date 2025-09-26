const pool = require('../config/db');

async function validateRealCounts() {
  try {
    console.log('🔍 VALIDANDO CONTEOS REALES SEGÚN LAS IMÁGENES...\n');
    
    // Según las imágenes que proporcionaste:
    // ENSAYO ESTÁNDAR: 20 subservicios (códigos SU*)
    // ENSAYOS ESPECIALES: 16 subservicios (códigos EE*)
    // ENSAYOS DE CAMPO: 8 subservicios (códigos SU*)
    // ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO: 6 subservicios (códigos SU*)
    
    console.log('1️⃣ VERIFICANDO ESTADO ACTUAL DE LA BD:');
    
    const currentState = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      WHERE s.name IN ('ENSAYO ESTÁNDAR', 'ENSAYOS ESPECIALES', 'ENSAYOS DE CAMPO', 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO')
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);
    
    console.log('   📊 ESTADO ACTUAL:');
    currentState.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.subservices_count} subservicios`);
    });
    
    // 2. Verificar qué códigos tenemos realmente
    console.log('\n2️⃣ CÓDIGOS REALES EN CADA SERVICIO:');
    
    for (const serviceName of ['ENSAYO ESTÁNDAR', 'ENSAYOS ESPECIALES', 'ENSAYOS DE CAMPO', 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO']) {
      const codesResult = await pool.query(`
        SELECT codigo FROM subservices 
        WHERE service_id = (SELECT id FROM services WHERE name = $1) 
        AND is_active = true 
        ORDER BY codigo
      `, [serviceName]);
      
      const codes = codesResult.rows.map(row => row.codigo);
      console.log(`   ${serviceName}: ${codes.join(', ')}`);
    }
    
    // 3. Verificar si hay subservicios en "OTROS SERVICIOS" que deberían estar en otros
    console.log('\n3️⃣ VERIFICANDO "OTROS SERVICIOS":');
    
    const otrosServiciosResult = await pool.query(`
      SELECT sub.codigo, sub.descripcion
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE s.name = 'OTROS SERVICIOS' AND sub.is_active = true
      ORDER BY sub.codigo
    `);
    
    if (otrosServiciosResult.rows.length > 0) {
      console.log(`   ⚠️  "OTROS SERVICIOS" tiene ${otrosServiciosResult.rows.length} subservicios:`);
      otrosServiciosResult.rows.forEach(row => {
        console.log(`     - ${row.codigo}: ${row.descripcion.substring(0, 50)}...`);
      });
    } else {
      console.log('   ✅ "OTROS SERVICIOS" está vacío');
    }
    
    // 4. Verificar si hay subservicios duplicados o mal asignados
    console.log('\n4️⃣ VERIFICANDO DUPLICADOS Y MALAS ASIGNACIONES:');
    
    // Buscar subservicios con códigos que no coinciden con el servicio
    const mismatchedCodes = await pool.query(`
      SELECT s.name as service_name, sub.codigo, sub.descripcion
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE sub.is_active = true
      AND (
        (s.name = 'ENSAYO ESTÁNDAR' AND NOT (sub.codigo LIKE 'ES%' OR sub.codigo LIKE 'SU%'))
        OR (s.name = 'ENSAYOS ESPECIALES' AND NOT sub.codigo LIKE 'EE%')
        OR (s.name = 'ENSAYOS DE CAMPO' AND NOT sub.codigo LIKE 'SU%')
        OR (s.name = 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' AND NOT sub.codigo LIKE 'SU%')
      )
    `);
    
    if (mismatchedCodes.rows.length > 0) {
      console.log('   ⚠️  Subservicios con códigos que no coinciden:');
      mismatchedCodes.rows.forEach(row => {
        console.log(`     - ${row.service_name}: ${row.codigo} - ${row.descripcion.substring(0, 50)}...`);
      });
    } else {
      console.log('   ✅ Todos los códigos coinciden con sus servicios');
    }
    
    // 5. Verificar totales
    console.log('\n5️⃣ TOTALES GENERALES:');
    
    const totalServices = await pool.query('SELECT COUNT(*) FROM services');
    const totalSubservices = await pool.query('SELECT COUNT(*) FROM subservices WHERE is_active = true');
    
    console.log(`   Servicios totales: ${totalServices.rows[0].count}`);
    console.log(`   Subservicios activos: ${totalSubservices.rows[0].count}`);
    
    // 6. Mostrar distribución completa
    console.log('\n6️⃣ DISTRIBUCIÓN COMPLETA:');
    
    const fullDistribution = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      GROUP BY s.id, s.name
      ORDER BY subservices_count DESC, s.name
    `);
    
    fullDistribution.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.subservices_count} subservicios`);
    });
    
    console.log('\n🎯 CONCLUSIÓN:');
    console.log('   Según las imágenes, los conteos deberían ser:');
    console.log('   - ENSAYO ESTÁNDAR: 20 subservicios (códigos SU*)');
    console.log('   - ENSAYOS ESPECIALES: 16 subservicios (códigos EE*)');
    console.log('   - ENSAYOS DE CAMPO: 8 subservicios (códigos SU*)');
    console.log('   - ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO: 6 subservicios (códigos SU*)');
    
  } catch (error) {
    console.error('❌ Error validando conteos:', error.message);
  } finally {
    await pool.end();
  }
}

validateRealCounts();
