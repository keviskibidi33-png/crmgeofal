const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testContenidoReal() {
  try {
    console.log('🔍 PRUEBA - Contenido real de la segunda página');
    console.log('===============================================');
    
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
    
    const outputPath = path.join(__dirname, 'contenido-real.pdf');
    
    console.log('📄 Generando PDF con contenido real...');
    console.log('🔧 Cambios aplicados:');
    console.log('   - Div de salto de página invisible');
    console.log('   - Contenido de prueba eliminado');
    console.log('   - Solo contenido real de condiciones');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo contenido-real.pdf');
    console.log('2. Debe tener 2 páginas');
    console.log('3. La segunda página debe mostrar:');
    console.log('   - Logo de Geofal (120px)');
    console.log('   - Condiciones de servicio reales:');
    console.log('     * CONTRAMUESTRA');
    console.log('     * CONFIDENCIALIDAD');
    console.log('     * QUEJAS Y SUGERENCIAS');
    console.log('     * ENTREGA DE INFORME DE ENSAYO');
    console.log('     * HORARIO DE ATENCIÓN');
    console.log('   - Footer con información de contacto');
    console.log('4. NO debe aparecer texto de prueba');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testContenidoReal();
