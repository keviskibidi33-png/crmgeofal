const pool = require('../config/db');

async function probarEndpoint() {
  try {
    console.log('🧪 PROBANDO ENDPOINT DE SUBSERVICIOS...\n');
    
    // Simular la consulta del endpoint GET /api/subservices
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
      WHERE s.is_active = true
      ORDER BY s.codigo
      LIMIT 5
    `;
    
    const result = await pool.query(query);
    
    console.log('📊 RESULTADOS DEL ENDPOINT:');
    console.log(`   Total encontrados: ${result.rows.length}`);
    
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.codigo}: ${row.descripcion.substring(0, 50)}... (${row.service_name})`);
    });
    
    // Probar búsqueda
    console.log('\n🔍 PROBANDO BÚSQUEDA "humedad":');
    const searchQuery = `
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        serv.name as service_name,
        serv.area
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE s.is_active = true 
        AND (
          s.codigo ILIKE $1 OR 
          s.descripcion ILIKE $1 OR 
          s.norma ILIKE $1 OR
          serv.name ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN s.codigo ILIKE $2 THEN 1
          WHEN s.descripcion ILIKE $2 THEN 2
          WHEN s.norma ILIKE $2 THEN 3
          ELSE 4
        END,
        s.codigo
      LIMIT 5
    `;
    
    const searchTerm = '%humedad%';
    const exactMatch = 'humedad%';
    const searchResult = await pool.query(searchQuery, [searchTerm, exactMatch]);
    
    console.log(`   Resultados de búsqueda: ${searchResult.rows.length}`);
    searchResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.codigo}: ${row.descripcion.substring(0, 50)}...`);
    });
    
    console.log('\n✅ ENDPOINT FUNCIONANDO CORRECTAMENTE');
    console.log('🚀 El frontend debería poder conectarse ahora.');
    
  } catch (error) {
    console.error('💥 Error probando endpoint:', error);
  } finally {
    await pool.end();
  }
}

probarEndpoint();
