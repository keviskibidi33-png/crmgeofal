const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function cleanAndReimport() {
  console.log('🧹 Limpiando datos corruptos y reimportando...\n');

  try {
    // 1. Eliminar todos los datos existentes
    console.log('🗑️ Eliminando datos corruptos...');
    await pool.query('DELETE FROM ensayos');
    console.log('✅ Datos eliminados');

    // 2. Reiniciar secuencia de IDs
    await pool.query('ALTER SEQUENCE ensayos_id_seq RESTART WITH 1');
    console.log('✅ Secuencia reiniciada');

    // 3. Importar datos limpios desde CSV
    console.log('📁 Leyendo CSV con codificación UTF-8...');
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('No se encontró el archivo CSV');
    }

    const ensayos = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath, { encoding: 'utf8' })
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          if (row.CÓDIGO && row.CÓDIGO.trim() && !row.CÓDIGO.startsWith(';')) {
            // Extraer ensayos requeridos de comentarios
            let ensayosRequeridos = [];
            if (row.COMENTARIOS) {
              const comentario = row.COMENTARIOS;
              // Buscar códigos de ensayos en comentarios
              const codigoMatches = comentario.match(/\b[A-Z]{2}\d{2,3}[A-Z]?\b/g);
              if (codigoMatches) {
                ensayosRequeridos = codigoMatches;
              }
            }

            ensayos.push({
              codigo: row.CÓDIGO.trim(),
              descripcion: row.DESCRIPCION ? row.DESCRIPCION.trim() : '',
              norma: row.NORMA ? row.NORMA.trim() : '',
              referencia_otra_norma: row['REFERENCIA OTRA NORMA'] ? row['REFERENCIA OTRA NORMA'].trim() : '',
              ubicacion: row.UBICACIÓN ? row.UBICACIÓN.trim() : '',
              precio: row.PRECIO ? parseFloat(row.PRECIO) || 0 : 0,
              comentarios: row.COMENTARIOS ? row.COMENTARIOS.trim() : '',
              nota_comercial: row['Nota comercial'] ? row['Nota comercial'].trim() : '',
              ensayos_requeridos: ensayosRequeridos
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Ensayos leídos del CSV: ${ensayos.length}`);

    // 4. Insertar datos limpios
    console.log('💾 Insertando datos limpios...');
    let insertedCount = 0;

    for (const ensayo of ensayos) {
      try {
        await pool.query(`
          INSERT INTO ensayos (
            codigo, descripcion, norma, referencia_otra_norma, 
            ubicacion, precio, comentarios, nota_comercial, 
            ensayos_requeridos, categoria
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          ensayo.codigo,
          ensayo.descripcion,
          ensayo.norma,
          ensayo.referencia_otra_norma,
          ensayo.ubicacion,
          ensayo.precio,
          ensayo.comentarios,
          ensayo.nota_comercial,
          ensayo.ensayos_requeridos,
          'OTROS SERVICIOS' // Categoría por defecto, se corregirá después
        ]);
        
        insertedCount++;
        if (insertedCount % 20 === 0) {
          console.log(`✅ Insertados ${insertedCount} ensayos...`);
        }
      } catch (error) {
        console.error(`❌ Error insertando ${ensayo.codigo}:`, error.message);
      }
    }

    console.log(`\n📈 RESUMEN DE IMPORTACIÓN:`);
    console.log(`✅ Ensayos insertados: ${insertedCount}`);
    console.log(`📊 Total procesados: ${ensayos.length}`);

    // 5. Aplicar categorías correctas
    console.log('\n🏷️ Aplicando categorías correctas...');
    await applyCorrectCategories();

    // 6. Verificar resultado final
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

async function applyCorrectCategories() {
  const categoryMap = {
    'SU': 'ENSAYO ESTÁNDAR SUELO',
    'AG': 'ENSAYO AGREGADO',
    'CO': 'ENSAYO CONCRETO',
    'MA': 'ENSAYO ALBAÑILERÍA',
    'RO': 'ENSAYO ROCA',
    'CE': 'CEMENTO',
    'PA': 'ENSAYO PAVIMENTO',
    'AS': 'ENSAYO MEZCLA ASFÁLTICA',
    'EE': 'EVALUACIONES ESTRUCTURALES',
    // Categorías específicas
    'SU06A': 'ENSAYOS DE CAMPO EN SUELO',
    'SU06B': 'ENSAYOS DE CAMPO EN SUELO',
    'SU06C': 'ENSAYOS DE CAMPO EN SUELO',
    'SU06D': 'ENSAYOS DE CAMPO EN SUELO',
    'SU02': 'ENSAYOS DE CAMPO EN SUELO',
    'SU16': 'ENSAYOS DE CAMPO EN SUELO',
    'SU18': 'ENSAYOS DE CAMPO EN SUELO',
    'SU28': 'ENSAYOS DE CAMPO EN SUELO',
    'SU29': 'ENSAYOS DE CAMPO EN SUELO',
    'SU05': 'ENSAYOS ESPECIALES SUELO',
    'SU20A': 'ENSAYOS ESPECIALES SUELO',
    'SU33': 'ENSAYOS ESPECIALES SUELO',
    'SU37': 'ENSAYOS ESPECIALES SUELO',
    'SU40': 'ENSAYOS ESPECIALES SUELO',
    'SU41': 'ENSAYOS ESPECIALES SUELO',
    'SU42': 'ENSAYOS ESPECIALES SUELO',
    'SU43': 'ENSAYOS ESPECIALES SUELO',
    'SU44': 'ENSAYOS ESPECIALES SUELO',
    'SU45': 'ENSAYOS ESPECIALES SUELO',
    'SU46': 'ENSAYOS ESPECIALES SUELO',
    'SU47': 'ENSAYOS ESPECIALES SUELO',
    'SU03': 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
    'SU13': 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
    'SU14': 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
    'SU15': 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
    'SU26': 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
    'AG11': 'ENSAYO QUÍMICO AGREGADO',
    'AG12': 'ENSAYO QUÍMICO AGREGADO',
    'AG13': 'ENSAYO QUÍMICO AGREGADO',
    'AG16': 'ENSAYO QUÍMICO AGREGADO',
    'AG17': 'ENSAYO QUÍMICO AGREGADO',
    'AG24': 'ENSAYO QUÍMICO AGREGADO',
    'AG25': 'ENSAYO QUÍMICO AGREGADO',
    'AG29': 'ENSAYO QUÍMICO AGREGADO',
    'AG30': 'ENSAYO QUÍMICO AGREGADO',
    'CO03A': 'ENSAYO CONCRETO DE CAMPO',
    'CO03B': 'ENSAYO CONCRETO DE CAMPO',
    'CO03D': 'ENSAYO CONCRETO DE CAMPO',
    'CO04': 'ENSAYO CONCRETO DE CAMPO',
    'CO11': 'ENSAYO CONCRETO DE CAMPO',
    'CO10': 'ENSAYO QUÍMICO EN CONCRETO',
    'CO13': 'ENSAYO QUÍMICO EN CONCRETO',
    'CO15': 'ENSAYO QUÍMICO EN CONCRETO',
    'CO16': 'ENSAYO QUÍMICO EN CONCRETO',
    'CO17': 'ENSAYO QUÍMICO EN CONCRETO',
    'SU27': 'ENSAYO QUÍMICO EN CONCRETO',
    'DIS01': 'ENSAYO CONCRETO',
    'DIS02': 'ENSAYO CONCRETO',
    'DIS03': 'ENSAYO CONCRETO',
    'E01': 'EVALUACIONES ESTRUCTURALES',
    'E02': 'EVALUACIONES ESTRUCTURALES',
    'E03': 'EVALUACIONES ESTRUCTURALES',
    'E04': 'EVALUACIONES ESTRUCTURALES',
    'EE01': 'ENSAYOS ESPECIALES SUELO',
    'EE02': 'ENSAYOS ESPECIALES SUELO',
    'EE03': 'ENSAYOS ESPECIALES SUELO',
    'MA02A': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA03': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA04': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA05': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA08': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA11': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA13': 'ENSAYO MEZCLA ASFÁLTICA',
    'MA14': 'ENSAYO MEZCLA ASFÁLTICA',
    'PAV01': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV02': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV02A': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV03': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV04': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV05': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV06': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV07': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV08': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV09': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV10': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV11': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'PAV12': 'ENSAYO PAVIMENTO EN CAMPO Y LABORATORIO',
    'CEM01': 'CEMENTO',
    'CEM02': 'CEMENTO',
    'CEM03': 'CEMENTO',
    'SU20A': 'OTROS SERVICIOS'
  };

  let updatedCount = 0;

  for (const [codigo, categoria] of Object.entries(categoryMap)) {
    try {
      await pool.query('UPDATE ensayos SET categoria = $1 WHERE codigo = $2', [categoria, codigo]);
      console.log(`✅ ${codigo}: ${categoria}`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error actualizando ${codigo}:`, error.message);
    }
  }

  console.log(`\n🏷️ Categorías aplicadas: ${updatedCount}`);
}

cleanAndReimport();
