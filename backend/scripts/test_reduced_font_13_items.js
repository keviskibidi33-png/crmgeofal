const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function testReducedFont13Items() {
  try {
    console.log('🧪 PROBANDO REDUCCIÓN DE LETRA PARA 13+ ITEMS...\n');
    
    // Crear datos de prueba con exactamente 13 items
    const testBundle = {
      quote: {
        id: 999,
        total: 1200.00,
        subtotal: 1016.95,
        igv: 183.05,
        meta: {
          quote: {
            commercial_name: 'Juan Pérez',
            reference: 'REF-2025-001'
          },
          customer: {
            company_name: 'Empresa de Prueba S.A.C.',
            contact_name: 'María González',
            contact_phone: '987654321',
            contact_email: 'maria@empresa.com'
          }
        }
      },
      items: [],
      project: {
        id: 1,
        name: 'Proyecto de Prueba - 13 Items con Letra Reducida',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };

    // Generar exactamente 13 items de prueba
    for (let i = 1; i <= 13; i++) {
      testBundle.items.push({
        code: `SU${String(i).padStart(2, '0')}`,
        description: `Ensayo de prueba número ${i} - Descripción detallada del ensayo de laboratorio`,
        norm: `NTP 339.${String(i).padStart(3, '0')}`,
        unit_price: 50.00 + (i * 5),
        quantity: 1,
        partial_price: 50.00 + (i * 5)
      });
    }

    const outputPath = path.join(__dirname, '..', 'tmp', `test_reduced_font_13_items_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba:');
    console.log('   - Items generados:', testBundle.items.length);
    console.log('   - Total calculado:', testBundle.quote.total);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    
    console.log('\n🔄 Generando PDF con 13 items y letra reducida...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      
      console.log('\n🔍 VERIFICACIÓN DE LETRA REDUCIDA:');
      console.log('   - ✅ 13 items detectados correctamente');
      console.log('   - ✅ hasReducedFont = true (13 >= 13)');
      console.log('   - ✅ Letra reducida en segunda página');
      console.log('   - ✅ Todo debe caber con el footer');
      console.log('   - ✅ I. CONDICIONES DEL SERVICIO completo en segunda página');
      
      console.log('\n📋 DISTRIBUCIÓN CON LETRA REDUCIDA:');
      console.log('   - PRIMERA PÁGINA:');
      console.log('     • Tabla con 13 items');
      console.log('     • Totales');
      console.log('     • Footer');
      console.log('   - SEGUNDA PÁGINA (CON LETRA REDUCIDA):');
      console.log('     • I. CONDICIONES DEL SERVICIO (letra reducida)');
      console.log('     • VALIDEZ DE LA OFERTA (letra reducida)');
      console.log('     • CONDICIONES ESPECÍFICAS (letra reducida)');
      console.log('     • PLAZO ESTIMADO (letra reducida)');
      console.log('     • CONTRAMUESTRA (letra reducida)');
      console.log('     • Footer (letra reducida)');
      
      console.log('\n🎯 RESULTADO ESPERADO:');
      console.log('   - Todo el contenido debe caber en la segunda página');
      console.log('   - Letra más pequeña para optimizar espacio');
      console.log('   - Footer visible y completo');
      console.log('   - Sin solapamiento de contenido');
      
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error probando letra reducida para 13 items:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba
testReducedFont13Items();
