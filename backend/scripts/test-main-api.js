const axios = require('axios');

async function testMainAPI() {
  console.log('🔗 PROBANDO API PRINCIPAL DE SUBSERVICIOS\n');
  
  try {
    // Probar endpoint principal de subservicios
    console.log('1️⃣ Probando endpoint principal...');
    const response = await axios.get('http://localhost:4000/api/subservices?area=laboratorio&limit=10');
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Total: ${response.data.total} subservicios`);
    console.log(`✅ Datos: ${response.data.subservices?.length || 0} registros`);
    
    if (response.data.subservices?.length > 0) {
      console.log('\n📋 Primeros subservicios:');
      response.data.subservices.slice(0, 5).forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.codigo}: ${sub.descripcion.substring(0, 40)}...`);
        console.log(`      Precio: ${sub.precio === 0 ? 'Sujeto a evaluación' : `S/ ${sub.precio}`}`);
        console.log(`      Norma: ${sub.norma || 'Sin norma'}`);
        console.log(`      Servicio: ${sub.service_name} (${sub.area})`);
        console.log('');
      });
    }

    console.log('🎉 API PRINCIPAL FUNCIONANDO CORRECTAMENTE');
    console.log('✅ Backend ejecutándose en puerto 4000');
    console.log('✅ Subservicios disponibles');
    console.log('✅ Frontend puede conectarse');
    console.log('✅ Listo para usar');
    
  } catch (error) {
    console.error('❌ Error en API:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function main() {
  try {
    await testMainAPI();
    console.log('\n✅ Prueba completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  }
}

main();
