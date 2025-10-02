const pool = require('./config/db');

async function checkQuoteMeta() {
  try {
    console.log('🔍 VERIFICANDO META DE COTIZACIÓN 92...\n');

    // Verificar meta de cotización 92
    const quoteResult = await pool.query(`
      SELECT id, meta, total, status
      FROM quotes 
      WHERE id = 92
    `);
    
    if (quoteResult.rows.length === 0) {
      console.log('❌ Cotización 92 no encontrada');
      return;
    }

    const quote = quoteResult.rows[0];
    console.log(`📋 Cotización ID: ${quote.id}`);
    console.log(`💰 Total: S/ ${quote.total}`);
    console.log(`📊 Estado: ${quote.status}`);
    
    if (quote.meta) {
      try {
        const meta = JSON.parse(quote.meta);
        console.log('\n📋 META DE LA COTIZACIÓN:');
        console.log(`  - Items en meta: ${meta.items ? meta.items.length : 'SIN ITEMS'}`);
        
        if (meta.items && meta.items.length > 0) {
          console.log('\n📋 ÍTEMS EN META:');
          meta.items.forEach((item, index) => {
            console.log(`    ${index + 1}. ${item.name || 'SIN NOMBRE'}`);
            console.log(`       Descripción: ${item.description || 'SIN DESCRIPCIÓN'}`);
            console.log(`       Precio: S/ ${item.total || 0}`);
            console.log(`       Subservicio ID: ${item.subservice_id || 'SIN ID'}`);
            console.log('');
          });
        } else {
          console.log('❌ No hay ítems en meta');
        }
        
        if (meta.quote) {
          console.log('📋 DATOS DE COTIZACIÓN EN META:');
          console.log(`  - Categoría: ${meta.quote.category_main || 'SIN CATEGORÍA'}`);
          console.log(`  - Código: ${meta.quote.quote_code || 'SIN CÓDIGO'}`);
        }
        
      } catch (parseError) {
        console.error('❌ Error parseando meta:', parseError.message);
        console.log('📋 Meta raw:', quote.meta);
      }
    } else {
      console.log('❌ Sin meta en la cotización');
    }

    console.log('\n💡 CONCLUSIÓN:');
    if (quote.meta && JSON.parse(quote.meta).items && JSON.parse(quote.meta).items.length > 0) {
      console.log('✅ La cotización tiene ítems en meta');
      console.log('📋 Para ver ensayos necesitas:');
      console.log('1. ✅ Subir comprobante de pago para esta cotización');
      console.log('2. ✅ Aprobar el comprobante para alimentar el embudo');
    } else {
      console.log('❌ La cotización no tiene ítems reales');
      console.log('📋 Necesitas crear una nueva cotización con datos reales');
    }

  } catch (error) {
    console.error('❌ Error verificando meta:', error.message);
  } finally {
    await pool.end();
  }
}

checkQuoteMeta();
