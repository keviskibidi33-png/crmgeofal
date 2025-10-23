const fs = require('fs');
const path = require('path');

async function checkCSVEncoding() {
  console.log('🔍 Verificando codificación del CSV...\n');

  try {
    const csvPath = path.join(__dirname, '../../DocumentosExcel/LISTA DE PRECIOS GEOFAL 2025 NUEVO.csv');
    console.log('📁 Archivo CSV:', csvPath);
    
    // Leer con diferentes codificaciones
    const encodings = ['utf8', 'latin1', 'cp1252', 'iso-8859-1'];
    
    for (const encoding of encodings) {
      try {
        console.log(`\n📖 Probando codificación: ${encoding}`);
        const content = fs.readFileSync(csvPath, encoding);
        const lines = content.split('\n');
        
        // Buscar líneas con caracteres especiales
        const specialLines = lines.filter(line => 
          line.includes('ó') || line.includes('í') || line.includes('ñ') || 
          line.includes('á') || line.includes('é') || line.includes('ú')
        );
        
        if (specialLines.length > 0) {
          console.log(`✅ Encontradas ${specialLines.length} líneas con caracteres especiales`);
          console.log('📄 Primeras líneas con caracteres especiales:');
          specialLines.slice(0, 3).forEach((line, index) => {
            console.log(`  ${index + 1}: ${line.substring(0, 100)}...`);
          });
        } else {
          console.log(`❌ No se encontraron caracteres especiales con ${encoding}`);
        }
        
        // Verificar bytes de caracteres problemáticos
        const testLine = lines.find(line => line.includes('Consolidación') || line.includes('Expansión'));
        if (testLine) {
          console.log(`🔍 Línea de prueba: ${testLine.substring(0, 50)}...`);
          const bytes = Buffer.from(testLine, encoding);
          console.log(`📊 Bytes (${encoding}): ${bytes.toString('hex')}`);
        }
        
      } catch (error) {
        console.log(`❌ Error con ${encoding}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCSVEncoding();
