const axios = require('axios');

async function testAPIConnection() {
  console.log('🔗 PROBANDO CONEXIÓN API DE SUBSERVICIOS\n');
  
  try {
    // 1. Probar endpoint básico
    console.log('1️⃣ Probando endpoint básico...');
    const basicResponse = await axios.get('http://localhost:4000/api/test');
    console.log(`✅ Endpoint básico: ${basicResponse.status} - ${basicResponse.data.message || 'OK'}`);

    // 2. Probar endpoint de subservicios
    console.log('\n2️⃣ Probando endpoint de subservicios...');
    const subservicesResponse = await axios.get('http://localhost:4000/api/subservices?area=laboratorio&limit=5');
    console.log(`✅ Subservicios: ${subservicesResponse.status}`);
    console.log(`   Total: ${subservicesResponse.data.total || 0} subservicios`);
    console.log(`   Datos: ${subservicesResponse.data.subservices?.length || 0} registros`);
    
    if (subservicesResponse.data.subservices?.length > 0) {
      console.log('\n📋 Primeros subservicios:');
      subservicesResponse.data.subservices.slice(0, 3).forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
        console.log(`      Precio: ${sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`}`);
      });
    }

    // 3. Probar búsqueda
    console.log('\n3️⃣ Probando búsqueda...');
    const searchResponse = await axios.get('http://localhost:4000/api/subservices/search?q=SU');
    console.log(`✅ Búsqueda: ${searchResponse.status}`);
    console.log(`   Resultados: ${searchResponse.data.subservices?.length || 0} encontrados`);

    // 4. Probar servicios
    console.log('\n4️⃣ Probando servicios...');
    const servicesResponse = await axios.get('http://localhost:4000/api/services');
    console.log(`✅ Servicios: ${servicesResponse.status}`);
    console.log(`   Total: ${servicesResponse.data.data?.length || 0} servicios`);
    
    if (servicesResponse.data.data?.length > 0) {
      servicesResponse.data.data.forEach(service => {
        console.log(`   - ${service.name} (${service.area})`);
      });
    }

    console.log('\n🎉 CONEXIÓN API FUNCIONANDO CORRECTAMENTE');
    console.log('✅ Backend ejecutándose en puerto 4000');
    console.log('✅ APIs de subservicios operativas');
    console.log('✅ Búsqueda funcionando');
    console.log('✅ Servicios disponibles');
    console.log('✅ Listo para frontend');
    
  } catch (error) {
    console.error('❌ Error en conexión API:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function main() {
  try {
    await testAPIConnection();
    console.log('\n✅ Prueba de conexión completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  }
}

main();
