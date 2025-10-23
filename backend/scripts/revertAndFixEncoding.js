const pool = require('../config/db');

async function revertAndFixEncoding() {
  console.log('🔄 Revirtiendo y corrigiendo codificación...\n');

  try {
    // Primero, vamos a importar los datos correctos desde el CSV
    const fs = require('fs');
    const path = require('path');
    const csv = require('csv-parser');

    console.log('📁 Leyendo CSV original...');
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ No se encontró el archivo CSV');
      return;
    }

    const ensayosCorrectos = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath, { encoding: 'utf8' })
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          if (row.CÓDIGO && row.CÓDIGO.trim() && !row.CÓDIGO.startsWith(';')) {
            ensayosCorrectos.push({
              codigo: row.CÓDIGO.trim(),
              descripcion: row.DESCRIPCION ? row.DESCRIPCION.trim() : '',
              norma: row.NORMA ? row.NORMA.trim() : '',
              referencia_otra_norma: row['REFERENCIA OTRA NORMA'] ? row['REFERENCIA OTRA NORMA'].trim() : '',
              ubicacion: row.UBICACIÓN ? row.UBICACIÓN.trim() : '',
              precio: row.PRECIO ? parseFloat(row.PRECIO) || 0 : 0,
              comentarios: row.COMENTARIOS ? row.COMENTARIOS.trim() : '',
              nota_comercial: row['Nota comercial'] ? row['Nota comercial'].trim() : ''
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Ensayos leídos del CSV: ${ensayosCorrectos.length}`);

    // Actualizar solo los campos de texto con los datos correctos del CSV
    let updatedCount = 0;
    
    for (const ensayoCorrecto of ensayosCorrectos) {
      try {
        await pool.query(`
          UPDATE ensayos 
          SET descripcion = $1, 
              norma = $2, 
              referencia_otra_norma = $3,
              comentarios = $4,
              nota_comercial = $5
          WHERE codigo = $6
        `, [
          ensayoCorrecto.descripcion,
          ensayoCorrecto.norma,
          ensayoCorrecto.referencia_otra_norma,
          ensayoCorrecto.comentarios,
          ensayoCorrecto.nota_comercial,
          ensayoCorrecto.codigo
        ]);
        
        console.log(`✅ ${ensayoCorrecto.codigo}: Corregido`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${ensayoCorrecto.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Ensayos corregidos: ${updatedCount}`);
    console.log(`📊 Total procesados: ${ensayosCorrectos.length}`);

    // Verificar resultado
    const examples = await pool.query(`
      SELECT codigo, descripcion 
      FROM ensayos 
      WHERE codigo IN ('SU04', 'SU19', 'SU22')
      ORDER BY codigo
    `);

    console.log('\n🔍 Verificación final:');
    examples.rows.forEach(row => {
      console.log(`${row.codigo}: ${row.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

revertAndFixEncoding();
