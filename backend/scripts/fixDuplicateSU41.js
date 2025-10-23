const pool = require('../config/db');

async function fixDuplicateSU41() {
  console.log('🔧 Corrigiendo duplicado SU41...\n');

  try {
    // 1. Verificar el SU41 actual
    const current = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo = $1', ['SU41']);
    console.log('SU41 actual:', current.rows[0]);

    // 2. El SU41 actual es "Potencial de Colapso en suelo" (ENSAYOS ESPECIALES SUELO)
    // Necesitamos agregar el segundo SU41 como SU41B
    console.log('\n📝 Agregando SU41B (Densímetro Nuclear)...');
    
    await pool.query(`
      INSERT INTO ensayos (
        codigo, descripcion, norma, referencia_otra_norma, 
        ubicacion, precio, comentarios, nota_comercial, 
        ensayos_requeridos, categoria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'SU41B',
      'Determinación de la densidad de suelo en terreno (Método Densímetro Nuclear)',
      'ASTM D2922',
      '',
      'LABORATORIO',
      90,
      '',
      '',
      [],
      'ENSAYOS DE CAMPO EN SUELO'
    ]);
    
    console.log('✅ SU41B agregado correctamente');

    // 3. Verificación final
    console.log('\n🔍 Verificación final:');
    const result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo IN ($1, $2)', ['SU41', 'SU41B']);
    result.rows.forEach(row => {
      console.log(`✅ ${row.codigo}: ${row.descripcion} (${row.categoria})`);
    });

    // 4. Estadísticas finales
    const totalCount = await pool.query('SELECT COUNT(*) as total FROM ensayos');
    console.log(`\n📊 Total de ensayos en BD: ${totalCount.rows[0].total}`);

    console.log('\n✅ Duplicado SU41 resuelto correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

fixDuplicateSU41();
