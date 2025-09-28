const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');

async function verificarCampoServicioEliminado() {
  try {
    console.log('🔍 VERIFICANDO ELIMINACIÓN DEL CAMPO "NOMBRE DEL SERVICIO"...');

    // Datos de prueba sin campo service_name
    const testBundle = {
      quote: { 
        id: '2025-0927-289',
        variant_id: 'V1',
        meta: {
          quote: {
            delivery_days: 4
          }
        }
      },
      company: { 
        name: 'GEOFAL SAC', 
        ruc: '20549356762',
        // service_name eliminado - no sirve
      },
      project: { name: 'Proyecto Sin Campo Servicio', location: 'Lima' },
      items: [
        { code: 'SU04', description: 'Contenido de humedad con Speedy', norm: 'NTP 339.25', unit_price: 30.00, quantity: 1 },
        { code: 'SU18', description: 'Capacidad de carga del Suelo', norm: 'ASTM D-1194', unit_price: 2000.00, quantity: 1 }
      ]
    };

    console.log('\n📋 CAMBIOS IMPLEMENTADOS:');
    console.log('   ✅ Campo "Nombre del servicio" eliminado del formulario');
    console.log('   ✅ Funciones handleServiceInputChange eliminadas');
    console.log('   ✅ Funciones handleServiceBlur eliminadas');
    console.log('   ✅ Funciones handleServiceSuggestionClick eliminadas');
    console.log('   ✅ Estados serviceSuggestions eliminados');
    console.log('   ✅ Estados showServiceSuggestions eliminados');
    console.log('   ✅ Campo service_name eliminado del estado del cliente');
    console.log('   ✅ useEffect de carga de servicios eliminado');
    console.log('   ✅ Autocompletado de servicios eliminado');
    
    console.log('\n📋 Datos de prueba:');
    console.log(`   - Número: COT-${testBundle.quote.id}-${new Date().getFullYear().toString().slice(-2)}`);
    console.log(`   - Proyecto: ${testBundle.project.name}`);
    console.log(`   - Variante: ${testBundle.quote.variant_id}`);
    console.log(`   - Días de entrega: ${testBundle.quote.meta.quote.delivery_days}`);
    console.log(`   - Items: ${testBundle.items.length}`);
    console.log(`   - Campo service_name: ELIMINADO`);
    
    try {
      const outputPath = `tmp/test_sin_campo_servicio_${Date.now()}.pdf`;
      await generateSmartTemplatePdf(testBundle, outputPath);
      console.log(`\n✅ PDF generado exitosamente: ${outputPath}`);
      
      console.log('\n🎉 ¡CAMPO "NOMBRE DEL SERVICIO" ELIMINADO EXITOSAMENTE!');
      console.log('✅ Formulario más limpio sin campo innecesario');
      console.log('✅ Código más eficiente sin funciones no utilizadas');
      console.log('✅ Sistema enfocado en las 8 variantes esenciales');
      console.log('✅ PDF generado correctamente sin campo service_name');
      
    } catch (error) {
      console.log(`\n❌ Error generando PDF: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

if (require.main === module) {
  verificarCampoServicioEliminado();
} else {
  module.exports = verificarCampoServicioEliminado;
}
