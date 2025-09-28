const pool = require('../config/db');

async function verificarSubservicios() {
  try {
    console.log('🔍 VERIFICANDO SUBSERVICIOS EN LA BASE DE DATOS...\n');
    
    // Contar total
    const count = await pool.query('SELECT COUNT(*) FROM subservices');
    console.log(`📊 TOTAL DE SUBSERVICIOS: ${count.rows[0].count}`);
    
    // Mostrar algunos ejemplos
    const ejemplos = await pool.query(`
      SELECT codigo, descripcion, precio, s.name as servicio 
      FROM subservices sub
      JOIN services s ON sub.service_id = s.id
      ORDER BY codigo 
      LIMIT 5
    `);
    
    console.log('\n📋 PRIMEROS 5 SUBSERVICIOS:');
    ejemplos.rows.forEach(sub => {
      const precio = sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`;
      console.log(`   - ${sub.codigo}: ${sub.descripcion.substring(0, 50)}... (${precio})`);
    });
    
    // Verificar por servicio
    const porServicio = await pool.query(`
      SELECT s.name, COUNT(sub.id) as cantidad
      FROM services s
      LEFT JOIN subservices sub ON s.id = sub.service_id
      WHERE s.area = 'laboratorio'
      GROUP BY s.id, s.name
      ORDER BY cantidad DESC
    `);
    
    console.log('\n📊 DISTRIBUCIÓN POR SERVICIO:');
    porServicio.rows.forEach(servicio => {
      console.log(`   - ${servicio.name}: ${servicio.cantidad} subservicios`);
    });
    
    console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA!');
    console.log('🚀 Los datos están listos para el autocompletado.');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarSubservicios();
