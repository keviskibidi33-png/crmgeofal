const pool = require('../config/db');

async function addMissingEnsayos() {
  console.log('🔧 Agregando ensayos faltantes...\n');

  try {
    // SU34: Densidad y peso unitario de muestra suelo
    console.log('📝 Agregando SU34...');
    await pool.query(`
      INSERT INTO ensayos (
        codigo, descripcion, norma, referencia_otra_norma, 
        ubicacion, precio, comentarios, nota_comercial, 
        ensayos_requeridos, categoria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'SU34',
      'Densidad y peso unitario de muestra suelo',
      'NTP 339.167',
      '',
      'LABORATORIO',
      120,
      '',
      '',
      [],
      'ENSAYO ESTÁNDAR SUELO'
    ]);
    console.log('✅ SU34 agregado');

    // MA02: Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall
    console.log('📝 Agregando MA02...');
    await pool.query(`
      INSERT INTO ensayos (
        codigo, descripcion, norma, referencia_otra_norma, 
        ubicacion, precio, comentarios, nota_comercial, 
        ensayos_requeridos, categoria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'MA02',
      'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall , incluye ensayo Rice y peso específico.',
      'ASTM D6926-20',
      '',
      'LABORATORIO',
      350,
      '',
      '',
      [],
      'ENSAYO MEZCLA ASFÁLTICA'
    ]);
    console.log('✅ MA02 agregado');

    // Verificación final
    console.log('\n🔍 Verificación final:');
    const result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo IN ($1, $2)', ['SU34', 'MA02']);
    result.rows.forEach(row => {
      console.log(`✅ ${row.codigo}: ${row.categoria}`);
    });

    // Estadísticas finales
    const totalCount = await pool.query('SELECT COUNT(*) as total FROM ensayos');
    console.log(`\n📊 Total de ensayos en BD: ${totalCount.rows[0].total}`);

    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    console.log('\n📋 Distribución final por categoría:');
    stats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.count} ensayos`);
    });

    console.log('\n✅ Todos los ensayos agregados correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

addMissingEnsayos();
