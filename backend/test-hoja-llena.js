const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testHojaLlena() {
  try {
    console.log('🔍 PRUEBA - Hoja llena con tamaños aumentados');
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
    
    const outputPath = path.join(__dirname, 'hoja-llena.pdf');
    
    console.log('📄 Generando PDF con hoja llena...');
    console.log('🔧 Cambios aplicados:');
    console.log('   - Título aumentado a 22px');
    console.log('   - Información del cliente a 14px');
    console.log('   - Tabla aumentada a 11px');
    console.log('   - Condiciones aumentadas a 12px');
    console.log('   - Footer aumentado a 11px');
    console.log('   - Espacios optimizados para llenar la hoja');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo hoja-llena.pdf');
    console.log('2. El título debe ser más grande (22px)');
    console.log('3. La información del cliente debe ser más grande (14px)');
    console.log('4. La tabla debe ser más legible (11px)');
    console.log('5. Las condiciones deben ser más grandes (12px)');
    console.log('6. El footer debe ser más grande (11px)');
    console.log('7. La hoja debe verse más llena y profesional');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testHojaLlena();
