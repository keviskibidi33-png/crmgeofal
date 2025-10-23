const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function finalCSVVerification() {
  console.log('🔍 VERIFICACIÓN FINAL CSV vs BD...\n');

  try {
    // 1. Leer CSV y extraer todos los ensayos
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    const csvContent = fs.readFileSync(csvPath, 'latin1');
    const lines = csvContent.split('\n');
    
    const csvEnsayos = [];
    let currentCategory = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      const codigo = columns[0]?.trim();
      const descripcion = columns[1]?.trim();
      const norma = columns[2]?.trim();
      const precio = columns[5]?.trim();
      
      // Si es una categoría
      if (!codigo && descripcion && !norma && !precio) {
        currentCategory = descripcion;
        continue;
      }
      
      // Si es un ensayo
      if (codigo && descripcion && precio) {
        csvEnsayos.push({
          codigo,
          descripcion,
          categoria: currentCategory
        });
      }
    }
    
    console.log(`📊 Total ensayos en CSV: ${csvEnsayos.length}`);
    
    // 2. Obtener todos los ensayos de la BD
    const dbResult = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos ORDER BY codigo');
    const dbEnsayos = dbResult.rows;
    
    console.log(`📊 Total ensayos en BD: ${dbEnsayos.length}`);
    
    // 3. Verificar cada ensayo del CSV
    let found = 0;
    let missing = 0;
    const missingEnsayos = [];
    
    console.log('\n🔍 VERIFICANDO ENSAYOS DEL CSV:');
    
    for (const csvEnsayos of csvEnsayos) {
      const dbEnsayos = dbEnsayos.find(db => db.codigo === csvEnsayos.codigo);
      
      if (dbEnsayos) {
        found++;
        console.log(`✅ ${csvEnsayos.codigo}: ${csvEnsayos.descripcion}`);
      } else {
        missing++;
        missingEnsayos.push(csvEnsayos);
        console.log(`❌ ${csvEnsayos.codigo}: ${csvEnsayos.descripcion} - FALTANTE`);
      }
    }
    
    // 4. Verificar ensayos extra en BD
    console.log('\n🔍 ENSAYOS EXTRA EN BD:');
    let extra = 0;
    
    for (const dbEnsayos of dbEnsayos) {
      const csvEnsayos = csvEnsayos.find(csv => csv.codigo === dbEnsayos.codigo);
      if (!csvEnsayos) {
        extra++;
        console.log(`⚠️  ${dbEnsayos.codigo}: ${dbEnsayos.descripcion} - EXTRA EN BD`);
      }
    }
    
    // 5. Resumen final
    console.log('\n📈 RESUMEN FINAL:');
    console.log(`✅ Ensayos encontrados: ${found}`);
    console.log(`❌ Ensayos faltantes: ${missing}`);
    console.log(`⚠️  Ensayos extra: ${extra}`);
    console.log(`📊 Total CSV: ${csvEnsayos.length}`);
    console.log(`📊 Total BD: ${dbEnsayos.length}`);
    
    if (missing > 0) {
      console.log('\n🔧 ENSAYOS FALTANTES:');
      missingEnsayos.forEach(ensayo => {
        console.log(`  ${ensayo.codigo}: ${ensayo.descripcion} (${ensayo.categoria})`);
      });
    }
    
    if (missing === 0 && extra === 0) {
      console.log('\n🎉 ¡PERFECTO! Todos los ensayos del CSV están en la BD');
    } else if (missing === 0) {
      console.log('\n✅ Todos los ensayos del CSV están en la BD (hay algunos extra)');
    } else {
      console.log(`\n⚠️  Faltan ${missing} ensayos del CSV en la BD`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

finalCSVVerification();
