const pool = require('../config/db');

async function completeEncodingFix() {
  console.log('🔧 Corrección completa de codificación...\n');

  try {
    // Obtener todos los ensayos que aún tienen problemas
    const problematic = await pool.query(`
      SELECT id, codigo, descripcion, norma, comentarios, nota_comercial
      FROM ensayos 
      WHERE descripcion LIKE '%Ñ%' 
         OR norma LIKE '%Ñ%' 
         OR comentarios LIKE '%Ñ%' 
         OR nota_comercial LIKE '%Ñ%'
    `);

    console.log(`📊 Ensayos con problemas restantes: ${problematic.rows.length}`);

    let updatedCount = 0;

    for (const ensayo of problematic.rows) {
      try {
        // Función para limpiar completamente el texto
        const cleanText = (text) => {
          if (!text) return text;
          
          // Remover todos los caracteres de control y espacios extra
          let cleaned = text
            .replace(/[^\x20-\x7E\u00C0-\u017F]/g, '') // Solo caracteres ASCII y latinos
            .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
            .trim();
          
          // Si el texto está muy dañado, intentar reconstruir desde el CSV
          if (cleaned.length < 5 || cleaned.includes('Ñ')) {
            // Mapeo de ensayos conocidos con descripciones correctas
            const knownCorrections = {
              'AG08A': 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.',
              'AG08B': 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.',
              'AG09': 'Índice de Durabilidad Agregado.',
              'AG11': 'Contenido Sales solubles, fino o grueso.',
              'AG12': 'Adherencia en agregado fino - Riedel Weber.',
              'AG13': 'Impurezas Orgánicas en los áridos finos.',
              'AG16': 'Contenido de cloruros solubles.',
              'AG17': 'Contenido de sulfatos solubles.',
              'AG18': 'Gravedad específica y absorción del agregado fino (*).',
              'AG19': 'Análisis granulométrico por tamizado en agregado (*).',
              'AG20': 'Contenido de humedad en agregado (*).',
              'AG22': 'Peso Unitario y Vacío de agregados (*).',
              'AG23': 'Pasante de la malla No.200 (*).',
              'AG24': 'Partículas Liviana en los agregados (carbón y lignito), Fino o grueso.',
              'AG25': 'Terrones de arcilla y partículas friables, Fino o grueso.',
              'AG26': 'Abrasión los ángeles de agregado grueso de gran tamaño (*).',
              'AG28': 'Gravedad específica y absorción de agregado grueso (*).',
              'AG29': 'Valor de azul de metileno.',
              'AG30': 'Reactividad agregado álcalis.',
              'AG33': 'Angularidad del agregado fino.',
              'AG34': 'Partículas planas y alargadas en agregado grueso (*).',
              'AG35': 'Porcentaje de Caras fracturadas en agregado grueso (*).',
              'AG36': 'Abrasión los ángeles de agregado grueso de tamaño pequeño (*).'
            };

            if (knownCorrections[ensayo.codigo]) {
              return knownCorrections[ensayo.codigo];
            }
          }
          
          return cleaned;
        };

        const descripcionLimpia = cleanText(ensayo.descripcion);
        const normaLimpia = cleanText(ensayo.norma);
        const comentariosLimpios = cleanText(ensayo.comentarios);
        const notaComercialLimpia = cleanText(ensayo.nota_comercial);

        // Solo actualizar si hay cambios
        if (descripcionLimpia !== ensayo.descripcion || 
            normaLimpia !== ensayo.norma ||
            comentariosLimpios !== ensayo.comentarios ||
            notaComercialLimpia !== ensayo.nota_comercial) {
          
          await pool.query(`
            UPDATE ensayos 
            SET descripcion = $1, 
                norma = $2, 
                comentarios = $3,
                nota_comercial = $4
            WHERE id = $5
          `, [descripcionLimpia, normaLimpia, comentariosLimpios, notaComercialLimpia, ensayo.id]);
          
          console.log(`✅ ${ensayo.codigo}: Corregido`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error actualizando ${ensayo.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos corregidos: ${updatedCount}`);
    console.log(`📊 Total procesados: ${problematic.rows.length}`);

    // Verificar resultado
    const examples = await pool.query(`
      SELECT codigo, descripcion, norma
      FROM ensayos 
      WHERE codigo IN ('AG08A', 'AG08B', 'AG09', 'AG11', 'AG12')
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

completeEncodingFix();
