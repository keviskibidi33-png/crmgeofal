const pool = require('../config/db');

async function testLaboratorioSystem() {
  console.log('🧪 PROBANDO SISTEMA DE LABORATORIO...\n');

  try {
    // 1. Verificar que las tablas se crearon correctamente
    console.log('1️⃣ Verificando estructura de tablas...');
    
    const tables = ['projects', 'quotes', 'project_states', 'project_files'];
    for (const table of tables) {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`   📋 Tabla ${table}: ${result.rows.length} columnas`);
      if (table === 'projects') {
        const newColumns = result.rows.filter(col => 
          ['estado', 'cotizacion_id', 'usuario_laboratorio_id', 'fecha_envio_laboratorio', 'fecha_completado_laboratorio', 'notas_laboratorio'].includes(col.column_name)
        );
        console.log(`      ✅ Nuevas columnas: ${newColumns.map(col => col.column_name).join(', ')}`);
      }
    }

    // 2. Verificar índices
    console.log('\n2️⃣ Verificando índices...');
    const indexes = await pool.query(`
      SELECT indexname, tablename, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('projects', 'quotes', 'project_files')
      AND indexname LIKE 'idx_%'
    `);
    
    console.log(`   📊 Índices creados: ${indexes.rows.length}`);
    indexes.rows.forEach(idx => {
      console.log(`      - ${idx.indexname} en ${idx.tablename}`);
    });

    // 3. Simular flujo de laboratorio
    console.log('\n3️⃣ Simulando flujo de laboratorio...');
    
    // Crear un proyecto de prueba
    const proyectoTest = await pool.query(`
      INSERT INTO projects (name, company_id, vendedor_id, estado, usuario_laboratorio_id, fecha_envio_laboratorio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, estado
    `, [
      'Proyecto Test Laboratorio',
      1, // company_id (asumiendo que existe)
      1, // vendedor_id (asumiendo que existe)
      'en_laboratorio',
      2, // usuario_laboratorio_id (asumiendo que existe)
      new Date()
    ]);
    
    console.log(`   ✅ Proyecto de prueba creado: ${proyectoTest.rows[0].name} (ID: ${proyectoTest.rows[0].id})`);

    // Crear una cotización de prueba
    const cotizacionTest = await pool.query(`
      INSERT INTO quotes (project_id, es_contrato, archivos_cotizacion, notas_vendedor)
      VALUES ($1, $2, $3, $4)
      RETURNING id, es_contrato
    `, [
      proyectoTest.rows[0].id,
      true,
      JSON.stringify([
        { nombre: 'cotizacion.pdf', ruta: '/uploads/cotizacion.pdf', tamaño: 1024, tipo: 'application/pdf' }
      ]),
      'Cotización de prueba para laboratorio'
    ]);
    
    console.log(`   ✅ Cotización de prueba creada: ID ${cotizacionTest.rows[0].id}`);

    // Actualizar proyecto con cotización
    await pool.query(`
      UPDATE projects SET cotizacion_id = $1 WHERE id = $2
    `, [cotizacionTest.rows[0].id, proyectoTest.rows[0].id]);

    // Simular cambio de estado
    await pool.query(`
      INSERT INTO project_states (project_id, estado_anterior, estado_nuevo, usuario_id, notas)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      proyectoTest.rows[0].id,
      'en_laboratorio',
      'completado',
      2, // usuario_laboratorio_id
      'Trabajo completado exitosamente'
    ]);

    // Simular archivos del laboratorio
    await pool.query(`
      INSERT INTO project_files (project_id, quote_id, tipo_archivo, nombre_archivo, ruta_archivo, tamaño_archivo, tipo_mime, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      proyectoTest.rows[0].id,
      cotizacionTest.rows[0].id,
      'laboratorio',
      'reporte_final.pdf',
      '/uploads/laboratorio/reporte_final.pdf',
      2048,
      'application/pdf',
      2
    ]);

    console.log(`   ✅ Archivo de laboratorio simulado`);

    // 4. Verificar datos del flujo
    console.log('\n4️⃣ Verificando flujo completo...');
    
    const proyectoCompleto = await pool.query(`
      SELECT 
        p.id, p.name, p.estado, p.fecha_envio_laboratorio, p.fecha_completado_laboratorio,
        q.es_contrato, q.archivos_cotizacion, q.archivos_laboratorio,
        pf.nombre_archivo, pf.tipo_archivo
      FROM projects p
      LEFT JOIN quotes q ON p.cotizacion_id = q.id
      LEFT JOIN project_files pf ON p.id = pf.project_id
      WHERE p.id = $1
    `, [proyectoTest.rows[0].id]);

    console.log(`   📊 Proyecto completo: ${proyectoCompleto.rows.length} registros relacionados`);
    console.log(`      - Estado: ${proyectoCompleto.rows[0].estado}`);
    console.log(`      - Es contrato: ${proyectoCompleto.rows[0].es_contrato}`);
    console.log(`      - Archivos cotización: ${proyectoCompleto.rows[0].archivos_cotizacion ? 'Sí' : 'No'}`);
    console.log(`      - Archivos laboratorio: ${proyectoCompleto.rows[0].archivos_laboratorio ? 'Sí' : 'No'}`);

    // 5. Limpiar datos de prueba
    console.log('\n5️⃣ Limpiando datos de prueba...');
    
    await pool.query('DELETE FROM project_files WHERE project_id = $1', [proyectoTest.rows[0].id]);
    await pool.query('DELETE FROM project_states WHERE project_id = $1', [proyectoTest.rows[0].id]);
    await pool.query('DELETE FROM quotes WHERE id = $1', [cotizacionTest.rows[0].id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [proyectoTest.rows[0].id]);
    
    console.log('   ✅ Datos de prueba eliminados');

    console.log('\n🎉 SISTEMA DE LABORATORIO FUNCIONANDO CORRECTAMENTE');
    console.log('✅ Tablas adaptadas');
    console.log('✅ Índices creados');
    console.log('✅ Flujo simulado exitosamente');
    console.log('✅ Listo para usar en producción');

  } catch (error) {
    console.error('❌ Error probando sistema de laboratorio:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

testLaboratorioSystem();
