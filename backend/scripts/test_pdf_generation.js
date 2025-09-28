const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');

async function testPdfGeneration() {
  try {
    console.log('🧪 PROBANDO GENERACIÓN DE PDF...\n');
    
    // Datos de prueba
    const testBundle = {
      quote: {
        id: 6,
        total: 236.00,
        meta: {
          quote: {
            commercial_name: 'Test Asesor',
            reference: 'Test Reference'
          },
          customer: {
            company_name: 'Test Company',
            contact_name: 'Test Contact',
            contact_phone: '123456789',
            contact_email: 'test@test.com'
          }
        }
      },
      items: [
        {
          code: 'SU04',
          description: 'Contenido de humedad con Speedy.',
          norm: 'NTP 339.25',
          unit_price: 30.00,
          quantity: 1,
          partial_price: 30.00
        },
        {
          code: 'SU16', 
          description: 'Ensayo de Penetración Estándar (SPT).',
          norm: 'NTP 339.133',
          unit_price: 0.00,
          quantity: 1,
          partial_price: 0.00
        }
      ],
      project: {
        id: 1,
        name: 'Test Project',
        location: 'Test Location'
      },
      company: {
        id: 1,
        name: 'Test Company',
        ruc: '12345678901'
      }
    };
    
    const outputPath = path.join(__dirname, '..', 'tmp', `test_pdf_${Date.now()}.pdf`);
    
    console.log('📋 Bundle de prueba:', {
      quoteId: testBundle.quote.id,
      itemsCount: testBundle.items.length,
      projectId: testBundle.project.id,
      companyId: testBundle.company.id
    });
    
    console.log('🔄 Generando PDF...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testPdfGeneration();
