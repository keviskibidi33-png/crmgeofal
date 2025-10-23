const fs = require('fs');
const path = require('path');

function checkEspecialesDetailed() {
  console.log('🔍 Verificación detallada de ENSAYOS ESPECIALES SUELO...\n');

  const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
  const csvContent = fs.readFileSync(csvPath, 'latin1');
  const lines = csvContent.split('\n');
  
  let currentCategory = '';
  let inEspeciales = false;
  let count = 0;
  
  console.log('📋 Líneas del CSV:');
  
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
      if (descripcion === 'ENSAYOS ESPECIALES SUELO') {
        inEspeciales = true;
        console.log(`\n📂 ENCONTRADA CATEGORÍA: ${descripcion} (línea ${i+1})`);
      } else {
        inEspeciales = false;
      }
      continue;
    }
    
    // Si es un ensayo
    if (codigo && descripcion && precio && inEspeciales) {
      count++;
      console.log(`  ${count}. ${codigo}: ${descripcion} (línea ${i+1})`);
    } else if (codigo && descripcion && precio && !inEspeciales) {
      // Ensayo fuera de la categoría especiales
      if (currentCategory) {
        console.log(`  (Fuera de especiales - ${currentCategory}) ${codigo}: ${descripcion} (línea ${i+1})`);
      }
    }
  }
  
  console.log(`\n📊 Total ensayos en ENSAYOS ESPECIALES SUELO: ${count}`);
}

checkEspecialesDetailed();
