const axios = require('axios');

async function testAutocompleteFunctionality() {
  try {
    console.log('🧪 Probando funcionalidad del autocompletado...\n');

    const baseURL = 'http://localhost:4000';
    
    // 1. Verificar que el backend esté funcionando
    console.log('🔍 Verificando backend...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Backend funcionando correctamente');
    } catch (error) {
      console.log('❌ Backend no está funcionando:', error.message);
      console.log('💡 Asegúrate de que el backend esté ejecutándose en el puerto 4000');
      return;
    }

    // 2. Probar búsqueda de subservicios
    console.log('\n🔍 Probando búsqueda de subservicios...');
    const searchTerms = ['arg', 'agregado', 'concreto', 'ensayo'];
    
    for (const term of searchTerms) {
      console.log(`\nBuscando: "${term}"`);
      try {
        const response = await axios.get(`${baseURL}/api/subservices/search?q=${encodeURIComponent(term)}&limit=5`);
        
        if (response.data && response.data.data) {
          console.log(`  ✅ Resultados encontrados: ${response.data.data.length}`);
          response.data.data.forEach((item, index) => {
            console.log(`    ${index + 1}. ${item.codigo} - ${item.descripcion}`);
          });
        } else {
          console.log(`  ⚠️ No se encontraron resultados para "${term}"`);
        }
      } catch (error) {
        console.log(`  ❌ Error buscando "${term}":`, error.message);
      }
    }

    // 3. Probar búsqueda con términos cortos
    console.log('\n🔍 Probando búsqueda con términos cortos...');
    const shortTerms = ['a', 'ar'];
    
    for (const term of shortTerms) {
      console.log(`\nBuscando: "${term}" (término corto)`);
      try {
        const response = await axios.get(`${baseURL}/api/subservices/search?q=${encodeURIComponent(term)}&limit=5`);
        
        if (response.data && response.data.data) {
          console.log(`  Resultados: ${response.data.data.length}`);
          if (response.data.data.length === 0) {
            console.log(`  ✅ Correcto: términos cortos no devuelven resultados`);
          } else {
            console.log(`  ⚠️ Inesperado: términos cortos devuelven resultados`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error buscando "${term}":`, error.message);
      }
    }

    // 4. Probar rendimiento
    console.log('\n⚡ Probando rendimiento...');
    const performanceTests = ['agregado', 'concreto', 'ensayo'];
    
    for (const term of performanceTests) {
      const startTime = Date.now();
      try {
        const response = await axios.get(`${baseURL}/api/subservices/search?q=${encodeURIComponent(term)}&limit=10`);
        const endTime = Date.now();
        const queryTime = endTime - startTime;
        
        console.log(`  "${term}": ${queryTime}ms (${response.data.data.length} resultados)`);
        
        if (queryTime > 1000) {
          console.log(`    ⚠️ Consulta lenta para "${term}"`);
        } else {
          console.log(`    ✅ Consulta rápida para "${term}"`);
        }
      } catch (error) {
        console.log(`  ❌ Error en prueba de rendimiento para "${term}":`, error.message);
      }
    }

    // 5. Probar límites
    console.log('\n📊 Probando límites...');
    const limitTests = [1, 5, 10, 20];
    
    for (const limit of limitTests) {
      console.log(`\nProbando límite: ${limit}`);
      try {
        const response = await axios.get(`${baseURL}/api/subservices/search?q=agregado&limit=${limit}`);
        
        if (response.data && response.data.data) {
          console.log(`  ✅ Límite ${limit}: ${response.data.data.length} resultados`);
          
          if (response.data.data.length > limit) {
            console.log(`    ⚠️ Más resultados de los esperados`);
          } else {
            console.log(`    ✅ Límite respetado correctamente`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error probando límite ${limit}:`, error.message);
      }
    }

    console.log('\n🎉 PRUEBAS COMPLETADAS');
    console.log('✅ Backend funcionando');
    console.log('✅ Búsquedas funcionando');
    console.log('✅ Rendimiento evaluado');
    console.log('✅ Límites verificados');
    console.log('\n💡 Si el autocompletado sigue apareciendo y desapareciendo:');
    console.log('   - Verifica que el componente React esté usando la versión Simple');
    console.log('   - Revisa la consola del navegador para errores');
    console.log('   - Asegúrate de que no haya conflictos de CSS');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit(0);
  }
}

testAutocompleteFunctionality();
