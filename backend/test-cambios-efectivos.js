const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testCambiosEfectivos() {
  try {
    console.log('🔍 PRUEBA - Cambios CSS efectivos');
    console.log('=================================');
    
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
        { code: 'TEST', description: 'Test Item', norma: 'ASTM', costo_unitario: 100.00, cantidad: 1, costo_parcial: 100.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'cambios-efectivos.pdf');
    
    console.log('📄 Generando PDF con cambios efectivos...');
    console.log('🔧 Correcciones aplicadas:');
    console.log('   - JavaScript simplificado (sin sobrescribir CSS)');
    console.log('   - Título margin-top: 0px (más cerca del logo)');
    console.log('   - Footer margin-top: 50px (subido)');
    console.log('   - CSS respetado sin interferencias');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo cambios-efectivos.pdf');
    console.log('2. El título debe estar más cerca del logo');
    console.log('3. El footer debe estar subido (más separado del contenido)');
    console.log('4. Los cambios CSS deben ser visibles');
    console.log('5. Sin interferencias del JavaScript');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testCambiosEfectivos();
