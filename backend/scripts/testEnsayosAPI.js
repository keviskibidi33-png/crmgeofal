const fetch = require('node-fetch');

async function testEnsayosAPI() {
  try {
    console.log('🧪 Probando API de Ensayos...\n');
    
    const baseURL = 'http://localhost:4000/api/ensayos';
    
    // Test 1: Obtener todos los ensayos
    console.log('1️⃣ Probando GET /api/ensayos');
    const response1 = await fetch(baseURL);
    const data1 = await response1.json();
    
    if (response1.ok) {
      console.log('✅ GET /api/ensayos - Éxito');
      console.log(`📊 Total ensayos: ${data1.data?.length || 0}`);
      console.log(`📄 Página: ${data1.pagination?.page || 'N/A'}`);
    } else {
      console.log('❌ GET /api/ensayos - Error:', data1.message);
    }
    
    // Test 2: Buscar ensayos
    console.log('\n2️⃣ Probando GET /api/ensayos/search?q=SU04');
    const response2 = await fetch(`${baseURL}/search?q=SU04`);
    const data2 = await response2.json();
    
    if (response2.ok) {
      console.log('✅ GET /api/ensayos/search - Éxito');
      console.log(`🔍 Resultados: ${data2.data?.length || 0}`);
      if (data2.data?.length > 0) {
        console.log(`📋 Primer resultado: ${data2.data[0].codigo} - ${data2.data[0].descripcion}`);
      }
    } else {
      console.log('❌ GET /api/ensayos/search - Error:', data2.message);
    }
    
    // Test 3: Obtener ensayo específico
    console.log('\n3️⃣ Probando GET /api/ensayos/SU04');
    const response3 = await fetch(`${baseURL}/SU04`);
    const data3 = await response3.json();
    
    if (response3.ok) {
      console.log('✅ GET /api/ensayos/SU04 - Éxito');
      console.log(`📋 Ensayo: ${data3.data?.codigo} - ${data3.data?.descripcion}`);
      console.log(`💰 Precio: S/ ${data3.data?.precio}`);
      console.log(`🏷️ Categoría: ${data3.data?.categoria}`);
    } else {
      console.log('❌ GET /api/ensayos/SU04 - Error:', data3.message);
    }
    
    // Test 4: Estadísticas
    console.log('\n4️⃣ Probando GET /api/ensayos/stats');
    const response4 = await fetch(`${baseURL}/stats`);
    const data4 = await response4.json();
    
    if (response4.ok) {
      console.log('✅ GET /api/ensayos/stats - Éxito');
      console.log(`📊 Total ensayos: ${data4.data?.totalEnsayos || 0}`);
      console.log(`📋 Categorías: ${data4.data?.porCategoria?.length || 0}`);
    } else {
      console.log('❌ GET /api/ensayos/stats - Error:', data4.message);
    }
    
    console.log('\n🎉 Pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testEnsayosAPI();
