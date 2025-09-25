const pool = require('../config/db');

async function verifyIngenieriaService() {
  console.log('🔍 VERIFICANDO SERVICIO DE INGENIERÍA\n');
  
  try {
    // 1. Verificar que existe el servicio Ingeniería
    console.log('1️⃣ Verificando servicio Ingeniería...');
    const serviceResult = await pool.query("SELECT id, name, area FROM services WHERE area = 'ingenieria'");
    
    if (serviceResult.rows.length === 0) {
      console.log('❌ Servicio Ingeniería no encontrado. Creándolo...');
      
      // Crear el servicio Ingeniería
      const createResult = await pool.query(`
        INSERT INTO services (name, area, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, area
      `, ['Ingeniería', 'ingenieria', true]);
      
      console.log(`✅ Servicio Ingeniería creado: ID ${createResult.rows[0].id}`);
    } else {
      console.log(`✅ Servicio Ingeniería encontrado: ID ${serviceResult.rows[0].id}`);
    }

    // 2. Verificar subservicios existentes de Ingeniería
    console.log('\n2️⃣ Verificando subservicios existentes de Ingeniería...');
    const subservicesResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM subservices s 
      JOIN services sv ON s.service_id = sv.id 
      WHERE s.is_active = true 
      AND sv.area = 'ingenieria'
    `);
    
    const total = parseInt(subservicesResult.rows[0].total);
    console.log(`✅ Total de subservicios de Ingeniería: ${total}`);

    // 3. Mostrar estructura de servicios
    console.log('\n3️⃣ Estructura actual de servicios:');
    const allServices = await pool.query(`
      SELECT s.id, s.name, s.area, 
             COUNT(sub.id) as subservices_count
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id AND sub.is_active = true
      GROUP BY s.id, s.name, s.area
      ORDER BY s.area
    `);
    
    allServices.rows.forEach(service => {
      console.log(`   ${service.area.toUpperCase()}: ${service.subservices_count} subservicios`);
    });

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('✅ Servicio Ingeniería listo para recibir subservicios');
    console.log('✅ Estructura preparada para implementación');
    
  } catch (error) {
    console.error('❌ Error verificando servicio Ingeniería:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await verifyIngenieriaService();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

main();
