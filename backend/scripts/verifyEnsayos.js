const pool = require('../config/db');

async function verifyEnsayos() {
  try {
    console.log('🔍 Verificando ensayos importados...\n');
    
    // Total de ensayos
    const total = await pool.query('SELECT COUNT(*) as total FROM ensayos');
    console.log(`📊 Total de ensayos: ${total.rows[0].total}`);
    
    // Por categoría
    const categorias = await pool.query(`
      SELECT categoria, COUNT(*) as cantidad, AVG(precio) as precio_promedio
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY cantidad DESC
    `);
    
    console.log('\n📋 Por categoría:');
    categorias.rows.forEach(cat => {
      console.log(`  ${cat.categoria}: ${cat.cantidad} ensayos (Precio promedio: S/ ${parseFloat(cat.precio_promedio).toFixed(2)})`);
    });
    
    // Ejemplos de ensayos SU
    const ensayosSU = await pool.query(`
      SELECT codigo, descripcion, precio 
      FROM ensayos 
      WHERE codigo LIKE 'SU%' 
      LIMIT 5
    `);
    
    console.log('\n🔬 Ejemplos de ensayos SU:');
    ensayosSU.rows.forEach(ensayo => {
      console.log(`  ${ensayo.codigo}: ${ensayo.descripcion} - S/ ${ensayo.precio}`);
    });
    
    // Ejemplos de ensayos AG
    const ensayosAG = await pool.query(`
      SELECT codigo, descripcion, precio 
      FROM ensayos 
      WHERE codigo LIKE 'AG%' 
      LIMIT 3
    `);
    
    console.log('\n🧱 Ejemplos de ensayos AG:');
    ensayosAG.rows.forEach(ensayo => {
      console.log(`  ${ensayo.codigo}: ${ensayo.descripcion} - S/ ${ensayo.precio}`);
    });
    
    // Ensayos con conexiones
    const conConexiones = await pool.query(`
      SELECT codigo, descripcion, ensayos_requeridos 
      FROM ensayos 
      WHERE ensayos_requeridos IS NOT NULL AND ensayos_requeridos != ''
      LIMIT 3
    `);
    
    console.log('\n🔗 Ensayos con conexiones:');
    conConexiones.rows.forEach(ensayo => {
      console.log(`  ${ensayo.codigo}: ${ensayo.descripcion}`);
      console.log(`    Requiere: ${ensayo.ensayos_requeridos}`);
    });
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

verifyEnsayos();
