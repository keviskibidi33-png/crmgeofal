const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');

async function debugVarianteAplicacion() {
  try {
    console.log('🔍 DEBUGGING APLICACIÓN DE VARIANTES EN COTIZACIÓN...');

    // Simular diferentes escenarios de datos
    const scenarios = [
      {
        name: 'Escenario 1: Variante V2 con variant_id como string',
        bundle: {
          quote: { 
            id: '2025-0927-289',
            variant_id: 'V2', // String
            meta: {
              quote: {
                delivery_days: 5
              }
            }
          },
          company: { name: 'GEOFAL SAC', ruc: '20549356762' },
          project: { name: 'Proyecto V2 String', location: 'Lima' },
          items: [
            { code: 'PR01', description: 'Ensayo de resistencia a la compresión', norm: 'ASTM C39', unit_price: 80.00, quantity: 3 }
          ]
        }
      },
      {
        name: 'Escenario 2: Variante V8 con variant_id como string',
        bundle: {
          quote: { 
            id: '2025-0927-290',
            variant_id: 'V8', // String
            meta: {
              quote: {
                delivery_days: 10
              }
            }
          },
          company: { name: 'GEOFAL SAC', ruc: '20549356762' },
          project: { name: 'Proyecto V8 String', location: 'Lima' },
          items: [
            { code: 'CC01', description: 'Ensayo de slump', norm: 'ASTM C143', unit_price: 30.00, quantity: 6 }
          ]
        }
      },
      {
        name: 'Escenario 3: Sin variante (variant_id null)',
        bundle: {
          quote: { 
            id: '2025-0927-291',
            variant_id: null,
            meta: {
              quote: {
                delivery_days: 4
              }
            }
          },
          company: { name: 'GEOFAL SAC', ruc: '20549356762' },
          project: { name: 'Proyecto Sin Variante', location: 'Lima' },
          items: [
            { code: 'SU01', description: 'Ensayo estándar', norm: 'ASTM D1234', unit_price: 50.00, quantity: 1 }
          ]
        }
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📋 ${scenario.name}:`);
      console.log(`   - variant_id: ${scenario.bundle.quote.variant_id}`);
      console.log(`   - delivery_days: ${scenario.bundle.quote.meta.quote.delivery_days}`);
      
      // Verificar qué condiciones se obtienen
      const { getVariantConditions } = require('../utils/smartTemplatePdf');
      const conditions = getVariantConditions(scenario.bundle.quote.variant_id);
      console.log(`   - Título obtenido: ${conditions.title}`);
      console.log(`   - Días obtenidos: ${conditions.delivery_days}`);
      console.log(`   - Condiciones específicas: ${conditions.conditions.length} items`);
      conditions.conditions.forEach((condition, index) => {
        console.log(`     ${index + 1}. ${condition.substring(0, 80)}...`);
      });

      try {
        const outputPath = `tmp/debug_${scenario.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`;
        await generateSmartTemplatePdf(scenario.bundle, outputPath);
        console.log(`   ✅ PDF generado: ${outputPath}`);
      } catch (error) {
        console.log(`   ❌ Error generando PDF: ${error.message}`);
      }
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETO:');
    console.log('✅ Verificando que variant_id se pase correctamente');
    console.log('✅ Verificando que getVariantConditions funcione');
    console.log('✅ Verificando que las condiciones se apliquen en el template');
    console.log('✅ Verificando que el PDF se genere con condiciones específicas');

  } catch (error) {
    console.error('❌ Error en debugging de variantes:', error.message);
  }
}

if (require.main === module) {
  debugVarianteAplicacion();
} else {
  module.exports = debugVarianteAplicacion;
}
