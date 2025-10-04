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

async function testUmbral25_27() {
  console.log('🧪 PROBANDO NUEVO UMBRAL 25-27 ITEMS\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 20, description: '20 ITEMS: Todo en primera página' },
    { count: 21, description: '21 ITEMS: Solo PLAZO ESTIMADO a segunda página' },
    { count: 24, description: '24 ITEMS: Solo PLAZO ESTIMADO a segunda página' },
    { count: 25, description: '25 ITEMS: Condiciones básicas a segunda página' },
    { count: 26, description: '26 ITEMS: Condiciones básicas a segunda página' },
    { count: 27, description: '27 ITEMS: Condiciones básicas a segunda página' },
    { count: 28, description: '28 ITEMS: Todas las condiciones a segunda página' },
    { count: 30, description: '30 ITEMS: Todas las condiciones a segunda página' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `umbral-25-27-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 NUEVO UMBRAL 25-27 IMPLEMENTADO:');
  console.log('• ≤20 items: Todo en primera página');
  console.log('• 21-24 items: Solo PLAZO ESTIMADO a segunda página');
  console.log('• 25-27 items: Condiciones básicas a segunda página');
  console.log('• 28+ items: Todas las condiciones a segunda página');
  console.log('\n✅ PRIMERA PÁGINA (25-27 items):');
  console.log('• Solo tabla de servicios');
  console.log('\n✅ SEGUNDA PÁGINA (25-27 items):');
  console.log('• (*) Ensayo dentro del alcance de acreditación INACAL.');
  console.log('• I. CONDICIONES DEL SERVICIO');
  console.log('• VALIDEZ DE LA OFERTA: 30 días calendario...');
  console.log('• CONDICIONES ESPECÍFICAS: (texto completo)');
  console.log('• PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO');
  console.log('• CONTRAMUESTRA');
  console.log('\n✨ ¡Nuevo umbral 25-27 funcionando!');
}

// Ejecutar pruebas
testUmbral25_27().catch(console.error);
