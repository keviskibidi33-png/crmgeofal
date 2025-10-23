const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function exportCompleteDatabase() {
  console.log('📊 EXPORTANDO BASE DE DATOS COMPLETA A JSON...\n');

  try {
    // 1. Obtener todos los ensayos con información completa
    const ensayosResult = await pool.query(`
      SELECT 
        id,
        codigo,
        descripcion,
        norma,
        referencia_otra_norma,
        ubicacion,
        precio,
        comentarios,
        nota_comercial,
        ensayos_requeridos,
        categoria,
        orden,
        created_at,
        updated_at
      FROM ensayos 
      ORDER BY categoria, COALESCE(orden, 999), codigo
    `);

    console.log(`📋 Total ensayos encontrados: ${ensayosResult.rows.length}`);

    // 2. Obtener estadísticas por categoría
    const statsResult = await pool.query(`
      SELECT 
        categoria,
        COUNT(*) as total_ensayos,
        MIN(precio) as precio_minimo,
        MAX(precio) as precio_maximo,
        AVG(precio) as precio_promedio,
        COUNT(CASE WHEN precio = 0 OR precio IS NULL THEN 1 END) as sin_precio
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY total_ensayos DESC
    `);

    // 3. Obtener ensayos con conexiones (ensayos requeridos)
    const conexionesResult = await pool.query(`
      SELECT 
        codigo,
        descripcion,
        ensayos_requeridos,
        categoria
      FROM ensayos 
      WHERE ensayos_requeridos IS NOT NULL 
        AND ensayos_requeridos != '{}'
        AND ensayos_requeridos != '[]'
    `);

    // 4. Crear estructura completa de la base de datos
    const databaseExport = {
      metadata: {
        export_date: new Date().toISOString(),
        total_ensayos: ensayosResult.rows.length,
        total_categorias: statsResult.rows.length,
        version: "1.0.0",
        description: "Base de datos completa de ensayos GEOFAL 2025"
      },
      
      estadisticas: {
        por_categoria: statsResult.rows.map(stat => ({
          categoria: stat.categoria,
          total_ensayos: parseInt(stat.total_ensayos),
          precio_minimo: parseFloat(stat.precio_minimo) || 0,
          precio_maximo: parseFloat(stat.precio_maximo) || 0,
          precio_promedio: parseFloat(stat.precio_promedio) || 0,
          sin_precio: parseInt(stat.sin_precio)
        })),
        
        resumen_general: {
          total_ensayos: ensayosResult.rows.length,
          total_categorias: statsResult.rows.length,
          ensayos_con_conexiones: conexionesResult.rows.length,
          precio_total_estimado: ensayosResult.rows.reduce((sum, ensayo) => sum + (parseFloat(ensayo.precio) || 0), 0)
        }
      },

      categorias: {},
      
      ensayos: ensayosResult.rows.map(ensayo => ({
        id: ensayo.id,
        codigo: ensayo.codigo,
        descripcion: ensayo.descripcion,
        norma: ensayo.norma,
        referencia_otra_norma: ensayo.referencia_otra_norma,
        ubicacion: ensayo.ubicacion,
        precio: parseFloat(ensayo.precio) || 0,
        comentarios: ensayo.comentarios,
        nota_comercial: ensayo.nota_comercial,
        ensayos_requeridos: ensayo.ensayos_requeridos || [],
        categoria: ensayo.categoria,
        orden: ensayo.orden,
        created_at: ensayo.created_at,
        updated_at: ensayo.updated_at
      })),

      conexiones: conexionesResult.rows.map(conexion => ({
        codigo: conexion.codigo,
        descripcion: conexion.descripcion,
        categoria: conexion.categoria,
        ensayos_requeridos: conexion.ensayos_requeridos,
        total_requeridos: conexion.ensayos_requeridos.length
      })),

      ubicaciones: {
        laboratorio: ensayosResult.rows.filter(e => e.ubicacion === 'LABORATORIO').length,
        campo: ensayosResult.rows.filter(e => e.ubicacion === 'CAMPO').length,
        mixto: ensayosResult.rows.filter(e => e.ubicacion === 'MIXTO').length,
        sin_ubicacion: ensayosResult.rows.filter(e => !e.ubicacion || e.ubicacion === '').length
      },

      rangos_precio: {
        sin_precio: ensayosResult.rows.filter(e => !e.precio || e.precio === 0).length,
        bajo: ensayosResult.rows.filter(e => e.precio > 0 && e.precio <= 100).length,
        medio: ensayosResult.rows.filter(e => e.precio > 100 && e.precio <= 500).length,
        alto: ensayosResult.rows.filter(e => e.precio > 500 && e.precio <= 1000).length,
        muy_alto: ensayosResult.rows.filter(e => e.precio > 1000).length
      }
    };

    // 5. Organizar ensayos por categoría
    for (const ensayo of ensayosResult.rows) {
      if (!databaseExport.categorias[ensayo.categoria]) {
        databaseExport.categorias[ensayo.categoria] = {
          nombre: ensayo.categoria,
          ensayos: [],
          total: 0,
          precio_minimo: null,
          precio_maximo: null,
          precio_promedio: 0
        };
      }
      
      databaseExport.categorias[ensayo.categoria].ensayos.push({
        codigo: ensayo.codigo,
        descripcion: ensayo.descripcion,
        precio: parseFloat(ensayo.precio) || 0,
        ubicacion: ensayo.ubicacion,
        orden: ensayo.orden
      });
      
      databaseExport.categorias[ensayo.categoria].total++;
    }

    // 6. Calcular estadísticas por categoría
    for (const categoria in databaseExport.categorias) {
      const ensayos = databaseExport.categorias[categoria].ensayos;
      const precios = ensayos.map(e => e.precio).filter(p => p > 0);
      
      if (precios.length > 0) {
        databaseExport.categorias[categoria].precio_minimo = Math.min(...precios);
        databaseExport.categorias[categoria].precio_maximo = Math.max(...precios);
        databaseExport.categorias[categoria].precio_promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
      }
    }

    // 7. Guardar archivo JSON
    const outputPath = path.join(__dirname, '../exports/ensayos_database_complete.json');
    
    // Crear directorio si no existe
    const exportDir = path.dirname(outputPath);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(databaseExport, null, 2), 'utf8');
    
    console.log(`✅ Base de datos exportada a: ${outputPath}`);
    console.log(`📊 Tamaño del archivo: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // 8. Mostrar resumen
    console.log('\n📈 RESUMEN DE LA EXPORTACIÓN:');
    console.log(`📋 Total ensayos: ${databaseExport.ensayos.length}`);
    console.log(`📂 Total categorías: ${Object.keys(databaseExport.categorias).length}`);
    console.log(`🔗 Ensayos con conexiones: ${databaseExport.conexiones.length}`);
    console.log(`💰 Precio total estimado: S/ ${databaseExport.estadisticas.resumen_general.precio_total_estimado.toFixed(2)}`);
    
    console.log('\n📋 ENSAYOS POR CATEGORÍA:');
    Object.entries(databaseExport.categorias).forEach(([categoria, data]) => {
      console.log(`  ${categoria}: ${data.total} ensayos (S/ ${data.precio_promedio.toFixed(2)} promedio)`);
    });

    console.log('\n🎉 Exportación completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

exportCompleteDatabase();
