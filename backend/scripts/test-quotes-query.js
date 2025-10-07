const pool = require('../config/db');

async function testQuotesQuery() {
  try {
    console.log('🔍 Probando consulta directa de cotizaciones...');

    // Probar la consulta exacta que usa el modelo
    const select = `
      SELECT 
        q.*,
        q.quote_number,
        p.name as project_name,
        p.location as project_location,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quotes q 
      LEFT JOIN projects p ON p.id = q.project_id 
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC 
      LIMIT 20 OFFSET 0
    `;
    
    const count = `SELECT COUNT(*) FROM quotes q LEFT JOIN projects p ON p.id = q.project_id`;
    
    console.log('📊 Ejecutando consulta de datos...');
    const data = await pool.query(select);
    console.log(`✅ Datos obtenidos: ${data.rows.length} cotizaciones`);
    
    console.log('📊 Ejecutando consulta de conteo...');
    const total = await pool.query(count);
    console.log(`✅ Total de cotizaciones: ${total.rows[0].count}`);
    
    if (data.rows.length > 0) {
      console.log('📋 Primeras 3 cotizaciones:');
      data.rows.slice(0, 3).forEach((quote, index) => {
        console.log(`  ${index + 1}. ID: ${quote.id} | Cliente: ${quote.client_contact} | Estado: ${quote.status} | Total: S/ ${quote.total}`);
      });
    } else {
      console.log('⚠️  No se encontraron cotizaciones en la consulta directa');
      
      // Verificar si hay cotizaciones sin JOINs
      console.log('🔍 Verificando cotizaciones sin JOINs...');
      const simpleQuery = await pool.query('SELECT * FROM quotes LIMIT 5');
      console.log(`📊 Cotizaciones simples: ${simpleQuery.rows.length}`);
      
      if (simpleQuery.rows.length > 0) {
        console.log('📋 Ejemplos de cotizaciones simples:');
        simpleQuery.rows.forEach((quote, index) => {
          console.log(`  ${index + 1}. ID: ${quote.id} | Cliente: ${quote.client_contact} | Estado: ${quote.status} | Total: S/ ${quote.total}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error en consulta directa:', error);
  }
}

if (require.main === module) {
  testQuotesQuery().then(() => {
    console.log('🎉 Prueba completada');
    process.exit(0);
  });
}

module.exports = testQuotesQuery;
