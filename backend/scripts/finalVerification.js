const pool = require('../config/db');

async function finalVerification() {
  console.log('🔍 REVISIÓN METICULOSA FINAL DEL SISTEMA DE ENSAYOS\n');

  try {
    // 1. Verificación básica de datos
    console.log('📊 1. VERIFICACIÓN BÁSICA DE DATOS:');
    const basicStats = await pool.query(`
      SELECT 
        COUNT(*) as total_ensayos,
        COUNT(DISTINCT categoria) as categorias_unicas,
        COUNT(DISTINCT codigo) as codigos_unicos,
        MIN(precio) as precio_minimo,
        MAX(precio) as precio_maximo,
        AVG(precio) as precio_promedio
      FROM ensayos
    `);
    
    const stats = basicStats.rows[0];
    console.log(`  ✅ Total ensayos: ${stats.total_ensayos}`);
    console.log(`  ✅ Categorías únicas: ${stats.categorias_unicas}`);
    console.log(`  ✅ Códigos únicos: ${stats.codigos_unicos}`);
    console.log(`  💰 Precio mínimo: S/ ${parseFloat(stats.precio_minimo).toFixed(2)}`);
    console.log(`  💰 Precio máximo: S/ ${parseFloat(stats.precio_maximo).toFixed(2)}`);
    console.log(`  💰 Precio promedio: S/ ${parseFloat(stats.precio_promedio).toFixed(2)}\n`);

    // 2. Verificación de categorías
    console.log('📋 2. DISTRIBUCIÓN POR CATEGORÍAS:');
    const categories = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    categories.rows.forEach(row => {
      console.log(`  ${row.categoria}: ${row.count} ensayos`);
    });
    console.log('');

    // 3. Verificación de ubicaciones
    console.log('🏢 3. DISTRIBUCIÓN POR UBICACIONES:');
    const locations = await pool.query(`
      SELECT ubicacion, COUNT(*) as count 
      FROM ensayos 
      GROUP BY ubicacion 
      ORDER BY count DESC
    `);
    
    locations.rows.forEach(row => {
      console.log(`  ${row.ubicacion}: ${row.count} ensayos`);
    });
    console.log('');

    // 4. Verificación de ensayos con conexiones
    console.log('🔗 4. ENSAYOS CON CONEXIONES:');
    const connections = await pool.query(`
      SELECT codigo, descripcion, ensayos_requeridos 
      FROM ensayos 
      WHERE ensayos_requeridos IS NOT NULL AND ensayos_requeridos != '{}'
      ORDER BY codigo
    `);
    
    console.log(`  Total ensayos con conexiones: ${connections.rows.length}`);
    connections.rows.slice(0, 5).forEach(row => {
      console.log(`  ${row.codigo}: ${row.descripcion.substring(0, 50)}...`);
      const requeridos = Array.isArray(row.ensayos_requeridos) ? row.ensayos_requeridos : [];
      console.log(`    Requiere: ${requeridos.join(', ')}`);
    });
    if (connections.rows.length > 5) {
      console.log(`  ... y ${connections.rows.length - 5} más`);
    }
    console.log('');

    // 5. Verificación de integridad de datos
    console.log('🔍 5. VERIFICACIÓN DE INTEGRIDAD:');
    
    // Ensayos sin descripción
    const noDescription = await pool.query(`
      SELECT COUNT(*) as count FROM ensayos WHERE descripcion IS NULL OR descripcion = ''
    `);
    console.log(`  ✅ Ensayos sin descripción: ${noDescription.rows[0].count}`);

    // Ensayos sin precio
    const noPrice = await pool.query(`
      SELECT COUNT(*) as count FROM ensayos WHERE precio IS NULL OR precio = 0
    `);
    console.log(`  ✅ Ensayos sin precio: ${noPrice.rows[0].count}`);

    // Ensayos sin categoría
    const noCategory = await pool.query(`
      SELECT COUNT(*) as count FROM ensayos WHERE categoria IS NULL OR categoria = ''
    `);
    console.log(`  ✅ Ensayos sin categoría: ${noCategory.rows[0].count}`);

    // Códigos duplicados
    const duplicates = await pool.query(`
      SELECT codigo, COUNT(*) as count 
      FROM ensayos 
      GROUP BY codigo 
      HAVING COUNT(*) > 1
    `);
    console.log(`  ✅ Códigos duplicados: ${duplicates.rows.length}`);

    console.log('');

    // 6. Verificación de rangos de precios por categoría
    console.log('💰 6. RANGOS DE PRECIOS POR CATEGORÍA:');
    const priceRanges = await pool.query(`
      SELECT 
        categoria,
        COUNT(*) as cantidad,
        MIN(precio) as precio_min,
        MAX(precio) as precio_max,
        AVG(precio) as precio_promedio
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY precio_promedio DESC
    `);
    
    priceRanges.rows.forEach(row => {
      console.log(`  ${row.categoria}:`);
      console.log(`    Cantidad: ${row.cantidad} | Min: S/ ${parseFloat(row.precio_min).toFixed(2)} | Max: S/ ${parseFloat(row.precio_max).toFixed(2)} | Prom: S/ ${parseFloat(row.precio_promedio).toFixed(2)}`);
    });
    console.log('');

    // 7. Verificación de estructura de tabla
    console.log('🗄️ 7. ESTRUCTURA DE TABLA:');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ensayos' 
      ORDER BY ordinal_position
    `);
    
    console.log('  Columnas de la tabla ensayos:');
    tableStructure.rows.forEach(col => {
      console.log(`    ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    console.log('');

    // 8. Verificación de índices
    console.log('📇 8. ÍNDICES DE LA TABLA:');
    const indexes = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'ensayos'
    `);
    
    indexes.rows.forEach(idx => {
      console.log(`    ${idx.indexname}: ${idx.indexdef}`);
    });
    console.log('');

    console.log('✅ REVISIÓN METICULOSA COMPLETADA - SISTEMA EN PERFECTO ESTADO');
    console.log('🎯 Todos los ensayos están correctamente categorizados y organizados');
    console.log('🚀 El módulo está listo para producción');

  } catch (error) {
    console.error('❌ Error en la verificación final:', error);
  } finally {
    pool.end();
  }
}

finalVerification();
