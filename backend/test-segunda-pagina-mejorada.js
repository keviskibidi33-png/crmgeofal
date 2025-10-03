const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testSegundaPaginaMejorada() {
  try {
    console.log('🔍 PRUEBA - Segunda página con mejor separación y encaje');
    console.log('========================================================');
    
    // Datos de prueba con muchos items para forzar segunda página
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
        { code: 'AG36', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG37', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG38', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG39', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG40', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG41', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG42', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG43', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'segunda-pagina-mejorada.pdf');
    
    console.log('📄 Generando PDF con segunda página mejorada...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Margin-top segunda página: +20mm');
    console.log('   - Header margin-top: 10px → 20px');
    console.log('   - Header margin-bottom: 10px → 15px');
    console.log('   - Content wrapper padding-bottom: 20px → 10px');
    console.log('   - Content wrapper min-height: 200mm → 180mm');
    console.log('   - Footer padding reducido: 3px 5mm 5px 5mm → 2px 5mm 3px 5mm');
    console.log('   - Footer min-height: 25px → 20px');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo segunda-pagina-mejorada.pdf');
    console.log('2. Debe tener 2 páginas');
    console.log('3. La segunda página debe tener mejor separación del logo');
    console.log('4. El contenido debe encajar mejor en la segunda página');
    console.log('5. El footer debe estar bien posicionado');
    console.log('6. No debe haber espacios excesivos');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testSegundaPaginaMejorada();
