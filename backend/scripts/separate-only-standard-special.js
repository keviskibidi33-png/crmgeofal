const pool = require('../config/db');

async function separateOnlyStandardSpecial() {
  console.log('🔧 SEPARANDO SOLO ENSAYOS ESTÁNDAR Y ESPECIALES\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Primero limpiar marcadores anteriores
    console.log('\n2️⃣ Limpiando marcadores anteriores...');
    await pool.query(`
      UPDATE subservices 
      SET descripcion = REPLACE(REPLACE(descripcion, ' [ESTÁNDAR]', ''), ' [ESPECIAL]', '')
      WHERE service_id = $1
    `, [serviceId]);
    console.log('✅ Marcadores anteriores eliminados');

    // 3. Definir solo ENSAYOS ESTÁNDAR (SU específicos)
    console.log('\n3️⃣ Marcando ENSAYOS ESTÁNDAR...');
    const standardCodes = [
      'SU04', 'SU16', 'SU18', 'SU19', 'SU20', 'SU20A', 'SU21', 'SU22', 'SU23', 'SU24',
      'SU27', 'SU30', 'SU31', 'SU32', 'SU34', 'SU35', 'SU36', 'SU38', 'SU39'
    ];

    let standardCount = 0;
    for (const codigo of standardCodes) {
      try {
        const result = await pool.query(`
          UPDATE subservices 
          SET descripcion = CONCAT(descripcion, ' [ESTÁNDAR]')
          WHERE codigo = $1 AND service_id = $2
        `, [codigo, serviceId]);
        
        if (result.rowCount > 0) {
          console.log(`   ✅ ${codigo}: Marcado como ESTÁNDAR`);
          standardCount++;
        } else {
          console.log(`   ⚠️  ${codigo}: No encontrado`);
        }
      } catch (error) {
        console.log(`   ❌ ${codigo}: Error - ${error.message}`);
      }
    }

    // 4. Definir solo ENSAYOS ESPECIALES (EE y algunos SU especiales)
    console.log('\n4️⃣ Marcando ENSAYOS ESPECIALES...');
    const specialCodes = [
      'SU33', 'SU37', 'EE01', 'EE02', 'EE03', 'EE04', 'EE05', 'EE06', 'EE07', 'EE08',
      'EE09', 'EE10', 'EE11', 'EE12', 'EE13', 'EE14', 'EE15'
    ];

    let specialCount = 0;
    for (const codigo of specialCodes) {
      try {
        const result = await pool.query(`
          UPDATE subservices 
          SET descripcion = CONCAT(descripcion, ' [ESPECIAL]')
          WHERE codigo = $1 AND service_id = $2
        `, [codigo, serviceId]);
        
        if (result.rowCount > 0) {
          console.log(`   ✅ ${codigo}: Marcado como ESPECIAL`);
          specialCount++;
        } else {
          console.log(`   ⚠️  ${codigo}: No encontrado`);
        }
      } catch (error) {
        console.log(`   ❌ ${codigo}: Error - ${error.message}`);
      }
    }

    // 5. Verificar distribución final
    console.log('\n5️⃣ Verificando distribución final...');
    
    // Contar estándar
    const standardResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion LIKE '%[ESTÁNDAR]%'
    `);
    
    // Contar especiales
    const specialResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion LIKE '%[ESPECIAL]%'
    `);
    
    // Contar otros (sin marcar)
    const otherResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion NOT LIKE '%[ESTÁNDAR]%'
      AND s.descripcion NOT LIKE '%[ESPECIAL]%'
    `);

    const standardTotal = parseInt(standardResult.rows[0].total);
    const specialTotal = parseInt(specialResult.rows[0].total);
    const otherTotal = parseInt(otherResult.rows[0].total);

    console.log(`✅ ENSAYOS ESTÁNDAR: ${standardTotal} subservicios`);
    console.log(`✅ ENSAYOS ESPECIALES: ${specialTotal} subservicios`);
    console.log(`✅ OTRAS CATEGORÍAS: ${otherTotal} subservicios (AG, CO, ALB, etc.)`);
    console.log(`✅ TOTAL: ${standardTotal + specialTotal + otherTotal} subservicios`);

    // 6. Mostrar ejemplos de cada categoría
    console.log('\n6️⃣ Ejemplos por categoría...');
    
    // Ejemplos estándar
    const standardExamples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion LIKE '%[ESTÁNDAR]%'
      ORDER BY s.codigo
      LIMIT 3
    `);
    
    console.log('\n📋 Ejemplos ENSAYOS ESTÁNDAR:');
    standardExamples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    // Ejemplos especiales
    const specialExamples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion LIKE '%[ESPECIAL]%'
      ORDER BY s.codigo
      LIMIT 3
    `);
    
    console.log('\n📋 Ejemplos ENSAYOS ESPECIALES:');
    specialExamples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    // Ejemplos otras categorías
    const otherExamples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion NOT LIKE '%[ESTÁNDAR]%'
      AND s.descripcion NOT LIKE '%[ESPECIAL]%'
      ORDER BY s.codigo
      LIMIT 3
    `);
    
    console.log('\n📋 Ejemplos OTRAS CATEGORÍAS:');
    otherExamples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 40)}... - ${precio}`);
    });

    console.log('\n🎉 SEPARACIÓN COMPLETADA CORRECTAMENTE');
    console.log('✅ ENSAYOS ESTÁNDAR: Solo los SU específicos');
    console.log('✅ ENSAYOS ESPECIALES: Solo los EE y SU especiales');
    console.log('✅ OTRAS CATEGORÍAS: AG, CO, ALB, etc. sin tocar');
    console.log('✅ Sistema organizado sin mezclar categorías');
    
  } catch (error) {
    console.error('❌ Error separando subservicios:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await separateOnlyStandardSpecial();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
