const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testSeparacion10px() {
  try {
    console.log('🔍 PRUEBA - Separación de 10px después de PLAZO ESTIMADO');
    console.log('=======================================================');
    
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
        { code: 'AG34', description: 'Test Item 1', norma: 'ASTM', acreditacion: '(*)', cantidad: 1, costo_parcial: 100.00 },
        { code: 'AG35', description: 'Test Item 2', norma: 'ASTM', acreditacion: '(*)', cantidad: 2, costo_parcial: 200.00 },
        { code: 'AG36', description: 'Test Item 3', norma: 'ASTM', acreditacion: '(*)', cantidad: 1, costo_parcial: 150.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'separacion-10px-plazo-estimado.pdf');
    
    console.log('📄 Generando PDF con separación de 10px...');
    console.log('🔧 Cambios aplicados:');
    console.log('   ✅ .conditions-content: margin-bottom: 10px (separación de 10px)');
    console.log('   ✅ Después de "PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO"');
    console.log('   ✅ Antes del footer y siguientes secciones');
    console.log('   ✅ Separación específica de 10px como solicitado');
    console.log('   ✅ Espaciado profesional y uniforme');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo separacion-10px-plazo-estimado.pdf');
    console.log('2. Verifica que haya 10px de separación después de "PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO"');
    console.log('3. Verifica que la separación sea visible y profesional');
    console.log('4. Verifica que el espaciado sea exactamente como lo necesitas');
    console.log('5. Verifica que se vea bien antes del footer');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testSeparacion10px();
