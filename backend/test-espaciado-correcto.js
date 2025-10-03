const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciadoCorrecto() {
  try {
    console.log('🔍 PRUEBA - Espaciado correcto sin choques');
    console.log('=========================================');
    
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
    
    const outputPath = path.join(__dirname, 'espaciado-correcto.pdf');
    
    console.log('📄 Generando PDF con espaciado correcto...');
    console.log('🔧 Ajustes aplicados:');
    console.log('   - Info-grid con margin-top: 20px (separación del logo)');
    console.log('   - Footer con margin-top: 30px (subido para mejor visualización)');
    console.log('   - Sin choques entre logo y contenido');
    console.log('   - Footer visible y bien posicionado');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espaciado-correcto.pdf');
    console.log('2. El contenido NO debe chocar con el logo');
    console.log('3. Debe haber separación adecuada entre logo y datos del cliente');
    console.log('4. El footer debe estar subido y visible');
    console.log('5. Mejor distribución del espacio en la página');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciadoCorrecto();
