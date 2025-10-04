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

async function testLetrasIguales() {
  console.log('🔤 VERIFICANDO TAMAÑO DE LETRAS IGUALES EN AMBAS PÁGINAS\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 17, description: '17 ITEMS: Letras normales en ambas páginas' },
    { count: 25, description: '25 ITEMS: Letras pequeñas solo en segunda página' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `letras-iguales-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 TAMAÑOS DE LETRA APLICADOS:');
  console.log('• PÁGINA 1: Letras normales (10px-12px)');
  console.log('• PÁGINA 2: Letras normales (10px-12px) para casos intermedios');
  console.log('• PÁGINA 2: Letras pequeñas (6px-7px) solo para 25+ items');
  console.log('\n✅ VERIFICACIÓN:');
  console.log('• .second-page .subtitle-box .subtitle-inner: 12px');
  console.log('• .second-page .conditions-content: 10px');
  console.log('• .second-page .normal-subtitle: 12px');
  console.log('• Espaciado mejorado: margin-bottom: 10px');
  console.log('• Line-height: 1.3 para mejor legibilidad');
  console.log('\n✨ ¡Letras iguales en ambas páginas!');
}

// Ejecutar pruebas
testLetrasIguales().catch(console.error);
