const pool = require('../config/db');

async function countEspeciales() {
  try {
    // Contar en BD
    const bdResult = await pool.query('SELECT COUNT(*) as count FROM ensayos WHERE categoria = $1', ['ENSAYOS ESPECIALES SUELO']);
    console.log('ENSAYOS ESPECIALES SUELO en BD:', bdResult.rows[0].count);
    
    // Listar todos los ensayos de esa categoría
    const listResult = await pool.query('SELECT codigo, descripcion FROM ensayos WHERE categoria = $1 ORDER BY codigo', ['ENSAYOS ESPECIALES SUELO']);
    console.log('\nEnsayos en BD:');
    listResult.rows.forEach(row => {
      console.log(`  ${row.codigo}: ${row.descripcion}`);
    });
    
    // Contar en CSV
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    const csvContent = fs.readFileSync(csvPath, 'latin1');
    const lines = csvContent.split('\n');
    
    let currentCategory = '';
    let csvCount = 0;
    const csvEnsayos = [];
    
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
        if (currentCategory === 'ENSAYOS ESPECIALES SUELO') {
          csvCount++;
          csvEnsayos.push({ codigo, descripcion });
        }
      }
    }
    
    console.log(`\nENSAYOS ESPECIALES SUELO en CSV: ${csvCount}`);
    console.log('\nEnsayos en CSV:');
    csvEnsayos.forEach(ensayo => {
      console.log(`  ${ensayo.codigo}: ${ensayo.descripcion}`);
    });
    
    console.log(`\nDiferencia: ${csvCount - bdResult.rows[0].count} ensayos faltantes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

countEspeciales();
