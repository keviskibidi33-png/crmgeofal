const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function simpleReimport() {
  console.log('🔄 Reimportación simple con UTF-8...\n');

  try {
    // 1. Eliminar datos existentes
    console.log('🗑️ Eliminando datos existentes...');
    await pool.query('DELETE FROM ensayos');
    await pool.query('ALTER SEQUENCE ensayos_id_seq RESTART WITH 1');
    console.log('✅ Datos eliminados');

    // 2. Leer CSV línea por línea
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    console.log('📁 Leyendo CSV:', csvPath);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    console.log(`📊 Líneas en CSV: ${lines.length}`);
    
    // 3. Procesar línea por línea
    let insertedCount = 0;
    let currentCategory = 'OTROS SERVICIOS';
    
    for (let i = 1; i < lines.length; i++) { // Saltar header
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      if (columns.length < 8) continue;
      
      const codigo = columns[0]?.trim();
      const descripcion = columns[1]?.trim();
      const norma = columns[2]?.trim();
      const referencia_otra_norma = columns[3]?.trim();
      const ubicacion = columns[4]?.trim();
      const precio = columns[5]?.trim();
      const comentarios = columns[6]?.trim();
      const nota_comercial = columns[7]?.trim();
      
      // Si es una categoría (línea sin código)
      if (!codigo && descripcion && !norma && !precio) {
        currentCategory = descripcion;
        console.log(`📂 Categoría: ${currentCategory}`);
        continue;
      }
      
      // Si tiene código, es un ensayo
      if (codigo && descripcion && precio) {
        try {
          // Extraer ensayos requeridos de comentarios
          let ensayosRequeridos = [];
          if (comentarios) {
            const codigoMatches = comentarios.match(/\b[A-Z]{2}\d{2,3}[A-Z]?\b/g);
            if (codigoMatches) {
              ensayosRequeridos = codigoMatches;
            }
          }
          
          await pool.query(`
            INSERT INTO ensayos (
              codigo, descripcion, norma, referencia_otra_norma, 
              ubicacion, precio, comentarios, nota_comercial, 
              ensayos_requeridos, categoria
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            codigo,
            descripcion,
            norma || '',
            referencia_otra_norma || '',
            ubicacion || '',
            parseFloat(precio) || 0,
            comentarios || '',
            nota_comercial || '',
            ensayosRequeridos,
            currentCategory
          ]);
          
          insertedCount++;
          if (insertedCount % 20 === 0) {
            console.log(`✅ Insertados ${insertedCount} ensayos...`);
          }
        } catch (error) {
          console.error(`❌ Error insertando ${codigo}:`, error.message);
        }
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos insertados: ${insertedCount}`);

    // 4. Verificar resultado
    const examples = await pool.query(`
      SELECT codigo, descripcion, norma, categoria
      FROM ensayos 
      WHERE codigo IN ('SU04', 'SU19', 'AG08A', 'AG09', 'SU22')
      ORDER BY codigo
    `);

    console.log('\n🔍 Verificación final:');
    examples.rows.forEach(row => {
      console.log(`${row.codigo}: ${row.descripcion}`);
      console.log(`  Norma: ${row.norma}`);
      console.log(`  Categoría: ${row.categoria}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

simpleReimport();
