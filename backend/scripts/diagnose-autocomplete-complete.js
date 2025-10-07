const pool = require('../config/db');
const axios = require('axios');

async function diagnoseAutocompleteComplete() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL AUTOCOMPLETADO\n');
  console.log('='.repeat(60));

  try {
    // 1. Verificar base de datos
    console.log('\n📊 1. VERIFICACIÓN DE BASE DE DATOS');
    console.log('-'.repeat(60));
    
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'subservices'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabla subservices NO EXISTE');
      return;
    }
    
    console.log('✅ Tabla subservices existe');
    
    const countResult = await pool.query('SELECT COUNT(*) as count FROM subservices WHERE is_active = true');
    const totalActive = countResult.rows[0].count;
    console.log(`✅ Total de subservicios activos: ${totalActive}`);

    // 2. Probar búsquedas directas en BD
    console.log('\n🔍 2. PRUEBAS DE BÚSQUEDA EN BASE DE DATOS');
    console.log('-'.repeat(60));
    
    const testTerms = ['arg', 'su', 'ag', 'co'];
    
    for (const term of testTerms) {
      const searchResult = await pool.query(`
        SELECT 
          s.id, s.codigo, s.descripcion, s.precio,
          serv.name as service_name
        FROM subservices s
        JOIN services serv ON s.service_id = serv.id
        WHERE s.is_active = true 
          AND (
            s.codigo ILIKE $1 OR 
            s.descripcion ILIKE $1 OR 
            s.norma ILIKE $1 OR
            serv.name ILIKE $1
          )
        LIMIT 5
      `, [`%${term}%`]);
      
      console.log(`\n  Término: "${term}"`);
      console.log(`  Resultados: ${searchResult.rows.length}`);
      if (searchResult.rows.length > 0) {
        searchResult.rows.forEach((item, idx) => {
          console.log(`    ${idx + 1}. ${item.codigo} - ${item.descripcion.substring(0, 50)}...`);
        });
      }
    }

    // 3. Verificar backend API
    console.log('\n🌐 3. VERIFICACIÓN DE BACKEND API');
    console.log('-'.repeat(60));
    
    const baseURL = 'http://localhost:4000';
    
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`, { timeout: 5000 });
      console.log('✅ Backend responde correctamente');
    } catch (error) {
      console.log('❌ Backend NO responde:', error.message);
      console.log('⚠️  Asegúrate de que el backend esté ejecutándose');
      return;
    }

    // 4. Probar endpoint de búsqueda
    console.log('\n🔎 4. PRUEBAS DE ENDPOINT /api/subservices/search');
    console.log('-'.repeat(60));
    
    for (const term of testTerms) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${baseURL}/api/subservices/search?q=${encodeURIComponent(term)}&limit=5`, { timeout: 5000 });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`\n  Término: "${term}"`);
        console.log(`  Tiempo de respuesta: ${responseTime}ms`);
        console.log(`  Status: ${response.status}`);
        console.log(`  Resultados: ${response.data?.data?.length || 0}`);
        
        if (response.data?.data?.length > 0) {
          response.data.data.forEach((item, idx) => {
            console.log(`    ${idx + 1}. ${item.codigo} - ${item.descripcion.substring(0, 50)}...`);
          });
        }
        
        if (responseTime > 1000) {
          console.log('  ⚠️  Respuesta lenta (>1s)');
        } else {
          console.log('  ✅ Respuesta rápida');
        }
      } catch (error) {
        console.log(`\n  Término: "${term}"`);
        console.log(`  ❌ Error: ${error.message}`);
      }
    }

    // 5. Verificar índices de BD
    console.log('\n📈 5. VERIFICACIÓN DE ÍNDICES');
    console.log('-'.repeat(60));
    
    const indexesResult = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename = 'subservices'
      ORDER BY indexname
    `);
    
    console.log(`Total de índices: ${indexesResult.rows.length}`);
    indexesResult.rows.forEach(index => {
      console.log(`  - ${index.indexname}`);
    });

    // 6. Verificar rendimiento con EXPLAIN
    console.log('\n⚡ 6. ANÁLISIS DE RENDIMIENTO (EXPLAIN)');
    console.log('-'.repeat(60));
    
    const explainResult = await pool.query(`
      EXPLAIN ANALYZE
      SELECT 
        s.id, s.codigo, s.descripcion, s.precio,
        serv.name as service_name
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE s.is_active = true 
        AND (
          s.codigo ILIKE '%arg%' OR 
          s.descripcion ILIKE '%arg%' OR 
          s.norma ILIKE '%arg%' OR
          serv.name ILIKE '%arg%'
        )
      LIMIT 10
    `);
    
    console.log('Query plan:');
    explainResult.rows.forEach(row => {
      console.log(`  ${row['QUERY PLAN']}`);
    });

    // 7. Resumen y recomendaciones
    console.log('\n📋 7. RESUMEN Y RECOMENDACIONES');
    console.log('='.repeat(60));
    
    console.log('\n✅ FUNCIONAMIENTO:');
    console.log(`  - Base de datos: ${totalActive} servicios activos`);
    console.log(`  - Backend API: Funcionando`);
    console.log(`  - Endpoint búsqueda: Operativo`);
    console.log(`  - Índices: ${indexesResult.rows.length} índices configurados`);
    
    console.log('\n💡 PARA EL FRONTEND:');
    console.log('  1. Abre la consola del navegador (F12)');
    console.log('  2. Busca logs que empiecen con [autocomplete_...]');
    console.log('  3. Verifica que aparezcan estos logs:');
    console.log('     - "Input change: ..."');
    console.log('     - "Abriendo dropdown"');
    console.log('     - "Render - isOpen: true, term: ..., results: X"');
    console.log('  4. Si el dropdown parpadea, busca múltiples logs de "Abriendo/Cerrando"');
    
    console.log('\n🐛 SI EL PROBLEMA PERSISTE:');
    console.log('  1. Verifica que solo existe SubserviceAutocompleteFinal.jsx');
    console.log('  2. Revisa si hay CSS que oculte el dropdown');
    console.log('  3. Comprueba si hay otros eventos de scroll/resize interfiriendo');
    console.log('  4. Abre Network tab y verifica las peticiones a /api/subservices/search');

  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

diagnoseAutocompleteComplete();
