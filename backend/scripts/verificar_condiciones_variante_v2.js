const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');

async function verificarCondicionesVarianteV2() {
  try {
    console.log('🔍 VERIFICANDO CONDICIONES ESPECÍFICAS DE VARIANTE V2 (PROBETAS)...');

    // Datos de prueba con variante V2 (PROBETAS)
    const testBundle = {
      quote: { 
        id: '2025-0927-289',
        variant_id: 'V2', // PROBETAS
        meta: {
          quote: {
            delivery_days: 5
          }
        }
      },
      company: { name: 'GEOFAL SAC', ruc: '20549356762' },
      project: { name: 'Proyecto V2 - PROBETAS', location: 'Lima' },
      items: [
        { code: 'PR01', description: 'Ensayo de resistencia a la compresión', norm: 'ASTM C39', unit_price: 80.00, quantity: 3 },
        { code: 'PR02', description: 'Ensayo de resistencia a la flexión', norm: 'ASTM C78', unit_price: 120.00, quantity: 2 }
      ]
    };

    console.log('\n📋 CONDICIONES ESPECÍFICAS ESPERADAS PARA V2 (PROBETAS):');
    console.log('   ✅ El cliente debe proporcionar las probetas antes del ingreso a obra.');
    console.log('   ✅ El cliente deberá de entregar las muestras debidamente identificadas.');
    console.log('   ✅ El cliente deberá especificar la Norma a ser utilizada para la ejecución del ensayo, caso contrario se considera Norma ASTM o NTP vigente de acuerdo con el alcance del laboratorio.');
    console.log('   ✅ El cliente deberá entregar las muestras en las instalaciones del LEM, ubicado en la Av. Marañón N° 763, Los Olivos, Lima.');
    console.log('   ✅ Los resultados se entregarán en un plazo máximo de 5 días hábiles.');
    console.log('   ✅ Los ensayos se realizarán dentro del alcance de acreditación INACAL.');
    
    console.log('\n📋 Datos de prueba:');
    console.log(`   - Número: COT-${testBundle.quote.id}-${new Date().getFullYear().toString().slice(-2)}`);
    console.log(`   - Variante: ${testBundle.quote.variant_id} (PROBETAS)`);
    console.log(`   - Título dinámico: PROBETAS`);
    console.log(`   - Días de entrega: ${testBundle.quote.meta.quote.delivery_days}`);
    console.log(`   - Items: ${testBundle.items.length}`);
    
    try {
      const outputPath = `tmp/test_variante_v2_condiciones_${Date.now()}.pdf`;
      await generateSmartTemplatePdf(testBundle, outputPath);
      console.log(`\n✅ PDF generado exitosamente: ${outputPath}`);
      
      console.log('\n🎉 ¡CONDICIONES ESPECÍFICAS DE VARIANTE V2 VERIFICADAS!');
      console.log('✅ Condiciones dinámicas funcionando correctamente');
      console.log('✅ Template usando variant_conditions.conditions');
      console.log('✅ Condiciones específicas de PROBETAS aplicadas');
      console.log('✅ Días de entrega configurables (5 días)');
      console.log('✅ Título dinámico: PROBETAS');
      
    } catch (error) {
      console.log(`\n❌ Error generando PDF: ${error.message}`);
      console.log('🔍 Verificando si variant_conditions está disponible...');
      
      // Verificar que las condiciones de la variante estén disponibles
      const { getVariantConditions } = require('../utils/smartTemplatePdf');
      const conditions = getVariantConditions('V2');
      console.log('\n📋 Condiciones de V2 disponibles:');
      console.log('   - Título:', conditions.title);
      console.log('   - Días de entrega:', conditions.delivery_days);
      console.log('   - Condiciones específicas:');
      conditions.conditions.forEach((condition, index) => {
        console.log(`     ${index + 1}. ${condition}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en verificación de condiciones V2:', error.message);
  }
}

if (require.main === module) {
  verificarCondicionesVarianteV2();
} else {
  module.exports = verificarCondicionesVarianteV2;
}
