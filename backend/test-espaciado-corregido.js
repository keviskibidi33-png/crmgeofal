const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciadoCorregido() {
  try {
    console.log('🔍 PRUEBA - Espaciado corregido y más profesional');
    console.log('==============================================');
    
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
    
    const outputPath = path.join(__dirname, 'espaciado-corregido-profesional.pdf');
    
    console.log('📄 Generando PDF con espaciado corregido...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   ✅ Reducido espaciado entre tabla y "I. CONDICIONES DEL SERVICIO"');
    console.log('   ✅ Reducido espaciado entre "CONDICIONES ESPECÍFICAS" y "PLAZO ESTIMADO"');
    console.log('   ✅ Espaciado más compacto y profesional');
    console.log('   ✅ Mantiene legibilidad');
    console.log('   ✅ Aspecto más profesional');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espaciado-corregido-profesional.pdf');
    console.log('2. Verifica que "I. CONDICIONES DEL SERVICIO" esté más cerca de la tabla');
    console.log('3. Verifica que el espaciado entre secciones sea pequeño');
    console.log('4. Verifica que se vea más profesional y compacto');
    console.log('5. Verifica que mantenga la adaptabilidad');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciadoCorregido();
