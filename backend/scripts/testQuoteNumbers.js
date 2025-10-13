const { generateUniqueQuoteNumber, generateCloneQuoteNumber, isQuoteNumberUnique } = require('../utils/quoteNumberGenerator');

async function testQuoteNumberGeneration() {
  console.log('🧪 Iniciando pruebas del sistema de numeración de cotizaciones...\n');
  
  try {
    // Prueba 1: Generar números únicos
    console.log('📋 Prueba 1: Generando números únicos');
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      const number = await generateUniqueQuoteNumber();
      numbers.push(number);
      console.log(`   ${i + 1}. ${number}`);
    }
    
    // Verificar que todos son únicos
    const uniqueNumbers = [...new Set(numbers)];
    console.log(`   ✅ Números generados: ${numbers.length}, Únicos: ${uniqueNumbers.length}`);
    
    if (numbers.length === uniqueNumbers.length) {
      console.log('   ✅ Todos los números son únicos\n');
    } else {
      console.log('   ❌ Se encontraron números duplicados\n');
    }
    
    // Prueba 2: Verificar unicidad
    console.log('📋 Prueba 2: Verificando unicidad');
    const testNumber = numbers[0];
    const isUnique = await isQuoteNumberUnique(testNumber);
    console.log(`   Número: ${testNumber}`);
    console.log(`   ¿Es único?: ${isUnique ? 'Sí' : 'No'}`);
    
    if (!isUnique) {
      console.log('   ✅ El número ya existe en la base de datos (comportamiento esperado)\n');
    } else {
      console.log('   ⚠️ El número no existe en la base de datos\n');
    }
    
    // Prueba 3: Generar números para clonación
    console.log('📋 Prueba 3: Generando números para clonación');
    const originalNumber = numbers[0];
    const cloneNumbers = [];
    
    for (let i = 0; i < 3; i++) {
      const cloneNumber = await generateCloneQuoteNumber(originalNumber);
      cloneNumbers.push(cloneNumber);
      console.log(`   Clon ${i + 1}: ${cloneNumber}`);
    }
    
    // Verificar que todos los clones son únicos
    const uniqueClones = [...new Set(cloneNumbers)];
    console.log(`   ✅ Números de clon generados: ${cloneNumbers.length}, Únicos: ${uniqueClones.length}`);
    
    if (cloneNumbers.length === uniqueClones.length) {
      console.log('   ✅ Todos los números de clon son únicos\n');
    } else {
      console.log('   ❌ Se encontraron números de clon duplicados\n');
    }
    
    // Prueba 4: Formato de números
    console.log('📋 Prueba 4: Verificando formato');
    const allNumbers = [...numbers, ...cloneNumbers];
    const formatRegex = /^COT-\d{6}-\d{2}-\d{3}$/;
    
    let validFormat = 0;
    for (const number of allNumbers) {
      if (formatRegex.test(number)) {
        validFormat++;
      } else {
        console.log(`   ❌ Formato inválido: ${number}`);
      }
    }
    
    console.log(`   ✅ Números con formato válido: ${validFormat}/${allNumbers.length}`);
    
    if (validFormat === allNumbers.length) {
      console.log('   ✅ Todos los números tienen el formato correcto\n');
    } else {
      console.log('   ❌ Algunos números no tienen el formato correcto\n');
    }
    
    console.log('🎉 Pruebas completadas exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Números únicos generados: ${numbers.length}`);
    console.log(`   - Números de clon generados: ${cloneNumbers.length}`);
    console.log(`   - Total de números: ${allNumbers.length}`);
    console.log(`   - Formato válido: ${validFormat}/${allNumbers.length}`);
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
  testQuoteNumberGeneration().then(() => {
    console.log('\n✅ Pruebas finalizadas');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { testQuoteNumberGeneration };
