const pool = require('../config/db');

async function checkAllCategories() {
  console.log('🔍 VERIFICACIÓN DE TODAS LAS CATEGORÍAS...\n');

  try {
    // 1. Obtener estadísticas de la BD
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    console.log('📋 DISTRIBUCIÓN EN BASE DE DATOS:');
    stats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.count} ensayos`);
    });
    
    const totalEnsayos = await pool.query('SELECT COUNT(*) as total FROM ensayos');
    console.log(`\n📊 Total de ensayos en BD: ${totalEnsayos.rows[0].total}`);
    
    // 2. Verificar categorías específicas
    const categorias = [
      'ENSAYOS ESPECIALES SUELO',
      'ENSAYOS DE CAMPO EN SUELO', 
      'ENSAYOS ESTÁNDAR SUELO',
      'ENSAYOS QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
      'ENSAYOS AGREGADO',
      'ENSAYOS QUÍMICO AGREGADO',
      'ENSAYOS CONCRETO',
      'ENSAYOS CONCRETO DE CAMPO',
      'ENSAYOS QUÍMICO EN CONCRETO',
      'ENSAYOS ALBAÑILERÍA',
      'ENSAYOS ROCA',
      'CEMENTO',
      'ENSAYOS PAVIMENTO EN CAMPO Y LABORATORIO',
      'ENSAYOS MEZCLA ASFÁLTICA',
      'EVALUACIONES ESTRUCTURALES',
      'OTROS SERVICIOS'
    ];
    
    console.log('\n🔍 VERIFICACIÓN POR CATEGORÍA:');
    
    for (const categoria of categorias) {
      const result = await pool.query('SELECT COUNT(*) as count FROM ensayos WHERE categoria = $1', [categoria]);
      const count = result.rows[0].count;
      
      // Listar algunos ensayos de cada categoría
      const ensayos = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE categoria = $1 ORDER BY codigo LIMIT 5', [categoria]);
      
      console.log(`\n📂 ${categoria}: ${count} ensayos`);
      ensayos.rows.forEach(ensayo => {
        console.log(`  ${ensayo.codigo}: ${ensayo.descripcion}`);
      });
      
      if (count > 5) {
        console.log(`  ... y ${count - 5} más`);
      }
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

checkAllCategories();
