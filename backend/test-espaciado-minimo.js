const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciadoMinimo() {
  try {
    console.log('🔍 PRUEBA - Espaciado mínimo y profesional');
    console.log('==========================================');
    
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
    
    const outputPath = path.join(__dirname, 'espaciado-minimo-profesional.pdf');
    
    console.log('📄 Generando PDF con espaciado mínimo y profesional...');
    console.log('🔧 Cambios aplicados para espaciado mínimo:');
    console.log('   ✅ .footer-note: margin: 1px (mínimo)');
    console.log('   ✅ .subtitle-box: margin: 0px (sin espaciado)');
    console.log('   ✅ .normal-subtitle: margin: 0px (sin espaciado)');
    console.log('   ✅ .conditions-content: margin-bottom: 0px (sin espaciado)');
    console.log('   ✅ .conditions-list: margin-bottom: 1px (mínimo)');
    console.log('   ✅ .conditions-list li: margin-bottom: 0px (sin espaciado)');
    console.log('   ✅ Espaciado mínimo y profesional');
    console.log('   ✅ Sin espacios excesivos');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espaciado-minimo-profesional.pdf');
    console.log('2. Verifica que "I. CONDICIONES DEL SERVICIO" esté MUY cerca de la tabla');
    console.log('3. Verifica que NO haya espacios excesivos entre secciones');
    console.log('4. Verifica que se vea compacto y profesional');
    console.log('5. Verifica que el espaciado sea mínimo pero legible');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciadoMinimo();
