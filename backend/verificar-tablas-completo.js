const pool = require('./config/db');

async function verificarTablasCompleto() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DE TABLAS DEL PROYECTO CRMGeoFal\n');
    console.log('=' .repeat(80));
    
    // 1. Obtener todas las tablas del esquema público
    console.log('\n📊 TABLAS EXISTENTES EN LA BASE DE DATOS:');
    console.log('-'.repeat(50));
    
    const tablasQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    const tablas = await pool.query(tablasQuery);
    
    if (tablas.rows.length === 0) {
      console.log('❌ No se encontraron tablas en el esquema público');
      return;
    }
    
    console.log(`✅ Total de tablas encontradas: ${tablas.rows.length}\n`);
    
    // Mostrar todas las tablas
    tablas.rows.forEach((tabla, index) => {
      console.log(`${index + 1}. ${tabla.tablename} (propietario: ${tabla.tableowner})`);
    });
    
    // 2. Verificar estructura de cada tabla
    console.log('\n🔍 ESTRUCTURA DETALLADA DE CADA TABLA:');
    console.log('=' .repeat(80));
    
    for (const tabla of tablas.rows) {
      console.log(`\n📋 TABLA: ${tabla.tablename.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      // Obtener columnas de la tabla
      const columnasQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnas = await pool.query(columnasQuery, [tabla.tablename]);
      
      console.log(`   Columnas (${columnas.rows.length}):`);
      columnas.rows.forEach(col => {
        const tipo = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     • ${col.column_name}: ${tipo} ${nullable}${defaultVal}`);
      });
      
      // Obtener índices de la tabla
      const indicesQuery = `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1 
        AND schemaname = 'public'
        ORDER BY indexname
      `;
      
      const indices = await pool.query(indicesQuery, [tabla.tablename]);
      
      if (indices.rows.length > 0) {
        console.log(`   Índices (${indices.rows.length}):`);
        indices.rows.forEach(idx => {
          console.log(`     • ${idx.indexname}`);
        });
      }
      
      // Obtener claves foráneas
      const fkQuery = `
        SELECT 
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
      `;
      
      const fks = await pool.query(fkQuery, [tabla.tablename]);
      
      if (fks.rows.length > 0) {
        console.log(`   Claves Foráneas (${fks.rows.length}):`);
        fks.rows.forEach(fk => {
          console.log(`     • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }
      
      // Contar registros
      const countQuery = `SELECT COUNT(*) as total FROM ${tabla.tablename}`;
      const count = await pool.query(countQuery);
      console.log(`   Registros: ${count.rows[0].total}`);
    }
    
    // 3. Verificar tablas esperadas del sistema
    console.log('\n🎯 VERIFICACIÓN DE TABLAS ESPERADAS DEL SISTEMA:');
    console.log('=' .repeat(80));
    
    const tablasEsperadas = [
      'users', 'companies', 'projects', 'categories', 'subcategories',
      'services', 'subservices', 'quotes', 'quote_items', 'quote_variants',
      'quote_versions', 'quote_approvals', 'invoices', 'payment_proofs',
      'leads', 'activities', 'notifications', 'tickets', 'ticket_history',
      'project_history', 'project_attachments', 'evidences', 'export_history',
      'audit_log', 'audit_cleanup_log', 'audit_quotes', 'monthly_goals',
      'project_categories', 'project_subcategories', 'project_services'
    ];
    
    const tablasExistentes = tablas.rows.map(t => t.tablename);
    
    console.log('\n✅ TABLAS PRESENTES:');
    tablasEsperadas.forEach(tabla => {
      if (tablasExistentes.includes(tabla)) {
        console.log(`   ✓ ${tabla}`);
      }
    });
    
    console.log('\n❌ TABLAS FALTANTES:');
    const tablasFaltantes = tablasEsperadas.filter(tabla => !tablasExistentes.includes(tabla));
    if (tablasFaltantes.length === 0) {
      console.log('   ¡Excelente! Todas las tablas esperadas están presentes.');
    } else {
      tablasFaltantes.forEach(tabla => {
        console.log(`   ✗ ${tabla}`);
      });
    }
    
    // 4. Verificar relaciones entre tablas
    console.log('\n🔗 VERIFICACIÓN DE RELACIONES ENTRE TABLAS:');
    console.log('=' .repeat(80));
    
    const relacionesQuery = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `;
    
    const relaciones = await pool.query(relacionesQuery);
    
    if (relaciones.rows.length > 0) {
      console.log(`\n📊 Total de relaciones encontradas: ${relaciones.rows.length}`);
      relaciones.rows.forEach(rel => {
        console.log(`   ${rel.table_name}.${rel.column_name} → ${rel.foreign_table_name}.${rel.foreign_column_name}`);
      });
    } else {
      console.log('\n⚠️  No se encontraron relaciones entre tablas');
    }
    
    // 5. Verificar secuencias
    console.log('\n🔢 VERIFICACIÓN DE SECUENCIAS:');
    console.log('=' .repeat(80));
    
    const secuenciasQuery = `
      SELECT sequence_name, data_type, start_value, minimum_value, maximum_value, increment
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name
    `;
    
    const secuencias = await pool.query(secuenciasQuery);
    
    if (secuencias.rows.length > 0) {
      console.log(`\n📊 Total de secuencias: ${secuencias.rows.length}`);
      secuencias.rows.forEach(seq => {
        console.log(`   • ${seq.sequence_name} (${seq.data_type}, inicio: ${seq.start_value})`);
      });
    } else {
      console.log('\n⚠️  No se encontraron secuencias');
    }
    
    // 6. Verificar funciones y triggers
    console.log('\n⚙️ VERIFICACIÓN DE FUNCIONES Y TRIGGERS:');
    console.log('=' .repeat(80));
    
    const funcionesQuery = `
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `;
    
    const funciones = await pool.query(funcionesQuery);
    
    if (funciones.rows.length > 0) {
      console.log(`\n📊 Total de funciones/procedimientos: ${funciones.rows.length}`);
      funciones.rows.forEach(func => {
        console.log(`   • ${func.routine_name} (${func.routine_type})`);
      });
    }
    
    const triggersQuery = `
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `;
    
    const triggers = await pool.query(triggersQuery);
    
    if (triggers.rows.length > 0) {
      console.log(`\n📊 Total de triggers: ${triggers.rows.length}`);
      triggers.rows.forEach(trigger => {
        console.log(`   • ${trigger.trigger_name} en ${trigger.event_object_table} (${trigger.action_timing} ${trigger.event_manipulation})`);
      });
    }
    
    // 7. Resumen final
    console.log('\n📈 RESUMEN FINAL:');
    console.log('=' .repeat(80));
    console.log(`✅ Tablas encontradas: ${tablas.rows.length}`);
    console.log(`✅ Tablas esperadas: ${tablasEsperadas.length}`);
    console.log(`✅ Tablas faltantes: ${tablasFaltantes.length}`);
    console.log(`✅ Relaciones encontradas: ${relaciones.rows.length}`);
    console.log(`✅ Secuencias encontradas: ${secuencias.rows.length}`);
    console.log(`✅ Funciones encontradas: ${funciones.rows.length}`);
    console.log(`✅ Triggers encontrados: ${triggers.rows.length}`);
    
    if (tablasFaltantes.length === 0) {
      console.log('\n🎉 ¡VERIFICACIÓN EXITOSA! Todas las tablas del sistema están presentes.');
    } else {
      console.log('\n⚠️  VERIFICACIÓN INCOMPLETA: Faltan algunas tablas del sistema.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

// Ejecutar verificación
verificarTablasCompleto();
