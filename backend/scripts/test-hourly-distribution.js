const pool = require('../config/db');

async function testHourlyDistribution() {
  try {
    console.log('🧪 Probando distribución horaria...');
    
    // Verificar registros de auditoría
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM audit_log');
    console.log(`📊 Total de registros de auditoría: ${totalResult.rows[0].total}`);
    
    // Obtener distribución horaria
    const result = await pool.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM audit_log 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `);
    
    console.log('📈 Distribución horaria (últimas 24h):');
    result.rows.forEach(row => {
      console.log(`   ${row.hour}:00 - ${row.count} actividades`);
    });
    
    // Crear array completo de 24 horas
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hourData = result.rows.find(row => parseInt(row.hour) === i);
      return {
        hour: i,
        count: hourData ? parseInt(hourData.count) : 0
      };
    });
    
    console.log('\n📊 Array completo de 24 horas:');
    hourlyData.forEach(data => {
      if (data.count > 0) {
        console.log(`   ${data.hour}:00 - ${data.count} actividades`);
      }
    });
    
    // Estadísticas
    const totalActivities = hourlyData.reduce((sum, data) => sum + data.count, 0);
    const maxHour = hourlyData.reduce((max, data) => data.count > max.count ? data : max, { hour: 0, count: 0 });
    const minHour = hourlyData.reduce((min, data) => data.count < min.count ? data : min, { hour: 0, count: 0 });
    
    console.log('\n📈 Estadísticas:');
    console.log(`   Total actividades: ${totalActivities}`);
    console.log(`   Hora pico: ${maxHour.hour}:00 (${maxHour.count} actividades)`);
    console.log(`   Hora baja: ${minHour.hour}:00 (${minHour.count} actividades)`);
    
  } catch (error) {
    console.error('❌ Error en prueba de distribución horaria:', error);
  } finally {
    await pool.end();
  }
}

testHourlyDistribution();
