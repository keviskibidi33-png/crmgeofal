const pool = require('../config/db');

async function correctCategories() {
  console.log('🔧 Corrigiendo categorías con mapeo preciso...\n');

  try {
    // Mapeo exacto según el CSV
    const corrections = [
      // ENSAYO QUÍMICO AGREGADO
      { codigo: 'AG11', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG12', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG13', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG16', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG17', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG24', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG25', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG29', categoria: 'ENSAYO QUÍMICO AGREGADO' },
      { codigo: 'AG30', categoria: 'ENSAYO QUÍMICO AGREGADO' },

      // ENSAYO ALBAÑILERÍA
      { codigo: 'ALB01', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB02', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB03', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB04', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB04A', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB05', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB06', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB07', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB08', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB09', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB10', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB11', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB12', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB13', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB14', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB15', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB16', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB17', categoria: 'ENSAYO ALBAÑILERÍA' },
      { codigo: 'ALB18', categoria: 'ENSAYO ALBAÑILERÍA' },

      // CEMENTO
      { codigo: 'CEM01', categoria: 'CEMENTO' },
      { codigo: 'CEM02', categoria: 'CEMENTO' },
      { codigo: 'CEM03', categoria: 'CEMENTO' },

      // ENSAYO CONCRETO DE CAMPO
      { codigo: 'CO03A', categoria: 'ENSAYO CONCRETO DE CAMPO' },
      { codigo: 'CO03B', categoria: 'ENSAYO CONCRETO DE CAMPO' },
      { codigo: 'CO03D', categoria: 'ENSAYO CONCRETO DE CAMPO' },
      { codigo: 'CO04', categoria: 'ENSAYO CONCRETO DE CAMPO' },
      { codigo: 'CO11', categoria: 'ENSAYO CONCRETO DE CAMPO' },

      // ENSAYO QUÍMICO EN CONCRETO
      { codigo: 'CO10', categoria: 'ENSAYO QUÍMICO EN CONCRETO' },
      { codigo: 'CO13', categoria: 'ENSAYO QUÍMICO EN CONCRETO' },
      { codigo: 'CO15', categoria: 'ENSAYO QUÍMICO EN CONCRETO' },
      { codigo: 'CO16', categoria: 'ENSAYO QUÍMICO EN CONCRETO' },
      { codigo: 'CO17', categoria: 'ENSAYO QUÍMICO EN CONCRETO' },
      { codigo: 'SU27', categoria: 'ENSAYO QUÍMICO EN CONCRETO' },

      // ENSAYO CONCRETO (Diseños)
      { codigo: 'DIS01', categoria: 'ENSAYO CONCRETO' },
      { codigo: 'DIS02', categoria: 'ENSAYO CONCRETO' },
      { codigo: 'DIS03', categoria: 'ENSAYO CONCRETO' },

      // EVALUACIONES ESTRUCTURALES
      { codigo: 'E01', categoria: 'EVALUACIONES ESTRUCTURALES' },
      { codigo: 'E02', categoria: 'EVALUACIONES ESTRUCTURALES' },
      { codigo: 'E03', categoria: 'EVALUACIONES ESTRUCTURALES' },
      { codigo: 'E04', categoria: 'EVALUACIONES ESTRUCTURALES' },

      // ENSAYOS ESPECIALES SUELO
      { codigo: 'EE01', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'EE02', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'EE03', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU05', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU33', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU37', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU40', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU41', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU42', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU43', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU44', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU45', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU46', categoria: 'ENSAYOS ESPECIALES SUELO' },
      { codigo: 'SU47', categoria: 'ENSAYOS ESPECIALES SUELO' },

      // ENSAYO MEZCLA ASFÁLTICA
      { codigo: 'MA02A', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA03', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA04', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA05', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA08', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA11', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA13', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },
      { codigo: 'MA14', categoria: 'ENSAYO MEZCLA ASFÁLTICA' },

      // ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO
      { codigo: 'PAV01', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV02', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV02A', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV03', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV04', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV05', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV06', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV07', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV08', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV09', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV10', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV11', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },
      { codigo: 'PAV12', categoria: 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO' },

      // ENSAYOS DE CAMPO EN SUELO
      { codigo: 'SU02', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU06A', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU06B', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU06C', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU06D', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU16', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU18', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU28', categoria: 'ENSAYOS DE CAMPO EN SUELO' },
      { codigo: 'SU29', categoria: 'ENSAYOS DE CAMPO EN SUELO' },

      // ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO
      { codigo: 'SU03', categoria: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' },
      { codigo: 'SU13', categoria: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' },
      { codigo: 'SU14', categoria: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' },
      { codigo: 'SU15', categoria: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' },
      { codigo: 'SU26', categoria: 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO' },

      // OTROS SERVICIOS (SU20A no está en el CSV, debe ser OTROS SERVICIOS)
      { codigo: 'SU20A', categoria: 'OTROS SERVICIOS' }
    ];

    let updated = 0;
    let errors = 0;

    console.log(`🔧 Aplicando ${corrections.length} correcciones...\n`);

    for (const correction of corrections) {
      try {
        await pool.query(
          'UPDATE ensayos SET categoria = $1 WHERE codigo = $2',
          [correction.categoria, correction.codigo]
        );
        console.log(`✅ ${correction.codigo}: → ${correction.categoria}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error actualizando ${correction.codigo}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📈 RESUMEN DE CORRECCIÓN:`);
    console.log(`✅ Ensayos actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);

    // Mostrar estadísticas finales
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);

    console.log(`\n📋 DISTRIBUCIÓN FINAL POR CATEGORÍAS:`);
    stats.rows.forEach(row => {
      console.log(`  ${row.categoria}: ${row.count} ensayos`);
    });

  } catch (error) {
    console.error('❌ Error en la corrección:', error);
  } finally {
    pool.end();
  }
}

correctCategories();
