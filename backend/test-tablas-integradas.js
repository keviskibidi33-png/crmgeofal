const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testTablasIntegradas() {
  try {
    console.log('🔍 PRUEBA - Tablas integradas y pegadas');
    console.log('=======================================');
    
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
    
    const outputPath = path.join(__dirname, 'tablas-integradas.pdf');
    
    console.log('📄 Generando PDF con tablas integradas...');
    console.log('🔧 Mejoras aplicadas:');
    console.log('   - Tabla de totales pegada a la tabla principal');
    console.log('   - Ancho completo (100%) para integración');
    console.log('   - Bordes continuos entre tablas');
    console.log('   - Aspecto unificado y profesional');
    console.log('   - Sin separación entre tablas');
    console.log('   - Continuidad visual perfecta');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo tablas-integradas.pdf');
    console.log('2. Las tablas deben estar pegadas e integradas');
    console.log('3. No debe haber separación entre tablas');
    console.log('4. Bordes continuos y unificados');
    console.log('5. Aspecto de una sola tabla grande');
    console.log('6. Continuidad visual perfecta');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testTablasIntegradas();
