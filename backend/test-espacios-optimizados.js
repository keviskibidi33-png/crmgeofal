const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testEspaciosOptimizados() {
  try {
    console.log('🔍 PRUEBA - Espacios optimizados y título centrado');
    console.log('==================================================');
    
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
    
    const outputPath = path.join(__dirname, 'espacios-optimizados.pdf');
    
    console.log('📄 Generando PDF con espacios optimizados...');
    console.log('🔧 Cambios aplicados:');
    console.log('   - Título "COTIZACIÓN N°" centrado');
    console.log('   - Espacios reducidos entre secciones');
    console.log('   - Información del cliente más compacta');
    console.log('   - Referencia y texto introductorio optimizados');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 VERIFICAR:');
    console.log('1. Abre el archivo espacios-optimizados.pdf');
    console.log('2. El título "COTIZACIÓN N°" debe estar CENTRADO');
    console.log('3. Los espacios entre secciones deben ser menores');
    console.log('4. La información del cliente debe estar más compacta');
    console.log('5. No debe haber espacios en blanco excesivos');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testEspaciosOptimizados();
