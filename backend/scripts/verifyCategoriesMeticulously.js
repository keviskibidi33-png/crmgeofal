const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function verifyCategoriesMeticulously() {
  console.log('🔍 Verificación meticulosa de categorías...\n');

  try {
    // 1. Leer CSV original con codificación correcta
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    console.log('📁 Leyendo CSV original...');
    
    const csvContent = fs.readFileSync(csvPath, 'latin1');
    const lines = csvContent.split('\n');
    
    // 2. Extraer categorías del CSV
    const csvCategories = [];
    let currentCategory = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      const codigo = columns[0]?.trim();
      const descripcion = columns[1]?.trim();
      const norma = columns[2]?.trim();
      const precio = columns[5]?.trim();
      
      // Si es una categoría (línea sin código)
      if (!codigo && descripcion && !norma && !precio) {
        currentCategory = descripcion;
        console.log(`📂 Categoría CSV: ${currentCategory}`);
        continue;
      }
      
      // Si tiene código, es un ensayo
      if (codigo && descripcion && precio) {
        csvCategories.push({
          codigo,
          descripcion,
          categoria: currentCategory
        });
      }
    }
    
    console.log(`\n📊 Total ensayos en CSV: ${csvCategories.length}`);
    
    // 3. Obtener categorías de la base de datos
    const dbResult = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos ORDER BY codigo');
    const dbCategories = dbResult.rows;
    
    console.log(`📊 Total ensayos en BD: ${dbCategories.length}`);
    
    // 4. Comparar categorías
    let correctCount = 0;
    let incorrectCount = 0;
    const incorrectEnsayos = [];
    
    console.log('\n🔍 Verificando categorías...');
    
    for (const csvEnsayos of csvCategories) {
      const dbEnsayos = dbCategories.find(db => db.codigo === csvEnsayos.codigo);
      
      if (dbEnsayos) {
        if (dbEnsayos.categoria === csvEnsayos.categoria) {
          correctCount++;
          console.log(`✅ ${csvEnsayos.codigo}: ${csvEnsayos.categoria}`);
        } else {
          incorrectCount++;
          incorrectEnsayos.push({
            codigo: csvEnsayos.codigo,
            csvCategoria: csvEnsayos.categoria,
            dbCategoria: dbEnsayos.categoria,
            descripcion: csvEnsayos.descripcion
          });
          console.log(`❌ ${csvEnsayos.codigo}: CSV="${csvEnsayos.categoria}" vs BD="${dbEnsayos.categoria}"`);
        }
      } else {
        console.log(`⚠️ ${csvEnsayos.codigo}: No encontrado en BD`);
      }
    }
    
    // 5. Mostrar resumen
    console.log('\n📈 RESUMEN:');
    console.log(`✅ Categorías correctas: ${correctCount}`);
    console.log(`❌ Categorías incorrectas: ${incorrectCount}`);
    console.log(`📊 Total verificados: ${csvCategories.length}`);
    
    if (incorrectEnsayos.length > 0) {
      console.log('\n🔧 Ensayos que necesitan corrección:');
      incorrectEnsayos.forEach(ensayo => {
        console.log(`${ensayo.codigo}: "${ensayo.dbCategoria}" → "${ensayo.csvCategoria}"`);
        console.log(`  Descripción: ${ensayo.descripcion}`);
      });
    }
    
    // 6. Verificar categorías por tipo
    console.log('\n📋 Distribución por categoría en BD:');
    const categoryStats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    categoryStats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.count} ensayos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

verifyCategoriesMeticulously();
