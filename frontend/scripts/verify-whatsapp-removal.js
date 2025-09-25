const fs = require('fs');
const path = require('path');

function searchInFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const fileMatches = content.match(regex);
      if (fileMatches) {
        matches.push({
          pattern,
          count: fileMatches.length,
          matches: fileMatches.slice(0, 5) // Solo las primeras 5 coincidencias
        });
      }
    });
    
    return matches;
  } catch (err) {
    return [];
  }
}

function searchInDirectory(dirPath, patterns, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
        results.push(...searchInDirectory(fullPath, patterns, extensions));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const matches = searchInFile(fullPath, patterns);
          if (matches.length > 0) {
            results.push({
              file: fullPath,
              matches
            });
          }
        }
      }
    });
  } catch (err) {
    // Ignorar errores de acceso
  }
  
  return results;
}

function main() {
  console.log('🔍 Verificando eliminación de referencias a WhatsApp en el frontend...\n');
  
  const patterns = [
    'whatsapp',
    'WhatsApp',
    'WSP',
    'wsp',
    'projectWhatsappNotice',
    'project_whatsapp_notices',
    'whatsapp-notices',
    'notificaciones-whatsapp',
    'NotificacionesWhatsapp'
  ];
  
  const srcDir = path.join(__dirname, '..', 'src');
  const results = searchInDirectory(srcDir, patterns);
  
  if (results.length === 0) {
    console.log('✅ No se encontraron referencias a WhatsApp en el código fuente');
  } else {
    console.log('⚠️  Referencias a WhatsApp encontradas:');
    results.forEach(result => {
      console.log(`\n📄 Archivo: ${result.file}`);
      result.matches.forEach(match => {
        console.log(`   - Patrón: ${match.pattern} (${match.count} ocurrencias)`);
        if (match.matches.length > 0) {
          console.log(`     Ejemplos: ${match.matches.join(', ')}`);
        }
      });
    });
  }
  
  // Verificar archivos eliminados
  console.log('\n🗑️  Verificando archivos eliminados...');
  const deletedFiles = [
    'src/services/whatsappNotices.js',
    'src/pages/NotificacionesWhatsapp.jsx'
  ];
  
  deletedFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`❌ Archivo ${file} aún existe`);
    } else {
      console.log(`✅ Archivo ${file} eliminado correctamente`);
    }
  });
  
  // Verificar rutas en App.jsx
  console.log('\n🛣️  Verificando rutas en App.jsx...');
  const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  const whatsappRoutes = appContent.match(/notificaciones-whatsapp|NotificacionesWhatsapp/gi);
  if (whatsappRoutes) {
    console.log('⚠️  Referencias a WhatsApp encontradas en App.jsx:');
    whatsappRoutes.forEach(match => {
      console.log(`   - ${match}`);
    });
  } else {
    console.log('✅ No se encontraron referencias a WhatsApp en App.jsx');
  }
  
  // Verificar sidebar
  console.log('\n📋 Verificando Sidebar...');
  const sidebarPath = path.join(__dirname, '..', 'src', 'layout', 'Sidebar.jsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  const sidebarWhatsapp = sidebarContent.match(/notificaciones-whatsapp|WhatsApp/gi);
  if (sidebarWhatsapp) {
    console.log('⚠️  Referencias a WhatsApp encontradas en Sidebar:');
    sidebarWhatsapp.forEach(match => {
      console.log(`   - ${match}`);
    });
  } else {
    console.log('✅ No se encontraron referencias a WhatsApp en Sidebar');
  }
  
  console.log('\n✅ Verificación completada');
  console.log('💡 Si se encontraron referencias, revisa los archivos mencionados');
}

main();
