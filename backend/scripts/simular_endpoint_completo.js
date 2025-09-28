const pool = require('../config/db');

async function simularEndpointCompleto() {
  try {
    console.log('🔍 SIMULANDO ENDPOINT COMPLETO /api/subservices...\n');
    
    // Simular exactamente lo que hace getAllSubservices
    const { serviceId, area, q, page = 1, limit = 1000 } = {};
    const offset = (page - 1) * limit;
    
    let whereClause = 's.is_active = true';
    let params = [];
    let paramIndex = 1;
    
    // No hay filtros, solo subservicios activos
    const query = `
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        s.service_id,
        s.is_active,
        s.created_at,
        s.updated_at,
        serv.name as service_name,
        serv.area
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE ${whereClause}
      ORDER BY s.codigo
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    
    console.log('📋 Consulta SQL:');
    console.log(query);
    console.log('\n📊 Parámetros:', params);
    
    const result = await pool.query(query, params);
    
    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, []);
    
    const response = {
      data: result.rows.map(row => ({
        id: row.id,
        codigo: row.codigo,
        descripcion: row.descripcion,
        norma: row.norma,
        precio: parseFloat(row.precio),
        service_id: row.service_id,
        is_active: row.is_active,
        service_name: row.service_name,
        area: row.area,
        created_at: row.created_at,
        updated_at: row.updated_at
      })),
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    console.log('\n📤 RESPUESTA DEL ENDPOINT:');
    console.log(`   Total: ${response.total}`);
    console.log(`   Datos recibidos: ${response.data.length}`);
    console.log(`   Página: ${response.page}`);
    console.log(`   Límite: ${response.limit}`);
    
    console.log('\n📋 PRIMEROS 3 SUBSERVICIOS:');
    response.data.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.codigo}: ${item.descripcion.substring(0, 50)}... (${item.service_name})`);
    });
    
    console.log('\n🔍 VERIFICANDO ESTRUCTURA DE DATOS:');
    if (response.data.length > 0) {
      const first = response.data[0];
      console.log('   Estructura del primer elemento:');
      Object.keys(first).forEach(key => {
        console.log(`     - ${key}: ${typeof first[key]} = ${first[key]}`);
      });
    }
    
    console.log('\n✅ SIMULACIÓN COMPLETADA');
    
  } catch (error) {
    console.error('💥 Error en simulación:', error);
  } finally {
    await pool.end();
  }
}

simularEndpointCompleto();
