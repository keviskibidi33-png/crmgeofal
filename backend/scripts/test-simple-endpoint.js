const http = require('http');

const data = JSON.stringify({
  ticket_id: 14,
  comment: 'Comentario de prueba'
});

const options = {
  hostname: 'localhost',
  port: 4001,
  path: '/api/ticket-comments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2MjY4MzYwLCJleHAiOjE3MzYyNzE5NjB9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
  }
};

console.log('🧪 Probando endpoint de prueba...');

const req = http.request(options, (res) => {
  console.log('📡 Status Code:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:', responseData);
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Éxito!');
    } else {
      console.log('❌ Error en la respuesta');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error en la petición:', e.message);
});

req.write(data);
req.end();
