const pool = require('../config/db');

async function fixEncoding() {
  console.log('🔧 Corrigiendo codificación UTF-8...\n');

  try {
    // Verificar ensayos con caracteres mal codificados
    const problematic = await pool.query(`
      SELECT codigo, descripcion, norma, comentarios, nota_comercial
      FROM ensayos 
      WHERE descripcion LIKE '%%' 
         OR norma LIKE '%%' 
         OR comentarios LIKE '%%' 
         OR nota_comercial LIKE '%%'
      LIMIT 5
    `);

    console.log(`📊 Ensayos con problemas de codificación: ${problematic.rows.length}`);
    
    if (problematic.rows.length > 0) {
      console.log('\n🔍 Ejemplos de problemas:');
      problematic.rows.forEach(row => {
        console.log(`  ${row.codigo}: ${row.descripcion}`);
        if (row.norma && row.norma.includes('')) {
          console.log(`    Norma: ${row.norma}`);
        }
      });
    }

    // Mapeo de correcciones comunes
    const corrections = {
      '': 'á',
      '': 'é', 
      '': 'í',
      '': 'ó',
      '': 'ú',
      '': 'ñ',
      '': 'Á',
      '': 'É',
      '': 'Í', 
      '': 'Ó',
      '': 'Ú',
      '': 'Ñ'
    };

    let updatedCount = 0;

    // Obtener todos los ensayos
    const allEnsayos = await pool.query('SELECT id, codigo, descripcion, norma, comentarios, nota_comercial FROM ensayos');
    
    for (const ensayo of allEnsayos.rows) {
      let needsUpdate = false;
      const updates = {};

      // Verificar y corregir cada campo
      ['descripcion', 'norma', 'comentarios', 'nota_comercial'].forEach(field => {
        if (ensayo[field] && ensayo[field].includes('')) {
          let corrected = ensayo[field];
          
          // Aplicar correcciones
          Object.entries(corrections).forEach(([wrong, right]) => {
            corrected = corrected.replace(new RegExp(wrong, 'g'), right);
          });
          
          if (corrected !== ensayo[field]) {
            updates[field] = corrected;
            needsUpdate = true;
          }
        }
      });

      // Actualizar si hay cambios
      if (needsUpdate) {
        const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [ensayo.id, ...Object.values(updates)];
        
        await pool.query(`UPDATE ensayos SET ${setClause} WHERE id = $1`, values);
        console.log(`✅ ${ensayo.codigo}: Corregido`);
        updatedCount++;
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos corregidos: ${updatedCount}`);
    console.log(`📊 Total procesados: ${allEnsayos.rows.length}`);

    // Verificar que se corrigieron
    const remaining = await pool.query(`
      SELECT COUNT(*) as count 
      FROM ensayos 
      WHERE descripcion LIKE '%%' 
         OR norma LIKE '%%' 
         OR comentarios LIKE '%%' 
         OR nota_comercial LIKE '%%'
    `);

    console.log(`🔍 Ensayos con problemas restantes: ${remaining.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error corrigiendo codificación:', error);
  } finally {
    pool.end();
  }
}

fixEncoding();
