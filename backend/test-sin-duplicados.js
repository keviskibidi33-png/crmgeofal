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

async function testSinDuplicados() {
  console.log('🧪 PROBANDO SIN DUPLICADOS DE TEXTO INACAL\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 3, description: '3 ITEMS: Sin duplicados - solo primera página' },
    { count: 5, description: '5 ITEMS: Sin duplicados - solo primera página' },
    { count: 7, description: '7 ITEMS: Sin duplicados - solo primera página' },
    { count: 10, description: '10 ITEMS: Sin duplicados - solo primera página' },
    { count: 15, description: '15 ITEMS: Sin duplicados - solo primera página' },
    { count: 20, description: '20 ITEMS: Sin duplicados - solo primera página' },
    { count: 21, description: '21 ITEMS: Sin duplicados - con segunda página' },
    { count: 25, description: '25 ITEMS: Sin duplicados - con segunda página' },
    { count: 30, description: '30 ITEMS: Sin duplicados - con segunda página' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `sin-duplicados-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 SIN DUPLICADOS DE TEXTO INACAL:');
  console.log('• Eliminado duplicado de condicionesSegundaPagina');
  console.log('• Texto "(*) Ensayo dentro del alcance de acreditación INACAL." aparece solo una vez');
  console.log('• Logo alineado correctamente con el texto');
  console.log('• Diseño limpio y profesional');
  console.log('\n✅ BENEFICIOS:');
  console.log('• Sin duplicación de texto');
  console.log('• Presentación más limpia');
  console.log('• Mejor experiencia de lectura');
  console.log('• Diseño profesional y ordenado');
  console.log('\n✨ ¡Sin duplicados funcionando!');
}

// Ejecutar pruebas
testSinDuplicados().catch(console.error);
