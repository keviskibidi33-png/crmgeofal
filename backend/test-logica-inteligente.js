const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testLogicaInteligente() {
  try {
    console.log('🔍 PRUEBA - Lógica inteligente adaptativa');
    console.log('==========================================');
    
    // Datos de prueba con pocos items (1-6)
    const testBundlePocos = {
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
        { code: 'AG35', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    // Datos de prueba con muchos items (7-12)
    const testBundleMuchos = {
      ...testBundlePocos,
      items: [
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG35', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG36', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG37', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG38', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG39', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG40', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG41', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    // Datos de prueba con items extremos (16+)
    const testBundleExtremos = {
      ...testBundlePocos,
      items: Array.from({length: 16}, (_, i) => ({
        code: `AG${34 + i}`,
        description: 'Partículas planas y alargadas en agregado grueso (*)',
        norma: 'ASTM D4791-19',
        costo_unitario: 120.00,
        cantidad: 1,
        costo_parcial: 120.00
      }))
    };
    
    console.log('📄 Generando PDF con pocos items (1-6)...');
    await generateSmartTemplatePdf(testBundlePocos, path.join(__dirname, 'logica-pocos-items.pdf'));
    console.log('✅ PDF con pocos items generado');
    
    console.log('📄 Generando PDF con muchos items (7-12)...');
    await generateSmartTemplatePdf(testBundleMuchos, path.join(__dirname, 'logica-muchos-items.pdf'));
    console.log('✅ PDF con muchos items generado');
    
    console.log('📄 Generando PDF con items extremos (16+)...');
    await generateSmartTemplatePdf(testBundleExtremos, path.join(__dirname, 'logica-items-extremos.pdf'));
    console.log('✅ PDF con items extremos generado');
    
    console.log('🎯 VERIFICAR:');
    console.log('1. logica-pocos-items.pdf: PLAZO ESTIMADO debe estar en primera página');
    console.log('2. logica-muchos-items.pdf: PLAZO ESTIMADO debe estar en primera página');
    console.log('3. logica-items-extremos.pdf: Solo condiciones básicas en primera página');
    console.log('4. La tabla debe adaptarse automáticamente según cantidad de items');
    console.log('5. No debe haber cortes ni problemas de encaje');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testLogicaInteligente();
