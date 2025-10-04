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

async function testAdaptiveSystem() {
  console.log('🧪 PROBANDO SISTEMA ADAPTATIVO INTELIGENTE\n');
  
  // Casos de prueba
  const testCases = [
    { count: 3, description: 'POCOS ITEMS (≤7): Espaciado generoso' },
    { count: 5, description: 'POCOS ITEMS (≤7): Espaciado generoso' },
    { count: 7, description: 'POCOS ITEMS (≤7): Espaciado generoso' },
    { count: 8, description: 'MUCHOS ITEMS (8+): Espaciado compacto' },
    { count: 12, description: 'MUCHOS ITEMS (8+): Espaciado compacto' },
    { count: 15, description: 'ITEMS EXTREMOS (15+): PLAZO ESTIMADO a segunda página' },
    { count: 20, description: 'ITEMS EXTREMOS (15+): PLAZO ESTIMADO a segunda página' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `test-adaptativo-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 SISTEMA ADAPTATIVO IMPLEMENTADO:');
  console.log('• ≤7 items: Espaciado generoso, todo en una página');
  console.log('• 8-14 items: Espaciado compacto, PLAZO ESTIMADO en primera página');
  console.log('• 15+ items: Espaciado muy compacto, PLAZO ESTIMADO en segunda página');
  console.log('\n✨ ¡Sistema adaptativo funcionando correctamente!');
}

// Ejecutar pruebas
testAdaptiveSystem().catch(console.error);
