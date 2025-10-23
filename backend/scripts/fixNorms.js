const pool = require('../config/db');

async function fixNorms() {
  console.log('🔧 Corrigiendo normas específicas...\n');

  try {
    // Correcciones específicas para normas
    const normCorrections = [
      { codigo: 'AG08A', norma: 'NTP 400.016' },
      { codigo: 'AG08B', norma: 'NTP 400.016' },
      { codigo: 'AG09', norma: 'MTC E-214' },
      { codigo: 'AG11', norma: 'MTC E-219' },
      { codigo: 'AG12', norma: 'MTC E 220' },
      { codigo: 'AG13', norma: 'ASTM C40-99' },
      { codigo: 'AG16', norma: 'NTP 400.042' },
      { codigo: 'AG17', norma: 'NTP 400.042' },
      { codigo: 'AG18', norma: 'ASTM C128-22' },
      { codigo: 'AG19', norma: 'ASTM C136/C136M-19' },
      { codigo: 'AG20', norma: 'ASTM C566-19' },
      { codigo: 'AG22', norma: 'ASTM C29/C29M-23' },
      { codigo: 'AG23', norma: 'ASTM C117-23' },
      { codigo: 'AG24', norma: 'NTP 400.023' },
      { codigo: 'AG25', norma: 'NTP 400.015' },
      { codigo: 'AG26', norma: 'ASTM C535-16 (Reapproved 2024)' },
      { codigo: 'AG28', norma: 'ASTM C127-24' },
      { codigo: 'AG29', norma: 'AASHTO TP57' },
      { codigo: 'AG30', norma: 'ASTM C289-07' },
      { codigo: 'AG33', norma: 'MTC E222' },
      { codigo: 'AG34', norma: 'ASTM D4791-19 (Reapproved 2023)' },
      { codigo: 'AG35', norma: 'ASTM D5821-13 (Reapproved 2017)' },
      { codigo: 'AG36', norma: 'ASTM C131/C131M-20' }
    ];

    let updatedCount = 0;

    for (const correction of normCorrections) {
      try {
        await pool.query(`
          UPDATE ensayos 
          SET norma = $1
          WHERE codigo = $2
        `, [correction.norma, correction.codigo]);
        
        console.log(`✅ ${correction.codigo}: Norma corregida a ${correction.norma}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${correction.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Normas corregidas: ${updatedCount}`);
    console.log(`📊 Total procesadas: ${normCorrections.length}`);

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

fixNorms();
