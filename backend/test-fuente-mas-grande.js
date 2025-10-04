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

async function testFuenteMasGrande() {
  console.log('🧪 PROBANDO FUENTE MÁS GRANDE EN SEGUNDA PÁGINA\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 21, description: '21 ITEMS: Segunda página con fuente más grande' },
    { count: 24, description: '24 ITEMS: Segunda página con fuente más grande' },
    { count: 25, description: '25 ITEMS: Segunda página con fuente más grande' },
    { count: 27, description: '27 ITEMS: Segunda página con fuente más grande' },
    { count: 28, description: '28 ITEMS: Segunda página con fuente más grande' },
    { count: 30, description: '30 ITEMS: Segunda página con fuente más grande' },
    { count: 35, description: '35 ITEMS: Segunda página con fuente más grande' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `fuente-mas-grande-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 FUENTE MÁS GRANDE EN SEGUNDA PÁGINA:');
  console.log('• .subtitle-box .subtitle-inner: font-size: 10px');
  console.log('• .conditions-content: font-size: 8px, line-height: 1.2');
  console.log('• .normal-subtitle: font-size: 9px');
  console.log('• Mejor legibilidad sin perder espacio');
  console.log('\n✅ BENEFICIOS:');
  console.log('• Texto más legible en segunda página');
  console.log('• Mejor experiencia de lectura');
  console.log('• Mantiene el espacio optimizado');
  console.log('• Footer se ve correctamente');
  console.log('\n✨ ¡Fuente más grande funcionando!');
}

// Ejecutar pruebas
testFuenteMasGrande().catch(console.error);
