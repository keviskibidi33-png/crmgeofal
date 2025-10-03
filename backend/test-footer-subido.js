const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testFooterSubido() {
  try {
    console.log('🔍 PRUEBA - Footer subido en primera página');
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
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG35', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG36', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'footer-subido.pdf');
    
    console.log('📄 Generando PDF con footer subido...');
    console.log('🔧 Ajuste aplicado:');
    console.log('   - Footer margin-top: 30px → 50px');
    console.log('   - Footer más separado del contenido');
    console.log('   - Mejor visualización del footer');
    console.log('   - Espaciado más equilibrado');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo footer-subido.pdf');
    console.log('2. El footer debe estar más separado del contenido');
    console.log('3. Mejor espaciado entre condiciones y footer');
    console.log('4. Footer visible y bien posicionado');
    console.log('5. Distribución más equilibrada en la página');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testFooterSubido();
