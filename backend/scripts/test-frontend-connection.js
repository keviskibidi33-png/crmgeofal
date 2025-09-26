const http = require('http');

function testFrontendConnection() {
  console.log('🧪 PROBANDO CONEXIÓN FRONTEND-BACKEND...\n');
  
  // Probar diferentes endpoints
  const endpoints = [
    '/api/companies/stats',
    '/api/companies?page=1&limit=5',
    '/api/companies/filter-options'
  ];
  
  endpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}️⃣ Probando ${endpoint}...`);
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173', // Simular petición desde frontend
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`   📊 Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log(`   ✅ ${endpoint}: Funcionando correctamente`);
            if (response.data) {
              if (endpoint.includes('stats')) {
                console.log(`      📈 Total: ${response.data.total}, Empresas: ${response.data.empresas}, Personas: ${response.data.personas}`);
              } else if (endpoint.includes('companies?')) {
                console.log(`      📋 Registros: ${response.data.length}, Total: ${response.pagination?.total || 'N/A'}`);
              } else if (endpoint.includes('filter-options')) {
                console.log(`      🔍 Ciudades: ${response.data.cities?.length || 0}, Sectores: ${response.data.sectors?.length || 0}`);
              }
            }
          } else {
            console.log(`   ⚠️ ${endpoint}: Respuesta con error - ${response.message || 'Error desconocido'}`);
          }
        } catch (error) {
          console.log(`   ❌ ${endpoint}: Error parseando respuesta - ${error.message}`);
          console.log(`   📄 Respuesta raw: ${data.substring(0, 200)}...`);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ ${endpoint}: Error de conexión - ${error.message}`);
    });

    req.end();
  });
}

testFrontendConnection();
