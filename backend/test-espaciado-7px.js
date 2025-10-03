const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciado7px() {
  try {
    console.log('🔍 PRUEBA - Espaciado específico de 7px');
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
    
    const outputPath = path.join(__dirname, 'espaciado-7px-especifico.pdf');
    
    console.log('📄 Generando PDF con espaciado específico de 7px...');
    console.log('🔧 Cambios aplicados:');
    console.log('   ✅ .normal-subtitle: margin: 7px 0 7px 0 (espacio de 7px arriba y abajo)');
    console.log('   ✅ .conditions-content: margin-bottom: 7px (espacio de 7px entre párrafos)');
    console.log('   ✅ Espaciado exacto de 7px entre secciones');
    console.log('   ✅ Entre "CONDICIONES ESPECÍFICAS" y "PLAZO ESTIMADO"');
    console.log('   ✅ Entre párrafos y footer');
    console.log('   ✅ Espaciado uniforme y profesional');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espaciado-7px-especifico.pdf');
    console.log('2. Verifica que haya 7px de espacio entre "CONDICIONES ESPECÍFICAS" y "PLAZO ESTIMADO"');
    console.log('3. Verifica que haya 7px de espacio entre párrafos');
    console.log('4. Verifica que el espaciado sea uniforme y profesional');
    console.log('5. Verifica que se vea exactamente como lo necesitas');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciado7px();
