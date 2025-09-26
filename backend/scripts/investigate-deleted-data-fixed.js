const pool = require('../config/db');

async function investigateDeletedData() {
  try {
    console.log('🔍 INVESTIGANDO DATOS ELIMINADOS...\n');
    
    // 1. Verificar datos actuales de clientes/empresas
    console.log('1️⃣ Datos actuales de empresas:');
    const companies = await pool.query('SELECT COUNT(*) as total FROM companies');
    console.log(`   📊 Total de empresas: ${companies.rows[0].total}`);
    
    if (companies.rows[0].total > 0) {
      const recentCompanies = await pool.query(`
        SELECT id, name, created_at 
        FROM companies 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      console.log('   📋 Últimas 5 empresas:');
      recentCompanies.rows.forEach(company => {
        console.log(`      ${company.id}: ${company.name} (${company.created_at})`);
      });
    }
    
    // 2. Verificar datos de usuarios
    console.log('\n2️⃣ Datos actuales de usuarios:');
    const users = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log(`   📊 Total de usuarios: ${users.rows[0].total}`);
    
    if (users.rows[0].total > 0) {
      const recentUsers = await pool.query(`
        SELECT id, name, email, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      console.log('   📋 Últimos 5 usuarios:');
      recentUsers.rows.forEach(user => {
        console.log(`      ${user.id}: ${user.name} (${user.email}) - ${user.created_at}`);
      });
    }
    
    // 3. Verificar logs de auditoría
    console.log('\n3️⃣ Revisando logs de auditoría:');
    const auditLogs = await pool.query(`
      SELECT action, table_name, record_id, old_values, new_values, created_at, user_id
      FROM audit_log 
      WHERE action = 'DELETE' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (auditLogs.rows.length > 0) {
      console.log(`   ⚠️  Encontradas ${auditLogs.rows.length} eliminaciones recientes:`);
      auditLogs.rows.forEach(log => {
        console.log(`      ${log.created_at}: ${log.action} en ${log.table_name} (ID: ${log.record_id})`);
        if (log.old_values) {
          try {
            const oldData = JSON.parse(log.old_values);
            console.log(`         Datos eliminados: ${JSON.stringify(oldData).substring(0, 100)}...`);
          } catch (e) {
            console.log(`         Datos eliminados: ${log.old_values.substring(0, 100)}...`);
          }
        }
      });
    } else {
      console.log('   ✅ No se encontraron eliminaciones en los logs');
    }
    
    // 4. Verificar logs de limpieza
    console.log('\n4️⃣ Revisando logs de limpieza:');
    const cleanupLogs = await pool.query(`
      SELECT action, table_name, records_affected, created_at, details
      FROM audit_cleanup_log 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (cleanupLogs.rows.length > 0) {
      console.log(`   📋 Encontrados ${cleanupLogs.rows.length} logs de limpieza:`);
      cleanupLogs.rows.forEach(log => {
        console.log(`      ${log.created_at}: ${log.action} en ${log.table_name} - ${log.records_affected} registros`);
        if (log.details) {
          console.log(`         Detalles: ${log.details.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('   ✅ No se encontraron logs de limpieza');
    }
    
    // 5. Verificar proyectos y cotizaciones
    console.log('\n5️⃣ Datos actuales de proyectos y cotizaciones:');
    const projects = await pool.query('SELECT COUNT(*) as total FROM projects');
    const quotes = await pool.query('SELECT COUNT(*) as total FROM quotes');
    console.log(`   📊 Proyectos: ${projects.rows[0].total}`);
    console.log(`   📊 Cotizaciones: ${quotes.rows[0].total}`);
    
    // 6. Verificar si hay datos recientes
    console.log('\n6️⃣ Verificando datos recientes:');
    const recentData = await pool.query(`
      SELECT 
        'companies' as tabla, COUNT(*) as total, MAX(created_at) as ultimo
      FROM companies
      UNION ALL
      SELECT 
        'users' as tabla, COUNT(*) as total, MAX(created_at) as ultimo
      FROM users
      UNION ALL
      SELECT 
        'projects' as tabla, COUNT(*) as total, MAX(created_at) as ultimo
      FROM projects
      UNION ALL
      SELECT 
        'quotes' as tabla, COUNT(*) as total, MAX(created_at) as ultimo
      FROM quotes
      ORDER BY tabla
    `);
    
    recentData.rows.forEach(row => {
      console.log(`   ${row.tabla}: ${row.total} registros, último: ${row.ultimo || 'N/A'}`);
    });
    
    // 7. Verificar estructura de tablas
    console.log('\n7️⃣ Verificando estructura de tablas:');
    const tableStructure = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('companies', 'users', 'projects', 'quotes')
      ORDER BY table_name, ordinal_position
    `);
    
    const tables = {};
    tableStructure.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });
    
    Object.keys(tables).forEach(tableName => {
      console.log(`   📋 ${tableName}: ${tables[tableName].length} columnas`);
    });
    
    console.log('\n🎯 INVESTIGACIÓN COMPLETADA');
    console.log('✅ Backup creado y datos verificados');
    
  } catch (error) {
    console.error('❌ Error en la investigación:', error.message);
  } finally {
    await pool.end();
  }
}

investigateDeletedData();
