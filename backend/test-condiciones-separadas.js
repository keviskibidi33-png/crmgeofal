const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testCondicionesSeparadas() {
  try {
    console.log('🔍 PRUEBA - Condiciones con mejor separación');
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
    
    const outputPath = path.join(__dirname, 'condiciones-separadas.pdf');
    
    console.log('📄 Generando PDF con condiciones mejor separadas...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Subtítulos: margin 2px 0 1px 0 → 8px 0 4px 0');
    console.log('   - Contenido: margin-bottom 1px → 6px');
    console.log('   - Subtitle-box: margin 2px 0 1px 0 → 12px 0 8px 0');
    console.log('   - Mayor separación entre cada condición');
    console.log('   - Mejor separación entre secciones I, II, III');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo condiciones-separadas.pdf');
    console.log('2. Las condiciones deben estar mejor separadas');
    console.log('3. Cada subtítulo debe tener más espacio arriba y abajo');
    console.log('4. Las secciones I, II, III deben estar más separadas');
    console.log('5. El contenido debe verse más organizado');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testCondicionesSeparadas();
