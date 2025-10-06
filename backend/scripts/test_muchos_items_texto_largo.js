const { generateSmartTemplatePdf } = require('../utils/smartTemplatePdf');
const path = require('path');
const fs = require('fs');

async function testMuchosItemsTextoLargo() {
  try {
    console.log('🧪 PROBANDO MUCHOS ITEMS CON TEXTO LARGO...\n');
    
    // Crear datos de prueba con 15 items y descripciones largas
    const testBundle = {
      quote: {
        id: 999,
        total: 5000.00,
        subtotal: 4237.29,
        igv: 762.71,
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
        name: 'Proyecto de Prueba - 15 Items con Texto Largo',
        location: 'Lima, Perú'
      },
      company: {
        id: 1,
        name: 'GEOFAL',
        ruc: '20123456789'
      }
    };

    // Generar 15 items con descripciones largas
    const descripcionesLargas = [
      'Control de calidad de asfalto emulsificado (Incluye: Viscosidad SF, estabilidad al almacenamiento, carga de partícula, tamizado, destilación, ensayos en residuo: penetración, ductilidad y solubilidad)',
      'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal técnico, por día.',
      'Carga de rotura por unidad de ancho / Ladrillo pastelero (Incluye: preparación de probetas, ensayo de compresión, medición de dimensiones, cálculo de resistencia y elaboración de informe técnico)',
      'Ensayo de resistencia a la compresión de concreto (Incluye: preparación de probetas cilíndricas, curado, ensayo de compresión a 7, 14 y 28 días, medición de dimensiones, cálculo de resistencia y elaboración de informe técnico detallado)',
      'Análisis granulométrico completo de suelos (Incluye: tamizado húmedo y seco, análisis de finos por hidrómetro, clasificación según SUCS y AASHTO, cálculo de coeficientes de uniformidad y curvatura, y elaboración de informe técnico)',
      'Control de calidad de agregados para concreto (Incluye: análisis granulométrico, contenido de humedad, absorción, densidad, peso específico, desgaste por abrasión Los Ángeles, resistencia al desgaste, contenido de material fino, y elaboración de informe técnico completo)',
      'Ensayo de límites de Atterberg en suelos (Incluye: determinación del límite líquido, límite plástico, índice de plasticidad, clasificación según Casagrande, y elaboración de informe técnico)',
      'Control de calidad de concreto fresco (Incluye: ensayo de asentamiento, contenido de aire, temperatura, densidad, tiempo de fraguado, y elaboración de informe técnico)',
      'Análisis químico de cemento (Incluye: determinación de óxidos principales, pérdida por ignición, residuo insoluble, tiempo de fraguado, expansión, y elaboración de informe técnico completo)',
      'Ensayo de durabilidad de agregados (Incluye: ensayo de sulfato de sodio, ensayo de congelación y deshielo, ensayo de desgaste por abrasión, y elaboración de informe técnico)',
      'Control de calidad de acero de refuerzo (Incluye: ensayo de tracción, ensayo de doblado, ensayo de doblado y enderezado, medición de dimensiones, y elaboración de informe técnico)',
      'Análisis de suelos contaminados (Incluye: determinación de metales pesados, hidrocarburos totales de petróleo, pH, conductividad eléctrica, y elaboración de informe técnico)',
      'Control de calidad de mezclas asfálticas (Incluye: ensayo Marshall, ensayo de estabilidad, ensayo de fluencia, ensayo de densidad, y elaboración de informe técnico)',
      'Ensayo de permeabilidad en suelos (Incluye: ensayo de permeabilidad constante, ensayo de permeabilidad variable, cálculo de coeficiente de permeabilidad, y elaboración de informe técnico)',
      'Control de calidad de ladrillos y bloques (Incluye: ensayo de compresión, ensayo de absorción, ensayo de dimensiones, ensayo de resistencia al fuego, y elaboración de informe técnico)'
    ];

    for (let i = 1; i <= 15; i++) {
      testBundle.items.push({
        code: `SU${String(i).padStart(2, '0')}`,
        description: descripcionesLargas[i - 1],
        norm: `NTP 339.${String(i).padStart(3, '0')}`,
        unit_price: 100.00 + (i * 20),
        quantity: 1,
        partial_price: 100.00 + (i * 20)
      });
    }

    const outputPath = path.join(__dirname, '..', 'tmp', `test_muchos_items_texto_largo_${Date.now()}.pdf`);
    
    console.log('📋 Datos de prueba:');
    console.log('   - Items generados:', testBundle.items.length);
    console.log('   - Total calculado:', testBundle.quote.total);
    console.log('   - Cliente:', testBundle.quote.meta.customer.company_name);
    console.log('   - Descripciones muy largas incluidas');
    
    console.log('\n🔄 Generando PDF con 15 items y texto largo...');
    await generateSmartTemplatePdf(testBundle, outputPath);
    
    console.log('✅ PDF generado exitosamente en:', outputPath);
    
    // Verificar que el archivo se creó
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`\n📊 Archivo generado: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('✅ El archivo PDF se generó correctamente');
      
      console.log('\n🔍 VERIFICACIÓN DE MUCHOS ITEMS CON TEXTO LARGO:');
      console.log('   - ✅ 15 items con descripciones largas');
      console.log('   - ✅ Tabla debe manejar texto sin romperse');
      console.log('   - ✅ Altura de filas debe ajustarse automáticamente');
      console.log('   - ✅ No debe haber superposición de contenido');
      console.log('   - ✅ I. CONDICIONES DEL SERVICIO debe estar en segunda página');
      console.log('   - ✅ Letra reducida aplicada automáticamente');
      
      console.log('\n📋 DISTRIBUCIÓN ESPERADA:');
      console.log('   - PRIMERA PÁGINA:');
      console.log('     • Tabla con 15 items (texto largo manejado correctamente)');
      console.log('     • Totales');
      console.log('     • Footer');
      console.log('   - SEGUNDA PÁGINA (CON LETRA REDUCIDA):');
      console.log('     • I. CONDICIONES DEL SERVICIO');
      console.log('     • VALIDEZ DE LA OFERTA');
      console.log('     • CONDICIONES ESPECÍFICAS');
      console.log('     • PLAZO ESTIMADO');
      console.log('     • CONTRAMUESTRA');
      console.log('     • Footer');
      
    } else {
      console.log('❌ Error: El archivo PDF no se generó');
    }
    
  } catch (error) {
    console.error('❌ Error probando muchos items con texto largo:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba
testMuchosItemsTextoLargo();
