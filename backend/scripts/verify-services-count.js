const pool = require('../config/db');

async function verifyServicesCount() {
  try {
    console.log('🔍 VERIFICANDO CONTEOS REALES DE SERVICIOS Y SUBSERVICIOS...\n');
    
    // 1. Verificar cada servicio individualmente
    console.log('1️⃣ VERIFICACIÓN DETALLADA POR SERVICIO:');
    
    const servicesToCheck = [
      'ENSAYO ESTÁNDAR',
      'ENSAYOS ESPECIALES', 
      'ENSAYOS DE CAMPO',
      'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO'
    ];
    
    for (const serviceName of servicesToCheck) {
      console.log(`\n📋 ${serviceName}:`);
      
      // Obtener el servicio
      const serviceResult = await pool.query('SELECT id, name FROM services WHERE name = $1', [serviceName]);
      if (serviceResult.rows.length === 0) {
        console.log(`   ❌ Servicio no encontrado`);
        continue;
      }
      
      const serviceId = serviceResult.rows[0].id;
      console.log(`   ID: ${serviceId}`);
      
      // Contar subservicios activos
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM subservices WHERE service_id = $1 AND is_active = true', 
        [serviceId]
      );
      const activeCount = parseInt(countResult.rows[0].count);
      console.log(`   Subservicios activos: ${activeCount}`);
      
      // Mostrar todos los subservicios
      const subservicesResult = await pool.query(`
        SELECT codigo, descripcion, is_active 
        FROM subservices 
        WHERE service_id = $1 
        ORDER BY codigo
      `, [serviceId]);
      
      console.log(`   Lista de subservicios:`);
      subservicesResult.rows.forEach(sub => {
        const status = sub.is_active ? '✅' : '❌';
        console.log(`     ${status} ${sub.codigo}: ${sub.descripcion.substring(0, 50)}...`);
      });
      
      // Contar inactivos
      const inactiveCount = subservicesResult.rows.filter(sub => !sub.is_active).length;
      if (inactiveCount > 0) {
        console.log(`   ⚠️  Subservicios inactivos: ${inactiveCount}`);
      }
    }
    
    // 2. Verificar si hay subservicios duplicados o mal asignados
    console.log('\n2️⃣ VERIFICANDO POSIBLES PROBLEMAS:');
    
    // Buscar subservicios con códigos que no coinciden con el servicio
    const mismatchedCodes = await pool.query(`
      SELECT s.name as service_name, sub.codigo, sub.descripcion
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      WHERE sub.is_active = true
      AND (
        (s.name = 'ENSAYO ESTÁNDAR' AND NOT (sub.codigo LIKE 'ES%' OR sub.codigo LIKE 'EE%'))
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
    
    // 3. Verificar distribución real
    console.log('\n3️⃣ DISTRIBUCIÓN REAL DE SUBSERVICIOS:');
    
    const distributionResult = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as total_subservices,
        COUNT(CASE WHEN sub.is_active = true THEN 1 END) as active_subservices,
        COUNT(CASE WHEN sub.is_active = false THEN 1 END) as inactive_subservices
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id
      WHERE s.name IN ('ENSAYO ESTÁNDAR', 'ENSAYOS ESPECIALES', 'ENSAYOS DE CAMPO', 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO')
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);
    
    distributionResult.rows.forEach(row => {
      console.log(`   ${row.name}:`);
      console.log(`     Total: ${row.total_subservices}, Activos: ${row.active_subservices}, Inactivos: ${row.inactive_subservices}`);
    });
    
    // 4. Verificar si hay subservicios en "OTROS SERVICIOS" que deberían estar en otros
    console.log('\n4️⃣ VERIFICANDO "OTROS SERVICIOS":');
    
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
    
  } catch (error) {
    console.error('❌ Error verificando conteos:', error.message);
  } finally {
    await pool.end();
  }
}

verifyServicesCount();
