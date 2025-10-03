const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciosReducidos() {
  try {
    console.log('🔍 PRUEBA - Espacios reducidos');
    console.log('===============================');
    
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
    
    const outputPath = path.join(__dirname, 'espacios-reducidos.pdf');
    
    console.log('📄 Generando PDF con espacios reducidos...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Subtítulos: margin 4px 0 2px 0 → 2px 0 1px 0');
    console.log('   - Contenido: margin-bottom 2px → 1px');
    console.log('   - Line-height: 1.3 → 1.2');
    console.log('   - Subtitle-box: margin 4px 0 2px 0 → 2px 0 1px 0');
    console.log('   - Conditions-list: margin-bottom 8px → 4px');
    console.log('   - Signature-block: margin-top 2px → 1px');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espacios-reducidos.pdf');
    console.log('2. Los espacios entre secciones deben ser menores');
    console.log('3. El contenido debe verse más compacto');
    console.log('4. No debe haber espacios excesivos');
    console.log('5. Todo debe seguir encajando en una página');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciosReducidos();
