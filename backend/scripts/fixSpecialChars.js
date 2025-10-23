const pool = require('../config/db');

async function fixSpecialChars() {
  console.log('🔧 Corrigiendo caracteres especiales...\n');

  try {
    // Correcciones específicas para caracteres especiales
    const corrections = [
      { codigo: 'AG09', descripcion: 'Índice de Durabilidad Agregado.' },
      { codigo: 'SU04', descripcion: 'Contenido de humedad con Speedy.' },
      { codigo: 'SU19', descripcion: 'Próctor modificado (*).' },
      { codigo: 'SU22', descripcion: 'Clasificación suelo SUCS - AASHTO (*).' },
      { codigo: 'SU33', descripcion: 'Resistencia a la Compresión no confinada de suelos cohesivos' },
      { codigo: 'SU37', descripcion: 'California Bearing Ratio (CBR)' },
      { codigo: 'SU40', descripcion: 'Hinchamiento suelo' },
      { codigo: 'SU41', descripcion: 'Potencial de Colapso en suelo' },
      { codigo: 'SU42', descripcion: 'Conductividad hidráulica en pared rígida' },
      { codigo: 'SU43', descripcion: 'Conductividad hidráulica en pared flexible' },
      { codigo: 'SU44', descripcion: 'Conductividad térmica' },
      { codigo: 'SU45', descripcion: 'Compresión triaxial UU' },
      { codigo: 'SU46', descripcion: 'Compresión triaxial CU' },
      { codigo: 'SU47', descripcion: 'Compresión triaxial CD' },
      { codigo: 'AG08A', descripcion: 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.' },
      { codigo: 'AG08B', descripcion: 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.' },
      { codigo: 'AG11', descripcion: 'Contenido Sales solubles, fino o grueso.' },
      { codigo: 'AG12', descripcion: 'Adherencia en agregado fino - Riedel Weber.' },
      { codigo: 'AG13', descripcion: 'Impurezas Orgánicas en los áridos finos.' },
      { codigo: 'AG16', descripcion: 'Contenido de cloruros solubles.' },
      { codigo: 'AG17', descripcion: 'Contenido de sulfatos solubles.' },
      { codigo: 'AG18', descripcion: 'Gravedad específica y absorción del agregado fino (*).' },
      { codigo: 'AG19', descripcion: 'Análisis granulométrico por tamizado en agregado (*).' },
      { codigo: 'AG20', descripcion: 'Contenido de humedad en agregado (*).' },
      { codigo: 'AG22', descripcion: 'Peso Unitario y Vacío de agregados (*).' },
      { codigo: 'AG23', descripcion: 'Pasante de la malla No.200 (*).' },
      { codigo: 'AG24', descripcion: 'Partículas Liviana en los agregados (carbón y lignito), Fino o grueso.' },
      { codigo: 'AG25', descripcion: 'Terrones de arcilla y partículas friables, Fino o grueso.' },
      { codigo: 'AG26', descripcion: 'Abrasión los ángeles de agregado grueso de gran tamaño (*).' },
      { codigo: 'AG28', descripcion: 'Gravedad específica y absorción de agregado grueso (*).' },
      { codigo: 'AG29', descripcion: 'Valor de azul de metileno.' },
      { codigo: 'AG30', descripcion: 'Reactividad agregado álcalis.' },
      { codigo: 'AG33', descripcion: 'Angularidad del agregado fino.' },
      { codigo: 'AG34', descripcion: 'Partículas planas y alargadas en agregado grueso (*).' },
      { codigo: 'AG35', descripcion: 'Porcentaje de Caras fracturadas en agregado grueso (*).' },
      { codigo: 'AG36', descripcion: 'Abrasión los ángeles de agregado grueso de tamaño pequeño (*).' }
    ];

    let updatedCount = 0;

    for (const correction of corrections) {
      try {
        await pool.query(`
          UPDATE ensayos 
          SET descripcion = $1
          WHERE codigo = $2
        `, [correction.descripcion, correction.codigo]);
        
        console.log(`✅ ${correction.codigo}: ${correction.descripcion}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${correction.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos corregidos: ${updatedCount}`);

    // Verificar resultado
    const examples = await pool.query(`
      SELECT codigo, descripcion, norma, categoria
      FROM ensayos 
      WHERE codigo IN ('SU04', 'SU19', 'AG08A', 'AG09', 'SU22')
      ORDER BY codigo
    `);

    console.log('\n🔍 Verificación final:');
    examples.rows.forEach(row => {
      console.log(`${row.codigo}: ${row.descripcion}`);
      console.log(`  Norma: ${row.norma}`);
      console.log(`  Categoría: ${row.categoria}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

fixSpecialChars();
