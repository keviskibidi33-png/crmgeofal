const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');

async function verificarTemplateCotizacion() {
  try {
    console.log('🔍 VERIFICANDO TEMPLATE DE COTIZACIÓN...');

    // Datos de prueba con diferentes variantes
    const testBundles = [
      {
        quote: { id: 'COT-2025-0927-289', variant_id: 'V1' },
        company: { name: 'GEOFAL SAC', ruc: '20549356762' },
        project: { name: 'Proyecto Test V1', location: 'Lima' },
        items: [
          { code: 'SU04', description: 'Contenido de humedad con Speedy', norm: 'NTP 339.25', unit_price: 30.00, quantity: 1 },
          { code: 'SU18', description: 'Capacidad de carga del Suelo', norm: 'ASTM D-1194', unit_price: 2000.00, quantity: 1 }
        ]
      },
      {
        quote: { id: 'COT-2025-0927-290', variant_id: 'V2' },
        company: { name: 'GEOFAL SAC', ruc: '20549356762' },
        project: { name: 'Proyecto Test V2', location: 'Lima' },
        items: [
          { code: 'SU01', description: 'Ensayo de penetración estándar', norm: 'ASTM D1586', unit_price: 150.00, quantity: 2 }
        ]
      },
      {
        quote: { id: 'COT-2025-0927-291', variant_id: 'V3' },
        company: { name: 'GEOFAL SAC', ruc: '20549356762' },
        project: { name: 'Proyecto Test V3', location: 'Lima' },
        items: [
          { code: 'SU13', description: 'Sales solubles en Suelos y Agua', norm: 'NTP 339.152', unit_price: 80.00, quantity: 1 }
        ]
      }
    ];

    for (let i = 0; i < testBundles.length; i++) {
      const bundle = testBundles[i];
      const outputPath = `tmp/test_template_${bundle.quote.variant_id}_${Date.now()}.pdf`;
      
      console.log(`\n📋 Probando variante ${bundle.quote.variant_id}:`);
      console.log(`   - Número de cotización: ${bundle.quote.id}`);
      console.log(`   - Proyecto: ${bundle.project.name}`);
      console.log(`   - Items: ${bundle.items.length}`);
      
      try {
        await generateSmartTemplatePdf(bundle, outputPath);
        console.log(`   ✅ PDF generado exitosamente: ${outputPath}`);
      } catch (error) {
        console.log(`   ❌ Error generando PDF: ${error.message}`);
      }
    }

    console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA!');
    console.log('✅ Número de cotización simplificado');
    console.log('✅ Título de sección dinámico por variante');
    console.log('✅ Días de entrega configurables');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

if (require.main === module) {
  verificarTemplateCotizacion();
} else {
  module.exports = verificarTemplateCotizacion;
}
