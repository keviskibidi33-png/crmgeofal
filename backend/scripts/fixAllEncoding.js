const pool = require('../config/db');

async function fixAllEncoding() {
  console.log('🔧 Corrigiendo codificación de todos los ensayos...\n');

  try {
    // Obtener todos los ensayos con problemas
    const problematic = await pool.query(`
      SELECT id, codigo, descripcion, norma, comentarios, nota_comercial
      FROM ensayos 
      WHERE descripcion LIKE '%%' 
         OR norma LIKE '%%' 
         OR comentarios LIKE '%%' 
         OR nota_comercial LIKE '%%'
    `);

    console.log(`📊 Ensayos con problemas: ${problematic.rows.length}`);

    let updatedCount = 0;

    for (const ensayo of problematic.rows) {
      try {
        // Función para limpiar texto
        const cleanText = (text) => {
          if (!text) return text;
          
          // Remover caracteres de control y espacios extra
          let cleaned = text.replace(/[^\x20-\x7E\u00C0-\u017F]/g, '');
          
          // Corregir caracteres específicos
          cleaned = cleaned
            .replace(/Ã¡/g, 'á')
            .replace(/Ã©/g, 'é') 
            .replace(/Ã/g, 'í')
            .replace(/Ã³/g, 'ó')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã±/g, 'ñ')
            .replace(/Ã/g, 'Á')
            .replace(/Ã/g, 'É')
            .replace(/Ã/g, 'Í')
            .replace(/Ã³/g, 'Ó')
            .replace(/Ã/g, 'Ú')
            .replace(/Ã/g, 'Ñ')
            .replace(/\s+/g, ' ')
            .trim();
            
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
      SELECT codigo, descripcion 
      FROM ensayos 
      WHERE codigo IN ('AG08A', 'AG08B', 'AG09', 'SU04', 'SU19')
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

fixAllEncoding();
