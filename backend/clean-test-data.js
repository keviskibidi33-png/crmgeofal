const pool = require('./config/db');

async function cleanTestData() {
  try {
    console.log('🧹 LIMPIANDO DATOS DE PRUEBA...\n');

    // 1. Limpiar funnel_metrics
    console.log('📊 Limpiando funnel_metrics...');
    await pool.query('DELETE FROM funnel_metrics');
    console.log('✅ funnel_metrics limpiado');

    // 2. Limpiar quote_items
    console.log('📋 Limpiando quote_items...');
    await pool.query('DELETE FROM quote_items');
    console.log('✅ quote_items limpiado');

    // 3. Eliminar cotización de prueba
    console.log('📄 Eliminando cotización de prueba...');
    await pool.query('DELETE FROM quotes WHERE id = 97');
    console.log('✅ cotización 97 eliminada');

    console.log('\n🎉 DATOS DE PRUEBA LIMPIADOS EXITOSAMENTE!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. ✅ Ir a http://localhost:3000/cotizaciones/inteligente');
    console.log('2. ✅ Crear una nueva cotización con datos reales');
    console.log('3. ✅ Agregar ítems con nombres y precios reales');
    console.log('4. ✅ Subir comprobante de pago');
    console.log('5. ✅ Aprobar y verificar que el embudo se alimente correctamente');

  } catch (error) {
    console.error('❌ Error limpiando datos:', error.message);
  } finally {
    await pool.end();
  }
}

cleanTestData();
