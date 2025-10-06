const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function testUmbral11Items() {
  try {
    console.log('🧪 PROBANDO NUEVO UMBRAL DE 11 ITEMS...\n');
    
    // Crear datos de prueba con exactamente 11 items
    const testBundle = {
      quote: {
        id: 999,
        total: 1000.00,
        subtotal: 847.46,
        igv: 152.54,
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
        name: 'Proyecto de Prueba - 11 Items',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };

    // Generar exactamente 11 items de prueba
    for (let i = 1; i <= 11; i++) {
      testBundle.items.push({
        code: `SU${String(i).padStart(2, '0')}`,
        description: `Ensayo de prueba número ${i} - Descripción detallada del ensayo de laboratorio`,
        norm: `NTP 339.${String(i).padStart(3, '0')}`,
        unit_price: 50.00 + (i * 5),
        quantity: 1,
        partial_price: 50.00 + (i * 5)
      });
    }

    const outputPath = path.join(__dirname, '..', 'tmp', `test_umbral_11_items_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba:');
    console.log('   - Items generados:', testBundle.items.length);
    console.log('   - Total calculado:', testBundle.quote.total);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    
    console.log('\n🔄 Generando PDF con 11 items (nuevo umbral)...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      
      console.log('\n🔍 VERIFICACIÓN DEL NUEVO UMBRAL:');
      console.log('   - ✅ 11 items detectados correctamente');
      console.log('   - ✅ PLAZO ESTIMADO debe estar en SEGUNDA PÁGINA');
      console.log('   - ✅ PRIMERA PÁGINA: Solo tabla + condiciones básicas');
      console.log('   - ✅ SEGUNDA PÁGINA: PLAZO ESTIMADO + CONTRAMUESTRA');
      console.log('   - ✅ Footer en ambas páginas');
      
      console.log('\n📋 DISTRIBUCIÓN ESPERADA:');
      console.log('   - PRIMERA PÁGINA:');
      console.log('     • Tabla con 11 items');
      console.log('     • I. CONDICIONES DEL SERVICIO');
      console.log('     • VALIDEZ DE LA OFERTA');
      console.log('     • CONDICIONES ESPECÍFICAS');
      console.log('     • Footer');
      console.log('   - SEGUNDA PÁGINA:');
      console.log('     • PLAZO ESTIMADO DE EJECUCIÓN DE SERVICIO');
      console.log('     • CONTRAMUESTRA');
      console.log('     • Footer');
      
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error probando umbral de 11 items:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba
testUmbral11Items();
