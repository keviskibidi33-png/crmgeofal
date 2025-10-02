const pool = require('./backend/config/db');

async function debugFunnelData() {
  try {
    console.log('🔍 INVESTIGANDO DATOS DEL EMBUDO...\n');

    // 1. Verificar datos en funnel_metrics
    console.log('📊 1. DATOS EN FUNNEL_METRICS:');
    const funnelResult = await pool.query(`
      SELECT 
        id, quote_id, quote_code, category_main, service_name, item_name, 
        item_total, real_amount_paid, created_at
      FROM funnel_metrics
      ORDER BY id
    `);
    
    console.log(`   Total registros: ${funnelResult.rows.length}`);
    funnelResult.rows.forEach(row => {
      console.log(`   - ID: ${row.id} | Quote: ${row.quote_id} | Código: ${row.quote_code}`);
      console.log(`     Categoría: ${row.category_main} | Servicio: ${row.service_name}`);
      console.log(`     Ítem: ${row.item_name} | Total: S/ ${row.item_total} | Real: S/ ${row.real_amount_paid}`);
      console.log('');
    });

    // 2. Verificar si hay servicios específicos
    console.log('🧪 2. SERVICIOS EN FUNNEL_METRICS:');
    const servicesResult = await pool.query(`
      SELECT DISTINCT service_name, COUNT(*) as count
      FROM funnel_metrics
      GROUP BY service_name
      ORDER BY count DESC
    `);
    
    servicesResult.rows.forEach(row => {
      console.log(`   - ${row.service_name}: ${row.count} registros`);
    });

    // 3. Verificar quote_items para ver si tienen servicios
    console.log('\n📋 3. DATOS EN QUOTE_ITEMS:');
    const quoteItemsResult = await pool.query(`
      SELECT 
        qi.id, qi.quote_id, qi.name, qi.total_price,
        s.name as service_name,
        sub.descripcion as subservice_description
      FROM quote_items qi
      LEFT JOIN subservices sub ON qi.subservice_id = sub.id
      LEFT JOIN services s ON sub.service_id = s.id
      ORDER BY qi.id
    `);
    
    console.log(`   Total ítems en quote_items: ${quoteItemsResult.rows.length}`);
    quoteItemsResult.rows.forEach(row => {
      console.log(`   - ID: ${row.id} | Quote: ${row.quote_id} | Nombre: ${row.name}`);
      console.log(`     Servicio: ${row.service_name || 'SIN SERVICIO'} | Subservicio: ${row.subservice_description || 'SIN SUBSERVICIO'}`);
      console.log(`     Precio: S/ ${row.total_price}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error en debugFunnelData:', error.message);
  } finally {
    await pool.end();
  }
}

debugFunnelData();
