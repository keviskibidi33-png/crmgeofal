const pool = require('../config/db');

async function fixOrder() {
  console.log('🔧 CORRIGIENDO ORDEN DE ENSAYOS...\n');

  try {
    // 1. Corregir ENSAYOS ESPECIALES SUELO
    console.log('📂 Corrigiendo ENSAYOS ESPECIALES SUELO...');
    
    // El orden correcto según CSV es: SU05, SU33, SU37, SU38B, SU40B, SU41, SU42, SU43, SU44, SU45, SU46, SU47, EE01, EE02, EE03
    const especialesOrder = [
      'SU05', 'SU33', 'SU37', 'SU38B', 'SU40B', 'SU41', 'SU42', 'SU43', 'SU44', 'SU45', 'SU46', 'SU47', 'EE01', 'EE02', 'EE03'
    ];
    
    for (let i = 0; i < especialesOrder.length; i++) {
      await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, especialesOrder[i]]);
    }
    console.log('✅ ENSAYOS ESPECIALES SUELO ordenados');

    // 2. Corregir ENSAYO QUÍMICO AGREGADO
    console.log('📂 Corrigiendo ENSAYO QUÍMICO AGREGADO...');
    
    const quimicoAgregadoOrder = [
      'AG11', 'AG16', 'AG17', 'AG29', 'AG30', 'AG24', 'AG25', 'AG12', 'AG13'
    ];
    
    for (let i = 0; i < quimicoAgregadoOrder.length; i++) {
      await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, quimicoAgregadoOrder[i]]);
    }
    console.log('✅ ENSAYO QUÍMICO AGREGADO ordenado');

    // 3. Corregir ENSAYO QUÍMICO EN CONCRETO
    console.log('📂 Corrigiendo ENSAYO QUÍMICO EN CONCRETO...');
    
    const quimicoConcretoOrder = [
      'CO15', 'CO16', 'CO17', 'SU27', 'CO10', 'CO13'
    ];
    
    for (let i = 0; i < quimicoConcretoOrder.length; i++) {
      await pool.query('UPDATE ensayos SET orden = $1 WHERE codigo = $2', [i + 1, quimicoConcretoOrder[i]]);
    }
    console.log('✅ ENSAYO QUÍMICO EN CONCRETO ordenado');

    // 4. Verificar que la columna orden existe, si no, crearla
    try {
      await pool.query('ALTER TABLE ensayos ADD COLUMN orden INTEGER');
      console.log('✅ Columna orden creada');
    } catch (error) {
      if (error.code === '42701') {
        console.log('✅ Columna orden ya existe');
      } else {
        throw error;
      }
    }

    // 5. Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    
    const especialesResult = await pool.query(`
      SELECT codigo, descripcion, orden 
      FROM ensayos 
      WHERE categoria = 'ENSAYOS ESPECIALES SUELO' 
      ORDER BY orden
    `);
    
    console.log('📋 ENSAYOS ESPECIALES SUELO ordenados:');
    especialesResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.codigo}: ${row.descripcion}`);
    });

    console.log('\n✅ Orden corregido exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

fixOrder();
