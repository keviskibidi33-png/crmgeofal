const pool = require('../config/db');

async function addOrdenColumn() {
  try {
    console.log('🔧 Agregando columna orden...');
    
    await pool.query('ALTER TABLE ensayos ADD COLUMN orden INTEGER');
    console.log('✅ Columna orden agregada');
    
    // Ahora ejecutar el script de orden
    console.log('\n🔧 Aplicando orden...');
    
    // ENSAYOS ESPECIALES SUELO
    const especialesOrder = [
      'SU05', 'SU33', 'SU37', 'SU38B', 'SU40B', 'SU41', 'SU42', 'SU43', 'SU44', 'SU45', 'SU46', 'SU47', 'EE01', 'EE02', 'EE03'
    ];
    
    for (let i = 0; i < especialesOrder.length; i++) {
      await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, especialesOrder[i]]);
    }
    console.log('✅ ENSAYOS ESPECIALES SUELO ordenados');

    // ENSAYO QUÍMICO AGREGADO
    const quimicoAgregadoOrder = [
      'AG11', 'AG16', 'AG17', 'AG29', 'AG30', 'AG24', 'AG25', 'AG12', 'AG13'
    ];
    
    for (let i = 0; i < quimicoAgregadoOrder.length; i++) {
      await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, quimicoAgregadoOrder[i]]);
    }
    console.log('✅ ENSAYO QUÍMICO AGREGADO ordenado');

    // ENSAYO QUÍMICO EN CONCRETO
    const quimicoConcretoOrder = [
      'CO15', 'CO16', 'CO17', 'SU27', 'CO10', 'CO13'
    ];
    
    for (let i = 0; i < quimicoConcretoOrder.length; i++) {
      await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, quimicoConcretoOrder[i]]);
    }
    console.log('✅ ENSAYO QUÍMICO EN CONCRETO ordenado');

    // Verificación final
    console.log('\n🔍 VERIFICACIÓN:');
    
    const especialesResult = await pool.query(`
      SELECT codigo, descripcion, orden 
      FROM ensayos 
      WHERE categoria = 'ENSAYOS ESPECIALES SUELO' 
      ORDER BY orden
    `);
    
    console.log('📋 ENSAYOS ESPECIALES SUELO:');
    especialesResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.codigo}: ${row.descripcion}`);
    });

    console.log('\n✅ Orden aplicado exitosamente');

  } catch (error) {
    if (error.code === '42701') {
      console.log('✅ Columna orden ya existe, aplicando orden...');
      
      // Solo aplicar orden si la columna ya existe
      const especialesOrder = [
        'SU05', 'SU33', 'SU37', 'SU38B', 'SU40B', 'SU41', 'SU42', 'SU43', 'SU44', 'SU45', 'SU46', 'SU47', 'EE01', 'EE02', 'EE03'
      ];
      
      for (let i = 0; i < especialesOrder.length; i++) {
        await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, especialesOrder[i]]);
      }
      console.log('✅ Orden aplicado');
    } else {
      console.error('❌ Error:', error);
    }
  } finally {
    pool.end();
  }
}

addOrdenColumn();
