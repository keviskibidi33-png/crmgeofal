const pool = require('../config/db');

async function finalEncodingFix() {
  console.log('🔧 Corrección final de codificación...\n');

  try {
    // Correcciones específicas para ensayos problemáticos
    const specificCorrections = [
      { codigo: 'AG08A', descripcion: 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.' },
      { codigo: 'AG08B', descripcion: 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.' },
      { codigo: 'AG09', descripcion: 'Índice de Durabilidad Agregado.' },
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

    for (const correction of specificCorrections) {
      try {
        await pool.query(`
          UPDATE ensayos 
          SET descripcion = $1
          WHERE codigo = $2
        `, [correction.descripcion, correction.codigo]);
        
        console.log(`✅ ${correction.codigo}: Corregido`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${correction.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos corregidos: ${updatedCount}`);
    console.log(`📊 Total procesados: ${specificCorrections.length}`);

    // Verificar resultado
    const examples = await pool.query(`
      SELECT codigo, descripcion 
      FROM ensayos 
      WHERE codigo IN ('AG08A', 'AG08B', 'AG09', 'AG18', 'AG19')
      ORDER BY codigo
    `);

    console.log('\n🔍 Verificación final:');
    examples.rows.forEach(row => {
      console.log(`${row.codigo}: ${row.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

finalEncodingFix();
