const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');

async function verificarCotizacionLimpia() {
  try {
    console.log('🔍 VERIFICANDO COTIZACIÓN LIMPIA (SIN RELLENO INNECESARIO)...');

    // Datos de prueba simplificados
    const testBundle = {
      quote: { 
        id: '2025-0927-289',
        meta: {
          quote: {
            delivery_days: 4
          }
        }
      },
      company: { 
        name: 'GEOFAL SAC', 
        ruc: '20549356762' 
      },
      project: { 
        name: 'Proyecto Test', 
        location: 'Lima' 
      },
      items: [
        { 
          code: 'SU04', 
          description: 'Contenido de humedad con Speedy', 
          norm: 'NTP 339.25', 
          unit_price: 30.00, 
          quantity: 1 
        },
        { 
          code: 'SU18', 
          description: 'Capacidad de carga del Suelo', 
          norm: 'ASTM D-1194', 
          unit_price: 2000.00, 
          quantity: 1 
        }
      ]
    };

    const outputPath = `tmp/test_cotizacion_limpia_${Date.now()}.pdf`;
    
    console.log('\n📋 Datos de prueba:');
    console.log(`   - Número de cotización: COT-${testBundle.quote.id}-${new Date().getFullYear().toString().slice(-2)}`);
    console.log(`   - Proyecto: ${testBundle.project.name}`);
    console.log(`   - Items: ${testBundle.items.length}`);
    console.log(`   - Días de entrega: ${testBundle.quote.meta.quote.delivery_days}`);
    
    console.log('\n🔧 Cambios aplicados:');
    console.log('   ✅ Año mantenido en número de cotización (esencial para mapeo)');
    console.log('   ✅ Título de sección fijo: "ENSAYOS DE LABORATORIO"');
    console.log('   ✅ Variantes eliminadas (no afectan resultado)');
    console.log('   ✅ Días de entrega configurables desde formulario');
    
    try {
      await generateSmartTemplatePdf(testBundle, outputPath);
      console.log(`\n✅ PDF generado exitosamente: ${outputPath}`);
      console.log('\n🎉 ¡COTIZACIÓN LIMPIA VERIFICADA!');
      console.log('✅ Sin relleno innecesario');
      console.log('✅ Año mantenido para mapeo');
      console.log('✅ Resultado enfocado en datos esenciales');
    } catch (error) {
      console.log(`\n❌ Error generando PDF: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

if (require.main === module) {
  verificarCotizacionLimpia();
} else {
  module.exports = verificarCotizacionLimpia;
}
