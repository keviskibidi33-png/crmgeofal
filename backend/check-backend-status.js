const axios = require('axios');
const { exec } = require('child_process');

console.log('🔍 VERIFICANDO ESTADO DEL BACKEND');
console.log('=================================');

async function checkBackendStatus() {
  try {
    // 1. Verificar si hay procesos Node.js corriendo
    console.log('\n1️⃣ VERIFICANDO PROCESOS NODE.JS...');
    exec('tasklist /FI "IMAGENAME eq node.exe"', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Error verificando procesos:', error.message);
      } else {
        const nodeProcesses = stdout.split('\n').filter(line => line.includes('node.exe'));
        if (nodeProcesses.length > 1) { // Más de 1 porque tasklist incluye el header
          console.log('✅ Procesos Node.js encontrados:', nodeProcesses.length - 1);
          nodeProcesses.forEach(process => {
            if (process.includes('node.exe')) {
              console.log('   📋', process.trim());
            }
          });
        } else {
          console.log('❌ No hay procesos Node.js corriendo');
        }
      }
    });

    // 2. Verificar puerto 4000
    console.log('\n2️⃣ VERIFICANDO PUERTO 4000...');
    exec('netstat -an | findstr :4000', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Error verificando puerto:', error.message);
      } else if (stdout.trim()) {
        console.log('✅ Puerto 4000 en uso:');
        console.log(stdout);
      } else {
        console.log('❌ Puerto 4000 NO está en uso');
      }
    });

    // 3. Probar conexión al backend
    console.log('\n3️⃣ PROBANDO CONEXIÓN AL BACKEND...');
    try {
      const response = await axios.get('http://localhost:4000/api/health', { 
        timeout: 3000,
        headers: {
          'User-Agent': 'Backend-Checker'
        }
      });
      console.log('✅ Backend respondiendo:', response.data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend NO está corriendo (ECONNREFUSED)');
        console.log('🔧 Solución: Ejecutar "node index.js" en el directorio backend');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('❌ Backend no responde (TIMEOUT)');
      } else {
        console.log('❌ Error conectando al backend:', error.message);
      }
    }

    // 4. Verificar archivos necesarios
    console.log('\n4️⃣ VERIFICANDO ARCHIVOS NECESARIOS...');
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'index.js',
      'package.json',
      '.env',
      'config/db.js',
      'routes/ticketCommentRoutesSimple.js',
      'controllers/ticketCommentControllerSimple.js'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log('✅', file);
      } else {
        console.log('❌', file, '- FALTANTE');
      }
    });

    // 5. Instrucciones de solución
    console.log('\n5️⃣ INSTRUCCIONES DE SOLUCIÓN...');
    console.log('Si el backend no está corriendo:');
    console.log('1. Abrir terminal en el directorio backend');
    console.log('2. Ejecutar: node index.js');
    console.log('3. O ejecutar: start-backend.bat (Windows)');
    console.log('4. Verificar que aparezca: "Server running on port 4000"');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

checkBackendStatus();
