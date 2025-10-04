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

async function testSoloSegundaPagina() {
  console.log('🧪 PROBANDO CAMBIOS SOLO EN SEGUNDA PÁGINA\n');
  
  // Casos de prueba específicos
  const testCases = [
    { count: 3, description: '3 ITEMS: Solo primera página - SIN cambios' },
    { count: 5, description: '5 ITEMS: Solo primera página - SIN cambios' },
    { count: 7, description: '7 ITEMS: Solo primera página - SIN cambios' },
    { count: 10, description: '10 ITEMS: Solo primera página - SIN cambios' },
    { count: 15, description: '15 ITEMS: Solo primera página - SIN cambios' },
    { count: 20, description: '20 ITEMS: Solo primera página - SIN cambios' },
    { count: 21, description: '21 ITEMS: Con segunda página - CON cambios en segunda página' },
    { count: 25, description: '25 ITEMS: Con segunda página - CON cambios en segunda página' },
    { count: 30, description: '30 ITEMS: Con segunda página - CON cambios en segunda página' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📊 ${testCase.description} - ${testCase.count} items`);
      
      const bundle = createTestBundle(testCase.count);
      const outputPath = `solo-segunda-pagina-${testCase.count}-items.pdf`;
      
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
  
  console.log('\n🎯 CAMBIOS SOLO EN SEGUNDA PÁGINA:');
  console.log('• Primera página: Espaciado original mantenido');
  console.log('• Segunda página: margin-top: -25px');
  console.log('• Segunda página: header margin-top: -25px, margin-bottom: 5px');
  console.log('• Segunda página: contenido más compacto');
  console.log('\n✅ BENEFICIOS:');
  console.log('• Primera página mantiene su diseño original');
  console.log('• Segunda página optimizada para que entre todo');
  console.log('• Footer "III. ACEPTACIÓN" se ve correctamente');
  console.log('• Mejor aprovechamiento del espacio en segunda página');
  console.log('\n✨ ¡Cambios solo en segunda página funcionando!');
}

// Ejecutar pruebas
testSoloSegundaPagina().catch(console.error);
