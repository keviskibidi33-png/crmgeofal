const pool = require('../config/db');

async function addSubservicesOneByOne() {
  console.log('🔧 AGREGANDO SUBSERVICIOS UNO POR UNO - SECCIÓN POR SECCIÓN\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Limpiar todos los subservicios existentes
    console.log('\n2️⃣ Limpiando subservicios existentes...');
    await pool.query('DELETE FROM subservices WHERE service_id = $1', [serviceId]);
    console.log('✅ Subservicios existentes eliminados');

    // 3. Función para agregar un subservicio
    async function addSubservice(codigo, descripcion, norma, precio) {
      try {
        await pool.query(`
          INSERT INTO subservices (codigo, descripcion, norma, precio, service_id, name, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [codigo, descripcion, norma, precio, serviceId, descripcion]);
        console.log(`   ✅ ${codigo}: ${descripcion.substring(0, 40)}...`);
        return true;
      } catch (error) {
        console.log(`   ❌ ${codigo}: Error - ${error.message}`);
        return false;
      }
    }

    // 4. SECCIÓN 1: ENSAYOS ESTÁNDAR (20 subservicios)
    console.log('\n3️⃣ SECCIÓN 1: ENSAYOS ESTÁNDAR (20 subservicios)');
    console.log('📋 Esperando datos de ENSAYOS ESTÁNDAR...');
    console.log('💡 Formato: codigo, descripcion, norma, precio');
    console.log('💡 Ejemplo: SU04, "Contenido de humedad con Speedy", "NTP 339.25", 30');
    console.log('💡 Para "Sujeto a evaluación" usar precio: 0');
    console.log('💡 Para normas vacías usar: "-"');
    console.log('\n⏳ Esperando que me proporciones los 20 ENSAYOS ESTÁNDAR...');

    // 5. SECCIÓN 2: ENSAYOS ESPECIALES (17 subservicios)
    console.log('\n4️⃣ SECCIÓN 2: ENSAYOS ESPECIALES (17 subservicios)');
    console.log('📋 Esperando datos de ENSAYOS ESPECIALES...');
    console.log('💡 Formato: codigo, descripcion, norma, precio');
    console.log('💡 Ejemplo: EE01, "Conductividad eléctrica", "ASTM D1293", 250');
    console.log('\n⏳ Esperando que me proporciones los 17 ENSAYOS ESPECIALES...');

    // 6. SECCIÓN 3: ENSAYO AGREGADO (17 subservicios)
    console.log('\n5️⃣ SECCIÓN 3: ENSAYO AGREGADO (17 subservicios)');
    console.log('📋 Esperando datos de ENSAYO AGREGADO...');
    console.log('💡 Formato: codigo, descripcion, norma, precio');
    console.log('💡 Ejemplo: AG08A, "Inalterabilidad Agregado Grueso con Sulfato de Magnesio", "NTP 400.016", 350');
    console.log('\n⏳ Esperando que me proporciones los 17 ENSAYO AGREGADO...');

    // 7. SECCIÓN 4: ENSAYOS DE CAMPO (8 subservicios)
    console.log('\n6️⃣ SECCIÓN 4: ENSAYOS DE CAMPO (8 subservicios)');
    console.log('📋 Esperando datos de ENSAYOS DE CAMPO...');
    console.log('💡 Formato: codigo, descripcion, norma, precio');
    console.log('💡 Ejemplo: CAM01, "Ensayo de campo específico", "ASTM D1234", 200');
    console.log('\n⏳ Esperando que me proporciones los 8 ENSAYOS DE CAMPO...');

    // 8. Verificar total final
    console.log('\n7️⃣ Verificando total final...');
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    console.log(`✅ Total de subservicios: ${total}`);

    // 9. Verificar por sección
    const sections = [
      { name: 'ENSAYOS ESTÁNDAR', prefix: 'SU' },
      { name: 'ENSAYOS ESPECIALES', prefix: 'EE' },
      { name: 'ENSAYO AGREGADO', prefix: 'AG' },
      { name: 'ENSAYOS DE CAMPO', prefix: 'CAM' }
    ];

    console.log('\n8️⃣ Verificando por sección...');
    for (const section of sections) {
      const sectionResult = await pool.query(`
        SELECT COUNT(*) as total
        FROM subservices s 
        JOIN services sv ON s.service_id = sv.id 
        WHERE s.is_active = true 
        AND sv.area = 'laboratorio'
        AND s.codigo LIKE $1
      `, [`${section.prefix}%`]);
      
      const sectionTotal = parseInt(sectionResult.rows[0].total);
      console.log(`   ${section.name}: ${sectionTotal} subservicios`);
    }

    console.log('\n🎉 SISTEMA LISTO PARA AGREGAR SUBSERVICIOS');
    console.log('✅ Base de datos limpia y preparada');
    console.log('✅ Listo para recibir datos sección por sección');
    console.log('✅ Formato: codigo, descripcion, norma, precio');
    console.log('✅ Precio 0 = "Sujeto a evaluación"');
    console.log('✅ Norma vacía = "-"');
    
  } catch (error) {
    console.error('❌ Error preparando sistema:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await addSubservicesOneByOne();
    console.log('\n✅ Sistema preparado exitosamente');
    console.log('📋 Ahora puedes darme los datos sección por sección');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
