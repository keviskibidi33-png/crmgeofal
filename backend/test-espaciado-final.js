const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciadoFinal() {
  try {
    console.log('🔍 PRUEBA - Espaciado final corregido');
    console.log('=====================================');
    
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
    
    const outputPath = path.join(__dirname, 'espaciado-final-corregido.pdf');
    
    console.log('📄 Generando PDF con espaciado final corregido...');
    console.log('🔧 Cambios aplicados en template.css:');
    console.log('   ✅ .footer-note: margin-bottom: 2px (reducido de 8px)');
    console.log('   ✅ .subtitle-box: margin: 1px 0 1px 0 (reducido de 2px)');
    console.log('   ✅ .normal-subtitle: margin: 1px 0 0px 0 (reducido de 2px)');
    console.log('   ✅ .conditions-content: margin-bottom: 0px (reducido de 1px)');
    console.log('   ✅ Espaciado mínimo y profesional');
    console.log('   ✅ Cambios aplicados en archivo CSS correcto');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espaciado-final-corregido.pdf');
    console.log('2. Verifica que "I. CONDICIONES DEL SERVICIO" esté MUCHO más cerca de la tabla');
    console.log('3. Verifica que el espaciado entre secciones sea MÍNIMO');
    console.log('4. Verifica que se vea más profesional y compacto');
    console.log('5. Verifica que los cambios se hayan aplicado correctamente');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciadoFinal();
