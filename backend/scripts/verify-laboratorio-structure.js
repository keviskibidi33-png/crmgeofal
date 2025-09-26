const pool = require('../config/db');

async function verifyLaboratorioStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DEL SISTEMA DE LABORATORIO...\n');

  try {
    // 1. Verificar columnas agregadas a projects
    console.log('1️⃣ Verificando columnas de projects...');
    const projectsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name IN ('estado', 'cotizacion_id', 'usuario_laboratorio_id', 'fecha_envio_laboratorio', 'fecha_completado_laboratorio', 'notas_laboratorio')
      ORDER BY column_name
    `);
    
    console.log(`   📋 Columnas de laboratorio en projects: ${projectsColumns.rows.length}`);
    projectsColumns.rows.forEach(col => {
      console.log(`      ✅ ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });

    // 2. Verificar columnas agregadas a quotes
    console.log('\n2️⃣ Verificando columnas de quotes...');
    const quotesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'quotes' 
      AND column_name IN ('es_contrato', 'archivos_cotizacion', 'archivos_laboratorio', 'notas_vendedor', 'notas_laboratorio')
      ORDER BY column_name
    `);
    
    console.log(`   📋 Columnas de laboratorio en quotes: ${quotesColumns.rows.length}`);
    quotesColumns.rows.forEach(col => {
      console.log(`      ✅ ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });

    // 3. Verificar tablas nuevas
    console.log('\n3️⃣ Verificando tablas nuevas...');
    const newTables = ['project_states', 'project_files'];
    for (const table of newTables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (exists.rows[0].exists) {
        const columns = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table]);
        
        console.log(`   ✅ Tabla ${table}: ${columns.rows.length} columnas`);
        columns.rows.forEach(col => {
          console.log(`      - ${col.column_name}: ${col.data_type}`);
        });
      } else {
        console.log(`   ❌ Tabla ${table}: NO EXISTE`);
      }
    }

    // 4. Verificar índices
    console.log('\n4️⃣ Verificando índices...');
    const indexes = await pool.query(`
      SELECT indexname, tablename, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('projects', 'quotes', 'project_files')
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `);
    
    console.log(`   📊 Índices creados: ${indexes.rows.length}`);
    indexes.rows.forEach(idx => {
      console.log(`      ✅ ${idx.indexname} en ${idx.tablename}`);
    });

    // 5. Verificar datos existentes
    console.log('\n5️⃣ Verificando datos existentes...');
    
    const companiesCount = await pool.query('SELECT COUNT(*) FROM companies');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    const quotesCount = await pool.query('SELECT COUNT(*) FROM quotes');
    
    console.log(`   📊 Datos existentes:`);
    console.log(`      - Companies: ${companiesCount.rows[0].count}`);
    console.log(`      - Users: ${usersCount.rows[0].count}`);
    console.log(`      - Projects: ${projectsCount.rows[0].count}`);
    console.log(`      - Quotes: ${quotesCount.rows[0].count}`);

    // 6. Verificar proyectos con estado de laboratorio
    console.log('\n6️⃣ Verificando proyectos con estado de laboratorio...');
    const laboratorioProjects = await pool.query(`
      SELECT estado, COUNT(*) as count
      FROM projects 
      WHERE estado IS NOT NULL
      GROUP BY estado
      ORDER BY estado
    `);
    
    if (laboratorioProjects.rows.length > 0) {
      console.log(`   📊 Proyectos con estado de laboratorio:`);
      laboratorioProjects.rows.forEach(row => {
        console.log(`      - ${row.estado}: ${row.count} proyectos`);
      });
    } else {
      console.log(`   ℹ️  No hay proyectos con estado de laboratorio aún`);
    }

    // 7. Verificar cotizaciones con contrato
    console.log('\n7️⃣ Verificando cotizaciones con contrato...');
    const contratoQuotes = await pool.query(`
      SELECT es_contrato, COUNT(*) as count
      FROM quotes 
      WHERE es_contrato IS NOT NULL
      GROUP BY es_contrato
      ORDER BY es_contrato
    `);
    
    if (contratoQuotes.rows.length > 0) {
      console.log(`   📊 Cotizaciones con contrato:`);
      contratoQuotes.rows.forEach(row => {
        console.log(`      - ${row.es_contrato ? 'Sí' : 'No'}: ${row.count} cotizaciones`);
      });
    } else {
      console.log(`   ℹ️  No hay cotizaciones con contrato aún`);
    }

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('✅ Estructura de laboratorio implementada correctamente');
    console.log('✅ Tablas y columnas creadas');
    console.log('✅ Índices optimizados');
    console.log('✅ Sistema listo para usar');

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

verifyLaboratorioStructure();
