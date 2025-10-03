const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEncajePerfecto() {
  try {
    console.log('🔍 PRUEBA - Encaje perfecto sin cortes');
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
    
    const outputPath = path.join(__dirname, 'encaje-perfecto.pdf');
    
    console.log('📄 Generando PDF con encaje perfecto...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Título: 20px (reducido de 22px)');
    console.log('   - Info cliente: 13px (reducido de 14px)');
    console.log('   - Tabla: 10px (reducido de 11px)');
    console.log('   - Condiciones: 10px (reducido de 12px)');
    console.log('   - Footer: 9px (reducido de 11px)');
    console.log('   - Márgenes optimizados para evitar cortes');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo encaje-perfecto.pdf');
    console.log('2. TODO el contenido debe estar visible');
    console.log('3. NO debe haber texto cortado');
    console.log('4. El footer debe estar completo');
    console.log('5. "Atentamente" debe estar visible');
    console.log('6. La información bancaria debe estar completa');
    console.log('7. Todo debe encajar en UNA SOLA PÁGINA');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEncajePerfecto();
