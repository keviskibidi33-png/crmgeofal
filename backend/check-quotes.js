const pool = require('./config/db');

async function checkQuotes() {
  try {
    console.log('🔍 VERIFICANDO COTIZACIONES EXISTENTES...\n');

    // Verificar cotizaciones
    const quotesResult = await pool.query(`
      SELECT id, quote_code, category_main, total, status, created_at
      FROM quotes 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log(`📋 Total cotizaciones: ${quotesResult.rows.length}`);
    quotesResult.rows.forEach(q => {
      console.log(`  - ID: ${q.id} | Código: ${q.quote_code || 'SIN CÓDIGO'}`);
      console.log(`    Categoría: ${q.category_main} | Total: S/ ${q.total} | Estado: ${q.status}`);
      console.log(`    Creada: ${q.created_at}`);
      console.log('');
    });

    // Verificar quote_items
    const itemsResult = await pool.query(`
      SELECT COUNT(*) as count FROM quote_items
    `);
    console.log(`📊 Total ítems en quote_items: ${itemsResult.rows[0].count}`);

    // Verificar funnel_metrics
    const funnelResult = await pool.query(`
      SELECT COUNT(*) as count FROM funnel_metrics
    `);
    console.log(`📈 Total métricas en embudo: ${funnelResult.rows[0].count}`);

    if (quotesResult.rows.length === 0) {
      console.log('\n⚠️ NO HAY COTIZACIONES EN EL SISTEMA');
      console.log('📋 Para ver ensayos necesitas:');
      console.log('1. ✅ Crear una cotización en http://localhost:3000/cotizaciones/inteligente');
      console.log('2. ✅ Agregar ítems con nombres y precios reales');
      console.log('3. ✅ Subir comprobante de pago');
      console.log('4. ✅ Aprobar para alimentar el embudo');
    }

  } catch (error) {
    console.error('❌ Error verificando cotizaciones:', error.message);
  } finally {
    await pool.end();
  }
}

checkQuotes();
