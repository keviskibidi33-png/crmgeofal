const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function verifyAllCategoriesFinal() {
  console.log('🔍 VERIFICACIÓN METICULOSA DE TODAS LAS CATEGORÍAS...\n');

  try {
    // 1. Leer CSV original con codificación correcta
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    console.log('📁 Leyendo CSV original...');
    
    const csvContent = fs.readFileSync(csvPath, 'latin1');
    const lines = csvContent.split('\n');
    
    // 2. Extraer todas las categorías y ensayos del CSV
    const csvData = {};
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
        if (!csvData[currentCategory]) {
          csvData[currentCategory] = [];
        }
        console.log(`📂 Categoría CSV: ${currentCategory}`);
        continue;
      }
      
      // Si tiene código, es un ensayo
      if (codigo && descripcion && precio) {
        csvData[currentCategory].push({
          codigo,
          descripcion,
          norma,
          precio
        });
      }
    }
    
    // 3. Obtener datos de la base de datos
    const dbResult = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos ORDER BY categoria, codigo');
    const dbData = {};
    
    dbResult.rows.forEach(row => {
      if (!dbData[row.categoria]) {
        dbData[row.categoria] = [];
      }
      dbData[row.categoria].push({
        codigo: row.codigo,
        descripcion: row.descripcion
      });
    });
    
    // 4. Comparar cada categoría
    console.log('\n🔍 COMPARACIÓN POR CATEGORÍA:\n');
    
    let totalCorrect = 0;
    let totalMissing = 0;
    
    for (const categoria in csvData) {
      const csvEnsayos = csvData[categoria];
      const dbEnsayos = dbData[categoria] || [];
      
      console.log(`📋 ${categoria}:`);
      console.log(`  CSV: ${csvEnsayos.length} ensayos`);
      console.log(`  BD:  ${dbEnsayos.length} ensayos`);
      
      // Verificar cada ensayo del CSV
      let correctInCategory = 0;
      let missingInCategory = 0;
      
      for (const csvEnsayos of csvEnsayos) {
        const dbEnsayos = dbEnsayos.find(db => db.codigo === csvEnsayos.codigo);
        
        if (dbEnsayos) {
          correctInCategory++;
          totalCorrect++;
          console.log(`    ✅ ${csvEnsayos.codigo}: ${csvEnsayos.descripcion}`);
        } else {
          missingInCategory++;
          totalMissing++;
          console.log(`    ❌ ${csvEnsayos.codigo}: ${csvEnsayos.descripcion} - FALTANTE EN BD`);
        }
      }
      
      console.log(`  📊 Correctos: ${correctInCategory}, Faltantes: ${missingInCategory}\n`);
    }
    
    // 5. Resumen final
    console.log('📈 RESUMEN FINAL:');
    console.log(`✅ Ensayos correctos: ${totalCorrect}`);
    console.log(`❌ Ensayos faltantes: ${totalMissing}`);
    console.log(`📊 Total categorías verificadas: ${Object.keys(csvData).length}`);
    
    // 6. Estadísticas por categoría en BD
    console.log('\n📋 DISTRIBUCIÓN FINAL EN BD:');
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    stats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.count} ensayos`);
    });
    
    const totalEnsayos = await pool.query('SELECT COUNT(*) as total FROM ensayos');
    console.log(`\n📊 Total de ensayos en BD: ${totalEnsayos.rows[0].total}`);
    
    if (totalMissing === 0) {
      console.log('\n🎉 ¡TODAS LAS CATEGORÍAS ESTÁN COMPLETAS!');
    } else {
      console.log(`\n⚠️  Faltan ${totalMissing} ensayos en total`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

verifyAllCategoriesFinal();
