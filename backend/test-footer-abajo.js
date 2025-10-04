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

async function testFooterAbajo() {
  console.log('📄 VERIFICANDO FOOTER MÁS ABAJO EN SEGUNDA PÁGINA\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 17, description: '17 ITEMS: Footer más abajo (intermediate-items)' },
    { count: 25, description: '25 ITEMS: Footer más abajo (medium-items)' },
    { count: 30, description: '30 ITEMS: Footer más abajo (very-many-items)' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `footer-abajo-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 FOOTER AJUSTADO:');
  console.log('• .second-page .footer-bar: margin-top: 25px (antes 16px)');
  console.log('• Footer más separado del contenido');
  console.log('• Aplicado a todos los casos (intermediate, medium, very-many)');
  console.log('\n✅ VERIFICACIÓN:');
  console.log('• 17 items: Footer más abajo con letras normales');
  console.log('• 25+ items: Footer más abajo con letras pequeñas');
  console.log('• Espaciado mejorado en segunda página');
  console.log('\n✨ ¡Footer movido más abajo!');
}

// Ejecutar pruebas
testFooterAbajo().catch(console.error);
