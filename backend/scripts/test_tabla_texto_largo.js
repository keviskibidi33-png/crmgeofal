const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function testTablaTextoLargo() {
  try {
    console.log('🧪 PROBANDO TABLA CON TEXTO MUY LARGO...\n');
    
    // Crear datos de prueba con descripciones muy largas
    const testBundle = {
      quote: {
        id: 999,
        total: 2000.00,
        subtotal: 1694.92,
        igv: 305.08,
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
      items: [
        {
          code: 'AS10',
          description: 'Control de calidad de asfalto emulsificado (Incluye: Viscosidad SF, estabilidad al almacenamiento, carga de partícula, tamizado, destilación, ensayos en residuo: penetración, ductilidad y solubilidad)',
          norm: 'ASTM D244-09',
          unit_price: 150.00,
          quantity: 1,
          partial_price: 150.00
        },
        {
          code: 'SU06C',
          description: 'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal técnico, por día.',
          norm: 'NTP 339.127',
          unit_price: 200.00,
          quantity: 1,
          partial_price: 200.00
        },
        {
          code: 'ALB18',
          description: 'Carga de rotura por unidad de ancho / Ladrillo pastelero (Incluye: preparación de probetas, ensayo de compresión, medición de dimensiones, cálculo de resistencia y elaboración de informe técnico)',
          norm: 'NTP 399.010',
          unit_price: 180.00,
          quantity: 1,
          partial_price: 180.00
        },
        {
          code: 'CONC01',
          description: 'Ensayo de resistencia a la compresión de concreto (Incluye: preparación de probetas cilíndricas, curado, ensayo de compresión a 7, 14 y 28 días, medición de dimensiones, cálculo de resistencia y elaboración de informe técnico detallado)',
          norm: 'ASTM C39/C39M-18',
          unit_price: 250.00,
          quantity: 2,
          partial_price: 500.00
        },
        {
          code: 'SUELO01',
          description: 'Análisis granulométrico completo de suelos (Incluye: tamizado húmedo y seco, análisis de finos por hidrómetro, clasificación según SUCS y AASHTO, cálculo de coeficientes de uniformidad y curvatura, y elaboración de informe técnico)',
          norm: 'ASTM D422-63',
          unit_price: 300.00,
          quantity: 1,
          partial_price: 300.00
        },
        {
          code: 'AGREG01',
          description: 'Control de calidad de agregados para concreto (Incluye: análisis granulométrico, contenido de humedad, absorción, densidad, peso específico, desgaste por abrasión Los Ángeles, resistencia al desgaste, contenido de material fino, y elaboración de informe técnico completo)',
          norm: 'ASTM C33/C33M-18',
          unit_price: 400.00,
          quantity: 1,
          partial_price: 400.00
        }
      ],
      project: {
        id: 1,
        name: 'Proyecto de Prueba con Descripciones Largas',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };

    const outputPath = path.join(__dirname, '..', 'tmp', `test_tabla_texto_largo_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba:');
    console.log('   - Items generados:', testBundle.items.length);
    console.log('   - Total calculado:', testBundle.quote.total);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    console.log('   - Descripciones muy largas incluidas');
    
    console.log('\n🔄 Generando PDF con descripciones largas...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      
      console.log('\n🔍 VERIFICACIÓN DE TABLA CON TEXTO LARGO:');
      console.log('   - ✅ Tabla debe manejar descripciones largas sin romperse');
      console.log('   - ✅ Texto debe ajustarse automáticamente');
      console.log('   - ✅ No debe haber superposición de contenido');
      console.log('   - ✅ Altura de filas debe ajustarse automáticamente');
      
      console.log('\n📋 DESCRIPCIONES DE PRUEBA INCLUIDAS:');
      console.log('   - AS10: Control de calidad de asfalto emulsificado (muy largo)');
      console.log('   - SU06C: Control de calidad de suelo con Cono de arena');
      console.log('   - ALB18: Carga de rotura por unidad de ancho / Ladrillo pastelero');
      console.log('   - CONC01: Ensayo de resistencia a la compresión de concreto');
      console.log('   - SUELO01: Análisis granulométrico completo de suelos');
      console.log('   - AGREG01: Control de calidad de agregados para concreto');
      
      console.log('\n🎯 RESULTADO ESPERADO:');
      console.log('   - Todas las descripciones deben ser visibles completamente');
      console.log('   - No debe haber superposición de texto');
      console.log('   - La tabla debe mantener su estructura');
      console.log('   - El footer debe estar visible');
      
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error probando tabla con texto largo:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba
testTablaTextoLargo();
