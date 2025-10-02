const pool = require('../config/db');

async function checkQuote96() {
  try {
    console.log('🔍 VERIFICANDO COTIZACIÓN ID 96...\n');
    
    // 1. Verificar la cotización
    const quoteResult = await pool.query(`
      SELECT id, quote_code, category_main, total, status, meta, created_at
      FROM quotes 
      WHERE id = 96
    `);
    
    if (quoteResult.rows.length > 0) {
      const quote = quoteResult.rows[0];
      console.log('📋 Cotización ID 96:');
      console.log(`   Código: ${quote.quote_code || 'N/A'} | Categoría: ${quote.category_main} | Total: S/ ${quote.total}`);
      console.log(`   Estado: ${quote.status} | Fecha: ${quote.created_at}`);
      
      // 2. Verificar campo meta
      if (quote.meta) {
        try {
          const meta = JSON.parse(quote.meta);
          console.log('\n📋 Campo meta:');
          console.log(`   Tiene ítems: ${!!meta.items}`);
          console.log(`   Cantidad de ítems: ${meta.items ? meta.items.length : 0}`);
          
          if (meta.items && meta.items.length > 0) {
            console.log('   Ítems en meta:');
            meta.items.forEach((item, index) => {
              console.log(`     ${index + 1}. ${item.name || 'Sin nombre'}: S/ ${item.total || 0}`);
            });
          }
        } catch (e) {
          console.log('   Error parseando meta:', e.message);
        }
      }
    }
    
    // 3. Verificar quote_items para esta cotización
    console.log('\n📊 Verificando quote_items para cotización 96:');
    const itemsResult = await pool.query(`
      SELECT id, name, total_price, subservice_id
      FROM quote_items 
      WHERE quote_id = 96
    `);
    
    console.log(`   Total ítems en quote_items: ${itemsResult.rows.length}`);
    itemsResult.rows.forEach(item => {
      console.log(`     - ID: ${item.id} | Nombre: ${item.name} | Total: S/ ${item.total_price} | Subservice: ${item.subservice_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkQuote96();
