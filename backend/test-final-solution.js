const { generateSmartTemplatePdf } = require('./utils/smartTemplatePdf');
const path = require('path');

async function testFinalSolution() {
  try {
    console.log('🔍 PRUEBA FINAL - Solución agresiva para segunda página');
    console.log('======================================================');
    
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
    
    const outputPath = path.join(__dirname, 'test-solucion-final.pdf');
    
    console.log('📄 Generando PDF con solución agresiva...');
    console.log('🔧 Métodos aplicados:');
    console.log('   - Div invisible de 297mm de altura');
    console.log('   - JavaScript injection agresivo');
    console.log('   - Altura forzada del body a 594mm');
    console.log('   - Múltiples page-break CSS');
    
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado en:', outputPath);
    console.log('🎯 INSTRUCCIONES:');
    console.log('1. Abre el archivo test-solucion-final.pdf');
    console.log('2. Verifica si tiene 2 páginas');
    console.log('3. Si aún solo tiene 1 página, el problema es de Puppeteer');
    console.log('4. En ese caso, necesitaremos una solución alternativa');
    
  } catch (error) {
    console.error('❌ Error en prueba final:', error.message);
  }
}

testFinalSolution();
