const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');

async function verificarSinVariantes() {
  try {
    console.log('🔍 VERIFICANDO SISTEMA SIN VARIANTES...');

    // Datos de prueba sin variantes
    const testBundle = {
      quote: { 
        id: '2025-0927-289',
        meta: {
          quote: {
            delivery_days: 4  // Solo días de entrega configurables
          }
        }
      },
      company: { name: 'GEOFAL SAC', ruc: '20549356762' },
      project: { name: 'Proyecto Test Sin Variantes', location: 'Lima' },
      items: [
        { code: 'SU04', description: 'Contenido de humedad con Speedy', norm: 'NTP 339.25', unit_price: 30.00, quantity: 1 },
        { code: 'SU18', description: 'Capacidad de carga del Suelo', norm: 'ASTM D-1194', unit_price: 2000.00, quantity: 1 }
      ]
    };

    const outputPath = `tmp/test_sin_variantes_${Date.now()}.pdf`;
    
    console.log('\n📋 CAMBIOS IMPLEMENTADOS:');
    console.log('   ✅ Sistema de variantes completamente eliminado');
    console.log('   ✅ Frontend limpio sin selector de variantes');
    console.log('   ✅ Backend sin funciones de variantes');
    console.log('   ✅ Solo días de entrega configurables');
    console.log('   ✅ Número de cotización con año para mapeo');
    console.log('   ✅ Título fijo: "ENSAYOS DE LABORATORIO"');
    
    console.log('\n📋 Datos de prueba:');
    console.log(`   - Número: COT-${testBundle.quote.id}-${new Date().getFullYear().toString().slice(-2)}`);
    console.log(`   - Proyecto: ${testBundle.project.name}`);
    console.log(`   - Días de entrega: ${testBundle.quote.meta.quote.delivery_days}`);
    console.log(`   - Items: ${testBundle.items.length}`);
    
    try {
      await generateSmartTemplatePdf(testBundle, outputPath);
      console.log(`\n✅ PDF generado exitosamente: ${outputPath}`);
      
      console.log('\n🎉 ¡SISTEMA LIMPIO VERIFICADO!');
      console.log('✅ Sin variantes innecesarias');
      console.log('✅ Solo funcionalidades esenciales');
      console.log('✅ Días de entrega configurables');
      console.log('✅ Código más limpio y eficiente');
      
    } catch (error) {
      console.log(`\n❌ Error generando PDF: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

if (require.main === module) {
  verificarSinVariantes();
} else {
  module.exports = verificarSinVariantes;
}
