const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testContenidoCentrado() {
  try {
    console.log('🔍 PRUEBA - Contenido centrado verticalmente');
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
    
    const outputPath = path.join(__dirname, 'contenido-centrado.pdf');
    
    console.log('📄 Generando PDF con contenido centrado...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Margen superior reducido: 20mm → 10mm');
    console.log('   - Margen del título reducido: 30px → 15px');
    console.log('   - Contenido más cerca del borde superior');
    console.log('   - Mejor distribución vertical');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo contenido-centrado.pdf');
    console.log('2. El contenido debe estar más centrado verticalmente');
    console.log('3. Menos espacio en blanco en la parte superior');
    console.log('4. El logo y título más cerca del borde superior');
    console.log('5. Mejor distribución del espacio en la página');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testContenidoCentrado();
