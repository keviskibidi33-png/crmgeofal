const pool = require('../config/db');

async function simpleVerification() {
  console.log('🔍 VERIFICACIÓN SIMPLE CSV vs BD...\n');

  try {
    // 1. Contar ensayos en BD por categoría
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    console.log('📋 DISTRIBUCIÓN EN BD:');
    let totalBD = 0;
    stats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.count} ensayos`);
      totalBD += parseInt(stat.count);
    });
    
    console.log(`\n📊 Total en BD: ${totalBD} ensayos`);
    
    // 2. Verificar categorías específicas que podrían tener problemas
    const problemCategories = [
      'ENSAYOS ESPECIALES SUELO',
      'ENSAYOS DE CAMPO EN SUELO',
      'ENSAYOS ESTÁNDAR SUELO'
    ];
    
    console.log('\n🔍 VERIFICACIÓN DE CATEGORÍAS PROBLEMÁTICAS:');
    
    for (const categoria of problemCategories) {
      const result = await pool.query('SELECT COUNT(*) as count FROM ensayos WHERE categoria = $1', [categoria]);
      const count = result.rows[0].count;
      
      console.log(`\n📂 ${categoria}: ${count} ensayos`);
      
      // Listar todos los ensayos de esta categoría
      const ensayos = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE categoria = $1 ORDER BY codigo', [categoria]);
      ensayos.rows.forEach(ensayo => {
        console.log(`  ${ensayo.codigo}: ${ensayo.descripcion}`);
      });
    }
    
    // 3. Verificar duplicados
    console.log('\n🔍 VERIFICANDO DUPLICADOS:');
    const duplicates = await pool.query(`
      SELECT codigo, COUNT(*) as count 
      FROM ensayos 
      GROUP BY codigo 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length > 0) {
      console.log('❌ Duplicados encontrados:');
      duplicates.rows.forEach(dup => {
        console.log(`  ${dup.codigo}: ${dup.count} veces`);
      });
    } else {
      console.log('✅ No hay duplicados');
    }
    
    // 4. Verificar ensayos sin precio
    console.log('\n🔍 VERIFICANDO ENSAYOS SIN PRECIO:');
    const sinPrecio = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE precio = 0 OR precio IS NULL');
    
    if (sinPrecio.rows.length > 0) {
      console.log('⚠️  Ensayos sin precio:');
      sinPrecio.rows.forEach(ensayo => {
        console.log(`  ${ensayo.codigo}: ${ensayo.descripcion}`);
      });
    } else {
      console.log('✅ Todos los ensayos tienen precio');
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

simpleVerification();
