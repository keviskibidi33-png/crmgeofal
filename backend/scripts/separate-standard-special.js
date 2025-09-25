const pool = require('../config/db');

async function separateStandardSpecial() {
  console.log('🔧 SEPARANDO SUBSERVICIOS EN ESTÁNDAR Y ESPECIALES\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Definir subservicios ESTÁNDAR (solo los SU que son estándar)
    console.log('\n2️⃣ Identificando subservicios ESTÁNDAR...');
    const standardCodes = [
      'SU04', 'SU16', 'SU18', 'SU19', 'SU20', 'SU20A', 'SU21', 'SU22', 'SU23', 'SU24',
      'SU27', 'SU30', 'SU31', 'SU32', 'SU34', 'SU35', 'SU36', 'SU38', 'SU39'
    ];

    // 3. Definir subservicios ESPECIALES (solo los EE y algunos SU especiales)
    console.log('\n3️⃣ Identificando subservicios ESPECIALES...');
    const specialCodes = [
      'SU33', 'SU37', 'EE01', 'EE02', 'EE03', 'EE04', 'EE05', 'EE06', 'EE07', 'EE08',
      'EE09', 'EE10', 'EE11', 'EE12', 'EE13', 'EE14', 'EE15'
    ];

    // 4. Actualizar subservicios ESTÁNDAR
    console.log('\n4️⃣ Actualizando subservicios ESTÁNDAR...');
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

    // 5. Actualizar subservicios ESPECIALES
    console.log('\n5️⃣ Actualizando subservicios ESPECIALES...');
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

    // 6. Verificar distribución final
    console.log('\n6️⃣ Verificando distribución final...');
    
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
    
    // Contar otros
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
    console.log(`✅ OTROS: ${otherTotal} subservicios`);
    console.log(`✅ TOTAL: ${standardTotal + specialTotal + otherTotal} subservicios`);

    // 7. Mostrar ejemplos de cada categoría
    console.log('\n7️⃣ Ejemplos por categoría...');
    
    // Ejemplos estándar
    const standardExamples = await pool.query(`
      SELECT codigo, descripcion, precio
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
      AND s.descripcion LIKE '%[ESTÁNDAR]%'
      ORDER BY s.codigo
      LIMIT 5
    `);
    
    console.log('\n📋 Ejemplos ENSAYOS ESTÁNDAR:');
    standardExamples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 50)}... - ${precio}`);
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
      LIMIT 5
    `);
    
    console.log('\n📋 Ejemplos ENSAYOS ESPECIALES:');
    specialExamples.rows.forEach(row => {
      const precio = (row.precio && parseFloat(row.precio) > 0) ? `S/ ${parseFloat(row.precio).toFixed(2)}` : 'Sujeto a evaluación';
      console.log(`   ${row.codigo}: ${row.descripcion.substring(0, 50)}... - ${precio}`);
    });

    console.log('\n🎉 SEPARACIÓN COMPLETADA');
    console.log('✅ ENSAYOS ESTÁNDAR: Identificados y marcados');
    console.log('✅ ENSAYOS ESPECIALES: Identificados y marcados');
    console.log('✅ Sistema organizado por categorías');
    console.log('✅ Frontend puede filtrar por tipo');
    
  } catch (error) {
    console.error('❌ Error separando subservicios:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await separateStandardSpecial();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
