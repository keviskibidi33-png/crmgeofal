const pool = require('../config/db');

async function directFixEncoding() {
  console.log('🔧 Corrigiendo codificación directamente...\n');

  try {
    // Mapeo de correcciones específicas basado en el CSV original
    const corrections = [
      // SU04
      { codigo: 'SU04', descripcion: 'Contenido de humedad con Speedy.', norma: 'NTP 339.25' },
      // SU19  
      { codigo: 'SU19', descripcion: 'Próctor modificado (*).', norma: 'ASTM D1557-12 (Reapproved 2021)' },
      // SU20
      { codigo: 'SU20', descripcion: 'Contenido de humedad en suelos (*).', norma: 'ASTM D2216-19' },
      // SU20A
      { codigo: 'SU20A', descripcion: 'Contenido de humedad en Roca.', norma: 'ASTM D2216-19' },
      // SU21
      { codigo: 'SU21', descripcion: 'Equivalente de arena (*).', norma: 'ASTM D2419-22' },
      // SU22
      { codigo: 'SU22', descripcion: 'Clasificación suelo SUCS - AASHTO (*).', norma: 'ASTM D2487-17 (Reapproved 2025) / ASTM D3282-24' },
      // SU23
      { codigo: 'SU23', descripcion: 'Límite líquido y Límite Plástico del Suelo (*).', norma: 'ASTM D4318-17?1' },
      // SU24
      { codigo: 'SU24', descripcion: 'Análisis granulométrico por tamizado en Suelo (*).', norma: 'ASTM D6913/D6913M-17' },
      // SU30
      { codigo: 'SU30', descripcion: 'Ensayo de Compactación Próctor Estándar.', norma: 'ASTM D698' },
      // SU31
      { codigo: 'SU31', descripcion: 'Corrección de Peso Unitario para Partícula de gran tamaño.', norma: 'ASTM D4718-87' },
      // SU32
      { codigo: 'SU32', descripcion: 'Gravedad específica de los sólidos del suelo.', norma: 'ASTM D854-14' },
      // SU33
      { codigo: 'SU33', descripcion: 'Resistencia a la Compresión no confinada de suelos cohesivos', norma: 'NTP 339.167' },
      // SU34
      { codigo: 'SU34', descripcion: 'Densidad y peso unitario de muestra suelo', norma: 'ASTM D 7263' },
      // SU35
      { codigo: 'SU35', descripcion: 'Densidad del peso unitario máximo del suelo.', norma: 'NTP 339.137' },
      // SU36
      { codigo: 'SU36', descripcion: 'Densidad del peso unitario mínimo del suelo.', norma: 'NTP 339.138' },
      // SU37
      { codigo: 'SU37', descripcion: 'California Bearing Ratio (CBR) (*).', norma: 'ASTM D1883-21' },
      // SU38
      { codigo: 'SU38', descripcion: 'Determinación de sólidos totales suspendidos.', norma: 'NTP 214.039' },
      // SU39
      { codigo: 'SU39', descripcion: 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', norma: 'NTP 339.128 1999 (revisada el 2019)' },
      // SU40
      { codigo: 'SU40', descripcion: 'Hinchamiento suelo', norma: 'ASTM D4546-21' },
      // SU41
      { codigo: 'SU41', descripcion: 'Potencial de Colapso en suelo.', norma: 'ASTM D5333' },
      // SU42
      { codigo: 'SU42', descripcion: 'Conductividad hidráulica en pared rígida (Permeabilidad).', norma: 'ASTM D2434' },
      // SU43
      { codigo: 'SU43', descripcion: 'Conductividad hidráulica en pared flexible (Permeabilidad).', norma: 'ASTM D5084' },
      // SU44
      { codigo: 'SU44', descripcion: 'Conductividad térmica / Resistividad térmica', norma: 'ASTM D5334-14' },
      // SU45
      { codigo: 'SU45', descripcion: 'Compresión triaxial no consolidado no drenado UU.', norma: 'ASTM D2850' },
      // SU46
      { codigo: 'SU46', descripcion: 'Compresión triaxial consolidado no drenado CU.', norma: 'ASTM D4767' },
      // SU47
      { codigo: 'SU47', descripcion: 'Compresión triaxial consolidado drenado CD.', norma: 'ASTM D7181' }
    ];

    let updatedCount = 0;

    for (const correction of corrections) {
      try {
        await pool.query(`
          UPDATE ensayos 
          SET descripcion = $1, norma = $2
          WHERE codigo = $3
        `, [correction.descripcion, correction.norma, correction.codigo]);
        
        console.log(`✅ ${correction.codigo}: Corregido`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${correction.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos corregidos: ${updatedCount}`);
    console.log(`📊 Total procesados: ${corrections.length}`);

    // Verificar algunos ejemplos
    const examples = await pool.query(`
      SELECT codigo, descripcion, norma 
      FROM ensayos 
      WHERE codigo IN ('SU04', 'SU19', 'SU22', 'SU33')
      ORDER BY codigo
    `);

    console.log('\n🔍 Verificación final:');
    examples.rows.forEach(row => {
      console.log(`${row.codigo}: ${row.descripcion}`);
      console.log(`  Norma: ${row.norma}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

directFixEncoding();
