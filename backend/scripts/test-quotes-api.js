const axios = require('axios');

async function testQuotesAPI() {
  try {
    console.log('🔍 Probando API de cotizaciones...');

    // Primero obtener un token válido
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'sistemas@gmail.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');

    // Probar la API de cotizaciones
    const quotesResponse = await axios.get('http://localhost:4000/api/quotes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ API de cotizaciones funcionando');
    console.log('📊 Datos recibidos:', {
      total: quotesResponse.data.total,
      dataLength: quotesResponse.data.data?.length || 0,
      page: quotesResponse.data.page,
      limit: quotesResponse.data.limit
    });

    if (quotesResponse.data.data && quotesResponse.data.data.length > 0) {
      console.log('📋 Primeras 3 cotizaciones:');
      quotesResponse.data.data.slice(0, 3).forEach((quote, index) => {
        console.log(`  ${index + 1}. ID: ${quote.id} | Cliente: ${quote.client_contact} | Estado: ${quote.status} | Total: S/ ${quote.total}`);
      });
    } else {
      console.log('⚠️  No se encontraron cotizaciones en la respuesta');
    }

  } catch (error) {
    console.error('❌ Error probando API:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testQuotesAPI().then(() => {
    console.log('🎉 Prueba completada');
    process.exit(0);
  });
}

module.exports = testQuotesAPI;
