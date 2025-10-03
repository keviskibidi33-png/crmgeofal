const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testSeparacionLogo() {
  try {
    console.log('🔍 PRUEBA - Separación del logo y contenido');
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
    
    const outputPath = path.join(__dirname, 'separacion-logo.pdf');
    
    console.log('📄 Generando PDF con separación del logo...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Margin-top del contenido: 15mm → 20mm (+5mm)');
    console.log('   - Margin del título: 20px 0 15px 0 → 30px 0 20px 0');
    console.log('   - Mayor separación entre logo y contenido');
    console.log('   - El contenido no debe chocar con el logo');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo separacion-logo.pdf');
    console.log('2. El contenido debe estar más separado del logo');
    console.log('3. NO debe haber choque entre el logo y el título');
    console.log('4. El título debe tener más espacio arriba');
    console.log('5. La información del cliente debe estar bien separada');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testSeparacionLogo();
