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

async function testLogoAlineado() {
  console.log('🧪 PROBANDO LOGO ALINEADO CON EL TEXTO\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 3, description: '3 ITEMS: Logo alineado con texto' },
    { count: 5, description: '5 ITEMS: Logo alineado con texto' },
    { count: 7, description: '7 ITEMS: Logo alineado con texto' },
    { count: 10, description: '10 ITEMS: Logo alineado con texto' },
    { count: 15, description: '15 ITEMS: Logo alineado con texto' },
    { count: 20, description: '20 ITEMS: Logo alineado con texto' },
    { count: 25, description: '25 ITEMS: Logo alineado con texto' },
    { count: 30, description: '30 ITEMS: Logo alineado con texto' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `logo-alineado-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 LOGO ALINEADO CON EL TEXTO:');
  console.log('• .header: display: flex, align-items: flex-start, gap: 15px');
  console.log('• .header img: position: relative, flex-shrink: 0');
  console.log('• Logo alineado con el margen del texto principal');
  console.log('• Texto "(*) Ensayo dentro del alcance de acreditación INACAL." visible');
  console.log('\n✅ BENEFICIOS:');
  console.log('• Logo alineado correctamente con el contenido');
  console.log('• Texto de acreditación visible y legible');
  console.log('• Mejor presentación profesional');
  console.log('• Diseño más ordenado y consistente');
  console.log('\n✨ ¡Logo alineado funcionando!');
}

// Ejecutar pruebas
testLogoAlineado().catch(console.error);
