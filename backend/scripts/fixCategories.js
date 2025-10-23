const pool = require('../config/db');

async function fixCategories() {
  console.log('🔧 Corrigiendo categorías de ensayos...');

  try {
    // Mapeo detallado de categorías según el CSV
    const categoryMappings = [
      // ENSAYO ESTÁNDAR SUELO
      { pattern: /^SU\d+$/, category: 'ENSAYO ESTÁNDAR SUELO' },
      
      // ENSAYOS ESPECIALES SUELO
      { pattern: /^SU\d+[A-Z]?$/, category: 'ENSAYOS ESPECIALES SUELO', exclude: ['SU04', 'SU19', 'SU20', 'SU21', 'SU22', 'SU23', 'SU24', 'SU30', 'SU31', 'SU32', 'SU34', 'SU35', 'SU36', 'SU38', 'SU39'] },
      
      // ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO
      { pattern: /^SU(03|13|14|15|26)$/, category: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' },
      
      // ENSAYOS DE CAMPO EN SUELO
      { pattern: /^SU(02|06[A-D]|16|18|28|29)$/, category: 'ENSAYOS DE CAMPO EN SUELO' },
      
      // ENSAYO AGREGADO
      { pattern: /^AG\d+[A-Z]?$/, category: 'ENSAYO AGREGADO' },
      
      // ENSAYO CONCRETO
      { pattern: /^CO\d+[A-Z]?$/, category: 'ENSAYO CONCRETO' },
      
      // ENSAYO ALBAÑILERÍA
      { pattern: /^MA\d+[A-Z]?$/, category: 'ENSAYO ALBAÑILERÍA' },
      
      // ENSAYO ROCA
      { pattern: /^RO\d+[A-Z]?$/, category: 'ENSAYO ROCA' },
      
      // CEMENTO
      { pattern: /^CE\d+[A-Z]?$/, category: 'CEMENTO' },
      
      // ENSAYO PAVIMENTO
      { pattern: /^PA\d+[A-Z]?$/, category: 'ENSAYO PAVIMENTO' },
      
      // ENSAYO MEZCLA ASFÁLTICA
      { pattern: /^AS\d+[A-Z]?$/, category: 'ENSAYO MEZCLA ASFÁLTICA' },
      
      // EVALUACIONES ESTRUCTURALES
      { pattern: /^EE\d+[A-Z]?$/, category: 'EVALUACIONES ESTRUCTURALES' }
    ];

    // Obtener todos los ensayos
    const result = await pool.query('SELECT id, codigo, categoria FROM ensayos ORDER BY codigo');
    const ensayos = result.rows;

    console.log(`📊 Total de ensayos encontrados: ${ensayos.length}`);

    let updated = 0;
    let errors = 0;

    for (const ensayo of ensayos) {
      let newCategory = null;

      // Buscar la categoría correcta
      for (const mapping of categoryMappings) {
        if (mapping.pattern.test(ensayo.codigo)) {
          // Verificar si está en la lista de exclusión
          if (mapping.exclude && mapping.exclude.includes(ensayo.codigo)) {
            continue;
          }
          newCategory = mapping.category;
          break;
        }
      }

      // Si no se encontró categoría específica, mantener la actual o asignar por defecto
      if (!newCategory) {
        // Mantener categorías especiales que ya están correctas
        if (ensayo.categoria !== 'OTROS SERVICIOS') {
          continue;
        }
        newCategory = 'OTROS SERVICIOS';
      }

      // Actualizar solo si la categoría es diferente
      if (ensayo.categoria !== newCategory) {
        try {
          await pool.query(
            'UPDATE ensayos SET categoria = $1 WHERE id = $2',
            [newCategory, ensayo.id]
          );
          console.log(`✅ ${ensayo.codigo}: ${ensayo.categoria} → ${newCategory}`);
          updated++;
        } catch (error) {
          console.error(`❌ Error actualizando ${ensayo.codigo}:`, error.message);
          errors++;
        }
      }
    }

    console.log(`\n📈 Resumen:`);
    console.log(`✅ Ensayos actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesados: ${ensayos.length}`);

    // Mostrar estadísticas por categoría
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);

    console.log(`\n📋 Categorías actuales:`);
    stats.rows.forEach(row => {
      console.log(`  ${row.categoria}: ${row.count} ensayos`);
    });

  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    pool.end();
  }
}

fixCategories();
