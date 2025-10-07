const pool = require('../config/db');

async function diagnoseAutocompleteIssue() {
  try {
    console.log('🔍 Diagnosticando problema del autocompletado...\n');

    // 1. Verificar si la tabla subservices existe
    console.log('📋 Verificando tabla subservices...');
    const subservicesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subservices'
      );
    `);

    if (subservicesCheck.rows[0].exists) {
      console.log('✅ Tabla subservices existe');
      
      // 2. Verificar estructura de la tabla
      console.log('\n📋 Verificando estructura de subservices...');
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'subservices'
        ORDER BY ordinal_position
      `);

      console.log('Columnas de subservices:');
      structure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // 3. Verificar datos existentes
      console.log('\n📊 Verificando datos existentes...');
      const dataCount = await pool.query('SELECT COUNT(*) as count FROM subservices');
      console.log(`Total de subservicios: ${dataCount.rows[0].count}`);

      // 4. Probar búsqueda con diferentes términos
      console.log('\n🔍 Probando búsquedas...');
      const searchTerms = ['arg', 'agregado', 'concreto', 'ensayo'];
      
      for (const term of searchTerms) {
        console.log(`\nBuscando: "${term}"`);
        const searchResult = await pool.query(`
          SELECT 
            id, codigo, descripcion, norma, precio, name
          FROM subservices 
          WHERE 
            codigo ILIKE $1 OR 
            descripcion ILIKE $1 OR 
            norma ILIKE $1
          LIMIT 5
        `, [`%${term}%`]);

        console.log(`  Resultados encontrados: ${searchResult.rows.length}`);
        searchResult.rows.forEach((item, index) => {
          console.log(`    ${index + 1}. ${item.codigo} - ${item.descripcion}`);
        });
      }

      // 5. Verificar servicios populares
      console.log('\n📈 Verificando servicios populares...');
      const popularServices = await pool.query(`
        SELECT 
          name,
          COUNT(*) as count
        FROM subservices 
        GROUP BY name 
        ORDER BY count DESC 
        LIMIT 10
      `);

      console.log('Servicios más populares:');
      popularServices.rows.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name}: ${service.count} servicios`);
      });

    } else {
      console.log('❌ Tabla subservices NO existe');
      console.log('💡 Esto explicaría por qué el autocompletado no funciona');
    }

    // 6. Verificar si hay problemas de rendimiento
    console.log('\n⚡ Verificando rendimiento de consultas...');
    const startTime = Date.now();
    
    try {
      await pool.query(`
        SELECT 
          id, codigo, descripcion, norma, precio, name
        FROM subservices 
        WHERE descripcion ILIKE '%arg%'
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      console.log(`Tiempo de consulta: ${queryTime}ms`);
      
      if (queryTime > 1000) {
        console.log('⚠️ Consulta lenta - puede causar problemas de rendimiento');
      } else {
        console.log('✅ Consulta rápida');
      }
    } catch (error) {
      console.log('❌ Error en consulta de rendimiento:', error.message);
    }

    // 7. Verificar índices
    console.log('\n📊 Verificando índices...');
    const indexes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename = 'subservices'
    `);

    if (indexes.rows.length > 0) {
      console.log('Índices existentes:');
      indexes.rows.forEach(index => {
        console.log(`  - ${index.indexname} en ${index.tablename}`);
      });
    } else {
      console.log('⚠️ No hay índices en subservices - puede ser lento');
    }

    console.log('\n🎉 DIAGNÓSTICO COMPLETADO');
    console.log('✅ Estructura de base de datos verificada');
    console.log('✅ Datos de subservicios analizados');
    console.log('✅ Rendimiento de consultas evaluado');
    console.log('✅ Índices verificados');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    process.exit(0);
  }
}

diagnoseAutocompleteIssue();
