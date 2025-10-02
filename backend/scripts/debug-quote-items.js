const pool = require('../config/db');

async function debugQuoteItems() {
  try {
    console.log('🔍 INVESTIGANDO PROBLEMA DE ÍTEMS...\n');
    
    // 1. Verificar todas las cotizaciones
    console.log('📋 1. VERIFICANDO TODAS LAS COTIZACIONES:');
    const quotesResult = await pool.query(`
      SELECT id, quote_code, category_main, total, status, created_at, created_by
      FROM quotes 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    quotesResult.rows.forEach(quote => {
      console.log(`   ID: ${quote.id} | Código: ${quote.quote_code || 'SIN CÓDIGO'} | Categoría: ${quote.category_main || 'N/A'} | Total: S/ ${quote.total} | Estado: ${quote.status}`);
    });
    
    // 2. Verificar ítems en quote_items
    console.log('\n📊 2. VERIFICANDO TABLA quote_items:');
    const itemsResult = await pool.query(`
      SELECT COUNT(*) as total_items FROM quote_items
    `);
    console.log(`   Total de ítems en quote_items: ${itemsResult.rows[0].total_items}`);
    
    if (itemsResult.rows[0].total_items > 0) {
      const sampleItems = await pool.query(`
        SELECT qi.id, qi.quote_id, qi.name, qi.total_price, q.quote_code
        FROM quote_items qi
        LEFT JOIN quotes q ON qi.quote_id = q.id
        ORDER BY qi.created_at DESC
        LIMIT 3
      `);
      
      console.log('   Muestra de ítems:');
      sampleItems.rows.forEach(item => {
        console.log(`     - ID: ${item.id} | Quote ID: ${item.quote_id} | Nombre: ${item.name || 'Sin nombre'} | Total: S/ ${item.total_price} | Código: ${item.quote_code || 'N/A'}`);
      });
    }
    
    // 3. Verificar campo meta de cotizaciones
    console.log('\n📋 3. VERIFICANDO CAMPO META:');
    const metaResult = await pool.query(`
      SELECT id, quote_code, meta
      FROM quotes 
      WHERE meta IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    metaResult.rows.forEach(quote => {
      try {
        const meta = JSON.parse(quote.meta);
        console.log(`   Cotización ID: ${quote.id} | Código: ${quote.quote_code || 'N/A'}`);
        console.log(`     - Tiene ítems en meta: ${!!meta.items}`);
        console.log(`     - Cantidad de ítems: ${meta.items ? meta.items.length : 0}`);
        if (meta.items && meta.items.length > 0) {
          console.log(`     - Primer ítem: ${meta.items[0].name || 'Sin nombre'} - S/ ${meta.items[0].total || 0}`);
        }
      } catch (e) {
        console.log(`   Error parseando meta para cotización ${quote.id}`);
      }
    });
    
    // 4. Verificar si hay comprobantes de pago
    console.log('\n💳 4. VERIFICANDO COMPROBANTES DE PAGO:');
    const proofsResult = await pool.query(`
      SELECT id, quote_id, amount_paid, status, created_at
      FROM payment_proofs 
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log(`   Total comprobantes: ${proofsResult.rows.length}`);
    proofsResult.rows.forEach(proof => {
      console.log(`     - ID: ${proof.id} | Quote ID: ${proof.quote_id} | Monto: S/ ${proof.amount_paid} | Estado: ${proof.status}`);
    });
    
    // 5. Verificar funnel_metrics
    console.log('\n📊 5. VERIFICANDO FUNNEL_METRICS:');
    const funnelResult = await pool.query(`
      SELECT COUNT(*) as total_metrics FROM funnel_metrics
    `);
    console.log(`   Total métricas en embudo: ${funnelResult.rows[0].total_metrics}`);
    
    if (funnelResult.rows[0].total_metrics > 0) {
      const sampleMetrics = await pool.query(`
        SELECT quote_id, quote_code, category_main, service_name, item_name, item_total
        FROM funnel_metrics
        ORDER BY created_at DESC
        LIMIT 3
      `);
      
      console.log('   Muestra de métricas:');
      sampleMetrics.rows.forEach(metric => {
        console.log(`     - Quote ID: ${metric.quote_id} | Código: ${metric.quote_code} | Categoría: ${metric.category_main} | Servicio: ${metric.service_name} | Ítem: ${metric.item_name} | Total: S/ ${metric.item_total}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error investigando:', error.message);
  } finally {
    await pool.end();
  }
}

debugQuoteItems();
