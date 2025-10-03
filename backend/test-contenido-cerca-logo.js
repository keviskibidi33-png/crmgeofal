const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testContenidoCercaLogo() {
  try {
    console.log('🔍 PRUEBA - Contenido más cerca del logo');
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
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG35', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG36', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'contenido-cerca-logo.pdf');
    
    console.log('📄 Generando PDF con contenido más cerca del logo...');
    console.log('🔧 Ajuste aplicado:');
    console.log('   - Título margin-top: 15px → 0px');
    console.log('   - Contenido bajado 15px hacia el logo');
    console.log('   - Mejor proximidad entre logo y título');
    console.log('   - Espaciado más compacto');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo contenido-cerca-logo.pdf');
    console.log('2. El título debe estar más cerca del logo');
    console.log('3. Menos espacio entre logo y "COTIZACIÓN N°"');
    console.log('4. Contenido más compacto en la parte superior');
    console.log('5. Mejor aprovechamiento del espacio');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testContenidoCercaLogo();
