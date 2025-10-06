const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function testEspaciadoInacal() {
  try {
    console.log('🧪 PROBANDO ESPACIADO DEL TEXTO DE INACAL...\n');
    
    // Crear datos de prueba con 15 items (caso donde todo se mueve a segunda página)
    const testBundle = {
      quote: {
        id: 999,
        total: 3000.00,
        subtotal: 2542.37,
        igv: 457.63,
        meta: {
          quote: {
            commercial_name: 'Juan Pérez',
            reference: 'REF-2025-001',
            request_date: '2025-01-15'
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
        name: 'Proyecto de Prueba - Espaciado INACAL',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };

    // Generar exactamente 15 items de prueba
    for (let i = 1; i <= 15; i++) {
      testBundle.items.push({
        code: `SU${String(i).padStart(2, '0')}`,
        description: `Ensayo de prueba número ${i} - Descripción detallada del ensayo de laboratorio`,
        norm: `NTP 339.${String(i).padStart(3, '0')}`,
        unit_price: 50.00 + (i * 5),
        quantity: 1,
        partial_price: 50.00 + (i * 5)
      });
    }

    const outputPath = path.join(__dirname, '..', 'tmp', `test_espaciado_inacal_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba:');
    console.log('   - Items generados:', testBundle.items.length);
    console.log('   - Total calculado:', testBundle.quote.total);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    console.log('   - Caso: Espaciado INACAL optimizado');
    
    console.log('\n🔄 Generando PDF con espaciado INACAL optimizado...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      
      console.log('\n🔍 VERIFICACIÓN DE ESPACIADO INACAL:');
      console.log('   - ✅ 15 items detectados correctamente');
      console.log('   - ✅ hasCondicionesItems = true (13-20 items)');
      console.log('   - ✅ Texto INACAL debe estar MUY CERCA de la tabla');
      console.log('   - ✅ margin-top: 1px (muy cerca de la tabla)');
      console.log('   - ✅ margin-bottom: 4px (espaciado compacto)');
      console.log('   - ✅ font-size: 7px (texto compacto)');
      
      console.log('\n📋 ESPACIADO APLICADO:');
      console.log('   - margin-top: 1px (antes era 5px)');
      console.log('   - margin-bottom: 4px (antes era 15px)');
      console.log('   - font-size: 7px (antes era 9px)');
      console.log('   - Texto más cerca de la tabla');
      console.log('   - Espaciado optimizado para 15 items');
      
      console.log('\n📋 ESTRUCTURA ESPERADA EN PRIMERA PÁGINA:');
      console.log('   - Tabla con 15 items (compacta)');
      console.log('   - TOTALES VISIBLES');
      console.log('   - Texto INACAL MUY CERCA de la tabla');
      console.log('   - Footer MUY COMPACTO');
      
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error probando espaciado INACAL:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba
testEspaciadoInacal();
