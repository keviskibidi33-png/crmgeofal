import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Agregando efectos hover con tono más oscuro...');

// Efectos hover a agregar
const hoverEffects = [
  // Botones primarios
  {
    selector: '.btn-primary',
    hover: `
.btn-primary:hover {
  background-color: #e6390a !important;
  border-color: #e6390a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(248, 70, 22, 0.3);
}`
  },
  
  // Botones outline primarios
  {
    selector: '.btn-outline-primary',
    hover: `
.btn-outline-primary:hover {
  background-color: #f84616 !important;
  border-color: #f84616 !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(248, 70, 22, 0.3);
}`
  },
  
  // Enlaces primarios
  {
    selector: '.text-primary',
    hover: `
.text-primary:hover {
  color: #e6390a !important;
  text-decoration: underline;
}`
  },
  
  // Cards con header primario
  {
    selector: '.card-header.bg-primary',
    hover: `
.card-header.bg-primary:hover {
  background-color: #e6390a !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(248, 70, 22, 0.2);
}`
  },
  
  // Badges primarios
  {
    selector: '.badge.bg-primary',
    hover: `
.badge.bg-primary:hover {
  background-color: #e6390a !important;
  transform: scale(1.05);
}`
  },
  
  // Elementos con gradiente naranja
  {
    selector: '[style*="linear-gradient(135deg, #f84616"]',
    hover: `
[style*="linear-gradient(135deg, #f84616"]:hover {
  background: linear-gradient(135deg, #e6390a 0%, #e6390a 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(248, 70, 22, 0.3);
}`
  },
  
  // Iconos primarios
  {
    selector: '.text-primary',
    hover: `
.text-primary:hover {
  color: #e6390a !important;
  transform: scale(1.1);
}`
  },
  
  // Formularios con focus
  {
    selector: '.form-control:focus, .form-select:focus',
    hover: `
.form-control:focus, .form-select:focus {
  border-color: #f84616 !important;
  box-shadow: 0 0 0 0.2rem rgba(248, 70, 22, 0.25) !important;
}`
  }
];

function addHoverEffects(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Verificar si el archivo ya tiene efectos hover
    if (content.includes('/* Hover effects added */')) {
      return false;
    }
    
    // Agregar efectos hover al final del archivo
    if (content.includes('#f84616') || content.includes('--bs-primary')) {
      content += '\n\n/* Hover effects added */\n';
      
      for (const effect of hoverEffects) {
        content += effect.hover + '\n';
      }
      
      changed = true;
      console.log(`  ✓ Efectos hover agregados`);
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error en ${filePath}:`, error.message);
    return false;
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Solo procesar archivos CSS
    if (!filePath.endsWith('.css')) {
      return false;
    }
    
    // Verificar si el archivo contiene colores naranja
    if (content.includes('#f84616') || content.includes('--bs-primary')) {
      console.log(`\n🔍 ${filePath}`);
      return addHoverEffects(filePath);
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error en ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dirPath) {
  let total = 0;
  let changed = 0;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.includes('node_modules') && !item.includes('dist') && !item.includes('.git')) {
        const result = walkDir(fullPath);
        total += result.total;
        changed += result.changed;
      }
    } else if (stat.isFile()) {
      if (fullPath.endsWith('.css')) {
        total++;
        if (processFile(fullPath)) {
          changed++;
        }
      }
    }
  }
  
  return { total, changed };
}

const frontendPath = path.join(__dirname, 'frontend', 'src');
console.log(`📁 Procesando: ${frontendPath}`);

const { total, changed } = walkDir(frontendPath);

console.log(`\n📊 Resumen:`);
console.log(`   Archivos CSS procesados: ${total}`);
console.log(`   Archivos modificados: ${changed}`);

if (changed > 0) {
  console.log('\n✅ ¡Efectos hover agregados!');
  console.log('💡 Ejecuta: npm run build');
} else {
  console.log('\nℹ️  No se encontraron archivos para modificar');
}
