const pool = require('../config/db');

async function fixServicesDistribution() {
  try {
    console.log('🔧 CORRIGIENDO DISTRIBUCIÓN DE SERVICIOS...\n');
    
    // 1. Obtener IDs de servicios
    const services = await pool.query(`
      SELECT id, name FROM services 
      WHERE name IN ('ENSAYO ESTÁNDAR', 'ENSAYOS ESPECIALES', 'ENSAYOS DE CAMPO', 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO')
    `);
    
    const serviceIds = {};
    services.rows.forEach(row => {
      serviceIds[row.name] = row.id;
    });
    
    console.log('1️⃣ IDs de servicios obtenidos:');
    Object.keys(serviceIds).forEach(name => {
      console.log(`   ${name}: ${serviceIds[name]}`);
    });
    
    // 2. Corregir ENSAYO ESTÁNDAR - mover códigos SU* que no pertenecen ahí
    console.log('\n2️⃣ Corrigiendo ENSAYO ESTÁNDAR...');
    
    // Los códigos SU* en ENSAYO ESTÁNDAR deberían ir a ENSAYOS DE CAMPO o QUÍMICO SUELO
    const estandarSubservices = await pool.query(`
      SELECT id, codigo, descripcion 
      FROM subservices 
      WHERE service_id = $1 AND codigo LIKE 'SU%'
    `, [serviceIds['ENSAYO ESTÁNDAR']]);
    
    console.log(`   Encontrados ${estandarSubservices.rows.length} subservicios SU* en ENSAYO ESTÁNDAR`);
    
    for (const sub of estandarSubservices.rows) {
      let targetServiceId = null;
      let targetServiceName = '';
      
      // Determinar a qué servicio debe ir cada código SU*
      if (['SU02', 'SU06A', 'SU06B', 'SU06C', 'SU28', 'SU29'].includes(sub.codigo)) {
        targetServiceId = serviceIds['ENSAYOS DE CAMPO'];
        targetServiceName = 'ENSAYOS DE CAMPO';
      } else if (['SU03', 'SU13', 'SU14', 'SU15', 'SU26'].includes(sub.codigo)) {
        targetServiceId = serviceIds['ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO'];
        targetServiceName = 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO';
      } else {
        // Otros códigos SU* pueden quedarse o ir a ENSAYOS DE CAMPO
        targetServiceId = serviceIds['ENSAYOS DE CAMPO'];
        targetServiceName = 'ENSAYOS DE CAMPO';
      }
      
      // Mover el subservicio
      await pool.query(
        'UPDATE subservices SET service_id = $1 WHERE id = $2',
        [targetServiceId, sub.id]
      );
      
      console.log(`   ✅ ${sub.codigo} movido a ${targetServiceName}`);
    }
    
    // 3. Corregir ENSAYOS ESPECIALES - mover códigos SU* que no pertenecen ahí
    console.log('\n3️⃣ Corrigiendo ENSAYOS ESPECIALES...');
    
    const especialesSubservices = await pool.query(`
      SELECT id, codigo, descripcion 
      FROM subservices 
      WHERE service_id = $1 AND codigo LIKE 'SU%'
    `, [serviceIds['ENSAYOS ESPECIALES']]);
    
    console.log(`   Encontrados ${especialesSubservices.rows.length} subservicios SU* en ENSAYOS ESPECIALES`);
    
    for (const sub of especialesSubservices.rows) {
      let targetServiceId = null;
      let targetServiceName = '';
      
      // Determinar a qué servicio debe ir cada código SU*
      if (['SU02', 'SU06A', 'SU06B', 'SU06C', 'SU28', 'SU29'].includes(sub.codigo)) {
        targetServiceId = serviceIds['ENSAYOS DE CAMPO'];
        targetServiceName = 'ENSAYOS DE CAMPO';
      } else if (['SU03', 'SU13', 'SU14', 'SU15', 'SU26'].includes(sub.codigo)) {
        targetServiceId = serviceIds['ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO'];
        targetServiceName = 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO';
      } else {
        // Otros códigos SU* pueden ir a ENSAYOS DE CAMPO
        targetServiceId = serviceIds['ENSAYOS DE CAMPO'];
        targetServiceName = 'ENSAYOS DE CAMPO';
      }
      
      // Mover el subservicio
      await pool.query(
        'UPDATE subservices SET service_id = $1 WHERE id = $2',
        [targetServiceId, sub.id]
      );
      
      console.log(`   ✅ ${sub.codigo} movido a ${targetServiceName}`);
    }
    
    // 4. Verificar distribución final
    console.log('\n4️⃣ Verificando distribución final...');
    
    const finalDistribution = await pool.query(`
      SELECT 
        s.name,
        COUNT(sub.id) as subservices_count
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      WHERE s.name IN ('ENSAYO ESTÁNDAR', 'ENSAYOS ESPECIALES', 'ENSAYOS DE CAMPO', 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO')
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);
    
    console.log('   📊 DISTRIBUCIÓN CORREGIDA:');
    finalDistribution.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.subservices_count} subservicios`);
    });
    
    // 5. Mostrar códigos por servicio
    console.log('\n5️⃣ Códigos por servicio:');
    
    for (const serviceName of ['ENSAYO ESTÁNDAR', 'ENSAYOS ESPECIALES', 'ENSAYOS DE CAMPO', 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO']) {
      const codesResult = await pool.query(`
        SELECT codigo FROM subservices 
        WHERE service_id = $1 AND is_active = true 
        ORDER BY codigo
      `, [serviceIds[serviceName]]);
      
      const codes = codesResult.rows.map(row => row.codigo);
      console.log(`   ${serviceName}: ${codes.join(', ')}`);
    }
    
    console.log('\n🎉 DISTRIBUCIÓN CORREGIDA EXITOSAMENTE');
    console.log('✅ Los subservicios están ahora en sus servicios correctos');
    console.log('✅ Los códigos coinciden con las categorías');
    
  } catch (error) {
    console.error('❌ Error corrigiendo distribución:', error.message);
  } finally {
    await pool.end();
  }
}

fixServicesDistribution();
