const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testFooterSeparado() {
  try {
    console.log('🔍 PRUEBA - Footer con mejor separación');
    console.log('=======================================');
    
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
        name: 'Innovatech Solutions S.A.C.',
        ruc: '20512345678',
        contact_name: 'Ana Torres',
        contact_phone: '+51 987 654 321',
        contact_email: 'contacto@innovatech.com.pe'
      },
      project: {
        name: '121221',
        location: 'Av. Javier Prado Este 123, Of. 404, San Isidro, Lima'
      },
      user: {
        name: 'Admin',
        phone: '99999999999'
      },
      items: [
        {
          code: 'AG34',
          description: 'Partículas planas y alargadas en agregado grueso (*)',
          norma: 'ASTM D4791-19 (Reapproved 2023)',
          costo_unitario: 120.00,
          cantidad: 1,
          costo_parcial: 120.00
        }
      ]
    };
    
    const outputPath = path.join(__dirname, 'footer-separado.pdf');
    
    console.log('📄 Generando PDF con footer separado...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Footer primera página: margin-top +15px');
    console.log('   - Footer segunda página: margin-top +15px');
    console.log('   - Mayor separación entre contenido y footer');
    console.log('   - Línea naranja más separada del contenido');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo footer-separado.pdf');
    console.log('2. El footer debe estar más separado del contenido');
    console.log('3. La línea naranja debe tener más espacio arriba');
    console.log('4. El footer debe verse más equilibrado');
    console.log('5. No debe estar muy pegado al contenido');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testFooterSeparado();
