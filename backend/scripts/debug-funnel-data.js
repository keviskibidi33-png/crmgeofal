const pool = require('../config/db');

async function debugFunnelData() {
  try {
    console.log('🔍 VERIFICANDO DATOS DEL EMBUDO...\n');
    
    // 1. Verificar funnel_metrics
    console.log('📊 1. VERIFICANDO FUNNEL_METRICS:');
    const funnelResult = await pool.query(`
      SELECT 
        id, quote_id, quote_code, category_main, service_name, 
        item_name, item_total, real_amount_paid, created_at
      FROM funnel_metrics 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`   Total métricas: ${funnelResult.rows.length}`);
    funnelResult.rows.forEach(metric => {
      console.log(`     - ID: ${metric.id} | Quote: ${metric.quote_id} | Código: ${metric.quote_code || 'N/A'}`);
      console.log(`       Categoría: ${metric.category_main} | Servicio: ${metric.service_name}`);
      console.log(`       Ítem: ${metric.item_name} | Total: S/ ${metric.item_total} | Real: S/ ${metric.real_amount_paid}`);
    });
    
    // 2. Verificar cotización asociada
    if (funnelResult.rows.length > 0) {
      const latestQuoteId = funnelResult.rows[0].quote_id;
      console.log(`\n📋 2. VERIFICANDO COTIZACIÓN ID: ${latestQuoteId}`);
      
      const quoteResult = await pool.query(`
        SELECT id, quote_code, category_main, total, status, status_payment
        FROM quotes 
        WHERE id = $1
      `, [latestQuoteId]);
      
      if (quoteResult.rows.length > 0) {
        const quote = quoteResult.rows[0];
        console.log(`   Código: ${quote.quote_code || 'N/A'} | Categoría: ${quote.category_main} | Total: S/ ${quote.total}`);
        console.log(`   Estado: ${quote.status} | Pago: ${quote.status_payment}`);
      }
    }
    
    // 3. Verificar si el dashboard está leyendo los datos correctamente
    console.log('\n📈 3. VERIFICANDO CONSULTAS DEL DASHBOARD:');
    
    // Consulta similar a la del dashboard
    const dashboardResult = await pool.query(`
      SELECT 
        category_main,
        COUNT(*) as total_quotes,
        SUM(item_total) as total_amount,
        AVG(item_total) as avg_amount
      FROM funnel_metrics 
      GROUP BY category_main
    `);
    
    console.log('   Datos por categoría:');
    dashboardResult.rows.forEach(row => {
      console.log(`     - Categoría: ${row.category_main} | Cotizaciones: ${row.total_quotes} | Total: S/ ${row.total_amount} | Promedio: S/ ${row.avg_amount}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugFunnelData();
