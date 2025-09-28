const http = require('http');

function probarEndpointHTTP() {
  console.log('🌐 PROBANDO ENDPOINT HTTP /api/subservices...\n');
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/subservices?limit=5',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📤 RESPUESTA COMPLETA:');
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ JSON válido');
        console.log(`   Total: ${jsonData.total}`);
        console.log(`   Datos: ${jsonData.data ? jsonData.data.length : 'undefined'}`);
        console.log(`   Página: ${jsonData.page}`);
        console.log(`   Límite: ${jsonData.limit}`);
        
        if (jsonData.data && jsonData.data.length > 0) {
          console.log('\n📋 PRIMEROS 3 SUBSERVICIOS:');
          jsonData.data.slice(0, 3).forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.codigo}: ${item.descripcion.substring(0, 50)}...`);
          });
        } else {
          console.log('⚠️  No hay datos en la respuesta');
        }
        
      } catch (error) {
        console.log('❌ Error parseando JSON:', error.message);
        console.log('📄 Respuesta raw:', data.substring(0, 500));
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('💥 Error en la petición:', error.message);
  });
  
  req.end();
}

probarEndpointHTTP();
