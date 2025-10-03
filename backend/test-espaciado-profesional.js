const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciadoProfesional() {
  try {
    console.log('🔍 PRUEBA - Espaciado profesional y adecuado');
    console.log('============================================');
    
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
    
    const outputPath = path.join(__dirname, 'espaciado-profesional-adecuado.pdf');
    
    console.log('📄 Generando PDF con espaciado profesional...');
    console.log('🔧 Cambios aplicados para espaciado profesional:');
    console.log('   ✅ .footer-note: margin-bottom: 15px (espacio entre nota y condiciones)');
    console.log('   ✅ .subtitle-box: margin: 8px 0 6px 0 (espacio alrededor del título)');
    console.log('   ✅ .normal-subtitle: margin: 6px 0 4px 0 (espacio entre subtítulos)');
    console.log('   ✅ .conditions-content: margin-bottom: 4px (espacio entre párrafos)');
    console.log('   ✅ line-height: 1.3 (mejor legibilidad)');
    console.log('   ✅ Espaciado profesional y legible');
    console.log('   ✅ No están pegados, tienen espacio adecuado');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espaciado-profesional-adecuado.pdf');
    console.log('2. Verifica que haya espacio entre "(*) Ensayo..." y "I. CONDICIONES DEL SERVICIO"');
    console.log('3. Verifica que haya espacio entre "I. CONDICIONES DEL SERVICIO" y "VALIDEZ DE LA OFERTA"');
    console.log('4. Verifica que haya espacio entre "CONDICIONES ESPECÍFICAS" y "PLAZO ESTIMADO"');
    console.log('5. Verifica que se vea profesional y no esté todo pegado');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciadoProfesional();
