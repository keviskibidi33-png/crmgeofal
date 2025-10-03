const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablaLimpia() {
  try {
    console.log('🔍 PRUEBA - Tabla limpia sin líneas largas');
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
    
    const outputPath = path.join(__dirname, 'tabla-limpia.pdf');
    
    console.log('📄 Generando PDF con tabla limpia...');
    console.log('🔧 Mejoras aplicadas:');
    console.log('   - Filas de totales sin celdas vacías largas');
    console.log('   - Texto en una sola fila por cuadro');
    console.log('   - Fondo gris claro para filas de totales');
    console.log('   - Borde superior para separar totales');
    console.log('   - Texto alineado a la derecha');
    console.log('   - Sin líneas largas vacías');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo tabla-limpia.pdf');
    console.log('2. Las filas de totales deben tener fondo gris claro');
    console.log('3. No debe haber líneas largas vacías');
    console.log('4. Cada texto debe estar en una sola fila');
    console.log('5. Los totales deben estar alineados a la derecha');
    console.log('6. Separación clara entre datos y totales');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablaLimpia();
