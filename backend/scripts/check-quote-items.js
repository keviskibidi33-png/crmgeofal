const pool = require('../config/db');

async function checkQuoteItems() {
  try {
    console.log('🔍 Verificando ítems de la cotización...');
    
    // Buscar la cotización más reciente
    const quoteResult = await pool.query(`
      SELECT id, quote_code, category_main, total, status, created_at
      FROM quotes 
      WHERE quote_code IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('📋 Cotizaciones encontradas:');
    quoteResult.rows.forEach(quote => {
      console.log(`   ID: ${quote.id} | Código: ${quote.quote_code} | Categoría: ${quote.category_main} | Total: S/ ${quote.total} | Estado: ${quote.status}`);
    });
    
    if (quoteResult.rows.length > 0) {
      const latestQuote = quoteResult.rows[0];
      console.log(`\n🔍 Verificando ítems para la cotización ID: ${latestQuote.id}`);
      
      const itemsResult = await pool.query(`
        SELECT 
          qi.id, qi.name, qi.total_price, qi.quantity, qi.unit_price,
          s.name as service_name,
          sub.descripcion as subservice_description
        FROM quote_items qi
        LEFT JOIN subservices sub ON qi.subservice_id = sub.id
        LEFT JOIN services s ON sub.service_id = s.id
        WHERE qi.quote_id = $1
      `, [latestQuote.id]);
      
      console.log(`📊 Ítems encontrados: ${itemsResult.rows.length}`);
      
      if (itemsResult.rows.length === 0) {
        console.log('❌ PROBLEMA: La cotización no tiene ítems en quote_items');
        console.log('💡 SOLUCIÓN: Los ítems deben estar en la tabla quote_items');
        
        // Verificar si hay ítems en la tabla quotes (en el campo meta)
        console.log('\n🔍 Verificando campo meta de la cotización...');
        const metaResult = await pool.query(`
          SELECT meta 
          FROM quotes 
          WHERE id = $1
        `, [latestQuote.id]);
        
        if (metaResult.rows.length > 0 && metaResult.rows[0].meta) {
          const meta = JSON.parse(metaResult.rows[0].meta);
          console.log('📋 Meta encontrado:', {
            hasItems: !!meta.items,
            itemsCount: meta.items ? meta.items.length : 0,
            hasQuote: !!meta.quote
          });
          
          if (meta.items && meta.items.length > 0) {
            console.log('💡 Los ítems están en el campo meta, no en quote_items');
            console.log('📊 Ítems en meta:');
            meta.items.forEach((item, index) => {
              console.log(`   ${index + 1}. ${item.name || 'Sin nombre'}: S/ ${item.total || 0}`);
            });
          }
        }
      } else {
        itemsResult.rows.forEach(item => {
          console.log(`   - ${item.name || 'Sin nombre'}: S/ ${item.total_price || 0} (Servicio: ${item.service_name || 'N/A'})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando ítems:', error.message);
  } finally {
    await pool.end();
  }
}

checkQuoteItems();
