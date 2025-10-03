const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablaAdaptativa() {
  try {
    console.log('🔍 PRUEBA - Tabla adaptativa y contenido bajado');
    console.log('===============================================');
    
    // Datos de prueba con pocos items (debe usar tabla grande)
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
    
    // Datos de prueba con muchos items (debe usar tabla pequeña)
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
    
    console.log('📄 Generando PDF con pocos items (tabla grande)...');
    await generateSmartTemplatePdf(testBundlePocos, path.join(__dirname, 'tabla-pocos-items.pdf'));
    console.log('✅ PDF con pocos items generado');
    
    console.log('📄 Generando PDF con muchos items (tabla pequeña)...');
    await generateSmartTemplatePdf(testBundleMuchos, path.join(__dirname, 'tabla-muchos-items.pdf'));
    console.log('✅ PDF con muchos items generado');
    
    console.log('🎯 VERIFICAR:');
    console.log('1. tabla-pocos-items.pdf: Debe tener tabla GRANDE (11px, padding 4px 6px)');
    console.log('2. tabla-muchos-items.pdf: Debe tener tabla PEQUEÑA (8px, padding 2px 3px)');
    console.log('3. El contenido debe estar más abajo (margin-top: 15mm)');
    console.log('4. La tabla debe adaptarse automáticamente según la cantidad de items');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablaAdaptativa();
