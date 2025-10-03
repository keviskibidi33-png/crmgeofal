const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablaRealmenteUnida() {
  try {
    console.log('🔍 PRUEBA - Tabla realmente unida');
    console.log('=================================');
    
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
    
    const outputPath = path.join(__dirname, 'tabla-realmente-unida.pdf');
    
    console.log('📄 Generando PDF con tabla realmente unida...');
    console.log('🔧 Corrección aplicada:');
    console.log('   - Filas de totales dentro de la misma tabla');
    console.log('   - colspan="5" para ocupar espacio de columnas');
    console.log('   - Una sola tabla continua');
    console.log('   - Sin separación entre datos y totales');
    console.log('   - Integración visual perfecta');
    console.log('   - Como una tabla grande unida');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo tabla-realmente-unida.pdf');
    console.log('2. Debe ser UNA SOLA tabla continua');
    console.log('3. Los totales deben estar dentro de la misma tabla');
    console.log('4. Sin separación entre datos y totales');
    console.log('5. Aspecto completamente unido');
    console.log('6. Como en la imagen que mostraste');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablaRealmenteUnida();
