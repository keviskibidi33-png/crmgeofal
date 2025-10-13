const pool = require('../config/db');
const { generateUniqueQuoteNumber } = require('../utils/quoteNumberGenerator');

async function updateExistingQuoteNumbers() {
  try {
    console.log('🔄 Iniciando actualización de números de cotizaciones existentes...\n');
    
    // Obtener todas las cotizaciones que no tienen número o tienen formato antiguo
    const result = await pool.query(`
      SELECT id, created_at, quote_number 
      FROM quotes 
      WHERE quote_number IS NULL 
         OR quote_number = ''
         OR quote_number NOT LIKE 'COT-______-__-___'
      ORDER BY created_at ASC
    `);
    
    const quotesWithoutNumbers = result.rows;
    console.log(`📋 Encontradas ${quotesWithoutNumbers.length} cotizaciones sin número o con formato antiguo`);
    
    if (quotesWithoutNumbers.length === 0) {
      console.log('✅ Todas las cotizaciones ya tienen números asignados');
      return;
    }
    
    let updated = 0;
    let errors = 0;
    
    for (const quote of quotesWithoutNumbers) {
      try {
        // Generar un número único para cada cotización
        const newQuoteNumber = await generateUniqueQuoteNumber();
        
        // Actualizar la cotización con el nuevo número
        await pool.query(
          'UPDATE quotes SET quote_number = $1 WHERE id = $2',
          [newQuoteNumber, quote.id]
        );
        
        console.log(`✅ Cotización ID ${quote.id}: ${newQuoteNumber}`);
        updated++;
        
        // Pequeña pausa para evitar problemas de concurrencia
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error actualizando cotización ID ${quote.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Resumen de actualización:`);
    console.log(`   - Cotizaciones procesadas: ${quotesWithoutNumbers.length}`);
    console.log(`   - Actualizadas exitosamente: ${updated}`);
    console.log(`   - Errores: ${errors}`);
    
    if (errors === 0) {
      console.log('\n🎉 ¡Todas las cotizaciones han sido actualizadas exitosamente!');
    } else {
      console.log(`\n⚠️ Se encontraron ${errors} errores durante la actualización`);
    }
    
  } catch (error) {
    console.error('❌ Error fatal durante la actualización:', error);
    throw error;
  }
}

// Función para verificar el estado actual
async function checkQuoteNumbersStatus() {
  try {
    console.log('🔍 Verificando estado de números de cotizaciones...\n');
    
    // Contar cotizaciones con y sin números
    const withNumbers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM quotes 
      WHERE quote_number IS NOT NULL AND quote_number != ''
    `);
    
    const withoutNumbers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM quotes 
      WHERE quote_number IS NULL OR quote_number = ''
    `);
    
    const total = await pool.query('SELECT COUNT(*) as count FROM quotes');
    
    console.log('📊 Estado actual:');
    console.log(`   - Total de cotizaciones: ${total.rows[0].count}`);
    console.log(`   - Con número asignado: ${withNumbers.rows[0].count}`);
    console.log(`   - Sin número asignado: ${withoutNumbers.rows[0].count}`);
    
    // Mostrar algunos ejemplos de números existentes
    const examples = await pool.query(`
      SELECT id, quote_number, created_at 
      FROM quotes 
      WHERE quote_number IS NOT NULL AND quote_number != ''
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (examples.rows.length > 0) {
      console.log('\n📋 Ejemplos de números existentes:');
      examples.rows.forEach(quote => {
        console.log(`   - ID ${quote.id}: ${quote.quote_number} (${quote.created_at})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--check') || args.includes('-c')) {
    await checkQuoteNumbersStatus();
  } else if (args.includes('--update') || args.includes('-u')) {
    await updateExistingQuoteNumbers();
  } else {
    console.log('🔧 Script de actualización de números de cotizaciones\n');
    console.log('Uso:');
    console.log('  node updateExistingQuoteNumbers.js --check    Verificar estado actual');
    console.log('  node updateExistingQuoteNumbers.js --update  Actualizar cotizaciones sin número');
    console.log('\nEjemplos:');
    console.log('  node updateExistingQuoteNumbers.js -c');
    console.log('  node updateExistingQuoteNumbers.js -u');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { updateExistingQuoteNumbers, checkQuoteNumbersStatus };
