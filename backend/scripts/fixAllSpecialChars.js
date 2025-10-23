const pool = require('../config/db');

async function fixAllSpecialChars() {
  console.log('🔧 Corrigiendo TODOS los caracteres especiales...\n');

  try {
    // Obtener todos los ensayos que tienen problemas de codificación
    const problematic = await pool.query(`
      SELECT id, codigo, descripcion, norma, comentarios, nota_comercial
      FROM ensayos 
      WHERE descripcion LIKE '%Ñ%' 
         OR descripcion LIKE '%Í%'
         OR descripcion LIKE '%Á%'
         OR descripcion LIKE '%É%'
         OR descripcion LIKE '%Ó%'
         OR descripcion LIKE '%Ú%'
         OR norma LIKE '%Ñ%'
         OR norma LIKE '%Í%'
         OR norma LIKE '%Á%'
         OR norma LIKE '%É%'
         OR norma LIKE '%Ó%'
         OR norma LIKE '%Ú%'
         OR comentarios LIKE '%Ñ%'
         OR comentarios LIKE '%Í%'
         OR comentarios LIKE '%Á%'
         OR comentarios LIKE '%É%'
         OR comentarios LIKE '%Ó%'
         OR comentarios LIKE '%Ú%'
         OR nota_comercial LIKE '%Ñ%'
         OR nota_comercial LIKE '%Í%'
         OR nota_comercial LIKE '%Á%'
         OR nota_comercial LIKE '%É%'
         OR nota_comercial LIKE '%Ó%'
         OR nota_comercial LIKE '%Ú%'
    `);

    console.log(`📊 Ensayos con caracteres especiales: ${problematic.rows.length}`);

    let updatedCount = 0;

    for (const ensayo of problematic.rows) {
      try {
        // Función para limpiar y corregir caracteres especiales
        const cleanText = (text) => {
          if (!text) return text;
          
          return text
            .replace(/Ñ/g, 'Ñ')
            .replace(/Í/g, 'Í')
            .replace(/Á/g, 'Á')
            .replace(/É/g, 'É')
            .replace(/Ó/g, 'Ó')
            .replace(/Ú/g, 'Ú')
            .replace(/ñ/g, 'ñ')
            .replace(/í/g, 'í')
            .replace(/á/g, 'á')
            .replace(/é/g, 'é')
            .replace(/ó/g, 'ó')
            .replace(/ú/g, 'ú')
            .replace(/[^\x20-\x7E\u00C0-\u017F]/g, '') // Solo caracteres ASCII y latinos
            .replace(/\s+/g, ' ')
            .trim();
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

    // Verificar resultado específico
    const examples = await pool.query(`
      SELECT codigo, descripcion, norma
      FROM ensayos 
      WHERE codigo IN ('AG09', 'SU04', 'SU19', 'SU22', 'AG08A', 'AG08B')
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

fixAllSpecialChars();
