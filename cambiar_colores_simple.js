import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Iniciando cambio de colores...');

// Colores a cambiar
const replacements = [
  { from: '#667eea', to: '#f84616' },
  { from: '#764ba2', to: '#f84616' },
  { from: '#0d6efd', to: '#f84616' },
  { from: '#2563eb', to: '#f84616' },
  { from: '#007bff', to: '#f84616' },
  { from: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', to: 'linear-gradient(135deg, #f84616 0%, #f84616 100%)' },
  { from: 'linear-gradient(135deg, #667eea, #764ba2)', to: 'linear-gradient(135deg, #f84616, #f84616)' },
  { from: 'rgba(102, 126, 234, 0.25)', to: 'rgba(248, 70, 22, 0.25)' },
  { from: 'rgba(13, 110, 253, 0.25)', to: 'rgba(248, 70, 22, 0.25)' },
  { from: 'rgba(13, 110, 253, 0.3)', to: 'rgba(248, 70, 22, 0.3)' }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const { from, to } of replacements) {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        changed = true;
        console.log(`  ✓ ${from} → ${to}`);
      }
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
      const ext = path.extname(item).toLowerCase();
      if (['.css', '.js', '.jsx', '.html'].includes(ext)) {
        total++;
        console.log(`\n🔍 ${fullPath}`);
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
console.log(`   Archivos procesados: ${total}`);
console.log(`   Archivos modificados: ${changed}`);

if (changed > 0) {
  console.log('\n✅ ¡Cambios completados!');
  console.log('💡 Ejecuta: npm run build');
} else {
  console.log('\nℹ️  No se encontraron cambios');
}
