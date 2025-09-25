const pool = require('../config/db');

async function deleteRocaWrongCodes() {
  console.log('🗑️ ELIMINANDO CÓDIGOS INCORRECTOS DE ROCA\n');
  
  try {
    // 1. Obtener el ID del servicio Laboratorio
    console.log('1️⃣ Obteniendo ID del servicio Laboratorio...');
    const serviceResult = await pool.query("SELECT id FROM services WHERE area = 'laboratorio'");
    const serviceId = serviceResult.rows[0].id;
    console.log(`✅ ID del servicio Laboratorio: ${serviceId}`);

    // 2. Eliminar códigos incorrectos de ROCA
    console.log('\n2️⃣ Eliminando códigos incorrectos de ROCA...');
    
    const wrongCodes = ['R001', 'R002', 'R003', 'R004'];
    
    for (const codigo of wrongCodes) {
      try {
        const result = await pool.query(
          'DELETE FROM subservices WHERE codigo = $1 AND service_id = $2',
          [codigo, serviceId]
        );
        
        if (result.rowCount > 0) {
          console.log(`   ✅ ${codigo}: Eliminado correctamente`);
        } else {
          console.log(`   ⚠️  ${codigo}: No encontrado`);
        }
      } catch (error) {
        console.log(`   ❌ ${codigo}: Error - ${error.message}`);
      }
    }

    // 3. Verificar total
    console.log('\n3️⃣ Verificando total...');
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'laboratorio'
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    console.log(`✅ Total de subservicios: ${total}`);

    console.log('\n🎉 CÓDIGOS INCORRECTOS ELIMINADOS');
    console.log('✅ Listo para agregar con códigos correctos');
    
  } catch (error) {
    console.error('❌ Error eliminando códigos incorrectos:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await deleteRocaWrongCodes();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
