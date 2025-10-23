const pool = require('../config/db');

async function addMissingEspeciales() {
  console.log('🔧 Agregando ensayos faltantes en ESPECIALES...\n');

  try {
    // 1. Agregar SU38B (CBR INSITU) - el segundo SU38
    console.log('📝 Agregando SU38B (CBR INSITU)...');
    await pool.query(`
      INSERT INTO ensayos (
        codigo, descripcion, norma, referencia_otra_norma, 
        ubicacion, precio, comentarios, nota_comercial, 
        ensayos_requeridos, categoria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'SU38B',
      'CBR INSITU',
      '',
      '',
      'CAMPO',
      0, // Sin precio
      '',
      '',
      [],
      'ENSAYOS ESPECIALES SUELO'
    ]);
    console.log('✅ SU38B agregado');

    // 2. Agregar SU40B (Hinchamiento suelo) - el segundo SU40
    console.log('📝 Agregando SU40B (Hinchamiento suelo)...');
    await pool.query(`
      INSERT INTO ensayos (
        codigo, descripcion, norma, referencia_otra_norma, 
        ubicacion, precio, comentarios, nota_comercial, 
        ensayos_requeridos, categoria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'SU40B',
      'Hinchamiento suelo',
      'ASTM D4546-21',
      '',
      'LABORATORIO',
      0, // Sin precio
      '',
      '',
      [],
      'ENSAYOS ESPECIALES SUELO'
    ]);
    console.log('✅ SU40B agregado');

    // 3. Verificación final
    console.log('\n🔍 Verificación final:');
    const result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo IN ($1, $2)', ['SU38B', 'SU40B']);
    result.rows.forEach(row => {
      console.log(`✅ ${row.codigo}: ${row.descripcion} (${row.categoria})`);
    });

    // 4. Contar total en ESPECIALES
    const countResult = await pool.query('SELECT COUNT(*) as count FROM ensayos WHERE categoria = $1', ['ENSAYOS ESPECIALES SUELO']);
    console.log(`\n📊 Total ensayos en ENSAYOS ESPECIALES SUELO: ${countResult.rows[0].count}`);

    // 5. Listar todos los especiales
    const listResult = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE categoria = $1 ORDER BY codigo', ['ENSAYOS ESPECIALES SUELO']);
    console.log('\n📋 Todos los ensayos especiales:');
    listResult.rows.forEach(row => {
      console.log(`  ${row.codigo}: ${row.descripcion}`);
    });

    console.log('\n✅ Ensayos faltantes agregados correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

addMissingEspeciales();
