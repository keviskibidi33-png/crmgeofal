const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testSegundaPaginaContenido() {
  try {
    console.log('🔍 PRUEBA - Segunda página con contenido visible');
    console.log('================================================');
    
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
    
    const outputPath = path.join(__dirname, 'test-segunda-pagina-contenido.pdf');
    
    console.log('📄 Generando PDF con contenido visible en segunda página...');
    console.log('🔧 Contenido agregado:');
    console.log('   - Logo en segunda página');
    console.log('   - Condiciones de servicio');
    console.log('   - Contenido de prueba visible');
    console.log('   - Footer');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo test-segunda-pagina-contenido.pdf');
    console.log('2. Debe tener 2 páginas');
    console.log('3. La segunda página debe mostrar:');
    console.log('   - Logo de Geofal');
    console.log('   - Texto "SEGUNDA PÁGINA - CONTENIDO DE PRUEBA"');
    console.log('   - Condiciones de servicio');
    console.log('   - Footer con información de contacto');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testSegundaPaginaContenido();
