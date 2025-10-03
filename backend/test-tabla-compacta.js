const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablaCompacta() {
  try {
    console.log('🔍 PRUEBA - Tabla de totales pequeña y compacta');
    console.log('=============================================');
    
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
    
    const outputPath = path.join(__dirname, 'tabla-compacta.pdf');
    
    console.log('📄 Generando PDF con tabla compacta...');
    console.log('🔧 Mejoras aplicadas:');
    console.log('   - Tabla de totales pequeña y compacta');
    console.log('   - Solo en la parte derecha');
    console.log('   - Tamaño automático (width: auto)');
    console.log('   - Float right para posicionamiento');
    console.log('   - Padding reducido para compactar');
    console.log('   - Font-size más pequeño');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo tabla-compacta.pdf');
    console.log('2. La tabla de totales debe ser pequeña');
    console.log('3. Solo en la parte derecha');
    console.log('4. Compacta y sin espacio innecesario');
    console.log('5. Como en la segunda imagen');
    console.log('6. No debe ocupar todo el ancho');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablaCompacta();
