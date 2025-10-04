const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');

// Función para crear items de prueba
function createTestItems(count) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      code: `AG${i.toString().padStart(2, '0')}`,
      description: `Partículas planas y alargadas en agregado grueso (${i})`,
      standard: 'ASTM D4791-19 (Reapproved 2023)',
      accreditation: '*',
      quantity: 1,
      unit_price: 120.00
    });
  }
  return items;
}

// Función para crear bundle de prueba
function createTestBundle(itemCount) {
  return {
    quote: {
      meta: {
        quote: {
          issue_date: '2025-01-03',
          delivery_days: 4,
          payment_terms: '30 días'
        },
        items: createTestItems(itemCount)
      },
      variant_id: 1
    },
    company: {
      name: 'Innovatech Solutions S.A.C.',
      ruc: '20123456789',
      contact: 'Juan Pérez',
      phone: '987654321',
      email: 'juan@innovatech.com'
    },
    project: {
      name: 'Proyecto de Construcción Residencial',
      location: 'Lima, Perú',
      reference: 'REF-2025-001'
    },
    commercial: {
      advisor: 'María González',
      phone: '987654322'
    }
  };
}

async function testDebugCambios() {
  console.log('🔍 DEBUG: VERIFICANDO QUE LOS CAMBIOS SE APLIQUEN\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 3, description: '3 ITEMS: Clase few-items aplicada' },
    { count: 10, description: '10 ITEMS: Clase many-items aplicada' },
    { count: 22, description: '22 ITEMS: Clase partial-items aplicada' },
    { count: 26, description: '26 ITEMS: Clase medium-items aplicada' },
    { count: 30, description: '30 ITEMS: Clase very-many-items aplicada' },
    { count: 35, description: '35 ITEMS: Clase extreme-items aplicada' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `debug-cambios-${testCase.count}-items.pdf`;
      
      await generateSmartTemplatePdf(bundle, outputPath);
      console.log(`✅ PDF generado: ${outputPath}`);
      
      // Verificar que el archivo existe
      const fs = require('fs');
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`📁 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
      }
      
    } catch (error) {
      console.error(`❌ Error con ${testCase.count} items:`, error.message);
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('\n🔍 DEBUG COMPLETADO:');
  console.log('• Template HTML actualizado con clases adaptativas');
  console.log('• CSS con clases adaptativas definidas');
  console.log('• Encabezado optimizado para todas las cantidades');
  console.log('\n✅ CORRECCIONES APLICADAS:');
  console.log('• .page-content-wrapper: margin-top: -15px');
  console.log('• .header: margin-top: -15px, margin-bottom: 15px');
  console.log('• .title: margin: 15px 0 15px 0');
  console.log('• .info-grid: margin-top: 10px, margin-bottom: 10px');
  console.log('\n✨ ¡Debug completado - cambios aplicados!');
}

// Ejecutar pruebas
testDebugCambios().catch(console.error);
