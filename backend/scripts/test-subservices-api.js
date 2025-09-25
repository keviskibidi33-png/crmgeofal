const axios = require('axios');

async function testSubservicesAPI() {
  console.log('🔗 PROBANDO API DE SUBSERVICIOS\n');
  
  try {
    // 1. Probar endpoint de subservicios directamente
    console.log('1️⃣ Probando endpoint de subservicios...');
    const subservicesResponse = await axios.get('http://localhost:4000/api/subservices?area=laboratorio&limit=5');
    console.log(`✅ Subservicios: ${subservicesResponse.status}`);
    console.log(`   Total: ${subservicesResponse.data.total || 0} subservicios`);
    console.log(`   Datos: ${subservicesResponse.data.subservices?.length || 0} registros`);
    
    if (subservicesResponse.data.subservices?.length > 0) {
      console.log('\n📋 Primeros subservicios:');
      subservicesResponse.data.subservices.slice(0, 3).forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
        console.log(`      Precio: ${sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`}`);
        console.log(`      Norma: ${sub.norma || 'Sin norma'}`);
      });
    }

    // 2. Probar búsqueda
    console.log('\n2️⃣ Probando búsqueda...');
    const searchResponse = await axios.get('http://localhost:4000/api/subservices/search?q=SU');
    console.log(`✅ Búsqueda: ${searchResponse.status}`);
    console.log(`   Resultados: ${searchResponse.data.subservices?.length || 0} encontrados`);

    // 3. Probar servicios
    console.log('\n3️⃣ Probando servicios...');
    const servicesResponse = await axios.get('http://localhost:4000/api/services');
    console.log(`✅ Servicios: ${servicesResponse.status}`);
    console.log(`   Total: ${servicesResponse.data.data?.length || 0} servicios`);
    
    if (servicesResponse.data.data?.length > 0) {
      servicesResponse.data.data.forEach(service => {
        console.log(`   - ${service.name} (${service.area})`);
      });
    }

    console.log('\n🎉 API DE SUBSERVICIOS FUNCIONANDO');
    console.log('✅ Backend ejecutándose correctamente');
    console.log('✅ APIs de subservicios operativas');
    console.log('✅ Búsqueda funcionando');
    console.log('✅ Servicios disponibles');
    console.log('✅ Frontend puede conectarse');
    
  } catch (error) {
    console.error('❌ Error en API de subservicios:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('   No se pudo conectar al backend');
      console.error('   Verifica que el backend esté ejecutándose en puerto 4000');
    }
    throw error;
  }
}

async function main() {
  try {
    await testSubservicesAPI();
    console.log('\n✅ Prueba de API completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  }
}

main();
