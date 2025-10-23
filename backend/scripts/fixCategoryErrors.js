const pool = require('../config/db');

async function fixCategoryErrors() {
  console.log('🔧 Corrigiendo errores de categorías...\n');

  try {
    // 1. Corregir SU41
    console.log('🔧 Corrigiendo SU41...');
    await pool.query('UPDATE ensayos SET categoria = $1 WHERE codigo = $2', [
      'ENSAYOS DE CAMPO EN SUELO', 
      'SU41'
    ]);
    console.log('✅ SU41 corregido');

    // 2. Verificar SU34 y MA02 en el CSV
    console.log('\n🔍 Verificando ensayos faltantes...');
    
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    const csvContent = fs.readFileSync(csvPath, 'latin1');
    const lines = csvContent.split('\n');
    
    let currentCategory = '';
    let foundSU34 = false;
    let foundMA02 = false;
    
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
        if (codigo === 'SU34') {
          foundSU34 = true;
          console.log(`📋 SU34 encontrado en CSV: ${descripcion} (Categoría: ${currentCategory})`);
        }
        if (codigo === 'MA02') {
          foundMA02 = true;
          console.log(`📋 MA02 encontrado en CSV: ${descripcion} (Categoría: ${currentCategory})`);
        }
      }
    }
    
    if (!foundSU34) {
      console.log('⚠️ SU34 no encontrado en CSV');
    }
    if (!foundMA02) {
      console.log('⚠️ MA02 no encontrado en CSV');
    }

    // 3. Verificar corrección
    console.log('\n🔍 Verificación final:');
    const result = await pool.query('SELECT codigo, descripcion, categoria FROM ensayos WHERE codigo = $1', ['SU41']);
    if (result.rows.length > 0) {
      console.log(`✅ SU41: ${result.rows[0].categoria}`);
    }

    // 4. Estadísticas finales
    const stats = await pool.query(`
      SELECT categoria, COUNT(*) as count 
      FROM ensayos 
      GROUP BY categoria 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Distribución final por categoría:');
    stats.rows.forEach(stat => {
      console.log(`  ${stat.categoria}: ${stat.count} ensayos`);
    });

    console.log('\n✅ Corrección completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

fixCategoryErrors();
