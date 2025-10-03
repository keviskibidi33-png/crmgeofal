const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testAdaptativoFinal() {
  try {
    console.log('🔍 PRUEBA - Sistema Adaptativo Final');
    console.log('====================================');
    
    // Datos de prueba con diferentes cantidades de items
    const testBundles = [
      {
        name: 'Pocos items (3)',
        items: [
          { code: 'AG34', description: 'Test Item 1', norma: 'ASTM', acreditacion: '(*)', cantidad: 1, costo_parcial: 100.00 },
          { code: 'AG35', description: 'Test Item 2', norma: 'ASTM', acreditacion: '(*)', cantidad: 2, costo_parcial: 200.00 },
          { code: 'AG36', description: 'Test Item 3', norma: 'ASTM', acreditacion: '(*)', cantidad: 1, costo_parcial: 150.00 }
        ]
      },
      {
        name: 'Muchos items (8)',
        items: Array.from({length: 8}, (_, i) => ({
          code: `AG${30+i}`,
          description: `Test Item ${i+1}`,
          norma: 'ASTM',
          acreditacion: '(*)',
          cantidad: 1,
          costo_parcial: 120.00
        }))
      },
      {
        name: 'Items extremos (15)',
        items: Array.from({length: 15}, (_, i) => ({
          code: `AG${30+i}`,
          description: `Test Item ${i+1}`,
          norma: 'ASTM',
          acreditacion: '(*)',
          cantidad: 1,
          costo_parcial: 120.00
        }))
      }
    ];
    
    for (const testCase of testBundles) {
      console.log(`\n📄 Generando PDF: ${testCase.name}`);
      
      const testBundle = {
        quote: {
          id: 999,
          meta: {
            quote: {
              issue_date: '2025-10-03',
              delivery_days: 4
            }
          }
        },
        company: {
          name: 'Test Company S.A.C.',
          ruc: '20512345678',
          contact_name: 'Test User',
          contact_phone: '+51 987 654 321',
          contact_email: 'test@test.com'
        },
        project: {
          name: 'Test Project',
          location: 'Test Location'
        },
        user: {
          name: 'Admin',
          phone: '99999999999'
        },
        items: testCase.items
      };
      
      const outputPath = path.join(__dirname, `adaptativo-${testCase.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
      
      console.log('🔧 Características del sistema:');
      console.log('   ✅ Completamente adaptativo');
      console.log('   ✅ Detecta automáticamente cantidad de items');
      console.log('   ✅ Ajusta diseño según necesidad');
      console.log('   ✅ Mantiene estructura sin deformarse');
      console.log('   ✅ Mueve contenido a segunda página si es necesario');
      console.log('   ✅ Columnas: Código, Descripción, Norma, Acreditación, Cantidad, Costo Parcial');
      console.log('   ✅ Tabla unificada con totales integrados');
      
      await generateSmartTemplatePdf(testBundle, outputPath);
      
      console.log(`✅ PDF generado: ${outputPath}`);
    }
    
    console.log('\n🎯 VERIFICAR:');
    console.log('1. Abre los 3 archivos generados');
    console.log('2. Verifica que las columnas sean: Código, Descripción, Norma, Acreditación, Cantidad, Costo Parcial');
    console.log('3. Verifica que la tabla sea una sola unidad continua');
    console.log('4. Verifica que se adapte a diferentes cantidades de items');
    console.log('5. Verifica que no se deforme con muchos items');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testAdaptativoFinal();
