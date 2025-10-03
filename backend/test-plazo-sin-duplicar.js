const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testPlazoSinDuplicar() {
  try {
    console.log('🔍 PRUEBA - PLAZO ESTIMADO sin duplicar');
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
        { code: 'AG34', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG35', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 },
        { code: 'AG36', description: 'Partículas planas y alargadas en agregado grueso (*)', norma: 'ASTM D4791-19', costo_unitario: 120.00, cantidad: 1, costo_parcial: 120.00 }
      ]
    };
    
    const outputPath = path.join(__dirname, 'plazo-sin-duplicar.pdf');
    
    console.log('📄 Generando PDF con PLAZO ESTIMADO único...');
    console.log('🔧 Correcciones aplicadas:');
    console.log('   - Eliminado PLAZO ESTIMADO hardcodeado del template HTML');
    console.log('   - Solo se genera dinámicamente desde JavaScript');
    console.log('   - Debe aparecer SOLO UNA VEZ en toda la cotización');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo plazo-sin-duplicar.pdf');
    console.log('2. Busca "PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO"');
    console.log('3. Debe aparecer SOLO UNA VEZ en toda la cotización');
    console.log('4. Debe estar en la primera página después de CONDICIONES ESPECÍFICAS');
    console.log('5. NO debe haber duplicados en la primera página');
    console.log('6. NO debe aparecer en la segunda página');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testPlazoSinDuplicar();
