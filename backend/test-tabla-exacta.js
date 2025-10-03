const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablaExacta() {
  try {
    console.log('🔍 PRUEBA - Tabla exacta como la imagen');
    console.log('=====================================');
    
    // Datos de prueba con 12 items como en la imagen
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
        name: 'Test Company S.A.C.',
        ruc: '20512345678',
        contact_name: 'Test User',
        contact_phone: '+51 987 654 321',
        contact_email: 'test@test.com'
      },
      project: {
        name: 'Test Project',
        location: 'Test Location'
      },
      user: {
        name: 'Admin',
        phone: '99999999999'
      },
      items: [
        // 12 items idénticos como en la imagen
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19 (Reapproved 2023)', acreditacion: '(*)', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'tabla-exacta-como-imagen.pdf');
    
    console.log('📄 Generando PDF con tabla exacta...');
    console.log('🔧 Corrección aplicada:');
    console.log('   - UNA SOLA tabla continua');
    console.log('   - Filas de totales como filas normales');
    console.log('   - Celdas vacías en las primeras 4 columnas');
    console.log('   - Total en las últimas 2 columnas');
    console.log('   - Línea superior en "Costo Parcial"');
    console.log('   - Exactamente como en tu imagen');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo tabla-exacta-como-imagen.pdf');
    console.log('2. Debe ser UNA SOLA tabla continua');
    console.log('3. 12 filas de datos + 3 filas de totales');
    console.log('4. Total: 15 filas en una sola tabla');
    console.log('5. Exactamente como en tu imagen');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablaExacta();
