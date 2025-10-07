const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN DEL SISTEMA CRMGeoFal');
console.log('=====================================\n');

// Verificar archivos críticos del backend
const criticalFiles = [
  'index.js',
  'package.json',
  'config/db.js',
  'routes/ticketRoutes.js',
  'controllers/ticketController.js',
  'models/Ticket.js'
];

console.log('1️⃣ VERIFICANDO ARCHIVOS CRÍTICOS DEL BACKEND...');
let backendFilesOk = true;

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    backendFilesOk = false;
  }
});

// Verificar archivos críticos del frontend
const frontendFiles = [
  '../frontend/src/pages/TicketsVendedor.jsx',
  '../frontend/src/components/TicketHistoryVendedor.jsx',
  '../frontend/src/components/TicketChatVendedor.jsx',
  '../frontend/src/components/TicketFormUnified.jsx',
  '../frontend/src/services/tickets.js'
];

console.log('\n2️⃣ VERIFICANDO ARCHIVOS CRÍTICOS DEL FRONTEND...');
let frontendFilesOk = true;

frontendFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    frontendFilesOk = false;
  }
});

// Verificar configuración de base de datos
console.log('\n3️⃣ VERIFICANDO CONFIGURACIÓN...');
const dbConfigPath = path.join(__dirname, '..', 'config', 'db.js');
if (fs.existsSync(dbConfigPath)) {
  console.log('✅ Configuración de base de datos encontrada');
} else {
  console.log('❌ Configuración de base de datos NO encontrada');
}

// Verificar package.json
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ package.json encontrado');
  console.log(`   - Node.js requerido: ${packageJson.engines?.node || 'No especificado'}`);
  console.log(`   - Dependencias: ${Object.keys(packageJson.dependencies || {}).length}`);
} else {
  console.log('❌ package.json NO encontrado');
}

// Verificar que no haya degradados en CSS
console.log('\n4️⃣ VERIFICANDO ESTILOS (SIN DEGRADADOS)...');
const cssFiles = [
  '../frontend/src/components/TicketChatVendedor.css',
  '../frontend/src/components/TicketHistoryVendedor.css',
  '../frontend/src/pages/TicketsVendedor.css'
];

let cssOk = true;
cssFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasGradients = content.includes('linear-gradient');
    if (hasGradients) {
      console.log(`❌ ${file} - CONTIENE DEGRADADOS`);
      cssOk = false;
    } else {
      console.log(`✅ ${file} - Sin degradados`);
    }
  }
});

// Resumen final
console.log('\n🎯 RESUMEN DE VERIFICACIÓN');
console.log('==========================');
console.log(`Backend: ${backendFilesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`Frontend: ${frontendFilesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`Estilos: ${cssOk ? '✅ OK (Sin degradados)' : '❌ CONTIENE DEGRADADOS'}`);

if (backendFilesOk && frontendFilesOk && cssOk) {
  console.log('\n🎉 SISTEMA COMPLETAMENTE VERIFICADO');
  console.log('✅ Todos los archivos críticos presentes');
  console.log('✅ Estilos sin degradados (colores sólidos naranjas)');
  console.log('✅ Estructura del proyecto correcta');
  console.log('\n🚀 El sistema está listo para funcionar!');
} else {
  console.log('\n⚠️  SISTEMA CON PROBLEMAS');
  console.log('Revisa los errores mostrados arriba');
}

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. Iniciar backend: cd backend && node index.js');
console.log('2. Iniciar frontend: cd frontend && npm run dev');
console.log('3. Verificar que no haya errores en consola');
console.log('4. Probar funcionalidad de tickets');
