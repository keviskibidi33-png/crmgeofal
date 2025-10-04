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

async function testCompactTableFinal() {
  console.log('🧪 PROBANDO TABLA COMPACTA FINAL\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 3, description: 'POCOS ITEMS (≤7): Tabla compacta, todo en primera página' },
    { count: 5, description: 'POCOS ITEMS (≤7): Tabla compacta, todo en primera página' },
    { count: 7, description: 'POCOS ITEMS (≤7): Tabla compacta, todo en primera página' },
    { count: 8, description: 'MUCHOS ITEMS (8-14): Tabla compacta, todo en primera página' },
    { count: 12, description: 'MUCHOS ITEMS (8-14): Tabla compacta, todo en primera página' },
    { count: 15, description: 'MUY MUCHOS ITEMS (15+): Tabla compacta, condiciones a segunda página' },
    { count: 20, description: 'MUY MUCHOS ITEMS (15+): Tabla compacta, condiciones a segunda página' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `tabla-compacta-final-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 SISTEMA ADAPTATIVO COMPACTO FINAL:');
  console.log('• ≤7 items: Tabla compacta, todo en primera página');
  console.log('• 8-14 items: Tabla compacta, todo en primera página');
  console.log('• 15+ items: Tabla compacta, condiciones a segunda página');
  console.log('\n✨ ¡Tabla compacta siempre, sin espaciado excesivo!');
}

// Ejecutar pruebas
testCompactTableFinal().catch(console.error);
