const http = require('http');

function testStatsEndpoint() {
  console.log('🧪 PROBANDO ENDPOINT DE ESTADÍSTICAS...\n');
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/companies/stats',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📊 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Respuesta del endpoint:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          console.log('\n📈 Estadísticas extraídas:');
          console.log(`   Total: ${response.data.total}`);
          console.log(`   Empresas: ${response.data.empresas}`);
          console.log(`   Personas: ${response.data.personas}`);
          console.log(`   Con email: ${response.data.withEmail}`);
          console.log(`   Con teléfono: ${response.data.withPhone}`);
        }
      } catch (error) {
        console.error('❌ Error parseando respuesta:', error.message);
        console.log('📄 Respuesta raw:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en la petición:', error.message);
  });

  req.end();
}

testStatsEndpoint();
