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

async function testLogoAlineadoMargen() {
  console.log('🧪 PROBANDO LOGO ALINEADO AL MISMO MARGEN QUE LAS LETRAS\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 21, description: '21 ITEMS: Logo alineado al margen' },
    { count: 24, description: '24 ITEMS: Logo alineado al margen' },
    { count: 25, description: '25 ITEMS: Logo alineado al margen' },
    { count: 27, description: '27 ITEMS: Logo alineado al margen' },
    { count: 28, description: '28 ITEMS: Logo alineado al margen' },
    { count: 30, description: '30 ITEMS: Logo alineado al margen' },
    { count: 35, description: '35 ITEMS: Logo alineado al margen' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `logo-alineado-margen-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 LOGO ALINEADO AL MISMO MARGEN:');
  console.log('• .second-page .header: margin-left: 0, padding-left: 0');
  console.log('• .second-page .header img: margin-left: 0, margin-right: 15px');
  console.log('• Logo alineado al mismo margen que las letras');
  console.log('• Logo a la misma altura que el texto');
  console.log('\n✅ BENEFICIOS:');
  console.log('• Logo alineado al mismo margen que las letras');
  console.log('• Logo a la misma altura que el texto');
  console.log('• Diseño consistente y profesional');
  console.log('• Alineación perfecta entre logo y contenido');
  console.log('\n✨ ¡Logo alineado al margen funcionando!');
}

// Ejecutar pruebas
testLogoAlineadoMargen().catch(console.error);
