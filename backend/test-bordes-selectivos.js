const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testBordesSelectivos() {
  try {
    console.log('🔍 PRUEBA - Bordes solo en celdas con contenido');
    console.log('==============================================');
    
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
        { code: 'TEST1', description: 'Test Item 1', norma: 'ASTM', costo_unitario: 100.00, cantidad: 1, costo_parcial: 100.00 },
        { code: 'TEST2', description: 'Test Item 2', norma: 'ASTM', costo_unitario: 200.00, cantidad: 1, costo_parcial: 200.00 },
        { code: 'TEST3', description: 'Test Item 3', norma: 'ASTM', costo_unitario: 300.00, cantidad: 1, costo_parcial: 300.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'bordes-selectivos.pdf');
    
    console.log('📄 Generando PDF con bordes selectivos...');
    console.log('🔧 Mejoras aplicadas:');
    console.log('   - Solo celdas con contenido tienen bordes');
    console.log('   - Celdas vacías sin bordes ni padding');
    console.log('   - Tabla más limpia y compacta');
    console.log('   - Mejor aprovechamiento del espacio');
    console.log('   - Aspecto más profesional');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo bordes-selectivos.pdf');
    console.log('2. Solo las celdas con texto deben tener bordes');
    console.log('3. Las celdas vacías no deben tener bordes');
    console.log('4. La tabla debe verse más limpia');
    console.log('5. Mejor aprovechamiento del espacio');
    console.log('6. Aspecto más profesional');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testBordesSelectivos();
