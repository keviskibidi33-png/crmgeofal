const axios = require('axios');

async function testSubservicesAPI() {
  try {
    console.log('🔍 Probando API de subservicios...');

    // Primero obtener un token válido
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'sistemas@gmail.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');

    // Probar la API de búsqueda de subservicios
    const searchResponse = await axios.get('http://localhost:4000/api/subservices/search?q=ar&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ API de subservicios funcionando');
    console.log('📊 Datos recibidos:', {
      dataLength: searchResponse.data.data?.length || 0,
      data: searchResponse.data.data?.slice(0, 3) || []
    });

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      console.log('📋 Primeros 3 subservicios:');
      searchResponse.data.data.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. Código: ${item.codigo} | Descripción: ${item.descripcion} | Precio: S/ ${item.precio}`);
      });
    } else {
      console.log('⚠️  No se encontraron subservicios en la respuesta');
    }

  } catch (error) {
    console.error('❌ Error probando API de subservicios:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testSubservicesAPI().then(() => {
    console.log('🎉 Prueba completada');
    process.exit(0);
  });
}

module.exports = testSubservicesAPI;
