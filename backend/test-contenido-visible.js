const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testContenidoVisible() {
  try {
    console.log('🔍 PRUEBA FINAL - Contenido visible en segunda página');
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
    
    const outputPath = path.join(__dirname, 'test-contenido-visible.pdf');
    
    console.log('📄 Generando PDF con contenido visible...');
    console.log('🔧 Correcciones aplicadas:');
    console.log('   - visibility: visible !important');
    console.log('   - opacity: 1 !important');
    console.log('   - display: block !important');
    console.log('   - overflow: visible');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo test-contenido-visible.pdf');
    console.log('2. Debe tener 2 páginas');
    console.log('3. La segunda página debe mostrar:');
    console.log('   - Logo de Geofal (visible)');
    console.log('   - Texto "SEGUNDA PÁGINA - CONTENIDO DE PRUEBA" (con fondo gris)');
    console.log('   - Condiciones: CONTRAMUESTRA, CONFIDENCIALIDAD, etc.');
    console.log('   - Footer con información de contacto');
    console.log('4. Si aún está vacía, el problema es de Puppeteer');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testContenidoVisible();
