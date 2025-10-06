import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores a cambiar
const colorMappings = {
  // Gradientes púrpura/azul
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)': 'linear-gradient(135deg, #f84616 0%, #f84616 100%)',
  'linear-gradient(135deg, #667eea, #764ba2)': 'linear-gradient(135deg, #f84616, #f84616)',
  
  // Colores individuales
  '#667eea': '#f84616',
  '#764ba2': '#f84616',
  '#0d6efd': '#f84616',
  '#2563eb': '#f84616',
  '#007bff': '#f84616',
  
  // Colores con transparencia
  'rgba(102, 126, 234, 0.25)': 'rgba(248, 70, 22, 0.25)',
  'rgba(13, 110, 253, 0.25)': 'rgba(248, 70, 22, 0.25)',
  'rgba(13, 110, 253, 0.3)': 'rgba(248, 70, 22, 0.3)',
  'rgba(37, 99, 235, 0.25)': 'rgba(248, 70, 22, 0.25)',
  'rgba(0, 123, 255, 0.25)': 'rgba(248, 70, 22, 0.25)',
  
  // Colores hover más oscuros
  '#5a6fd8': '#e6390a',
  '#6a4190': '#e6390a',
  '#218838': '#e6390a',
  '#1ea085': '#e6390a',
  
  // Otros colores azules
  '#0a58ca': '#e6390a',
  '#052c65': '#e6390a',
  '#4facfe': '#f84616',
  '#00f2fe': '#f84616'
};

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Aplicar todos los mapeos de colores
    for (const [oldColor, newColor] of Object.entries(colorMappings)) {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldColor)) {
        content = content.replace(regex, newColor);
        changed = true;
        console.log(`  ✓ Cambiado: ${oldColor} → ${newColor}`);
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Archivo actualizado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath, extensions = ['.css', '.js', '.jsx', '.html']) {
  let totalFiles = 0;
  let changedFiles = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Saltar node_modules y dist
        if (!item.includes('node_modules') && !item.includes('dist') && !item.includes('.git')) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          totalFiles++;
          console.log(`\n🔍 Procesando: ${fullPath}`);
          if (processFile(fullPath)) {
            changedFiles++;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return { totalFiles, changedFiles };
}

// Función principal
function main() {
  console.log('🎨 Iniciando cambio de colores púrpura/azul a naranja...\n');
  
  const frontendPath = path.join(__dirname, 'frontend', 'src');
  
  if (!fs.existsSync(frontendPath)) {
    console.error('❌ No se encontró el directorio frontend/src');
    process.exit(1);
  }
  
  console.log(`📁 Procesando directorio: ${frontendPath}`);
  console.log('🎯 Buscando archivos: .css, .js, .jsx, .html\n');
  
  const { totalFiles, changedFiles } = processDirectory(frontendPath);
  
  console.log('\n📊 Resumen:');
  console.log(`   Archivos procesados: ${totalFiles}`);
  console.log(`   Archivos modificados: ${changedFiles}`);
  
  if (changedFiles > 0) {
    console.log('\n✅ ¡Cambios completados!');
    console.log('💡 Recuerda recompilar el frontend con: npm run build');
  } else {
    console.log('\nℹ️  No se encontraron colores para cambiar');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processFile, processDirectory, colorMappings };
