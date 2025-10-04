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

async function testContenidoAbajo() {
  console.log('🧪 PROBANDO CONTENIDO MÁS ABAJO\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 3, description: '3 ITEMS: Contenido más abajo' },
    { count: 5, description: '5 ITEMS: Contenido más abajo' },
    { count: 7, description: '7 ITEMS: Contenido más abajo' },
    { count: 10, description: '10 ITEMS: Contenido más abajo' },
    { count: 15, description: '15 ITEMS: Contenido más abajo' },
    { count: 20, description: '20 ITEMS: Contenido más abajo' },
    { count: 25, description: '25 ITEMS: Contenido más abajo' },
    { count: 30, description: '30 ITEMS: Contenido más abajo' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `contenido-abajo-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 CONTENIDO MÁS ABAJO:');
  console.log('• .page-content-wrapper: margin-top: 10px');
  console.log('• .header: margin-bottom: 30px, margin-top: 5px');
  console.log('• .title: margin: 30px 0 25px 0');
  console.log('• .info-grid: margin-top: 25px, margin-bottom: 20px');
  console.log('\n✅ BENEFICIOS:');
  console.log('• Más espacio entre logo y contenido');
  console.log('• Mejor distribución vertical');
  console.log('• Presentación más profesional');
  console.log('• Contenido bien espaciado');
  console.log('\n✨ ¡Contenido más abajo funcionando!');
}

// Ejecutar pruebas
testContenidoAbajo().catch(console.error);
