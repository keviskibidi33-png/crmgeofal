const axios = require('axios');

console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA');
console.log('=====================================\n');

// Configuración
const API_BASE = 'http://localhost:4000/api';
const TEST_USER = {
  email: 'admin@crm.com',
  password: 'admin123'
};

async function verifyBackend() {
  console.log('1️⃣ VERIFICANDO BACKEND...');
  
  try {
    // Verificar que el servidor esté corriendo
    const healthResponse = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    console.log('✅ Backend corriendo - Status:', healthResponse.status);
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    return false;
  }
  
  return true;
}

async function verifyDatabase() {
  console.log('\n2️⃣ VERIFICANDO BASE DE DATOS...');
  
  try {
    // Intentar login para verificar conexión a BD
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_USER, { timeout: 5000 });
    console.log('✅ Base de datos conectada');
    console.log('✅ Usuario admin encontrado');
    return loginResponse.data.token;
  } catch (error) {
    console.log('❌ Error en base de datos:', error.response?.data?.message || error.message);
    return null;
  }
}

async function verifyTicketsAPI(token) {
  console.log('\n3️⃣ VERIFICANDO API DE TICKETS...');
  
  try {
    const headers = { Authorization: `Bearer ${token}` };
    
    // Verificar listado de tickets
    const ticketsResponse = await axios.get(`${API_BASE}/tickets`, { headers, timeout: 5000 });
    console.log('✅ API de tickets funcionando');
    console.log(`✅ Tickets encontrados: ${ticketsResponse.data?.length || 0}`);
    
    // Verificar filtros de tickets
    const filtersResponse = await axios.get(`${API_BASE}/ticket-filters/stats`, { headers, timeout: 5000 });
    console.log('✅ Filtros de tickets funcionando');
    
    return true;
  } catch (error) {
    console.log('❌ Error en API de tickets:', error.response?.data?.message || error.message);
    return false;
  }
}

async function verifyWebSocket() {
  console.log('\n4️⃣ VERIFICANDO WEBSOCKET...');
  
  try {
    const io = require('socket.io-client');
    const socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });
    
    return new Promise((resolve) => {
      socket.on('connect', () => {
        console.log('✅ WebSocket conectado');
        socket.disconnect();
        resolve(true);
      });
      
      socket.on('connect_error', (error) => {
        console.log('❌ WebSocket error:', error.message);
        resolve(false);
      });
      
      setTimeout(() => {
        console.log('❌ WebSocket timeout');
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    console.log('❌ Error WebSocket:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando verificación del sistema...\n');
  
  // 1. Verificar backend
  const backendOk = await verifyBackend();
  if (!backendOk) {
    console.log('\n❌ BACKEND NO DISPONIBLE - Verifica que esté corriendo en puerto 4000');
    process.exit(1);
  }
  
  // 2. Verificar base de datos
  const token = await verifyDatabase();
  if (!token) {
    console.log('\n❌ BASE DE DATOS NO DISPONIBLE - Verifica la conexión');
    process.exit(1);
  }
  
  // 3. Verificar API de tickets
  const ticketsOk = await verifyTicketsAPI(token);
  if (!ticketsOk) {
    console.log('\n❌ API DE TICKETS CON PROBLEMAS');
    process.exit(1);
  }
  
  // 4. Verificar WebSocket
  const websocketOk = await verifyWebSocket();
  if (!websocketOk) {
    console.log('\n⚠️  WEBSOCKET CON PROBLEMAS - Chat en tiempo real puede no funcionar');
  }
  
  console.log('\n🎉 VERIFICACIÓN COMPLETA');
  console.log('========================');
  console.log('✅ Backend: Funcionando');
  console.log('✅ Base de datos: Conectada');
  console.log('✅ API de tickets: Funcionando');
  console.log(websocketOk ? '✅ WebSocket: Funcionando' : '⚠️  WebSocket: Con problemas');
  console.log('\n🚀 Sistema listo para usar!');
}

main().catch(console.error);
