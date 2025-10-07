const axios = require('axios');

console.log('🔍 Diagnosticando error 500 en /api/ticket-comments...');

async function testCommentEndpoint() {
  try {
    // 1. Verificar que el backend está corriendo
    console.log('📡 Probando conexión básica...');
    const healthResponse = await axios.get('http://localhost:4000/api/health');
    console.log('✅ Health check exitoso:', healthResponse.data);

    // 2. Obtener token de autenticación (simulando login)
    console.log('🔐 Probando autenticación...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@geofal.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido:', token ? 'Presente' : 'Ausente');

    // 3. Probar crear comentario con datos mínimos
    console.log('💬 Probando creación de comentario...');
    const commentData = {
      ticket_id: 14,
      comment: 'Comentario de prueba desde script'
    };

    const commentResponse = await axios.post('http://localhost:4000/api/ticket-comments', commentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Comentario creado exitosamente:', commentResponse.data);

  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    console.error('📊 Data:', error.response?.data);
    console.error('📊 Headers:', error.response?.headers);
    console.error('📊 Error completo:', error.message);
    
    if (error.response?.data) {
      console.error('📋 Detalles del error del servidor:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCommentEndpoint();