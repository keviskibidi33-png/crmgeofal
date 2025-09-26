const pool = require('../config/db');

async function cleanAllSubservices() {
  try {
    console.log('🧹 ELIMINANDO TODOS LOS SUBSERVICIOS PARA EMPEZAR DESDE CERO...\n');
    
    // 1. Eliminar todos los subservicios
    console.log('1️⃣ Eliminando todos los subservicios...');
    const deleteResult = await pool.query('DELETE FROM subservices');
    console.log(`   ✅ Eliminados ${deleteResult.rowCount} subservicios`);
    
    // 2. Verificar que estén vacíos
    console.log('\n2️⃣ Verificando que estén vacíos...');
    const countResult = await pool.query('SELECT COUNT(*) FROM subservices');
    console.log(`   📊 Subservicios restantes: ${countResult.rows[0].count}`);
    
    // 3. Mostrar servicios disponibles
    console.log('\n3️⃣ Servicios disponibles:');
    const servicesResult = await pool.query('SELECT id, name FROM services ORDER BY name');
    servicesResult.rows.forEach(service => {
      console.log(`   - ${service.id}: ${service.name}`);
    });
    
    console.log('\n🎉 LIMPIEZA COMPLETADA');
    console.log('✅ Todos los subservicios eliminados');
    console.log('✅ Base de datos lista para empezar desde cero');
    console.log('✅ Ahora puedes usar la extensión para leer las imágenes correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanAllSubservices();