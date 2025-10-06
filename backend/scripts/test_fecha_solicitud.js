const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function testFechaSolicitud() {
  try {
    console.log('🧪 PROBANDO FECHA SOLICITUD EN COTIZACIÓN...\n');
    
    // Crear datos de prueba con fecha de solicitud
    const testBundle = {
      quote: {
        id: 999,
        total: 500.00,
        subtotal: 423.73,
        igv: 76.27,
        meta: {
          quote: {
            commercial_name: 'Juan Pérez',
            reference: 'REF-2025-001',
            request_date: '2025-01-15' // FECHA SOLICITUD
          },
          customer: {
            company_name: 'Empresa de Prueba S.A.C.',
            contact_name: 'María González',
            contact_phone: '987654321',
            contact_email: 'maria@empresa.com'
          }
        }
      },
      items: [
        {
          code: 'SU01',
          description: 'Ensayo de granulometría por tamizado',
          norm: 'NTP 339.127',
          unit_price: 50.00,
          quantity: 2,
          partial_price: 100.00
        },
        {
          code: 'SU02', 
          description: 'Ensayo de límites de Atterberg',
          norm: 'NTP 339.128',
          unit_price: 75.00,
          quantity: 1,
          partial_price: 75.00
        }
      ],
      project: {
        id: 1,
        name: 'Proyecto de Prueba con Fecha Solicitud',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };

    const outputPath = path.join(__dirname, '..', 'tmp', `test_fecha_solicitud_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba:');
    console.log('   - Items generados:', testBundle.items.length);
    console.log('   - Total calculado:', testBundle.quote.total);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    console.log('   - FECHA SOLICITUD:', testBundle.quote.meta.quote.request_date);
    
    console.log('\n🔄 Generando PDF con fecha de solicitud...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      
      console.log('\n🔍 VERIFICACIÓN DE FECHA SOLICITUD:');
      console.log('   - ✅ FECHA SOLICITUD debe estar visible en datos del cliente');
      console.log('   - ✅ Debe aparecer en la primera página');
      console.log('   - ✅ Formato: FECHA SOLICITUD: 2025-01-15');
      
      console.log('\n📋 ESTRUCTURA ESPERADA EN PRIMERA PÁGINA:');
      console.log('   - CLIENTE: Empresa de Prueba S.A.C.');
      console.log('   - RUC: 20123456789');
      console.log('   - CONTACTO: María González');
      console.log('   - TELÉFONO: 987654321');
      console.log('   - CORREO: maria@empresa.com');
      console.log('   - FECHA SOLICITUD: 2025-01-15 ⭐');
      
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error probando fecha de solicitud:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba
testFechaSolicitud();
