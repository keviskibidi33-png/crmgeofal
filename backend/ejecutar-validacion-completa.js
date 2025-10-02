const { exec } = require('child_process');
const path = require('path');

async function ejecutarValidacionCompleta() {
  console.log('🚀 INICIANDO VALIDACIÓN COMPLETA DEL SISTEMA CRMGeoFal\n');
  console.log('=' .repeat(80));
  
  const scripts = [
    {
      nombre: 'Verificación de Tablas',
      archivo: 'verificar-tablas-completo.js',
      descripcion: 'Analiza la estructura completa de todas las tablas'
    },
    {
      nombre: 'Validación de Integridad',
      archivo: 'validar-integridad-datos.js',
      descripcion: 'Verifica la integridad de los datos y relaciones'
    },
    {
      nombre: 'Generación de Reporte',
      archivo: 'generar-reporte-validacion.js',
      descripcion: 'Genera un reporte HTML completo del sistema'
    }
  ];
  
  console.log('📋 Scripts de validación a ejecutar:\n');
  scripts.forEach((script, index) => {
    console.log(`${index + 1}. ${script.nombre}`);
    console.log(`   📄 Archivo: ${script.archivo}`);
    console.log(`   📝 Descripción: ${script.descripcion}\n`);
  });
  
  console.log('🔄 Ejecutando validaciones...\n');
  
  for (const script of scripts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 EJECUTANDO: ${script.nombre.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      await ejecutarScript(script.archivo);
      console.log(`\n✅ ${script.nombre} completado exitosamente`);
    } catch (error) {
      console.log(`\n❌ Error en ${script.nombre}: ${error.message}`);
    }
    
    console.log('\n' + '-'.repeat(60));
  }
  
  console.log('\n🎉 VALIDACIÓN COMPLETA FINALIZADA');
  console.log('=' .repeat(80));
  console.log('📊 Resumen de ejecución:');
  console.log('   • Verificación de estructura de tablas');
  console.log('   • Validación de integridad de datos');
  console.log('   • Generación de reporte HTML');
  console.log('\n📁 Archivos generados:');
  console.log('   • reporte-validacion.html (si se ejecutó correctamente)');
  console.log('\n💡 Para ejecutar scripts individuales:');
  console.log('   • node verificar-tablas-completo.js');
  console.log('   • node validar-integridad-datos.js');
  console.log('   • node generar-reporte-validacion.js');
}

function ejecutarScript(nombreArchivo) {
  return new Promise((resolve, reject) => {
    const rutaScript = path.join(__dirname, nombreArchivo);
    
    console.log(`📂 Ejecutando: ${rutaScript}`);
    
    const proceso = exec(`node "${rutaScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ejecutando ${nombreArchivo}:`, error.message);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`⚠️  Advertencias en ${nombreArchivo}:`, stderr);
      }
      
      if (stdout) {
        console.log(stdout);
      }
      
      resolve();
    });
    
    // Timeout de 30 segundos por script
    setTimeout(() => {
      proceso.kill();
      reject(new Error(`Timeout ejecutando ${nombreArchivo}`));
    }, 30000);
  });
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log(`
🔍 SISTEMA DE VALIDACIÓN CRMGeoFal
================================

USO:
  node ejecutar-validacion-completa.js [opciones]

OPCIONES:
  --help, -h          Mostrar esta ayuda
  --tablas             Ejecutar solo verificación de tablas
  --integridad         Ejecutar solo validación de integridad
  --reporte            Ejecutar solo generación de reporte
  --completo           Ejecutar todas las validaciones (por defecto)

SCRIPTS INDIVIDUALES:
  node verificar-tablas-completo.js     - Verificar estructura de tablas
  node validar-integridad-datos.js      - Validar integridad de datos
  node generar-reporte-validacion.js    - Generar reporte HTML

EJEMPLOS:
  node ejecutar-validacion-completa.js
  node ejecutar-validacion-completa.js --tablas
  node ejecutar-validacion-completa.js --help
  `);
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  mostrarAyuda();
  process.exit(0);
}

if (args.includes('--tablas')) {
  console.log('🔍 Ejecutando solo verificación de tablas...\n');
  ejecutarScript('verificar-tablas-completo.js')
    .then(() => console.log('✅ Verificación de tablas completada'))
    .catch(error => console.error('❌ Error:', error.message));
} else if (args.includes('--integridad')) {
  console.log('🔍 Ejecutando solo validación de integridad...\n');
  ejecutarScript('validar-integridad-datos.js')
    .then(() => console.log('✅ Validación de integridad completada'))
    .catch(error => console.error('❌ Error:', error.message));
} else if (args.includes('--reporte')) {
  console.log('🔍 Ejecutando solo generación de reporte...\n');
  ejecutarScript('generar-reporte-validacion.js')
    .then(() => console.log('✅ Generación de reporte completada'))
    .catch(error => console.error('❌ Error:', error.message));
} else {
  // Ejecutar validación completa por defecto
  ejecutarValidacionCompleta()
    .then(() => {
      console.log('\n🎯 VALIDACIÓN COMPLETA FINALIZADA');
      console.log('Revisa los archivos generados para más detalles.');
    })
    .catch(error => {
      console.error('❌ Error en validación completa:', error.message);
      process.exit(1);
    });
}
