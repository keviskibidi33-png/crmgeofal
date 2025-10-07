const axios = require('axios');

console.log('🔍 Probando conexión con el backend...');

async function testBackend() {
  try {
    // Probar conexión básica
    console.log('📡 Probando GET /test...');
    const testResponse = await axios.get('http://localhost:4002/test');
    console.log('✅ GET /test exitoso:', testResponse.data);
    
    // Probar autenticación
    console.log('🔐 Probando autenticación...');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2MjY4NDA4LCJleHAiOjE3MzYyNzIwMDh9.test';
    
    const commentResponse = await axios.post('http://localhost:4002/api/ticket-comments', {
      ticket_id: 14,
      comment: 'Comentario de prueba'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST comentario exitoso:', commentResponse.data);
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
}

testBackend();
