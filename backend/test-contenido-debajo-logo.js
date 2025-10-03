const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testContenidoDebajoLogo() {
  try {
    console.log('🔍 PRUEBA - Contenido completamente debajo del logo');
    console.log('================================================');
    
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
        { code: 'TEST2', description: 'Test Item 2', norma: 'ASTM', costo_unitario: 200.00, cantidad: 1, costo_parcial: 200.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'contenido-debajo-logo.pdf');
    
    console.log('📄 Generando PDF con contenido debajo del logo...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Header height: 80px → 120px (más espacio para logo)');
    console.log('   - Header margin-bottom: 10px → 20px (más separación)');
    console.log('   - Título margin-top: 0px → 30px (debajo del logo)');
    console.log('   - Separación clara entre logo y contenido');
    console.log('   - Sin superposición ni interrupciones');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo contenido-debajo-logo.pdf');
    console.log('2. El logo debe estar completamente arriba');
    console.log('3. El título "COTIZACIÓN N°" debe estar claramente debajo del logo');
    console.log('4. Los datos del cliente deben estar debajo del título');
    console.log('5. Sin superposición ni interrupciones visuales');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testContenidoDebajoLogo();
