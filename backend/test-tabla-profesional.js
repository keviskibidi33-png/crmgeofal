const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablaProfesional() {
  try {
    console.log('🔍 PRUEBA - Tabla profesional sin líneas largas vacías');
    console.log('====================================================');
    
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
    
    const outputPath = path.join(__dirname, 'tabla-profesional.pdf');
    
    console.log('📄 Generando PDF con tabla profesional...');
    console.log('🔧 Mejoras aplicadas:');
    console.log('   - Tabla de totales separada y compacta');
    console.log('   - Sin líneas largas vacías');
    console.log('   - Solo bordes donde hay contenido');
    console.log('   - Aspecto profesional y limpio');
    console.log('   - Mejor aprovechamiento del espacio');
    console.log('   - Totales alineados a la derecha');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo tabla-profesional.pdf');
    console.log('2. NO debe haber líneas largas vacías');
    console.log('3. Tabla de totales separada y compacta');
    console.log('4. Solo bordes donde hay contenido');
    console.log('5. Aspecto profesional y limpio');
    console.log('6. Totales alineados a la derecha');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablaProfesional();
