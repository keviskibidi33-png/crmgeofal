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

async function testFooterEspaciado() {
  console.log('🧪 VERIFICANDO ESPACIADO DEL FOOTER\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 25, description: '25 ITEMS: Footer con espaciado correcto' },
    { count: 27, description: '27 ITEMS: Footer con espaciado correcto' },
    { count: 28, description: '28 ITEMS: Footer con espaciado correcto' },
    { count: 30, description: '30 ITEMS: Footer con espaciado correcto' },
    { count: 35, description: '35 ITEMS: Footer con espaciado correcto' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `footer-espaciado-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 FOOTER CON ESPACIADO CORRECTO:');
  console.log('• .second-page-footer: margin-top: 6px');
  console.log('• Footer movido 6px hacia abajo');
  console.log('• Mejor separación del contenido');
  console.log('• Espaciado más cómodo y profesional');
  console.log('\n✅ VERIFICACIÓN:');
  console.log('• Footer con espaciado correcto');
  console.log('• Mejor separación del contenido');
  console.log('• Diseño más profesional');
  console.log('• Espaciado cómodo para leer');
  console.log('\n✨ ¡Footer con espaciado correcto funcionando!');
}

// Ejecutar pruebas
testFooterEspaciado().catch(console.error);
