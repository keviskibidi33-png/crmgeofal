const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testDosPaginas() {
  try {
    console.log('🔍 PRUEBA - Dos páginas con cambios CSS');
    console.log('======================================');
    
    // Datos de prueba
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
      items: [
        { code: 'TEST1', description: 'Test Item 1', norma: 'ASTM', costo_unitario: 100.00, cantidad: 1, costo_parcial: 100.00 },
        { code: 'TEST2', description: 'Test Item 2', norma: 'ASTM', costo_unitario: 200.00, cantidad: 1, costo_parcial: 200.00 },
        { code: 'TEST3', description: 'Test Item 3', norma: 'ASTM', costo_unitario: 300.00, cantidad: 1, costo_parcial: 300.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'dos-paginas.pdf');
    
    console.log('📄 Generando PDF con dos páginas...');
    console.log('🔧 Funcionalidad restaurada:');
    console.log('   - Segunda página forzada con JavaScript');
    console.log('   - CSS de primera página preservado');
    console.log('   - Título más cerca del logo (0px margin-top)');
    console.log('   - Footer subido (50px margin-top)');
    console.log('   - Ambas páginas visibles');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo dos-paginas.pdf');
    console.log('2. Debe haber DOS páginas');
    console.log('3. Primera página: título cerca del logo, footer subido');
    console.log('4. Segunda página: condiciones adicionales');
    console.log('5. Cambios CSS aplicados correctamente');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testDosPaginas();
